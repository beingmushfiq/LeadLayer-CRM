<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureTenantAccess - Validates that the authenticated user
 * belongs to a tenant and prevents cross-tenant access.
 */
class EnsureTenantAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Super Admins (tenant_id = null) can access all routes
        if ($user->tenant_id === null) {
            return $next($request);
        }

        // Check if the tenant is active
        if ($user->tenant && $user->tenant->deleted_at !== null) {
            return response()->json(['message' => 'Tenant account has been deactivated.'], 403);
        }

        // Check if the user is active
        if (!$user->is_active) {
            return response()->json(['message' => 'Your account has been deactivated.'], 403);
        }

        return $next($request);
    }
}
