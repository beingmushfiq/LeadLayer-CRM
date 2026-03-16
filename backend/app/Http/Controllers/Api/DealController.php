<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Pipeline;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DealController extends Controller
{
    public function index(Request $request)
    {
        $pipelineId = $request->pipeline_id ?? Pipeline::where('is_default', true)->value('id');

        if (!$pipelineId) {
            $pipelineId = Pipeline::first()?->id;
        }

        $deals = Deal::query()
            ->where('pipeline_id', $pipelineId)
            ->with(['stage', 'assignee:id,name', 'contact:id', 'account:id'])
            ->orderBy('position')
            ->get()
            ->groupBy('stage_id');

        return response()->json([
            'deals' => $deals,
            'pipeline_id' => $pipelineId
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pipeline_id' => 'required|exists:pipelines,id',
            'stage_id' => 'required|exists:pipeline_stages,id',
            'title' => 'required|string|max:255',
            'value' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'probability' => 'nullable|numeric|between:0,100',
            'expected_close_date' => 'nullable|date',
            'contact_id' => 'nullable|exists:contacts,id',
            'account_id' => 'nullable|exists:accounts,id',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => ['nullable', Rule::in(['open', 'won', 'lost'])],
        ]);

        // Get max position for the stage
        $maxPosition = Deal::where('stage_id', $validated['stage_id'])->max('position') ?? -1;
        $validated['position'] = $maxPosition + 1;

        $deal = Deal::create($validated);

        return response()->json([
            'message' => 'Deal created successfully',
            'deal' => $deal->load(['stage', 'assignee:id,name'])
        ], 201);
    }

    public function show(Deal $deal)
    {
        return response()->json($deal->load(['pipeline', 'stage', 'assignee', 'contact', 'account', 'lead', 'notes', 'tasks', 'activityLogs', 'invoices']));
    }

    public function update(Request $request, Deal $deal)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'value' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'probability' => 'nullable|numeric|between:0,100',
            'expected_close_date' => 'nullable|date',
            'actual_close_date' => 'nullable|date',
            'status' => ['sometimes', Rule::in(['open', 'won', 'lost'])],
            'loss_reason' => 'nullable|string|max:255',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        if (isset($validated['status']) && $validated['status'] !== 'open' && !$deal->actual_close_date) {
            $validated['actual_close_date'] = now();
        }

        $deal->update($validated);

        return response()->json([
            'message' => 'Deal updated successfully',
            'deal' => $deal->load(['stage', 'assignee:id,name'])
        ]);
    }

    public function kanbanUpdate(Request $request, Deal $deal)
    {
        $validated = $request->validate([
            'stage_id' => 'required|exists:pipeline_stages,id',
            'position' => 'required|integer|min:0',
        ]);

        $oldStageId = $deal->stage_id;
        $newStageId = $validated['stage_id'];
        $newPosition = $validated['position'];

        if ($oldStageId == $newStageId) {
            // Reordering within the same stage
            if ($newPosition > $deal->position) {
                Deal::where('stage_id', $oldStageId)
                    ->whereBetween('position', [$deal->position + 1, $newPosition])
                    ->decrement('position');
            } elseif ($newPosition < $deal->position) {
                Deal::where('stage_id', $oldStageId)
                    ->whereBetween('position', [$newPosition, $deal->position - 1])
                    ->increment('position');
            }
        } else {
            // Moving to a different stage
            // 1. Shift positions in old stage down
            Deal::where('stage_id', $oldStageId)
                ->where('position', '>', $deal->position)
                ->decrement('position');
            
            // 2. Shift positions in new stage up
            Deal::where('stage_id', $newStageId)
                ->where('position', '>=', $newPosition)
                ->increment('position');
        }

        $deal->update([
            'stage_id' => $newStageId,
            'position' => $newPosition
        ]);

        return response()->json(['message' => 'Deal position updated']);
    }

    public function destroy(Deal $deal)
    {
        $deal->delete();
        return response()->json(['message' => 'Deal deleted successfully']);
    }
}
