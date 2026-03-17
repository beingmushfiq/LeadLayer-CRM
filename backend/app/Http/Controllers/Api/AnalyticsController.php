<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Deal;
use App\Models\Invoice;
use App\Models\EmailCampaign;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function getDashboardStats(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $tenantId = $user->tenant_id;

        // KPI Metrics
        $totalLeads = Lead::count();
        $openDealsCount = Deal::whereHas('stage', function($q) {
            $q->where('probability', '<', 100)->where('probability', '>', 0);
        })->count();
        
        $monthlyRevenue = Invoice::where('status', 'paid')
            ->whereMonth('sent_at', now()->month)
            ->sum('total_amount');

        $activeCampaigns = EmailCampaign::where('status', 'sending')
            ->orWhere('status', 'scheduled')
            ->count();

        // Pipeline Funnel (Deals by Stage)
        $pipelineFunnel = DB::table('deals')
            ->join('pipeline_stages', 'deals.stage_id', '=', 'pipeline_stages.id')
            ->select('pipeline_stages.name as stage', DB::raw('count(*) as count'), DB::raw('sum(value) as total_value'))
            ->where('deals.tenant_id', $tenantId)
            ->groupBy('pipeline_stages.id', 'pipeline_stages.name', 'pipeline_stages.order')
            ->orderBy('pipeline_stages.order')
            ->get();

        // Revenue Stream (Last 6 Months)
        $revenueStream = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $revenueStream[] = [
                'month' => $month->format('M'),
                'revenue' => Invoice::where('status', 'paid')
                    ->whereMonth('sent_at', $month->month)
                    ->whereYear('sent_at', $month->year)
                    ->sum('total_amount'),
            ];
        }

        // Recent Activity Feed
        $recentActivity = ActivityLog::with('user:id,first_name,last_name')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'kpis' => [
                'total_leads' => $totalLeads,
                'open_deals' => $openDealsCount,
                'monthly_revenue' => $monthlyRevenue,
                'active_campaigns' => $activeCampaigns,
            ],
            'pipeline_funnel' => $pipelineFunnel,
            'revenue_stream' => $revenueStream,
            'recent_activity' => $recentActivity,
        ]);
    }

    public function getMarketingStats(): JsonResponse
    {
        $stats = EmailCampaign::select(
            DB::raw('sum(total_recipients) as total_reached'),
            DB::raw('sum(total_sent) as total_sent'),
            DB::raw('sum(total_opened) as total_opened'),
            DB::raw('sum(total_clicked) as total_clicked')
        )->first();

        $campaignsPerformance = EmailCampaign::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($camp) {
                return [
                    'name' => $camp->name,
                    'open_rate' => $camp->open_rate,
                    'click_rate' => $camp->click_rate,
                ];
            });

        return response()->json([
            'overview' => $stats,
            'performance' => $campaignsPerformance,
        ]);
    }
}
