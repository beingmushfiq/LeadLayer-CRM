<?php
/**
 * InvoiceController.php
 * Generated to handle Phase 8 Financials in LeadLayer CRM.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['contact', 'account', 'deal', 'issuer']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('invoice_number', 'like', "%{$search}%");
        }

        return $query->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_number' => 'required|string|max:50',
            'contact_id' => 'nullable|exists:contacts,id',
            'account_id' => 'nullable|exists:accounts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'status' => 'required|in:draft,sent,paid,partially_paid,overdue,cancelled,refunded',
            'subtotal' => 'required|numeric',
            'tax_rate' => 'nullable|numeric',
            'tax_amount' => 'nullable|numeric',
            'discount_amount' => 'nullable|numeric',
            'total' => 'required|numeric',
            'currency' => 'required|string|max:3',
            'issue_date' => 'required|date',
            'due_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:500',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric',
            'items.*.total' => 'required|numeric',
        ]);

        $invoice = Invoice::create(array_merge($validated, [
            'tenant_id' => Auth::user()->tenant_id,
            'issued_by' => Auth::id(),
            'amount_paid' => 0,
        ]));

        foreach ($validated['items'] as $item) {
            $invoice->items()->create($item);
        }

        return response()->json($invoice->load('items'), 201);
    }

    public function show(Invoice $invoice)
    {
        return $invoice->load(['items', 'contact', 'account', 'deal', 'issuer']);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'status' => 'sometimes|required|in:draft,sent,paid,partially_paid,overdue,cancelled,refunded',
            'due_date' => 'sometimes|required|date',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'paid' && $invoice->status !== 'paid') {
            $validated['paid_at'] = now();
            $validated['amount_paid'] = $invoice->total;
        }

        $invoice->update($validated);

        return response()->json($invoice);
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return response()->json(null, 204);
    }
}
