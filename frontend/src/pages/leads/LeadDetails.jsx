import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Globe, 
  Calendar, 
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRightLeft,
  CheckCircle2,
  MessageSquare,
  Users
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { ActivityTimeline } from '../../components/crm/ActivityTimeline';
import { Modal } from '../../components/ui/Modal';
import { LeadForm } from './LeadForm';
import { LeadConversionForm } from './LeadConversionForm';
import toast from 'react-hot-toast';

export const LeadDetails = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/leads/${id}`);
      setLead(response.data);
    } catch (error) {
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/leads/${id}`, { ...lead, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchLead();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Loading lead details...</div>;
  if (!lead) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <Link to="/leads" className="flex items-center text-zinc-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Leads
        </Link>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-zinc-800 bg-zinc-900/50"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsConvertModalOpen(true)}
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Convert to Deal
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20 mb-4">
                {lead.first_name[0]}{lead.last_name?.[0]}
              </div>
              <h2 className="text-xl font-bold text-white">{lead.first_name} {lead.last_name}</h2>
              <p className="text-zinc-500 text-sm mt-1">{lead.company_name || 'Individual Lead'}</p>
              
               {lead.status === 'converted' ? (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-[10px] uppercase text-emerald-500 font-bold mb-2">Deal converted</p>
                    <div className="space-y-2">
                       {lead.account_id && (
                         <Link to={`/accounts/${lead.account_id}`} className="flex items-center gap-2 text-zinc-300 hover:text-white text-xs font-bold">
                           <Building2 className="w-3 h-3 text-zinc-500" />
                           View Account
                         </Link>
                       )}
                       {lead.contact_id && (
                         <Link to={`/contacts/${lead.contact_id}`} className="flex items-center gap-2 text-zinc-300 hover:text-white text-xs font-bold">
                           <Users className="w-3 h-3 text-zinc-500" />
                           View Contact
                         </Link>
                       )}
                    </div>
                  </div>
               ) : (
                  <div className="mt-6 w-full space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold px-1">Status</label>
                    <select 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-indigo-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      value={lead.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="unqualified">Unqualified</option>
                      <option value="lost">Lost</option>
                      <option value="converted">Converted</option>
                    </select>
                  </div>
               )}
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">{lead.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">{lead.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">{lead.company_name || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">{lead.source || 'Direct Entry'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300 decoration-zinc-700 underline underline-offset-4">Created {new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-bold">Lead Score</p>
              <p className="text-2xl font-bold text-white mt-1">{lead.lead_score}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/10">
              {lead.lead_score}%
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Activity Timeline
              </h3>
              <Button variant="outline" className="h-8 text-xs border-zinc-800">
                Log Activity
              </Button>
            </div>

            <ActivityTimeline activities={lead.activity_logs || []} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Lead Details"
        maxWidth="2xl"
      >
        <LeadForm 
          lead={lead} 
          onSuccess={() => { setIsEditModalOpen(false); fetchLead(); }} 
          onCancel={() => setIsEditModalOpen(false)} 
        />
      </Modal>

      <Modal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        title="Convert Lead to Deal"
        maxWidth="2xl"
      >
        <LeadConversionForm 
          lead={lead} 
          onSuccess={() => setIsConvertModalOpen(false)} 
          onCancel={() => setIsConvertModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};
