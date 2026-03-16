import React from 'react';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  UserPlus, 
  CheckCircle2, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ActivityTimeline = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500 italic border-2 border-dashed border-zinc-900 rounded-2xl">
        No activity recorded yet.
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'note': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'email': return <Mail className="w-4 h-4 text-purple-400" />;
      case 'call': return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'conversion': return <UserPlus className="w-4 h-4 text-indigo-400" />;
      case 'status_change': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <CheckCircle2 className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, idx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 && (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-zinc-800" aria-hidden="true" />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center ring-8 ring-zinc-950">
                    {getIcon(activity.type)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-zinc-300">
                      {activity.description}{' '}
                      {activity.metadata?.deal_id && (
                        <span className="inline-flex items-center text-indigo-400 hover:text-indigo-300 ml-1 cursor-pointer">
                          View Deal <ExternalLink className="w-3 h-3 ml-0.5" />
                        </span>
                      )}
                    </p>
                    {activity.content && (
                      <div className="mt-2 text-sm text-zinc-500 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                        {activity.content}
                      </div>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-zinc-500">
                    <time dateTime={activity.created_at}>
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
