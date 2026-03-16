import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const conversionSchema = z.object({
  title: z.string().min(1, 'Deal title is required'),
  value: z.number().min(0).default(0),
  pipeline_id: z.number().min(1, 'Pipeline is required'),
  stage_id: z.number().min(1, 'Stage is required'),
  create_account: z.boolean().default(true),
  create_contact: z.boolean().default(true),
});

export const LeadConversionForm = ({ lead, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState([]);
  const [availableStages, setAvailableStages] = useState([]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(conversionSchema),
    defaultValues: {
      title: `${lead.company_name || lead.first_name + ' ' + lead.last_name} - Deal`,
      value: 0,
      pipeline_id: '',
      stage_id: '',
      create_account: !!lead.company_name,
      create_contact: true,
    }
  });

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      const response = await api.get('/pipelines');
      setPipelines(response.data);
      if (response.data.length > 0) {
        setValue('pipeline_id', response.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load pipelines');
    }
  };

  const selectedPipelineId = watch('pipeline_id');

  useEffect(() => {
    if (selectedPipelineId) {
      const pipeline = pipelines.find(p => p.id === parseInt(selectedPipelineId));
      if (pipeline) {
        setAvailableStages(pipeline.stages || []);
        if (pipeline.stages?.length > 0) {
          setValue('stage_id', pipeline.stages[0].id);
        }
      }
    }
  }, [selectedPipelineId, pipelines, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await api.post(`/leads/${lead.id}/convert`, data);
      toast.success('Lead converted to deal successfully');
      onSuccess(response.data.deal.id);
      navigate('/deals');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Conversion failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-6">
        <p className="text-sm text-indigo-300">
          This will convert <span className="font-bold text-white">{lead.first_name} {lead.last_name}</span> into an account, contact, and a new deal.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Deal Title</label>
        <Input 
          {...register('title')} 
          placeholder="Enterprise Implementation"
          className={errors.title ? 'border-rose-500' : ''}
        />
        {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Expected Value ($)</label>
        <Input {...register('value', { valueAsNumber: true })} type="number" step="0.01" />
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
          <label className="text-sm font-medium text-zinc-400">Initial Stage</label>
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

      <div className="space-y-3 pt-4 border-t border-zinc-800 mt-6">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            {...register('create_account')}
            id="create_account"
            className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/50"
          />
          <label htmlFor="create_account" className="text-sm text-zinc-300">Create an Account for {lead.company_name || 'Individual'}</label>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            {...register('create_contact')}
            id="create_contact"
            className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/50"
          />
          <label htmlFor="create_contact" className="text-sm text-zinc-300">Create a Contact for {lead.first_name} {lead.last_name}</label>
        </div>
      </div>

      <div className="pt-6 flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 h-10 px-8" disabled={isSubmitting}>
          {isSubmitting ? 'Converting...' : 'Convert Lead'}
        </Button>
      </div>
    </form>
  );
};
