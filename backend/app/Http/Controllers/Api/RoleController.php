<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * List all roles for the current tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $roles = Role::with('permissions')
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $roles->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'is_system' => $role->is_system,
                'permissions' => $role->permissions->pluck('name'),
                'users_count' => $role->users()->count(),
            ]),
        ]);
    }

    /**
     * Create a new custom role.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'display_name' => 'required|string|max:100',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Check uniqueness within tenant
        $exists = Role::where('name', $validated['name'])->exists();
        if ($exists) {
            return response()->json([
                'message' => 'A role with this name already exists.',
            ], 422);
        }

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'is_system' => false,
        ]);

        $role->syncPermissions($validated['permissions']);

        return response()->json([
            'message' => 'Role created successfully.',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'permissions' => $role->permissions->pluck('name'),
            ],
        ], 201);
    }

    /**
     * Update a role's display name and permissions.
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'display_name' => 'sometimes|string|max:100',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        if (isset($validated['display_name'])) {
            $role->update(['display_name' => $validated['display_name']]);
        }

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'message' => 'Role updated successfully.',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'permissions' => $role->fresh()->permissions->pluck('name'),
            ],
        ]);
    }

    /**
     * Delete a custom role (system roles cannot be deleted).
     */
    public function destroy(Role $role): JsonResponse
    {
        if ($role->is_system) {
            return response()->json([
                'message' => 'System roles cannot be deleted.',
            ], 403);
        }

        if ($role->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete a role that is assigned to users. Reassign users first.',
            ], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully.']);
    }

    /**
     * List all available permissions grouped by module.
     */
    public function permissions(): JsonResponse
    {
        $permissions = Permission::all()->groupBy('group');

        return response()->json([
            'data' => $permissions->map(fn($group) => $group->map(fn($perm) => [
                'id' => $perm->id,
                'name' => $perm->name,
                'description' => $perm->description,
            ])),
        ]);
    }
}
