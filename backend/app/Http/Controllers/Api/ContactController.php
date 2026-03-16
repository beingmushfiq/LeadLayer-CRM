<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $contacts = Contact::query()
            ->when($request->account_id, fn($q) => $q->where('account_id', $request->account_id))
            ->when($request->search, function($q) use ($request) {
                $q->where(fn($sq) => 
                    $sq->where('first_name', 'like', "%{$request->search}%")
                      ->orWhere('last_name', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%")
                      ->orWhere('phone', 'like', "%{$request->search}%")
                      ->orWhere('whatsapp_number', 'like', "%{$request->search}%")
                );
            })
            ->with(['account:id,name', 'owner:id,first_name,last_name'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($contacts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'nullable|exists:accounts,id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'whatsapp_number' => 'nullable|string|max:20',
            'job_title' => 'nullable|string|max:100',
            'owner_id' => 'nullable|exists:users,id',
            'source' => ['nullable', Rule::in(['manual','whatsapp','web_form','import','referral','email','other'])],
        ]);

        $contact = Contact::create($validated);

        return response()->json([
            'message' => 'Contact created successfully',
            'contact' => $contact->load(['account:id,name', 'owner:id,first_name,last_name'])
        ], 201);
    }

    public function show(Contact $contact)
    {
        return response()->json($contact->load([
            'account',
            'owner:id,first_name,last_name',
            'deals.stage',
            'notes.author:id,first_name,last_name',
            'whatsappConversations',
            'activityLogs.user:id,first_name,last_name'
        ]));
    }

    public function update(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'account_id' => 'nullable|exists:accounts,id',
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'whatsapp_number' => 'nullable|string|max:20',
            'job_title' => 'nullable|string|max:100',
            'owner_id' => 'nullable|exists:users,id',
            'source' => ['sometimes', Rule::in(['manual','whatsapp','web_form','import','referral','email','other'])],
        ]);

        $contact->update($validated);

        return response()->json([
            'message' => 'Contact updated successfully',
            'contact' => $contact->load(['account:id,name', 'owner:id,first_name,last_name'])
        ]);
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return response()->json(['message' => 'Contact deleted successfully']);
    }
}
