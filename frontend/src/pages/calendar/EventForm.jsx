import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

export function EventForm({ event, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    starts_at: event?.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : '',
    ends_at: event?.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : '',
    is_all_day: event?.is_all_day || false,
    eventable_type: event?.eventable_type || '',
    eventable_id: event?.eventable_id || '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (event) {
        await api.put(`/calendar-events/${event.id}`, formData);
        toast.success('Event updated');
      } else {
        await api.post('/calendar-events', formData);
        toast.success('Event scheduled');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Event Title</label>
          <Input 
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Meeting with client..."
            className="bg-zinc-900 border-zinc-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Starts At</label>
            <Input 
              type="datetime-local"
              required
              value={formData.starts_at}
              onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Ends At</label>
            <Input 
              type="datetime-local"
              required
              value={formData.ends_at}
              onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Location</label>
          <Input 
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Zoom, Coffee Shop, etc."
            className="bg-zinc-900 border-zinc-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description</label>
          <textarea 
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg bg-zinc-900 border-zinc-800 text-white text-sm p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Agenda, notes, etc."
          />
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox"
            id="is_all_day"
            checked={formData.is_all_day}
            onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
            className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="is_all_day" className="text-sm text-zinc-400">All day event</label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-8">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[100px]">
          {event ? 'Update Event' : 'Schedule Event'}
        </Button>
      </div>
    </form>
  );
}
