import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { TaskForm } from './TaskForm';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function TasksIndex() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task) => {
    try {
      const response = await api.patch(`/tasks/${task.id}/toggle`);
      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
      toast.success(response.data.status === 'completed' ? 'Task completed' : 'Task reopened');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const openModal = (task = null) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && task.status !== 'completed') || 
                         (filter === 'completed' && task.status === 'completed');
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'medium': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Tasks
            <span className="text-sm font-normal text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              {tasks.filter(t => t.status !== 'completed').length} pending
            </span>
          </h1>
          <p className="text-zinc-400 mt-1">Track your daily activities and follow-ups</p>
        </div>
        <Button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10 bg-zinc-900/50 border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                filter === f ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-zinc-500 animate-pulse">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
            <div className="inline-flex p-4 rounded-full bg-zinc-900/50 mb-4">
              <CheckCircle2 className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-white font-medium">All caught up!</h3>
            <p className="text-zinc-500 text-sm mt-1">No tasks match your current filters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task.id}
              className={cn(
                "group relative bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 transition-all hover:bg-zinc-900/60 hover:border-zinc-700/50 backdrop-blur-sm",
                task.status === 'completed' && "opacity-60"
              )}
            >
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => toggleTask(task)}
                  className={cn(
                    "mt-1 p-0.5 rounded-full transition-colors",
                    task.status === 'completed' ? "text-indigo-500" : "text-zinc-600 hover:text-indigo-400"
                  )}
                >
                  {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 
                      onClick={() => openModal(task)}
                      className={cn(
                        "text-sm font-semibold text-white cursor-pointer hover:text-indigo-400 transition-colors truncate",
                        task.status === 'completed' && "line-through text-zinc-500"
                      )}
                    >
                      {task.title}
                    </h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                      getPriorityColor(task.priority)
                    )}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5 border border-zinc-800/50 bg-zinc-950/50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                    </div>

                    {task.taskable && (
                      <div className="flex items-center gap-1.5 text-indigo-400/80">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="font-medium">
                          {task.taskable_type.split('\\').pop()}: {task.taskable.name || task.taskable.title}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold border border-zinc-700">
                        {task.assignee?.first_name?.[0] || 'U'}
                      </div>
                      <span>{task.assignee?.first_name || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>

                <button className="text-zinc-600 hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTask ? 'Edit Task' : 'New Task'}
        maxWidth="xl"
      >
        <TaskForm 
          task={selectedTask}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTasks();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
