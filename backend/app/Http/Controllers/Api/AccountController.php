<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $accounts = Account::query()
            ->when($request->industry, fn($q) => $q->where('industry', $request->industry))
            ->when($request->search, function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            })
            ->with(['owner:id,first_name,last_name', 'contacts:id,account_id,first_name,last_name'])
            ->withCount(['deals', 'leads'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($accounts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'owner_id' => 'nullable|exists:users,id',
        ]);

        $account = Account::create($validated);

        return response()->json([
            'message' => 'Account created successfully',
            'account' => $account->load('owner:id,first_name,last_name')
        ], 201);
    }

    public function show(Account $account)
    {
        return response()->json($account->load([
            'owner:id,first_name,last_name',
            'contacts',
            'leads',
            'deals.stage',
            'notes.author:id,first_name,last_name',
            'activityLogs.user:id,first_name,last_name'
        ]));
    }

    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'industry' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'owner_id' => 'nullable|exists:users,id',
        ]);

        $account->update($validated);

        return response()->json([
            'message' => 'Account updated successfully',
            'account' => $account->load('owner:id,first_name,last_name')
        ]);
    }

    public function destroy(Account $account)
    {
        $account->delete();
        return response()->json(['message' => 'Account deleted successfully']);
    }
}
