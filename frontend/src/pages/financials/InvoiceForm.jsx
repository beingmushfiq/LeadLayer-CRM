import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

export function InvoiceForm({ invoice, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientType, setClientType] = useState('account'); // account or contact
  const [formData, setFormData] = useState({
    invoice_number: invoice?.invoice_number || `INV-${Date.now().toString().slice(-6)}`,
    account_id: invoice?.account_id || '',
    contact_id: invoice?.contact_id || '',
    deal_id: invoice?.deal_id || '',
    status: invoice?.status || 'draft',
    issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    currency: invoice?.currency || 'BDT',
    notes: invoice?.notes || '',
    items: invoice?.items || [
      { description: '', quantity: 1, unit_price: 0, total: 0 }
    ],
    tax_rate: invoice?.tax_rate || 0,
    discount_amount: invoice?.discount_amount || 0,
  });

  useEffect(() => {
    fetchClients();
  }, [clientType, fetchClients]);

  const fetchClients = async () => {
    try {
      const endpoint = clientType === 'account' ? '/accounts' : '/contacts';
      const response = await api.get(endpoint);
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch clients');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * (formData.tax_rate / 100);
    return subtotal + tax - formData.discount_amount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        subtotal: calculateSubtotal(),
        tax_amount: calculateSubtotal() * (formData.tax_rate / 100),
        total: calculateTotal(),
      };

      if (invoice) {
        await api.put(`/invoices/${invoice.id}`, payload);
        toast.success('Invoice updated');
      } else {
        await api.post('/invoices', payload);
        toast.success('Invoice created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Details</h3>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Invoice Number</label>
            <Input 
              required
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              className="bg-zinc-950 border-zinc-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Issue Date</label>
              <Input 
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Due Date</label>
              <Input 
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Client</h3>
          <div className="flex gap-2 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setClientType('account')}
              className={cn(
                "flex-1 py-1 text-[10px] font-bold uppercase rounded transition-all",
                clientType === 'account' ? "bg-zinc-800 text-white" : "text-zinc-500"
              )}
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => setClientType('contact')}
              className={cn(
                "flex-1 py-1 text-[10px] font-bold uppercase rounded transition-all",
                clientType === 'contact' ? "bg-zinc-800 text-white" : "text-zinc-500"
              )}
            >
              Contact
            </button>
          </div>
          <div>
            <select
              value={clientType === 'account' ? formData.account_id : formData.contact_id}
              onChange={(e) => setFormData({ 
                ...formData, 
                account_id: clientType === 'account' ? e.target.value : '',
                contact_id: clientType === 'contact' ? e.target.value : ''
              })}
              className="w-full rounded-lg bg-zinc-950 border-zinc-800 text-white text-sm p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select {clientType}...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name || `${c.first_name} ${c.last_name}`}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Settings</h3>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-lg bg-zinc-950 border-zinc-800 text-white text-sm p-2.5 outline-none"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Currency</label>
            <Input 
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="bg-zinc-950 border-zinc-800"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Items</h3>
          <Button type="button" onClick={addItem} variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-start animate-in slide-in-from-left-2 duration-200">
              <div className="col-span-6">
                <Input 
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="col-span-2">
                <Input 
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="col-span-2">
                <Input 
                  type="number"
                  placeholder="Price"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="col-span-1 py-2 text-right font-medium text-zinc-300">
                {(item.total || 0).toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-end py-1">
                <button 
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1.5 text-zinc-600 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 pt-6 border-t border-zinc-800">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Notes / Terms</label>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Payment instructions, etc."
          />
        </div>
        <div className="w-full md:w-64 space-y-3">
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Subtotal</span>
            <span className="text-white font-medium">{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Tax (%)</span>
            <input 
              type="number"
              className="w-16 bg-zinc-950 border border-zinc-800 rounded text-right px-2 py-0.5 text-white"
              value={formData.tax_rate}
              onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Discount</span>
            <input 
              type="number"
              className="w-24 bg-zinc-950 border border-zinc-800 rounded text-right px-2 py-0.5 text-white"
              value={formData.discount_amount}
              onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-zinc-800">
            <span>Total</span>
            <span className="text-indigo-400">{calculateTotal().toFixed(2)} {formData.currency}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
          <Save className="w-4 h-4 mr-2" />
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
