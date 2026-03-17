<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailCampaign;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class EmailCampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EmailCampaign::query()
            ->with('creator:id,first_name,last_name')
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('subject', 'like', '%' . $request->search . '%');
        }

        $campaigns = $query->paginate($request->get('per_page', 15));

        return response()->json($campaigns);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body_html' => 'required|string',
            'from_name' => 'nullable|string|max:100',
            'from_email' => 'nullable|email|max:255',
            'scheduled_at' => 'nullable|date',
        ]);

        $campaign = EmailCampaign::create([
            ...$validated,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Campaign created successfully',
            'data' => $campaign->load('creator:id,first_name,last_name'),
        ], 211);
    }

    public function show(EmailCampaign $campaign): JsonResponse
    {
        return response()->json([
            'data' => $campaign->load(['creator:id,first_name,last_name', 'recipients.contact']),
        ]);
    }

    public function update(Request $request, EmailCampaign $campaign): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'subject' => 'sometimes|required|string|max:255',
            'body_html' => 'sometimes|required|string',
            'from_name' => 'nullable|string|max:100',
            'from_email' => 'nullable|email|max:255',
            'status' => 'sometimes|required|in:draft,scheduled,paused,cancelled',
            'scheduled_at' => 'nullable|date',
        ]);

        $campaign->update($validated);

        return response()->json([
            'message' => 'Campaign updated successfully',
            'data' => $campaign->load('creator:id,first_name,last_name'),
        ]);
    }

    public function destroy(EmailCampaign $campaign): JsonResponse
    {
        $campaign->delete();
        return response()->json(['message' => 'Campaign deleted successfully']);
    }

    public function send(EmailCampaign $campaign): JsonResponse
    {
        if ($campaign->status === 'sent') {
            return response()->json(['message' => 'Campaign already sent'], 400);
        }

        // Simulate sending process
        DB::transaction(function () use ($campaign) {
            $contacts = Contact::all();
            
            $campaign->recipients()->delete();
            
            foreach ($contacts as $contact) {
                $campaign->recipients()->create([
                    'contact_id' => $contact->id,
                    'email' => $contact->email,
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
            }

            $campaign->update([
                'status' => 'sent',
                'sent_at' => now(),
                'total_recipients' => $contacts->count(),
                'total_sent' => $contacts->count(),
                // Randomly simulate opens and clicks for demo purposes
                'total_opened' => floor($contacts->count() * (rand(20, 45) / 100)),
                'total_clicked' => floor($contacts->count() * (rand(5, 15) / 100)),
            ]);
        });

        return response()->json([
            'message' => 'Campaign sent successfully (simulated)',
            'data' => $campaign->fresh(['creator:id,first_name,last_name']),
        ]);
    }
}
