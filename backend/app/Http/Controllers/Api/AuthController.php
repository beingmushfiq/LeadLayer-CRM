<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new tenant with an admin user.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
            'timezone' => 'nullable|string|max:50',
        ]);

        // Create tenant
        $tenant = Tenant::create([
            'name' => $validated['company_name'],
            'slug' => Str::slug($validated['company_name']) . '-' . Str::random(6),
            'timezone' => $validated['timezone'] ?? 'UTC',
            'subscription_plan' => 'free_trial',
            'subscription_status' => 'trialing',
            'trial_ends_at' => now()->addDays(14),
        ]);

        // Get or create the tenant_admin role for this tenant
        $adminRole = Role::create([
            'tenant_id' => $tenant->id,
            'name' => 'tenant_admin',
            'display_name' => 'Administrator',
            'is_system' => true,
        ]);

        // Assign all permissions to admin role
        $allPermissionIds = \App\Models\Permission::pluck('id')->toArray();
        $adminRole->syncPermissions($allPermissionIds);

        // Create default roles for the tenant
        $this->createDefaultRoles($tenant);

        // Create admin user
        $user = User::withoutGlobalScopes()->create([
            'tenant_id' => $tenant->id,
            'role_id' => $adminRole->id,
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        // Create default pipeline for the tenant
        $this->createDefaultPipeline($tenant);

        // Generate API token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $adminRole->display_name,
                ],
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'trial_ends_at' => $tenant->trial_ends_at,
                ],
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login and receive an API token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        file_put_contents(storage_path('logs/auth_debug.log'), date('Y-m-d H:i:s')." Login attempt: ".$validated['email']."\n", FILE_APPEND);

        $user = User::withoutGlobalScopes()->where('email', $validated['email'])->first();

        file_put_contents(storage_path('logs/auth_debug.log'), date('Y-m-d H:i:s')." User found: ".($user ? 'YES' : 'NO')." | ID: ".($user ? $user->id : 'N/A')."\n", FILE_APPEND);

        if ($user) {
            $match = Hash::check($validated['password'], $user->password);
            file_put_contents(storage_path('logs/auth_debug.log'), date('Y-m-d H:i:s')." Hash match: ".($match ? 'YES' : 'NO')."\n", FILE_APPEND);
        }


        \Illuminate\Support\Facades\Log::info('Login attempt', [
            'email' => $validated['email'],
            'user_found' => !!$user,
            'is_super_admin' => $user ? $user->is_super_admin : null,
            'password_match' => $user ? \Illuminate\Support\Facades\Hash::check($validated['password'], $user->password) : null,
        ]);

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated.',
            ], 403);
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Revoke old tokens and create a new one
        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role?->display_name,
                    'tenant_id' => $user->tenant_id,
                    'is_super_admin' => $user->is_super_admin,
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout — revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Get authenticated user with role and permissions.
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load(['role.permissions', 'tenant']);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
                'is_active' => $user->is_active,
                'is_super_admin' => $user->is_super_admin,
                'role' => [
                    'id' => $user->role?->id,
                    'name' => $user->role?->name,
                    'display_name' => $user->role?->display_name,
                    'permissions' => $user->role?->permissions->pluck('name'),
                ],
                'tenant' => $user->tenant ? [
                    'id' => $user->tenant->id,
                    'name' => $user->tenant->name,
                    'slug' => $user->tenant->slug,
                    'subscription_plan' => $user->tenant->subscription_plan,
                    'subscription_status' => $user->tenant->subscription_status,
                ] : null,
            ],
        ]);
    }

    // ── Private helper methods ───────────────────────

    private function createDefaultRoles(Tenant $tenant): void
    {
        $defaultRoles = [
            ['name' => 'sales_manager', 'display_name' => 'Sales Manager', 'is_system' => true],
            ['name' => 'sales_rep', 'display_name' => 'Sales Representative', 'is_system' => true],
            ['name' => 'view_only', 'display_name' => 'View Only', 'is_system' => false],
        ];

        foreach ($defaultRoles as $roleData) {
            Role::create(array_merge($roleData, ['tenant_id' => $tenant->id]));
        }
    }

    private function createDefaultPipeline(Tenant $tenant): void
    {
        $pipeline = \App\Models\Pipeline::withoutGlobalScopes()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Sales Pipeline',
            'is_default' => true,
        ]);

        $stages = [
            ['name' => 'Prospecting', 'position' => 1, 'win_probability' => 10, 'color' => '#6B7280'],
            ['name' => 'Qualification', 'position' => 2, 'win_probability' => 25, 'color' => '#3B82F6'],
            ['name' => 'Proposal', 'position' => 3, 'win_probability' => 50, 'color' => '#8B5CF6'],
            ['name' => 'Negotiation', 'position' => 4, 'win_probability' => 75, 'color' => '#F59E0B'],
            ['name' => 'Closed Won', 'position' => 5, 'win_probability' => 100, 'color' => '#10B981'],
            ['name' => 'Closed Lost', 'position' => 6, 'win_probability' => 0, 'color' => '#EF4444'],
        ];

        foreach ($stages as $stageData) {
            \App\Models\PipelineStage::withoutGlobalScopes()->create(
                array_merge($stageData, ['pipeline_id' => $pipeline->id, 'tenant_id' => $tenant->id])
            );
        }
    }
}
