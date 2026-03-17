import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Users, 
  MousePointer2, 
  Eye, 
  AlertTriangle,
  Send,
  Calendar,
  MoreVertical,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

export function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCampaign = useCallback(async () => {
    try {
      const response = await api.get(`/email-campaigns/${id}`);
      setCampaign(response.data.data);
    } catch {
      toast.error('Failed to fetch campaign details');
      navigate('/marketing');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleSend = async () => {
    try {
      await api.post(`/email-campaigns/${id}/send`);
      toast.success('Campaign sent successfully');
      fetchCampaign();
    } catch (error) {
      toast.error('Failed to send campaign');
    }
  };

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  if (!campaign) return null;

  const stats = [
    { label: 'Total Recipients', value: campaign.total_recipients, icon: Users, color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
    { label: 'Delivered', value: campaign.total_sent, icon: Mail, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Opened', value: campaign.total_opened, icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Clicked', value: campaign.total_clicked, icon: MousePointer2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/marketing')}
          className="flex items-center text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </button>
        <div className="flex gap-3">
          {campaign.status === 'draft' && (
            <Button 
              onClick={handleSend}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-4 h-4 mr-2" />
              Launch Campaign
            </Button>
          )}
          <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <stat.icon className={cn("absolute -right-2 -bottom-2 w-16 h-16 opacity-5 group-hover:scale-110 transition-transform", stat.color)} />
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Campaign Overview</h2>
                <p className="text-sm text-zinc-400 italic">Subject: {campaign.subject}</p>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase border",
                campaign.status === 'sent' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
              )}>
                {campaign.status}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Sent At</p>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <span className="text-sm">{campaign.sent_at ? new Date(campaign.sent_at).toLocaleString() : 'Not sent yet'}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Created By</p>
                <div className="flex items-center gap-2 text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold uppercase">
                    {campaign.creator?.first_name?.[0]}
                  </div>
                  <span className="text-sm">{campaign.creator?.first_name} {campaign.creator?.last_name}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Recipients</p>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">{campaign.total_recipients} Contacts</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Preview</h3>
              <div 
                className="bg-white rounded-xl p-8 overflow-hidden min-h-[400px] shadow-inner text-zinc-900"
                dangerouslySetInnerHTML={{ __html: campaign.body_html }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500" />
              Recent Recipients
            </h3>
            <div className="space-y-4">
              {campaign.recipients?.slice(0, 10).map((recip, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg">
                      <Mail className="w-3 h-3 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200 truncate max-w-[120px]">{recip.contact?.first_name || recip.email}</p>
                      <p className="text-[10px] text-zinc-500">{recip.email}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0",
                    recip.status === 'sent' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-zinc-500 border-zinc-500/20 bg-zinc-500/5"
                  )}>
                    {recip.status}
                  </div>
                </div>
              ))}
              {(!campaign.recipients || campaign.recipients.length === 0) && (
                <p className="text-xs text-zinc-500 text-center py-4 italic">No recipients processed yet</p>
              )}
            </div>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
            <FileText className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-500/10 rotate-12" />
            <h3 className="text-sm font-black text-white mb-2 uppercase tracking-tight">Performance Summary</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-tighter">Engagement Rank</span>
                <span className="text-2xl font-black text-indigo-400">#1</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                This campaign is performing in the top 10% of your current month's marketing reach.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
