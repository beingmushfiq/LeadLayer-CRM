<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CalendarEventController extends Controller
{
    public function index(Request $request)
    {
        $query = CalendarEvent::with(['user', 'eventable']);

        if ($request->has('start') && $request->has('end')) {
            $query->whereBetween('starts_at', [$request->start, $request->end]);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after_or_equal:starts_at',
            'is_all_day' => 'boolean',
            'eventable_type' => 'nullable|string|max:100',
            'eventable_id' => 'nullable|integer',
        ]);

        $event = CalendarEvent::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'tenant_id' => Auth::user()->tenant_id,
        ]));

        return response()->json($event, 201);
    }

    public function show(CalendarEvent $calendarEvent)
    {
        return $calendarEvent->load(['user', 'eventable']);
    }

    public function update(Request $request, CalendarEvent $calendarEvent)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'starts_at' => 'sometimes|required|date',
            'ends_at' => 'sometimes|required|date|after_or_equal:starts_at',
            'is_all_day' => 'boolean',
            'eventable_type' => 'nullable|string|max:100',
            'eventable_id' => 'nullable|integer',
        ]);

        $calendarEvent->update($validated);

        return response()->json($calendarEvent);
    }

    public function destroy(CalendarEvent $calendarEvent)
    {
        $calendarEvent->delete();
        return response()->json(null, 204);
    }
}
