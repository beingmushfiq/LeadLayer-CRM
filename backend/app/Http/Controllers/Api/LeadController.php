<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Deal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Lead::with(['assignee', 'contact', 'account']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->latest()->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:255',
            'status' => 'required|string|in:new,contacted,qualified,unqualified,lost,converted',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $lead = Lead::create(array_merge($validated, [
            'tenant_id' => $request->user()->tenant_id,
        ]));

        return response()->json($lead, 201);
    }

    public function show(Lead $lead)
    {
        return $lead->load(['assignee', 'contact', 'account', 'activityLogs.user']);
    }

    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'status' => 'sometimes|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $lead->update($validated);
        return response()->json($lead);
    }

    public function convert(Request $request, Lead $lead)
    {
        if ($lead->status === 'converted') {
            return response()->json(['message' => 'Lead is already converted'], 422);
        }

        $validated = $request->validate([
            'deal_title' => 'required|string|max:255',
            'pipeline_id' => 'required|exists:pipelines,id',
            'stage_id' => 'required|exists:pipeline_stages,id',
            'value' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'expected_close_date' => 'nullable|date',
        ]);

        try {
            return DB::transaction(function () use ($lead, $validated) {
                // 1. Create Account if it doesn't exist and company name is present
                $accountId = $lead->account_id;
                if (!$accountId && $lead->company_name) {
                    $account = Account::create([
                        'tenant_id' => $lead->tenant_id,
                        'name' => $lead->company_name,
                        'email' => $lead->email,
                        'phone' => $lead->phone,
                        'owner_id' => $lead->assigned_to,
                    ]);
                    $accountId = $account->id;
                }

                // 2. Create Contact if it doesn't exist
                $contactId = $lead->contact_id;
                if (!$contactId) {
                    $contact = Contact::create([
                        'tenant_id' => $lead->tenant_id,
                        'account_id' => $accountId,
                        'first_name' => $lead->first_name,
                        'last_name' => $lead->last_name,
                        'email' => $lead->email,
                        'phone' => $lead->phone,
                        'whatsapp_number' => $lead->whatsapp_number,
                        'job_title' => $lead->job_title,
                        'owner_id' => $lead->assigned_to,
                        'source' => $lead->source,
                    ]);
                    $contactId = $contact->id;
                }

                // 3. Create the Deal
                $deal = Deal::create([
                    'tenant_id' => $lead->tenant_id,
                    'pipeline_id' => $validated['pipeline_id'],
                    'stage_id' => $validated['stage_id'],
                    'contact_id' => $contactId,
                    'account_id' => $accountId,
                    'lead_id' => $lead->id,
                    'title' => $validated['deal_title'],
                    'value' => $validated['value'] ?? 0,
                    'currency' => $validated['currency'] ?? 'BDT',
                    'assigned_to' => $lead->assigned_to,
                    'status' => 'open',
                ]);

                $lead->update([
                    'status' => 'converted',
                    'contact_id' => $contactId,
                    'account_id' => $accountId,
                    'converted_at' => now(),
                ]);

                return response()->json([
                    'message' => 'Lead converted to deal, contact, and account successfully',
                    'deal' => $deal,
                    'contact_id' => $contactId,
                    'account_id' => $accountId,
                    'lead' => $lead
                ]);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Conversion failed: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();
        return response()->json(['message' => 'Lead deleted successfully']);
    }
}
