import { useAuth } from '../contexts/AuthContext';
import { Target, Users, DollarSign, Activity } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Revenue', value: '$45,231.89', change: '+20.1%', trending: 'up', icon: DollarSign },
    { name: 'Active Deals', value: '124', change: '+12.5%', trending: 'up', icon: Target },
    { name: 'New Leads', value: '89', change: '-4.2%', trending: 'down', icon: Users },
    { name: 'Conversion Rate', value: '24.5%', change: '+5.4%', trending: 'up', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium text-gray-900">
            Welcome back, {user?.first_name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with {user?.tenant?.name} today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="glass rounded-xl p-6 transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="p-2 bg-brand-50 rounded-lg">
                <stat.icon className="h-6 w-6 text-brand-600" />
              </div>
              <p className="ml-3 text-sm font-medium text-gray-500">{stat.name}</p>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className={`text-sm font-medium ${
                stat.trending === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for future charts/tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass rounded-xl p-6 h-96 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300">
          <Activity className="h-8 w-8 mb-2 opacity-50" />
          <p>Revenue Pipeline Chart</p>
          <span className="text-xs mt-1">(Upcoming Phase)</span>
        </div>
        <div className="glass rounded-xl p-6 h-96 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300">
          <Users className="h-8 w-8 mb-2 opacity-50" />
          <p>Recent Activities</p>
          <span className="text-xs mt-1">(Upcoming Phase)</span>
        </div>
      </div>
    </div>
  );
}
