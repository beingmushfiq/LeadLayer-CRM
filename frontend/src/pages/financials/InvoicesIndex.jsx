import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Download,
  Filter
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { InvoiceForm } from './InvoiceForm';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function InvoicesIndex() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices');
      setInvoices(response.data.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (invoice = null) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'overdue': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'sent': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'draft': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Financials
            <span className="text-sm font-normal text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              Invoices
            </span>
          </h1>
          <p className="text-zinc-400 mt-1">Manage billing, payments, and invoice tracking</p>
        </div>
        <Button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search invoice number..." 
            className="pl-10 bg-zinc-900/50 border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
          {['all', 'draft', 'sent', 'paid', 'overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                statusFilter === status ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 content-start rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Invoice</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Client</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-zinc-500">Loading invoices...</td></tr>
            ) : filteredInvoices.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-zinc-500">No invoices found.</td></tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="text-sm font-medium text-brand-500 hover:text-brand-400 hover:underline transition-all"
                      >
                        {inv.invoice_number}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      onClick={() => openModal(inv)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border cursor-pointer hover:opacity-80 transition-opacity",
                        getStatusColor(inv.status)
                      )}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-300">
                      {inv.contact?.first_name || inv.account?.name || 'Unknown Client'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(inv.issue_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-semibold text-white">
                      {inv.total} {inv.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                        <MoreVertical className="w-4 h-4" />
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
        onClose={() => setIsModalOpen(false)}
        title={selectedInvoice ? 'Edit Invoice' : 'New Invoice'}
        maxWidth="5xl"
      >
        <InvoiceForm 
          invoice={selectedInvoice}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchInvoices();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
