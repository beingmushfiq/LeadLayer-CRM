import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

export function AccountForm({ account = null, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    phone: '',
    email: '',
    address_line_1: '',
    city: '',
    country: '',
    owner_id: ''
  });

  useEffect(() => {
    fetchUsers();
    if (account) {
      setFormData({
        name: account.name || '',
        industry: account.industry || '',
        website: account.website || '',
        phone: account.phone || '',
        email: account.email || '',
        address_line_1: account.address_line_1 || '',
        city: account.city || '',
        country: account.country || '',
        owner_id: account.owner_id || ''
      });
    }
  }, [account]);

  const fetchUsers = async () => {
    try {
      // In a real app, you'd fetch users for the owner dropdown
      // For now, let's assume current user or a list
      const response = await api.get('/user'); // Or a specific /users endpoint if it existed
      if (response.data) setUsers([response.data]);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (account) {
        await api.put(`/accounts/${account.id}`, formData);
        toast.success('Account updated successfully');
      } else {
        await api.post('/accounts', formData);
        toast.success('Account created successfully');
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
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-400 mb-1">Company Name *</label>
          <Input 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Acme Corp"
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Industry</label>
          <Input 
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            placeholder="e.g. Technology"
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Website</label>
          <Input 
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.com"
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
          <Input 
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contact@company.com"
            className="bg-zinc-800/50 border-zinc-700"
          />
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-400 mb-1">Address</label>
          <Input 
            value={formData.address_line_1}
            onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
            placeholder="123 Business St"
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">City</label>
          <Input 
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="San Francisco"
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Owner</label>
          <select 
            value={formData.owner_id}
            onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            className="w-full h-10 px-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
            ))}
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]"
        >
          {loading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}
