import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

export function ContactForm({ contact = null, initialAccountId = null, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    whatsapp_number: '',
    job_title: '',
    account_id: initialAccountId || '',
    source: 'manual'
  });

  useEffect(() => {
    fetchAccounts();
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        whatsapp_number: contact.whatsapp_number || '',
        job_title: contact.job_title || '',
        account_id: contact.account_id || '',
        source: contact.source || 'manual'
      });
    }
  }, [contact, initialAccountId]);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts', { params: { per_page: 100 } });
      setAccounts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch accounts');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (contact) {
        await api.put(`/contacts/${contact.id}`, formData);
        toast.success('Contact updated successfully');
      } else {
        await api.post('/contacts', formData);
        toast.success('Contact created successfully');
      }
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">First Name *</label>
          <Input 
            required
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            placeholder="Jane"
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Last Name</label>
          <Input 
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            placeholder="Doe"
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
          <Input 
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jane@example.com"
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Job Title</label>
          <Input 
            value={formData.job_title}
            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            placeholder="Marketing Manager"
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-400 mb-1">Account / Company</label>
          <select 
            value={formData.account_id}
            onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
            className="w-full h-10 px-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Independent / No Account</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Phone</label>
          <Input 
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 234 567 890"
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">WhatsApp</label>
          <Input 
            value={formData.whatsapp_number}
            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
            placeholder="+8801..."
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Source</label>
          <select 
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full h-10 px-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="manual">Manual</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="web_form">Web Form</option>
            <option value="referral">Referral</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-zinc-800">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
        >
          {loading ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  );
}
