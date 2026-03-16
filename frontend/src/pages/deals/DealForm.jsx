import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';

const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().min(0).default(0),
  pipeline_id: z.number().min(1, 'Pipeline is required'),
  stage_id: z.number().min(1, 'Stage is required'),
  probability: z.number().min(0).max(100).default(50),
  status: z.enum(['open', 'won', 'lost', 'on_hold']).default('open'),
  expected_close_date: z.string().optional().or(z.literal('')),
  description: z.string().optional(),
});

export const DealForm = ({ deal, pipelines, onSuccess, onCancel }) => {
  const isEditing = !!deal;
  const [availableStages, setAvailableStages] = useState([]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(dealSchema),
    defaultValues: deal || {
      title: '',
      value: 0,
      pipeline_id: pipelines[0]?.id || '',
      stage_id: pipelines[0]?.stages?.[0]?.id || '',
      probability: 50,
      status: 'open',
      expected_close_date: '',
      description: '',
    }
  });

  const selectedPipelineId = watch('pipeline_id');

  useEffect(() => {
    if (selectedPipelineId) {
      const pipeline = pipelines.find(p => p.id === parseInt(selectedPipelineId));
      if (pipeline) {
        setAvailableStages(pipeline.stages || []);
        // Only reset stage if not currently matching a stage in the new pipeline
        const currentStageId = watch('stage_id');
        const stageExists = pipeline.stages?.some(s => s.id === parseInt(currentStageId));
        if (!stageExists && pipeline.stages?.length > 0) {
          setValue('stage_id', pipeline.stages[0].id);
        }
      }
    }
  }, [selectedPipelineId, pipelines, setValue, watch]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await api.put(`/deals/${deal.id}`, data);
        toast.success('Deal updated successfully');
      } else {
        await api.post('/deals', data);
        toast.success('Deal created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Deal Title</label>
        <Input 
          {...register('title')} 
          placeholder="New Solar Implementation" 
          className={errors.title ? 'border-rose-500' : ''}
        />
        {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Deal Value ($)</label>
          <Input {...register('value', { valueAsNumber: true })} type="number" step="0.01" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Probability (%)</label>
          <Input {...register('probability', { valueAsNumber: true })} type="number" min="0" max="100" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Pipeline</label>
          <select 
            {...register('pipeline_id', { valueAsNumber: true })}
            className="w-full h-10 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {pipelines.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Stage</label>
          <select 
            {...register('stage_id', { valueAsNumber: true })}
            className="w-full h-10 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {availableStages.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Status</label>
          <select 
            {...register('status')}
            className="w-full h-10 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="open">Open</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Expected Close Date</label>
          <Input {...register('expected_close_date')} type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Description</label>
        <textarea 
          {...register('description')} 
          rows="3"
          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
          placeholder="Describe the deal context..."
        ></textarea>
      </div>

      <div className="pt-4 flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Deal' : 'Create Deal')}
        </Button>
      </div>
    </form>
  );
};
