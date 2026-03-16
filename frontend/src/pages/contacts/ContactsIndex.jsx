import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  Building2,
  ChevronRight,
  Edit2,
  Trash2,
  Linkedin,
  Clock,
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';
import { ContactForm } from './ContactForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export function ContactsIndex() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async (search = '') => {
    try {
      setLoading(true);
      const response = await api.get('/contacts', { params: { search } });
      setContacts(response.data.data);
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchContacts(searchTerm);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-500" />
            Contacts
          </h1>
          <p className="text-zinc-400 mt-1">Manage individuals and key stakeholders</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 transition-all"
          />
        </form>
        <div className="flex gap-2">
          <Button variant="secondary" className="border-zinc-700 text-zinc-300">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Contact</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Account</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Contact Info</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Source</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-4 h-16 bg-zinc-800/10"></td>
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 mb-4 opacity-20" />
                      <p>No contacts found</p>
                      <Button variant="link" onClick={() => setIsModalOpen(true)} className="text-emerald-500 mt-2">
                        Create your first contact
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="group hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/contacts/${contact.id}`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-medium overflow-hidden">
                          {contact.avatar_url ? (
                            <img src={contact.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                            {contact.first_name} {contact.last_name}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {contact.job_title || 'No Title'}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {contact.account ? (
                        <Link to={`/accounts/${contact.account.id}`} className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors">
                          <Building2 className="w-4 h-4 text-zinc-500" />
                          <span className="text-sm">{contact.account.name}</span>
                        </Link>
                      ) : (
                        <span className="text-sm text-zinc-500 italic">No Account</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Mail className="w-3.5 h-3.5 text-zinc-500" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {contact.source === 'whatsapp' ? (
                          <MessageSquare className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Clock className="w-3 h-3 text-zinc-500" />
                        )}
                        {contact.source || 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Link to={`/contacts/${contact.id}`} className="text-zinc-400 hover:text-emerald-400 p-1">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Creation Modal Placeholder */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create New Contact"
      >
        <div className="p-4">
          <ContactForm 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchContacts();
            }}
            onCancel={() => setIsModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
