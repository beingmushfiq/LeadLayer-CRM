import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Layers, 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Plus,
  MessageSquare,
  History,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

export function DealDetails() {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/deals/${id}`);
      setDeal(response.data);
    } catch (error) {
      toast.error('Failed to load deal details');
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (stageId) => {
    try {
      await api.put(`/deals/${id}`, { stage_id: stageId });
      toast.success('Stage updated');
      fetchDeal();
    } catch (error) {
      toast.error('Failed to update stage');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!deal) return <div className="p-8 text-center text-zinc-500">Deal not found</div>;

  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/deals" className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Kanban
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="border-zinc-700 text-zinc-300">Edit Deal</Button>
          <Button variant="outline" size="sm" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">Archive</Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 mb-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-6 max-w-2xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{deal.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm font-medium">
                {deal.account && (
                  <Link to={`/accounts/${deal.account.id}`} className="flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors">
                    <Building2 className="w-4 h-4 text-zinc-500" />
                    {deal.account.name}
                  </Link>
                )}
                {deal.contact && (
                  <Link to={`/contacts/${deal.contact.id}`} className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors">
                    <Users className="w-4 h-4 text-zinc-500" />
                    {deal.contact.first_name} {deal.contact.last_name}
                  </Link>
                )}
                <div className="flex items-center gap-2 text-zinc-500">
                  <Calendar className="w-4 h-4" />
                  Expected Close: {deal.expected_close_date || 'Not set'}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50 text-right min-w-[200px]">
             <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Deal Value</p>
             <p className="text-3xl font-extrabold text-white">
                <span className="text-indigo-400 mr-1 opacity-50">$</span>
                {parseFloat(deal.value).toLocaleString()}
             </p>
             <p className="text-xs text-emerald-400 mt-2 font-bold uppercase tracking-wider">Probability: 75%</p>
          </div>
        </div>

        {/* Pipeline Progress */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4 px-1">
             <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                Pipeline: {deal.pipeline?.name}
             </span>
             <span className="text-xs font-bold text-indigo-400">Step {deal.stage?.order + 1} of 5</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div 
                key={step}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all duration-500",
                  step <= (deal.stage?.order + 1) ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-zinc-800"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interaction Hub */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl flex flex-col min-h-[500px]">
            <div className="flex border-b border-zinc-800 p-2 gap-1 overflow-x-auto">
              {[
                { id: 'timeline', label: 'Activity', icon: History },
                { id: 'notes', label: 'Notes', icon: FileText },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-6 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2",
                    activeTab === tab.id 
                      ? 'bg-zinc-800 text-white shadow-inner' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="p-6 flex-1">
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <ActivityItem 
                    icon={CheckCircle2} 
                    title="Stage Changed" 
                    desc={`Moved to ${deal.stage?.name}`} 
                    time="1 hour ago" 
                  />
                  <ActivityItem 
                    icon={DollarSign} 
                    title="Value Updated" 
                    desc="Increased deal value by $5,000" 
                    time="Yesterday" 
                  />
                  <ActivityItem 
                    icon={Plus} 
                    title="Deal Created" 
                    desc="Automated creation from Lead conversion" 
                    time="3 days ago" 
                    isLast 
                  />
                </div>
              )}
              {activeTab !== 'timeline' && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                  <Clock className="w-12 h-12 mb-4 opacity-10" />
                  <p>No {activeTab} yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Details</h3>
            <div className="space-y-6">
               <SidebarStat label="Assigned To" value={deal.assigned_to_user?.first_name || 'Unassigned'} />
               <SidebarStat label="Pipeline" value={deal.pipeline?.name} />
               <SidebarStat label="Current Stage" value={deal.stage?.name} />
               <SidebarStat label="Currency" value={deal.currency} />
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <h3 className="text-white font-bold">Deal Status</h3>
             </div>
             <p className="text-sm text-zinc-400 mb-6 font-medium leading-relaxed">
                This deal is currently in progress. Target close date is within 2 weeks.
             </p>
             <div className="grid grid-cols-2 gap-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Mark Won</Button>
                <Button size="sm" variant="secondary" className="border-zinc-700 text-zinc-400 font-bold">Mark Lost</Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarStat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter mb-1">{label}</p>
      <p className="text-white font-bold text-sm tracking-tight">{value || 'N/A'}</p>
    </div>
  );
}

function ActivityItem({ icon: Icon, title, desc, time, isLast }) {
  return (
    <div className="flex gap-4 group h-full">
      <div className="relative flex flex-col items-center">
        <div className="z-10 w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
           <Icon className="w-4 h-4" />
        </div>
        {!isLast && <div className="w-px bg-zinc-800 group-hover:bg-indigo-500/30 flex-1 transition-colors"></div>}
      </div>
      <div className="pb-8">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-white font-bold text-sm">{title}</h4>
          <span className="text-[10px] text-zinc-500 font-bold">{time}</span>
        </div>
        <p className="text-xs text-zinc-500 font-medium">{desc}</p>
      </div>
    </div>
  );
}
