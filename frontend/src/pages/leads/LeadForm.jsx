import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';

const leadSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'lost', 'converted']),
  source: z.string().optional(),
  lead_score: z.number().min(0).max(100).default(0),
});

export const LeadForm = ({ lead, onSuccess, onCancel }) => {
  const isEditing = !!lead;
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: lead || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company_name: '',
      status: 'new',
      source: '',
      lead_score: 0,
    }
  });

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await api.put(`/leads/${lead.id}`, data);
        toast.success('Lead updated successfully');
      } else {
        await api.post('/leads', data);
        toast.success('Lead created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">First Name</label>
          <Input 
            {...register('first_name')} 
            placeholder="John" 
            className={errors.first_name ? 'border-rose-500' : ''}
          />
          {errors.first_name && <p className="text-xs text-rose-500">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Last Name</label>
          <Input {...register('last_name')} placeholder="Doe" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Email Address</label>
        <Input {...register('email')} type="email" placeholder="john@example.com" />
        {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Phone Number</label>
          <Input {...register('phone')} placeholder="+1 (555) 000-0000" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Company Name</label>
          <Input {...register('company_name')} placeholder="Acme Inc." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Status</label>
          <select 
            {...register('status')}
            className="w-full h-10 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Unqualified</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Lead Score (0-100)</label>
          <Input {...register('lead_score', { valueAsNumber: true })} type="number" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Source</label>
        <Input {...register('source')} placeholder="Website, Referral, LinkedIn..." />
      </div>

      <div className="pt-4 flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Lead' : 'Create Lead')}
        </Button>
      </div>
    </form>
  );
};
