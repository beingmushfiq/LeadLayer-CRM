import { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon,
  Filter,
  Users,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EventForm } from './EventForm';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
      
      const [eventsRes, tasksRes] = await Promise.all([
        api.get('/calendar-events', { params: { start: startOfMonth, end: endOfMonth } }),
        api.get('/tasks')
      ]);
      
      setEvents(eventsRes.data);
      setTasks(tasksRes.data.data.filter(t => t.due_date));
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Padding for previous month
    for (let i = 0; i < startDay; i++) {
        days.push({ day: null, type: 'padding' });
    }

    // Actual days
    for (let i = 1; i <= totalDays; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.starts_at.startsWith(dateStr));
        const dayTasks = tasks.filter(t => t.due_date.startsWith(dateStr));
        
        days.push({ 
            day: i, 
            date: dateStr,
            type: 'actual', 
            events: dayEvents,
            tasks: dayTasks
        });
    }

    return days;
  }, [currentDate, events, tasks]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const openModal = (event = null) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <CalendarIcon className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            <p className="text-zinc-500 text-sm">Schedule & Task Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl flex items-center">
            <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Today
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
            onClick={() => openModal()}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl overflow-hidden flex flex-col backdrop-blur-sm">
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-800/20">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-r border-zinc-800 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((dayObj, i) => (
            <div 
              key={i} 
              className={cn(
                "min-h-[120px] p-2 border-r border-zinc-800 border-b last:border-r-0 group/day transition-colors",
                dayObj.type === 'padding' ? "bg-zinc-950/20" : "bg-transparent hover:bg-zinc-800/10"
              )}
            >
              {dayObj.day && (
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-colors",
                    dayObj.date === new Date().toISOString().split('T')[0] 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                      : "text-zinc-500 group-hover/day:text-zinc-300"
                  )}>
                    {dayObj.day}
                  </span>
                </div>
              )}

              <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar pr-1">
                {dayObj.events?.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => openModal(event)}
                    className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-medium truncate cursor-pointer hover:bg-indigo-500/20 transition-colors"
                  >
                    <Activity className="w-2.5 h-2.5 inline mr-1" />
                    {event.title}
                  </div>
                ))}
                {dayObj.tasks?.map(task => (
                  <div 
                    key={task.id}
                    className={cn(
                      "px-2 py-1 rounded border text-[10px] font-medium truncate",
                      task.status === 'completed' 
                        ? "bg-zinc-800/50 border-zinc-700/50 text-zinc-500 line-through" 
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 inline mr-1" />
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvent ? 'Edit Event' : 'New Calendar Event'}
        maxWidth="xl"
      >
        <EventForm 
          event={selectedEvent}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Minimal placeholder for formatting
function CheckCircle2(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
}
