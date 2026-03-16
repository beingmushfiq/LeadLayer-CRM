<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsappConversation;
use Illuminate\Http\Request;

class WhatsappConversationController extends Controller
{
    /**
     * Retrieve a list of the tenant's WhatsApp conversations.
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $conversations = WhatsappConversation::where('tenant_id', $tenantId)
            ->with(['contact:id,first_name,last_name', 'lead:id,first_name,last_name'])
            ->withCount(['messages as unread_count' => function ($query) {
                $query->where('direction', 'inbound')->where('status', 'received');
            }])
            ->orderByDesc('last_message_at')
            ->paginate(50);

        return response()->json($conversations);
    }

    /**
     * Retrieve a specific conversation with its full message history.
     */
    public function show(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $conversation = WhatsappConversation::where('tenant_id', $tenantId)
            ->with(['messages', 'contact:id,first_name,last_name', 'lead:id,first_name,last_name'])
            ->findOrFail($id);

        // Mark inbound received messages as 'read' instantly upon opening the thread UI
        $conversation->messages()
            ->where('direction', 'inbound')
            ->where('status', 'received')
            ->update([
                'status' => 'read',
                'read_at' => now(),
            ]);

        return response()->json(['data' => $conversation]);
    }

    /**
     * Update conversation status (open/closed) or assignee.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:open,closed',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $tenantId = $request->user()->tenant_id;

        $conversation = WhatsappConversation::where('tenant_id', $tenantId)->findOrFail($id);
        
        if (isset($validated['status'])) {
            $conversation->status = $validated['status'];
        }
        
        if (array_key_exists('assigned_to', $validated)) {
            $conversation->assigned_to = $validated['assigned_to'];
        }

        $conversation->save();

        return response()->json([
            'message' => 'Conversation updated.',
            'data' => $conversation
        ]);
    }
}
