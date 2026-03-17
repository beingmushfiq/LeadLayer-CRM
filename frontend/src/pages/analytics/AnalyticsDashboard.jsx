import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const kpis = [
    { 
      name: 'Total Leads', 
      value: stats?.kpis.total_leads || 0, 
      icon: Users, 
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      trend: '+12%',
      positive: true
    },
    { 
      name: 'Open Deals', 
      value: stats?.kpis.open_deals || 0, 
      icon: Briefcase, 
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      trend: '+5%',
      positive: true
    },
    { 
      name: 'Monthly Revenue', 
      value: `$${(stats?.kpis.monthly_revenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      trend: '+24%',
      positive: true
    },
    { 
      name: 'Active Campaigns', 
      value: stats?.kpis.active_campaigns || 0, 
      icon: TrendingUp, 
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      trend: '-2%',
      positive: false
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Command Center</h1>
          <p className="text-gray-400 mt-1">Real-time performance metrics across your organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-gray-300">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.name} className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.07] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-xl", kpi.bg)}>
                <kpi.icon className={cn("w-6 h-6", kpi.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                kpi.positive ? "text-emerald-400" : "text-rose-400"
              )}>
                {kpi.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {kpi.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-400">{kpi.name}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{kpi.value}</h3>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-indigo-500 group-hover:w-full transition-all duration-500" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Funnel */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Pipeline Funnel</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-6">
            {stats?.pipeline_funnel.map((item, index) => (
              <div key={item.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{item.stage}</span>
                  <span className="text-sm font-bold text-white">{item.count} Deals · ${Number(item.total_value).toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(10, 100 - (index * 15))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Stream */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Revenue Stream</h3>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {stats?.revenue_stream.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div 
                    className="w-full max-w-[40px] bg-indigo-500/20 border border-indigo-500/30 rounded-t-lg group-hover:bg-indigo-500/40 transition-all duration-300 relative"
                    style={{ height: `${Math.max(10, (month.revenue / (Math.max(...stats.revenue_stream.map(m => m.revenue)) || 1)) * 100)}%` }}
                  >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      ${month.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">{month.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Organizational Pulse</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.recent_activity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/2 border border-white/5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-300">
                  <span className="font-bold text-white">{activity.user.first_name} {activity.user.last_name}</span>
                  {' '}{activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
