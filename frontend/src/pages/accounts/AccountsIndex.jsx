import { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  ExternalLink, 
  Users, 
  Layers,
  ChevronRight,
  Edit2,
  Trash2,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
import { api } from '../../services/api';
import { AccountForm } from './AccountForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export function AccountsIndex() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async (search = '') => {
    try {
      setLoading(true);
      const response = await api.get('/accounts', { params: { search } });
      setAccounts(response.data.data);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAccounts(searchTerm);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-500" />
            Accounts
          </h1>
          <p className="text-zinc-400 mt-1">Manage partner companies and organizations</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Accounts', value: accounts.length, icon: Building2, color: 'text-indigo-500' },
          { label: 'Active Contacts', value: accounts.reduce((acc, curr) => acc + (curr.contacts_count || 0), 0), icon: Users, color: 'text-emerald-500' },
          { label: 'Total Deals', value: accounts.reduce((acc, curr) => acc + (curr.deals_count || 0), 0), icon: Layers, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-zinc-800/50 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search by company name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-800/50 border-zinc-700/50 focus:border-indigo-500/50 transition-all"
          />
        </form>
        <div className="flex gap-2">
          <Button variant="secondary" className="border-zinc-700 text-zinc-300">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Account Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Industry</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Engagement</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Owner</th>
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
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center">
                      <Building2 className="w-12 h-12 mb-4 opacity-20" />
                      <p>No accounts found</p>
                      <Button variant="link" onClick={() => setIsModalOpen(true)} className="text-indigo-500 mt-2">
                        Create your first account
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="group hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/accounts/${account.id}`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {account.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                            {account.name}
                          </div>
                          {account.website && (
                            <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                              <Globe className="w-3 h-3" />
                              {account.website.replace(/^https?:\/\//, '')}
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {account.industry || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-zinc-500 uppercase tracking-tighter font-bold">People</span>
                          <span className="text-white flex items-center gap-1.5 font-medium">
                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                            {account.contacts_count || 0}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-zinc-500 uppercase tracking-tighter font-bold">Deals</span>
                          <span className="text-white flex items-center gap-1.5 font-medium">
                            <Layers className="w-3.5 h-3.5 text-amber-500" />
                            {account.deals_count || 0}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-white">
                          {account.owner ? account.owner.first_name.charAt(0) : '?'}
                        </div>
                        <span className="text-sm text-zinc-300">
                          {account.owner ? `${account.owner.first_name} ${account.owner.last_name}` : 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Link to={`/accounts/${account.id}`} className="text-zinc-400 hover:text-indigo-400 p-1">
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

      {/* Account Creation Modal Placeholder */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create New Account"
      >
        <div className="p-4">
          <AccountForm 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchAccounts();
            }}
            onCancel={() => setIsModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
