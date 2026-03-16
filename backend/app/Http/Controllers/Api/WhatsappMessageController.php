<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsappConfig;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use App\Services\WhatsappService;
use Illuminate\Http\Request;

class WhatsappMessageController extends Controller
{
    /**
     * Send an outbound message in a conversation.
     */
    public function store(Request $request, WhatsappService $whatsappService)
    {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:whatsapp_conversations,id',
            'content' => 'required|string',
            'message_type' => 'nullable|string|in:text,template',
            'template_name' => 'nullable|string',
        ]);

        $tenantId = $request->user()->tenant_id;

        // Verify configuration and token
        $config = WhatsappConfig::where('tenant_id', $tenantId)->where('is_active', true)->first();
        if (!$config || empty($config->access_token)) {
            return response()->json(['message' => 'WhatsApp configuration is inactive or missing token.'], 400);
        }

        $conversation = WhatsappConversation::where('tenant_id', $tenantId)->findOrFail($validated['conversation_id']);
        
        $type = $validated['message_type'] ?? 'text';
        $metaResponse = null;

        if ($type === 'text') {
            $metaResponse = $whatsappService->sendTextMessage(
                $config->phone_number_id,
                $config->access_token,
                $conversation->wa_contact_number,
                $validated['content']
            );
        } else if ($type === 'template') {
            $metaResponse = $whatsappService->sendTemplateMessage(
                $config->phone_number_id,
                $config->access_token,
                $conversation->wa_contact_number,
                $validated['template_name']
            );
        }

        if (!$metaResponse) {
            return response()->json(['message' => 'Failed to queue message with Meta API.'], 500);
        }

        // The Cloud API responds back with the message ID before delivery
        $waMessageId = $metaResponse['messages'][0]['id'] ?? null;

        $message = WhatsappMessage::create([
            'tenant_id' => $tenantId,
            'conversation_id' => $conversation->id,
            'wa_message_id' => $waMessageId,
            'direction' => 'outbound',
            'message_type' => $type,
            'content' => $validated['content'],
            'template_name' => $validated['template_name'] ?? null,
            'status' => 'sent',
            'sent_by' => $request->user()->id,
            'sent_at' => now(),
        ]);

        $conversation->update([
            'last_message_at' => now(),
            'status' => 'open'
        ]);

        return response()->json([
            'message' => 'Message queued for delivery.',
            'data' => $message
        ], 201);
    }
}
