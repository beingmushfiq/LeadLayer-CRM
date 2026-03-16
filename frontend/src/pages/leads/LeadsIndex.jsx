import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  MessageSquare, 
  Building2,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Eye,
  Edit2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LeadForm } from './LeadForm';
import toast from 'react-hot-toast';

export const LeadsIndex = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, [filterStatus]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const response = await api.get('/leads', { params });
      setLeads(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load leads');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      qualified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      lost: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      converted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      unqualified: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
    return colors[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  const openModal = (lead = null) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLead(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchLeads();
  };

  const filteredLeads = leads.filter(lead => {
    const fullName = `${lead.first_name} ${lead.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Lead Management
          </h1>
          <p className="text-zinc-400 mt-1">Track and manage your potential business opportunities.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800">
            <Filter className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="h-10 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
            onClick={() => openModal()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-blue-400' },
          { label: 'New This Week', value: '+12', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Qualified', value: filteredLeads.filter(l => l.status === 'qualified').length, icon: UserCheck, color: 'text-purple-400' },
          { label: 'Conversion Rate', value: '24%', icon: TrendingUp, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold mt-2 text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search leads by name, email or company..." 
            className="pl-10 h-10 bg-zinc-950 border-zinc-800 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            className="h-10 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse border-separate border-spacing-0">
          <thead>
            <tr className="bg-zinc-900/60 border-b border-zinc-800">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Lead Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 animate-pulse">
                  Querying Leads...
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                  No leads found.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-zinc-800/30 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/10 text-indigo-400 font-bold">
                        {lead.first_name[0]}{lead.last_name?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                          {lead.first_name} {lead.last_name}
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3" /> {lead.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-zinc-500" />
                      {lead.company_name || <span className="text-zinc-600 italic">Self-employed</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <TrendingUp className="w-3 h-3 text-emerald-400" />
                       <span className="text-sm font-semibold text-white">{lead.lead_score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {lead.assignee?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        to={`/leads/${lead.id}`}
                        className="p-2 hover:bg-indigo-500/10 hover:text-white rounded-lg text-zinc-500 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                      </Link>
                      <button 
                        className="p-2 hover:bg-indigo-500/10 hover:text-indigo-400 rounded-lg text-zinc-500 transition-colors"
                        onClick={() => openModal(lead)}
                        title="Edit Lead"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg text-zinc-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedLead ? 'Edit Lead' : 'Create New Lead'}
        maxWidth="2xl"
      >
        <LeadForm 
          lead={selectedLead} 
          onSuccess={handleSuccess} 
          onCancel={closeModal} 
        />
      </Modal>
    </div>
  );
};
