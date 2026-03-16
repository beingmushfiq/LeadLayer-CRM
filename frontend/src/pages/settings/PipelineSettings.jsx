import { useState, useEffect } from 'react';
import { 
  Settings, 
  Layers, 
  BarChart2, 
  Plus, 
  GripVertical, 
  Trash2, 
  Edit2,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

export function PipelineSettings() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPipeline, setIsAddingPipeline] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pipelines');
      setPipelines(response.data);
    } catch (error) {
      toast.error('Failed to load pipelines');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePipeline = async (e) => {
    e.preventDefault();
    if (!newPipelineName.trim()) return;
    try {
      await api.post('/pipelines', { name: newPipelineName });
      toast.success('Pipeline created');
      setNewPipelineName('');
      setIsAddingPipeline(false);
      fetchPipelines();
    } catch (error) {
      toast.error('Failed to create pipeline');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-zinc-500" />
            Pipeline Settings
          </h1>
          <p className="text-zinc-400 mt-1">Configure sales funnel stages and automation</p>
        </div>
        {!isAddingPipeline ? (
          <Button 
            onClick={() => setIsAddingPipeline(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Pipeline
          </Button>
        ) : (
          <form onSubmit={handleCreatePipeline} className="flex gap-2">
            <Input 
              autoFocus
              value={newPipelineName}
              onChange={(e) => setNewPipelineName(e.target.value)}
              placeholder="Pipeline Name..."
              className="w-48 bg-zinc-800 border-zinc-700"
            />
            <Button type="submit" size="sm" className="bg-emerald-600">Save</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAddingPipeline(false)}>Cancel</Button>
          </form>
        )}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
             {[1, 2].map(i => <div key={i} className="h-48 bg-zinc-900/50 rounded-3xl border border-zinc-800"></div>)}
          </div>
        ) : pipelines.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p>No pipelines configured yet.</p>
          </div>
        ) : (
          pipelines.map((pipeline) => (
            <div key={pipeline.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
              <div className="p-6 border-b border-zinc-800 bg-zinc-800/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    {pipeline.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none mb-1">{pipeline.name}</h2>
                    <p className="text-xs text-zinc-500 font-medium">{pipeline.stages?.length || 0} Stages defined</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                      <Edit2 className="w-4 h-4" />
                   </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-2">
                  {pipeline.stages?.sort((a,b) => a.order - b.order).map((stage) => (
                    <div 
                      key={stage.id} 
                      className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-800/30 border border-zinc-800 group hover:border-zinc-700 transition-all shadow-sm"
                    >
                      <div className="cursor-grab p-1 text-zinc-600 hover:text-zinc-400 transition-colors">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 font-bold">
                         {stage.order + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-bold">{stage.name}</p>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">Probability</span>
                            <span className="text-emerald-500/80 text-xs font-mono font-bold">100%</span>
                         </div>
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 rounded-2xl border border-dashed border-zinc-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-zinc-600 hover:text-indigo-400 text-xs font-bold uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Stage
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Advanced Config Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
         <ConfigCard 
            icon={Zap} 
            title="Auto-Assignment" 
            desc="Rules to balance deal distribution among your sales team." 
         />
         <ConfigCard 
            icon={ShieldCheck} 
            title="SLA Compliance" 
            desc="Alerts when deals sit in a stage for too long." 
         />
      </div>
    </div>
  );
}

function ConfigCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 hover:border-indigo-500/20 transition-all group cursor-not-allowed opacity-60">
       <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
             <Icon className="w-6 h-6" />
          </div>
          <div>
             <h4 className="text-white font-bold mb-1">{title}</h4>
             <p className="text-xs text-zinc-500 leading-relaxed font-medium">{desc}</p>
          </div>
       </div>
    </div>
  );
}
