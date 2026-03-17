import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Send, 
  CreditCard, 
  Printer, 
  MoreVertical,
  Calendar,
  User,
  Building2,
  FileText
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

export function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch invoice details');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await api.put(`/invoices/${id}`, { status: 'paid' });
      toast.success('Invoice marked as paid');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to update invoice status');
    }
  };

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  if (!invoice) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/invoices')}
          className="flex items-center text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </button>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 hover:text-white">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          {invoice.status !== 'paid' && (
            <Button 
              onClick={handleMarkAsPaid}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          )}
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
            <Send className="w-4 h-4 mr-2" />
            Send to Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Invoice Header */}
            <div className="p-8 border-b border-zinc-800 bg-zinc-950/50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-6 h-6 text-brand-500" />
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Invoice</h1>
                  </div>
                  <p className="text-zinc-500 text-sm">{invoice.invoice_number}</p>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase border mb-4",
                    invoice.status === 'paid' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                    invoice.status === 'sent' ? "text-blue-500 bg-blue-500/10 border-blue-500/20" :
                    "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
                  )}>
                    {invoice.status}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Total Amount</p>
                    <p className="text-3xl font-black text-indigo-400">{invoice.total} {invoice.currency}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Details */}
            <div className="grid grid-cols-2 gap-8 p-8 border-b border-zinc-800">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Billed To</h3>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-zinc-800 rounded-lg">
                    {invoice.account ? <Building2 className="w-4 h-4 text-brand-400" /> : <User className="w-4 h-4 text-brand-400" />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{invoice.account?.name || `${invoice.contact?.first_name} ${invoice.contact?.last_name}`}</p>
                    <p className="text-sm text-zinc-400">{invoice.account?.website || invoice.contact?.email}</p>
                    <p className="text-sm text-zinc-400">{invoice.account?.address}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Issuing Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Issue Date</p>
                    <p className="text-sm text-zinc-300 font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Due Date</p>
                    <p className="text-sm text-rose-400 font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/30 text-zinc-500">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Description</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Qty</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Unit Price</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {invoice.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-sm font-medium text-white">{item.description}</p>
                      </td>
                      <td className="px-8 py-5 text-sm text-zinc-400 text-right">{item.quantity}</td>
                      <td className="px-8 py-5 text-sm text-zinc-400 text-right">{item.unit_price}</td>
                      <td className="px-8 py-5 text-sm font-bold text-white text-right">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="p-8 bg-zinc-950/20">
              <div className="flex flex-col items-end space-y-3">
                <div className="flex justify-between w-64 text-sm text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{invoice.subtotal}</span>
                </div>
                <div className="flex justify-between w-64 text-sm text-zinc-400">
                  <span>Tax ({invoice.tax_rate}%)</span>
                  <span className="text-white font-medium">{invoice.tax_amount}</span>
                </div>
                <div className="flex justify-between w-64 text-sm text-zinc-400">
                  <span>Discount</span>
                  <span className="text-rose-400 font-medium">-{invoice.discount_amount}</span>
                </div>
                <div className="flex justify-between w-64 text-xl font-black text-white pt-4 border-t border-zinc-800">
                  <span>Grand Total</span>
                  <span className="text-indigo-400">{invoice.total} {invoice.currency}</span>
                </div>
              </div>
            </div>

            {/* Footer / Notes */}
            {invoice.notes && (
              <div className="p-8 border-t border-zinc-800 bg-zinc-950/10">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Notes & Terms</h3>
                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" />
              History & Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3 relative pb-4">
                <div className="absolute left-2 top-6 bottom-0 w-px bg-zinc-800" />
                <div className="w-4 h-4 rounded-full bg-indigo-500/20 border-2 border-indigo-500 z-10" />
                <div>
                  <p className="text-xs font-bold text-zinc-300">Invoice Created</p>
                  <p className="text-[10px] text-zinc-500">{new Date(invoice.created_at).toLocaleString()}</p>
                </div>
              </div>
              {invoice.status === 'paid' && (
                <div className="flex gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500 z-10" />
                  <div>
                    <p className="text-xs font-bold text-zinc-300">Payment Recorded</p>
                    <p className="text-[10px] text-zinc-500">Manual Entry</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
