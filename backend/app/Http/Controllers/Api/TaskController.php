<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['assignee', 'creator', 'taskable']);

        // Filter by tenant via middleware/trait (BelongsToTenant)
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('taskable_type') && $request->has('taskable_id')) {
            $query->where('taskable_type', $request->taskable_type)
                  ->where('taskable_id', $request->taskable_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        // Show tasks assigned to me or created by me by default if no other filter?
        // Actually usually we want to see all tenant tasks if we have permission.
        
        return $query->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'due_date' => 'nullable|date',
            'taskable_type' => 'nullable|string|max:100',
            'taskable_id' => 'nullable|integer',
        ]);

        $task = Task::create(array_merge($validated, [
            'created_by' => Auth::id(),
            'tenant_id' => Auth::user()->tenant_id,
        ]));

        return response()->json($task, 201);
    }

    public function show(Task $task)
    {
        return $task->load(['assignee', 'creator', 'taskable']);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'status' => 'sometimes|required|in:pending,in_progress,completed,cancelled',
            'due_date' => 'nullable|date',
            'taskable_type' => 'nullable|string|max:100',
            'taskable_id' => 'nullable|integer',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'completed' && $task->status !== 'completed') {
            $validated['completed_at'] = now();
        } elseif (isset($validated['status']) && $validated['status'] !== 'completed') {
            $validated['completed_at'] = null;
        }

        $task->update($validated);

        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(null, 204);
    }

    public function toggleComplete(Task $task)
    {
        $newStatus = $task->status === 'completed' ? 'pending' : 'completed';
        
        $task->update([
            'status' => $newStatus,
            'completed_at' => $newStatus === 'completed' ? now() : null,
        ]);

        return response()->json($task);
    }
}
