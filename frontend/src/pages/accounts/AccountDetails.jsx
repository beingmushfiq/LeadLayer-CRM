import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Layers, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  ChevronLeft,
  Plus,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  Clock,
  Edit2
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ContactForm } from '../contacts/ContactForm';
import { AccountForm } from './AccountForm';
import { toast } from 'react-hot-toast';

export function AccountDetails() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contacts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    fetchAccount();
  }, [id]);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/accounts/${id}`);
      setAccount(response.data);
    } catch (error) {
      toast.error('Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl text-white">Account not found</h2>
        <Link to="/accounts" className="text-indigo-500 mt-4 inline-block">Back to Accounts</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Link to="/accounts" className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Accounts
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 mb-8 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
              {account.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{account.name}</h1>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-widest">
                  {account.industry || 'General'}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  {account.city ? `${account.city}, ${account.country || ''}` : 'Location unknown'}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="secondary" 
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 md:flex-none border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Account
            </Button>
            <Button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-zinc-800/50">
          <DetailItem icon={Globe} label="Website" value={account.website} isLink />
          <DetailItem icon={Mail} label="Email" value={account.email} />
          <DetailItem icon={Phone} label="Phone" value={account.phone} />
          <DetailItem icon={Clock} label="Last Activity" value="2 hours ago" />
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
            <div className="flex border-b border-zinc-800 p-2 gap-1 overflow-x-auto">
              {['contacts', 'deals', 'notes', 'activity'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all capitalize ${
                    activeTab === tab 
                      ? 'bg-zinc-800 text-white shadow-inner' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'contacts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Associated Contacts</h3>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setIsContactModalOpen(true)}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add New Contact
                    </Button>
                  </div>
                  {account.contacts?.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-800">
                      <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500">No contacts linked to this account yet.</p>
                      <Button variant="link" onClick={() => setIsContactModalOpen(true)} className="text-indigo-500 mt-2 font-bold">
                        Add the first contact
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {account.contacts?.map(contact => (
                        <Link 
                          key={contact.id} 
                          to={`/contacts/${contact.id}`}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-800/30 border border-zinc-800 hover:border-indigo-500/30 hover:bg-zinc-800/50 transition-all group shadow-sm"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                            {contact.first_name?.[0]}{contact.last_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold group-hover:text-indigo-400 transition-colors">{contact.first_name} {contact.last_name}</h4>
                            <p className="text-xs text-zinc-500 font-medium">{contact.job_title || 'No Title'}</p>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-zinc-700 rotate-180 group-hover:text-indigo-500 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'deals' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Pipeline Deals</h3>
                    <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                      <Plus className="w-4 h-4 mr-1.5" />
                      Create New Deal
                    </Button>
                  </div>
                  {account.deals?.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-800">
                      <Layers className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500">No active deals found for this account.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {account.deals?.map(deal => (
                        <div key={deal.id} className="p-4 rounded-2xl bg-zinc-800/30 border border-zinc-800 flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-bold">{deal.title}</h4>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-emerald-500 font-mono text-sm leading-none">${parseFloat(deal.value).toLocaleString()}</span>
                              <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{deal.stage?.name || 'In Progress'}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="bg-zinc-800/50 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400">
                            View Deal
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Other tabs simplified for now */}
              {(activeTab === 'notes' || activeTab === 'activity') && (
                <div className="text-center py-12 text-zinc-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  Coming soon...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Account Owner</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-bold">
                  {account.owner ? `${account.owner.first_name} ${account.owner.last_name}` : 'Unassigned'}
                </p>
                <p className="text-xs text-zinc-500 font-medium">Primary Representative</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Location Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Address</p>
                <p className="text-white text-sm font-medium leading-relaxed">
                  {account.address_line_1 || 'Not specified'}<br />
                  {account.city && `${account.city}, `}{account.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Account">
        <div className="p-4">
          <AccountForm 
            account={account}
            onSuccess={() => {
              setIsEditModalOpen(false);
              fetchAccount();
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </div>
      </Modal>

      <Modal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} title="Add Contact">
        <div className="p-4">
          <ContactForm 
            initialAccountId={account.id}
            onSuccess={() => {
              setIsContactModalOpen(false);
              fetchAccount();
            }}
            onCancel={() => setIsContactModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, isLink = false }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-zinc-500 uppercase tracking-tighter text-[10px] font-extrabold">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      {isLink ? (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white text-sm font-bold hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
        >
          {value.replace(/^https?:\/\//, '')}
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
      ) : (
        <p className="text-white text-sm font-bold">{value}</p>
      )}
    </div>
  );
}
