import { Switch as HeadlessSwitch } from '@headlessui/react';
import { cn } from '../../utils/cn';

export function Switch({ checked, onChange, label, description }) {
  return (
    <HeadlessSwitch.Group as="div" className="flex items-center justify-between">
      <span className="flex flex-grow flex-col">
        {label && (
          <HeadlessSwitch.Label as="span" className="text-sm font-medium leading-6 text-white" passive>
            {label}
          </HeadlessSwitch.Label>
        )}
        {description && (
          <HeadlessSwitch.Description as="span" className="text-sm text-gray-400">
            {description}
          </HeadlessSwitch.Description>
        )}
      </span>
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        className={cn(
          checked ? 'bg-brand-500' : 'bg-white/10',
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-zinc-900'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            checked ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </HeadlessSwitch>
    </HeadlessSwitch.Group>
  );
}
