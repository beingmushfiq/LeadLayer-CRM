<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsappConfig;
use Illuminate\Http\Request;

class WhatsappConfigController extends Controller
{
    public function show(Request $request)
    {
        $config = WhatsappConfig::where('tenant_id', $request->user()->tenant_id)->first();
        
        return response()->json([
            'data' => $config ? [
                'id' => $config->id,
                'phone_number_id' => $config->phone_number_id,
                'waba_id' => $config->waba_id,
                'webhook_verify_token' => $config->webhook_verify_token,
                'auto_reply_enabled' => $config->auto_reply_enabled,
                'auto_reply_template' => $config->auto_reply_template,
                'auto_create_lead' => $config->auto_create_lead,
                'is_active' => $config->is_active,
                'has_access_token' => !empty($config->access_token)
            ] : null
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'phone_number_id' => 'required|string',
            'waba_id' => 'required|string',
            'access_token' => 'nullable|string',
            'webhook_verify_token' => 'required|string',
            'auto_reply_enabled' => 'boolean',
            'auto_reply_template' => 'nullable|string',
            'auto_create_lead' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $config = WhatsappConfig::firstOrNew(['tenant_id', $request->user()->tenant_id]);

        $config->phone_number_id = $validated['phone_number_id'];
        $config->waba_id = $validated['waba_id'];
        $config->webhook_verify_token = $validated['webhook_verify_token'];
        $config->auto_reply_enabled = $validated['auto_reply_enabled'] ?? false;
        $config->auto_reply_template = $validated['auto_reply_template'] ?? null;
        $config->auto_create_lead = $validated['auto_create_lead'] ?? false;
        $config->is_active = $validated['is_active'] ?? true;

        if (!empty($validated['access_token'])) {
            $config->access_token = $validated['access_token'];
        }

        $config->save();

        return response()->json([
            'message' => 'WhatsApp configuration updated successfully.',
            'data' => [
                'id' => $config->id,
                'phone_number_id' => $config->phone_number_id,
                'has_access_token' => !empty($config->access_token)
            ]
        ]);
    }
}
