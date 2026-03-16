<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class SuperAdminController extends Controller
{
    /**
     * Get aggregate metrics for the Super Admin dashboard.
     */
    public function metrics(): JsonResponse
    {
        // Using withoutGlobalScopes in case any models natively apply tenant restrictions, 
        // though our TenantScopes already bypass if the user is a super admin.
        $totalTenants = Tenant::count();
        $totalUsers = User::count();
        
        // Count tenants by plan
        $tenantsByPlan = Tenant::selectRaw('subscription_plan, count(*) as count')
            ->groupBy('subscription_plan')
            ->get();

        // Active vs Inactive
        $activeTenants = Tenant::where('subscription_status', 'active')->count();

        // Calculate a mock Total MRR (Monthly Recurring Revenue) based on plans
        // In reality, this would query a Stripe/SSLCommerz subscription map
        $mrrMocks = [
            'free_trial' => 0,
            'starter' => 2900,
            'professional' => 9900,
            'enterprise' => 29900
        ];

        $mrr = 0;
        foreach ($tenantsByPlan as $planRow) {
            $mrr += ($mrrMocks[$planRow->subscription_plan] ?? 0) * $planRow->count;
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_tenants' => $totalTenants,
                'total_users' => $totalUsers,
                'active_tenants' => $activeTenants,
                'monthly_recurring_revenue' => $mrr,
                'tenants_by_plan' => $tenantsByPlan,
            ]
        ]);
    }

    /**
     * Get a paginated list of all system tenants for the admin table.
     */
    public function tenants(): JsonResponse
    {
        $tenants = Tenant::withCount('users')
                    ->orderBy('created_at', 'desc')
                    ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $tenants
        ]);
    }
}
