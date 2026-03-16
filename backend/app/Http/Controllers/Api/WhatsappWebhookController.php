<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsappConfig;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use App\Models\Lead;
use App\Models\Contact;
use App\Services\WhatsappService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsappWebhookController extends Controller
{
    /**
     * Handle Facebook's webhook verification GET request.
     * Webhooks sent to this route DO NOT have a tenant_id in the URL.
     * We must verify the token against all active configs (or a centralized one if using an ISV model, 
     * but here we allow any tenant's verify token to pass if it matches).
     */
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode && $token) {
            if ($mode === 'subscribe') {
                $isValid = WhatsappConfig::where('webhook_verify_token', $token)
                    ->where('is_active', true)
                    ->exists();

                if ($isValid) {
                    return response($challenge, 200)->header('Content-Type', 'text/plain');
                }
            }
        }

        return response('Forbidden', 403);
    }

    /**
     * Process incoming WhatsApp messages.
     */
    public function process(Request $request, WhatsappService $whatsappService)
    {
        $payload = $request->all();

        // 1. Validate payload structure
        if (!isset($payload['object']) || $payload['object'] !== 'whatsapp_business_account' || empty($payload['entry'])) {
            return response('Not a WhatsApp payload', 200);
        }

        // Loop over entries (usually just 1)
        foreach ($payload['entry'] as $entry) {
            if (empty($entry['changes'])) continue;

            foreach ($entry['changes'] as $change) {
                if ($change['field'] !== 'messages' || empty($change['value'])) continue;

                $value = $change['value'];

                // Handle status updates (delivered, read, etc.)
                if (isset($value['statuses'])) {
                    $this->processStatusUpdates($value['statuses']);
                    continue;
                }

                // Handle incoming messages
                if (isset($value['messages'])) {
                    $this->processIncomingMessages($value, $whatsappService);
                }
            }
        }

        // Always return 200 OK so Facebook doesn't retry infinitely
        return response('EVENT_RECEIVED', 200);
    }

    private function processStatusUpdates(array $statuses)
    {
        foreach ($statuses as $status) {
            $messageId = $status['id'] ?? null;
            $statusType = $status['status'] ?? null; // 'sent', 'delivered', 'read', 'failed'
            $timestamp = isset($status['timestamp']) ? \Carbon\Carbon::createFromTimestamp($status['timestamp']) : now();

            if (!$messageId || !$statusType) continue;

            $message = WhatsappMessage::withoutGlobalScopes()->where('wa_message_id', $messageId)->first();
            if (!$message) continue;

            $updateData = ['status' => $statusType];
            if ($statusType === 'delivered') $updateData['delivered_at'] = $timestamp;
            if ($statusType === 'read') $updateData['read_at'] = $timestamp;
            
            if ($statusType === 'failed' && isset($status['errors'])) {
                $error = $status['errors'][0];
                $updateData['error_code'] = $error['code'] ?? null;
                $updateData['error_message'] = $error['title'] ?? null;
            }

            $message->update($updateData);
        }
    }

    private function processIncomingMessages(array $value, WhatsappService $whatsappService)
    {
        $businessPhoneNumberId = $value['metadata']['phone_number_id'] ?? null;
        if (!$businessPhoneNumberId) return;

        // Find the Tenant corresponding to this phone number
        $config = WhatsappConfig::where('phone_number_id', $businessPhoneNumberId)
            ->where('is_active', true)
            ->first();

        if (!$config) {
            Log::warning('WhatsApp Webhook received for unknown phone_number_id', ['phone_number_id' => $businessPhoneNumberId]);
            return;
        }

        $tenantId = $config->tenant_id;
        $contactsInfo = $value['contacts'] ?? [];

        foreach ($value['messages'] as $messageData) {
            $fromNumber = $messageData['from'];
            $messageId = $messageData['id'];
            $timestamp = \Carbon\Carbon::createFromTimestamp($messageData['timestamp']);
            
            // Extract profile name if available
            $profileName = null;
            foreach ($contactsInfo as $c) {
                if ($c['wa_id'] === $fromNumber) {
                    $profileName = $c['profile']['name'] ?? null;
                    break;
                }
            }

            // Extract content
            $messageType = $messageData['type'];
            $content = null;
            if ($messageType === 'text') {
                $content = $messageData['text']['body'] ?? null;
            } else {
                // Future media tracking (image, document, audio)
                $content = "[{$messageType} received]";
            }

            // Check if we already processed this message (WhatsApp sometimes sends dupes)
            if (WhatsappMessage::withoutGlobalScopes()->where('wa_message_id', $messageId)->exists()) {
                continue;
            }

            // --- Find or Create Conversation ---
            $conversation = WhatsappConversation::withoutGlobalScopes()
                ->where('tenant_id', $tenantId)
                ->where('wa_contact_number', $fromNumber)
                ->first();

            if (!$conversation) {
                // Optional Lead Creation
                $leadId = null;
                if ($config->auto_create_lead) {
                    $lead = Lead::create([
                        'tenant_id' => $tenantId,
                        'first_name' => $profileName ? explode(' ', $profileName)[0] : 'Unknown',
                        'last_name' => $profileName && strpos($profileName, ' ') !== false ? substr($profileName, strpos($profileName, ' ') + 1) : 'Contact',
                        'phone' => '+' . $fromNumber, // WABA mostly sends numbers without +
                        'status' => 'new',
                        'lead_source' => 'whatsapp',
                        'lead_score' => 10,
                    ]);
                    $leadId = $lead->id;
                }

                $conversation = WhatsappConversation::create([
                    'tenant_id' => $tenantId,
                    'wa_contact_number' => $fromNumber,
                    'wa_profile_name' => $profileName,
                    'status' => 'open',
                    'lead_id' => $leadId,
                    'last_message_at' => $timestamp,
                ]);
            } else {
                // Update profile name if it changed
                if ($profileName && $conversation->wa_profile_name !== $profileName) {
                    $conversation->wa_profile_name = $profileName;
                }
                $conversation->last_message_at = $timestamp;
                $conversation->status = 'open'; // Re-open if closed
                $conversation->save();
            }

            // --- Save Message ---
            WhatsappMessage::create([
                'tenant_id' => $tenantId,
                'conversation_id' => $conversation->id,
                'wa_message_id' => $messageId,
                'direction' => 'inbound',
                'message_type' => $messageType,
                'content' => $content,
                'status' => 'received',
                'sent_at' => $timestamp,
            ]);

            // --- Auto Reply Logic ---
            if ($config->auto_reply_enabled && $config->access_token && $config->auto_reply_template) {
                // Throttle auto-replies? Let's assume we reply to new conversations only (no messages prior to today)
                // For MVP, we will just send it if it's the first message ever in this conversation.
                $messageCount = WhatsappMessage::withoutGlobalScopes()
                    ->where('conversation_id', $conversation->id)
                    ->where('direction', 'inbound')
                    ->count();

                if ($messageCount === 1) { // This is the first message
                    $whatsappService->sendTextMessage( // Using text to respond cleanly to first inbound instead of strict templates
                        $config->phone_number_id,
                        $config->access_token,
                        $fromNumber,
                        $config->auto_reply_template
                    );
                }
            }
        }
    }
}
