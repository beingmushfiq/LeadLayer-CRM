import { useState } from 'react';
import { Save, Send, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

export function CampaignForm({ campaign, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    subject: campaign?.subject || '',
    from_name: campaign?.from_name || '',
    from_email: campaign?.from_email || '',
    body_html: campaign?.body_html || '',
    scheduled_at: campaign?.scheduled_at ? new Date(campaign.scheduled_at).toISOString().slice(0, 16) : '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (campaign) {
        await api.put(`/email-campaigns/${campaign.id}`, formData);
        toast.success('Campaign updated');
      } else {
        await api.post('/email-campaigns', formData);
        toast.success('Campaign created as draft');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Campaign Name</label>
            <Input 
              required
              placeholder="e.g. March Newsletter 2024"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-zinc-950 border-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email Subject</label>
            <Input 
              required
              placeholder="The subject line recipients will see"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="bg-zinc-950 border-zinc-800 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">From Name</label>
              <Input 
                placeholder="Sender Display Name"
                value={formData.from_name}
                onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">From Email</label>
              <Input 
                type="email"
                placeholder="sender@company.com"
                value={formData.from_email}
                onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Schedule (Optional)</label>
            <Input 
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              className="bg-zinc-950 border-zinc-800 text-white"
            />
          </div>
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-tighter mb-1">Marketing Tip</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Campaigns are created as <b>Drafts</b>. You can review and test the layout before sending it to your entire contact list.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email Content (HTML)</label>
        <textarea
          required
          rows={12}
          value={formData.body_html}
          onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          placeholder="<html><body><h1>Hello!</h1></body></html>"
        />
        <p className="text-[10px] text-zinc-500 mt-2 italic">
          Tip: You can use HTML tags to style your email content. Responsive templates are recommended.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
          <Save className="w-4 h-4 mr-2" />
          {campaign ? 'Update Campaign' : 'Save as Draft'}
        </Button>
      </div>
    </form>
  );
}
