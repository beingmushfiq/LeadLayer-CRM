<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use Illuminate\Http\Request;

class PipelineController extends Controller
{
    public function index()
    {
        $pipelines = Pipeline::with('stages')->get();
        return response()->json($pipelines);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'is_default' => 'boolean',
            'stages' => 'required|array|min:1',
            'stages.*.name' => 'required|string|max:100',
            'stages.*.win_probability' => 'nullable|numeric|between:0,100',
            'stages.*.color' => 'nullable|string|size:7',
        ]);

        if ($validated['is_default'] ?? false) {
            Pipeline::where('is_default', true)->update(['is_default' => false]);
        }

        $pipeline = Pipeline::create($validated);

        foreach ($validated['stages'] as $index => $stageData) {
            $pipeline->stages()->create(array_merge($stageData, [
                'tenant_id' => $pipeline->tenant_id,
                'position' => $index
            ]));
        }

        return response()->json($pipeline->load('stages'), 201);
    }

    public function show(Pipeline $pipeline)
    {
        return response()->json($pipeline->load('stages'));
    }

    public function update(Request $request, Pipeline $pipeline)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'is_default' => 'boolean',
        ]);

        if (isset($validated['is_default']) && $validated['is_default']) {
            Pipeline::where('id', '!=', $pipeline->id)->where('is_default', true)->update(['is_default' => false]);
        }

        $pipeline->update($validated);

        return response()->json($pipeline->load('stages'));
    }

    public function destroy(Pipeline $pipeline)
    {
        if ($pipeline->is_default) {
            return response()->json(['message' => 'Cannot delete default pipeline'], 422);
        }

        $pipeline->delete();
        return response()->json(['message' => 'Pipeline deleted successfully']);
    }
}
