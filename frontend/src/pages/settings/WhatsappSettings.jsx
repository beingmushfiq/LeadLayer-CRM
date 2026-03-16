import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Settings, ExternalLink, Key, MessageSquareText } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';

const configSchema = z.object({
  phone_number_id: z.string().min(1, 'Phone Number ID is required'),
  waba_id: z.string().min(1, 'WABA ID is required'),
  access_token: z.string().optional(),
  webhook_verify_token: z.string().min(1, 'Webhook Verify Token is required'),
  auto_reply_enabled: z.boolean().default(false),
  auto_reply_template: z.string().optional(),
  auto_create_lead: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export function WhatsappSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: {
      auto_reply_enabled: false,
      auto_create_lead: false,
      is_active: true,
    }
  });

  const autoReplyEnabled = watch('auto_reply_enabled');
  const autoCreateLead = watch('auto_create_lead');
  const isActive = watch('is_active');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/whatsapp/config');
        if (response.data.data) {
          const config = response.data.data;
          setValue('phone_number_id', config.phone_number_id);
          setValue('waba_id', config.waba_id);
          setValue('webhook_verify_token', config.webhook_verify_token);
          setValue('auto_reply_enabled', config.auto_reply_enabled);
          setValue('auto_reply_template', config.auto_reply_template || '');
          setValue('auto_create_lead', config.auto_create_lead);
          setValue('is_active', config.is_active);
          setHasToken(config.has_access_token);
        }
      } catch (error) {
        console.error('Failed to load WhatsApp config', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      // Don't override token if it wasn't typed, but let backend handle the nullish bypass
      if (!data.access_token) {
        delete data.access_token; 
      }

      await api.post('/whatsapp/config', data);
      toast.success('WhatsApp configuration saved successfully');
      
      // If user typed a token, we now have one
      if (data.access_token) {
        setHasToken(true);
        setValue('access_token', ''); // Clear input for security
      }
    } catch (error) {
      toast.error('Failed to save configuration');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-medium text-white flex items-center gap-3">
          <MessageSquareText className="h-8 w-8 text-brand-500" />
          WhatsApp Integration
        </h1>
        <p className="mt-2 text-gray-400">
          Connect your Meta WhatsApp Business API to send and receive messages directly inside LeadLayer CRM.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-white/10 pb-12 md:grid-cols-3">
        <div>
          <h2 className="text-base font-semibold leading-7 text-white flex items-center gap-2">
            <Key className="h-4 w-4" /> Meta App Credentials
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            You can find these details in your Meta for Developers dashboard under the WhatsApp product settings.
          </p>
          <a
            href="https://developers.facebook.com/apps/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors"
          >
            Open Meta Dashboard <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 space-y-8 glass p-8 rounded-2xl border border-white/5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Input
                label="Phone Number ID"
                {...register('phone_number_id')}
                error={errors.phone_number_id?.message}
                placeholder="e.g. 104562725893"
              />
            </div>
            
            <div className="sm:col-span-3">
              <Input
                label="WhatsApp Business Account ID"
                {...register('waba_id')}
                error={errors.waba_id?.message}
                placeholder="e.g. 103947264821"
              />
            </div>

            <div className="sm:col-span-6">
              <Input
                label="Permanent Access Token"
                type="password"
                {...register('access_token')}
                error={errors.access_token?.message}
                placeholder={hasToken ? "•••••••••••••••••••••••••••• (Saved)" : "EAAxXYZ..."}
                helperText={hasToken ? "A token is currently active. Leave blank unless you want to replace it." : "Generate a permanent token from the System User in Meta Business Settings."}
              />
            </div>

            <div className="sm:col-span-6">
              <Input
                label="Webhook Verify Token"
                {...register('webhook_verify_token')}
                error={errors.webhook_verify_token?.message}
                placeholder="Create a random secure string"
                helperText="You will paste this identical string into Meta when setting up the webhook."
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 space-y-6">
            <h3 className="text-sm font-medium text-white">Automations & Toggles</h3>
            
            <div className="space-y-6">
              <Switch
                checked={isActive}
                onChange={(val) => setValue('is_active', val, { shouldDirty: true })}
                label="Enable WhatsApp Integration"
                description="Turn off to temporarily disabled outgoing and incoming processing."
              />

              <Switch
                checked={autoCreateLead}
                onChange={(val) => setValue('auto_create_lead', val, { shouldDirty: true })}
                label="Auto-Create Leads"
                description="Automatically convert inbound messages from unknown numbers into New Leads."
              />

              <Switch
                checked={autoReplyEnabled}
                onChange={(val) => setValue('auto_reply_enabled', val, { shouldDirty: true })}
                label="Auto-Reply to New Conversations"
                description="Send an instant template reply when a contact messages you for the very first time."
              />

              {autoReplyEnabled && (
                <div className="pl-4 border-l-2 border-brand-500/30">
                  <Input
                    label="Auto-Reply Template Name"
                    {...register('auto_reply_template')}
                    error={errors.auto_reply_template?.message}
                    placeholder="e.g. welcome_message"
                    helperText="Must be an approved text-based template in your Meta account."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-x-4 border-t border-white/10">
            <Button type="submit" isLoading={isSaving}>
              Save Integration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
