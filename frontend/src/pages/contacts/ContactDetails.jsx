import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  Linkedin,
  Clock,
  MessageSquare,
  Globe,
  ExternalLink,
  Layers,
  AtSign
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ContactForm } from './ContactForm';
import { toast } from 'react-hot-toast';

export function ContactDetails() {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contacts/${id}`);
      setContact(response.data);
    } catch (error) {
      toast.error('Failed to load contact details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl text-white">Contact not found</h2>
        <Link to="/contacts" className="text-emerald-500 mt-4 inline-block">Back to Contacts</Link>
      </div>
    );
  }

  const fullName = `${contact.first_name} ${contact.last_name || ''}`.trim();

  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Link to="/contacts" className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Contacts
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-indigo-500/50"></div>
            
            <div className="relative inline-block mx-auto mb-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-800 border-4 border-zinc-900 overflow-hidden mx-auto flex items-center justify-center shadow-2xl">
                {contact.avatar_url ? (
                  <img src={contact.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-extrabold text-zinc-700">
                    {contact.first_name[0]}{contact.last_name?.[0] || ''}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-1 right-1 p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg hover:scale-110 transition-transform"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">{fullName}</h1>
            <p className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-6">
              {contact.job_title || 'No Title'}
            </p>

            <div className="flex justify-center gap-3">
              <span className="px-3 py-1.5 rounded-2xl bg-zinc-800/50 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                {contact.source || 'Manual'}
              </span>
              <span className="px-3 py-1.5 rounded-2xl bg-zinc-800/50 border border-zinc-700 text-zinc-400 text-xs font-bold capitalize">
                ID: {contact.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-zinc-800">
              <ProfileAction icon={MessageSquare} color="text-emerald-400" bgColor="bg-emerald-500/10" label="WhatsApp" />
              <ProfileAction icon={Mail} color="text-indigo-400" bgColor="bg-indigo-500/10" label="Email" />
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
               <AtSign className="w-3.5 h-3.5" /> Contact Information
            </h3>
            <div className="space-y-6">
              <SidebarItem icon={Mail} label="Primary Email" value={contact.email} />
              <SidebarItem icon={Phone} label="Contact Number" value={contact.phone} />
              <SidebarItem icon={MessageSquare} label="WhatsApp Number" value={contact.whatsapp_number} />
              {contact.account && (
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-[10px] text-zinc-500 font-extrabold uppercase mb-3">Associated Account</p>
                  <Link 
                    to={`/accounts/${contact.account.id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-800/30 border border-zinc-800 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold">
                      {contact.account.name[0]}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-white font-bold text-sm truncate group-hover:text-indigo-400 transition-colors">{contact.account.name}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">View Account Detail</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Hub */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl flex-1 flex flex-col">
            <div className="flex border-b border-zinc-800 p-2 gap-1 overflow-x-auto">
              {['activity', 'deals', 'whatsapp', 'notes'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all capitalize ${
                    activeTab === tab 
                      ? 'bg-zinc-800 text-white shadow-inner' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                  }`}
                >
                  {tab === 'whatsapp' ? 'WhatsApp' : tab}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6 overflow-y-auto min-h-[500px]">
              {activeTab === 'activity' && (
                <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-px before:bg-zinc-800/50">
                  <ActivityItem 
                    icon={Edit2} 
                    title="Profile updated" 
                    time="15 minutes ago" 
                    desc="System record was modified manually" 
                  />
                  <ActivityItem 
                    icon={Building2} 
                    title="Account link established" 
                    time="1 day ago" 
                    desc={`Linked to ${contact.account?.name || 'an account'}`} 
                  />
                  <ActivityItem 
                    icon={Plus} 
                    title="Contact created" 
                    time="2 days ago" 
                    desc="Created via manual entry in the CRM" 
                    isLast={true}
                  />
                </div>
              )}

              {activeTab === 'deals' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">Opportunities</h3>
                    <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300">
                      <Plus className="w-4 h-4 mr-1.5" /> New Deal
                    </Button>
                  </div>
                  {contact.deals?.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-800">
                       <Layers className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                       <p className="text-zinc-500">No active deals found for this contact.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contact.deals?.map(deal => (
                        <div key={deal.id} className="p-4 rounded-2xl bg-zinc-800/30 border border-zinc-800 flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-bold">{deal.title}</h4>
                            <p className="text-xs text-zinc-500 font-bold uppercase mt-1 tracking-widest">{deal.stage?.name}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-emerald-500 font-mono font-bold">${parseFloat(deal.value).toLocaleString()}</p>
                             <Link to={`/deals/${deal.id}`} className="text-[10px] text-zinc-500 hover:text-white uppercase font-black underline mt-0.5">Details</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(activeTab === 'whatsapp' || activeTab === 'notes') && (
                <div className="text-center py-24 text-zinc-500">
                   <Clock className="w-12 h-12 mx-auto mb-4 opacity-10" />
                   Interactive log coming soon...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Contact">
        <div className="p-4">
          <ContactForm 
            contact={contact}
            onSuccess={() => {
              setIsEditModalOpen(false);
              fetchContact();
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-zinc-500 uppercase tracking-tighter text-[10px] font-extrabold">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="text-white text-sm font-bold tracking-tight">{value}</p>
    </div>
  );
}

function ProfileAction({ icon: Icon, color, bgColor, label }) {
  return (
    <button className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${bgColor} border border-zinc-800 hover:border-indigo-500/30 transition-all group`}>
      <Icon className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform`} />
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
    </button>
  );
}

function ActivityItem({ icon: Icon, title, time, desc, isLast = false }) {
  return (
    <div className="flex gap-4 group">
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
          <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
        </div>
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-bold">{title}</h4>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{time}</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1 font-medium">{desc}</p>
      </div>
    </div>
  );
}
