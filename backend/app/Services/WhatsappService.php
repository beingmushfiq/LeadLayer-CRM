<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    protected string $baseUrl = 'https://graph.facebook.com/v19.0';

    /**
     * Send a text message via WhatsApp Cloud API.
     */
    public function sendTextMessage(string $phoneNumberId, string $accessToken, string $to, string $text): array|null
    {
        $response = Http::withToken($accessToken)
            ->post("{$this->baseUrl}/{$phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $to,
                'type' => 'text',
                'text' => [
                    'preview_url' => false,
                    'body' => $text
                ]
            ]);

        if ($response->failed()) {
            Log::error('WhatsApp API Error (Text):', [
                'status' => $response->status(),
                'response' => $response->json(),
                'to' => $to,
            ]);
            return null;
        }

        return $response->json();
    }

    /**
     * Send a template message via WhatsApp Cloud API.
     */
    public function sendTemplateMessage(string $phoneNumberId, string $accessToken, string $to, string $templateName, string $languageCode = 'en_US', array $components = []): array|null
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $to,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => ['code' => $languageCode],
            ]
        ];

        if (!empty($components)) {
            $payload['template']['components'] = $components;
        }

        $response = Http::withToken($accessToken)
            ->post("{$this->baseUrl}/{$phoneNumberId}/messages", $payload);

        if ($response->failed()) {
            Log::error('WhatsApp API Error (Template):', [
                'status' => $response->status(),
                'response' => $response->json(),
                'to' => $to,
                'template' => $templateName,
            ]);
            return null;
        }

        return $response->json();
    }
}
