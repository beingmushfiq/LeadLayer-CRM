import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Users, Activity, CreditCard, ExternalLink, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (page = 1) => {
    setIsLoading(true);
    try {
      const [metricsRes, tenantsRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get(`/admin/tenants?page=${page}`)
      ]);
      
      setMetrics(metricsRes.data.data);
      setTenants(tenantsRes.data.data.data);
      setPagination({
        current_page: tenantsRes.data.data.current_page,
        last_page: tenantsRes.data.data.last_page,
        total: tenantsRes.data.data.total,
      });
    } catch (error) {
      toast.error('Failed to load admin dashboard data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, prefix = '' }) => (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-4 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 group-hover:translate-x-2 ${color}`}>
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl transition-colors duration-500 bg-white/5 border border-white/10 group-hover:bg-white/10 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-zinc-400 font-medium">{title}</h3>
        </div>
        <div className="text-4xl font-bold text-white tracking-tight flex items-baseline gap-1">
          {prefix && <span className="text-2xl text-zinc-500 font-medium">{prefix}</span>}
          {value !== undefined ? (typeof value === 'number' && prefix === '৳' ? value.toLocaleString() : value) : '...'}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            System Overview
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
            </span>
          </h1>
          <p className="text-zinc-400 mt-2">Aggregate metrics across all LeadLayer tenants.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 rounded-xl bg-zinc-900/80 border border-white/10 text-sm font-medium text-zinc-300">
             Last Updated: <span className="text-white">{format(new Date(), 'HH:mm')}</span>
           </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Tenants" 
          value={metrics?.total_tenants} 
          icon={Building2} 
          color="text-blue-400" 
        />
        <StatCard 
          title="Active Tenants" 
          value={metrics?.active_tenants} 
          icon={Activity} 
          color="text-emerald-400" 
        />
        <StatCard 
          title="Total Users" 
          value={metrics?.total_users} 
          icon={Users} 
          color="text-purple-400" 
        />
        <StatCard 
          title="Monthly Revenue" 
          value={metrics?.monthly_recurring_revenue} 
          icon={CreditCard} 
          color="text-indigo-400" 
          prefix="৳"
        />
      </div>

      {/* Tenants Table */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Registered Tenants
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-zinc-400 text-sm font-medium border-b border-white/10">
                <th className="px-6 py-4">Tenant Info</th>
                <th className="px-6 py-4">Plan & Status</th>
                <th className="px-6 py-4">Users</th>
                <th className="px-6 py-4">Joined At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      Loading tenants...
                    </div>
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 font-medium">
                    No tenants found matching criteria.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium group-hover:text-indigo-400 transition-colors">{tenant.name}</p>
                          <p className="text-xs text-zinc-500">Slug: {tenant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-medium text-zinc-300 capitalize border border-white/10">
                          {tenant.subscription_plan.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                          tenant.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          tenant.subscription_status === 'trialing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                          {tenant.subscription_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/10 w-fit">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        {tenant.users_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {format(new Date(tenant.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-zinc-400">
              Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fetchDashboardData(pagination.current_page - 1)}
                disabled={pagination.current_page === 1 || isLoading}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => fetchDashboardData(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page || isLoading}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
