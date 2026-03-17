import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Send, 
  BarChart3, 
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { CampaignForm } from './CampaignForm';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export function CampaignsIndex() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/email-campaigns');
      setCampaigns(response.data.data || []);
    } catch {
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'draft': return <Mail className="w-4 h-4 text-zinc-500" />;
      default: return <AlertCircle className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'scheduled': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'draft': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const handleSend = async (id) => {
    try {
      await api.post(`/email-campaigns/${id}/send`);
      toast.success('Campaign sending started');
      fetchCampaigns();
    } catch {
      toast.error('Failed to send campaign');
    }
  };

  const filteredCampaigns = campaigns.filter(camp => {
    const matchesSearch = camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camp.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || camp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Email Campaigns</h1>
          <p className="text-zinc-400 mt-1">Design, send, and track your marketing reach</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedCampaign(null);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search campaigns..." 
            className="pl-10 bg-zinc-900/50 border-zinc-800 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <select 
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white appearance-none outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-zinc-500">Loading campaigns...</div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <Mail className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No campaigns found matching your criteria</p>
          </div>
        ) : (
          filteredCampaigns.map((camp) => (
            <div key={camp.id} className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1.5",
                  getStatusColor(camp.status)
                )}>
                  {getStatusIcon(camp.status)}
                  {camp.status}
                </div>
                <button className="text-zinc-500 hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <Link to={`/marketing/${camp.id}`} className="block group/title">
                <h3 className="text-lg font-bold text-white mb-1 group-hover/title:text-indigo-400 transition-colors truncate">
                  {camp.name}
                </h3>
                <p className="text-sm text-zinc-400 mb-4 truncate italic">"{camp.subject}"</p>
              </Link>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="text-center p-2 bg-zinc-950/50 rounded-xl">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter mb-0.5">Recipients</p>
                  <p className="text-sm font-bold text-white">{camp.total_recipients || 0}</p>
                </div>
                <div className="text-center p-2 bg-zinc-950/50 rounded-xl">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter mb-0.5">Open Rate</p>
                  <p className="text-sm font-bold text-emerald-400">{camp.open_rate || 0}%</p>
                </div>
                <div className="text-center p-2 bg-zinc-950/50 rounded-xl">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter mb-0.5">Click Rate</p>
                  <p className="text-sm font-bold text-blue-400">{camp.click_rate || 0}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                <span className="text-[10px] text-zinc-600 font-medium">
                  Created by {camp.creator?.first_name}
                </span>
                <div className="flex gap-2">
                  {camp.status === 'draft' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleSend(camp.id)}
                      className="h-8 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white border-none text-[11px] font-bold uppercase tracking-wider"
                    >
                      <Send className="w-3 h-3 mr-1.5" />
                      Send Now
                    </Button>
                  )}
                  <Link to={`/marketing/${camp.id}`}>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-8 text-zinc-400 hover:text-white text-[11px] font-bold uppercase tracking-wider"
                    >
                      <BarChart3 className="w-3 h-3 mr-1.5" />
                      Stats
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        maxWidth="4xl"
      >
        <CampaignForm 
          campaign={selectedCampaign}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCampaigns();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
