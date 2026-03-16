import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Settings, 
  MoreVertical, 
  Building2,
  Calendar,
  DollarSign,
  ChevronRight,
  Filter,
  ArrowRightLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DealForm } from './DealForm';
import toast from 'react-hot-toast';

export const DealsKanban = () => {
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const [dealsByStage, setDealsByStage] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (selectedPipelineId) {
      fetchDeals();
    }
  }, [selectedPipelineId]);

  const fetchPipelines = async () => {
    try {
      const response = await api.get('/pipelines');
      setPipelines(response.data);
      if (response.data.length > 0) {
        const defaultPipeline = response.data.find(p => p.is_default) || response.data[0];
        setSelectedPipelineId(defaultPipeline.id);
      }
    } catch (error) {
      toast.error('Failed to load pipelines');
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/deals', {
        params: { pipeline_id: selectedPipelineId }
      });
      setDealsByStage(response.data);
    } catch (error) {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (deal = null) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDeal(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchDeals();
  };

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const stages = selectedPipeline?.stages || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4 animate-in fade-in duration-500">
      {/* Kanban Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Sales Pipeline
            <span className="text-sm font-normal text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              {selectedPipeline?.name}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search deals..." 
              className="pl-10 h-10 w-64 bg-zinc-900/50 border-zinc-800 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-10 border-zinc-800 bg-zinc-900/50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button 
            className="h-10 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => openModal()}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-x-auto px-6 pb-6 custom-scrollbar">
        <div className="inline-flex gap-4 h-full min-w-full">
          {stages.map((stage) => {
            const deals = dealsByStage[stage.id] || [];
            const filteredDeals = deals.filter(deal => 
              deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              deal.contact?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const stageTotal = filteredDeals.reduce((sum, deal) => sum + parseFloat(deal.value || 0), 0);

            return (
              <div key={stage.id} className="w-80 flex-shrink-0 flex flex-col bg-zinc-900/40 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
                {/* Stage Header */}
                <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color || '#6366f1' }}></span>
                       {stage.name}
                       <span className="ml-2 px-1.5 py-0.5 rounded-md bg-zinc-800 text-[10px] text-zinc-400">
                        {filteredDeals.length}
                       </span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                      Total: {formatCurrency(stageTotal)}
                    </p>
                  </div>
                  <button className="text-zinc-500 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Deal Cards Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {loading ? (
                    <div className="py-8 text-center text-zinc-600 text-xs animate-pulse">Loading...</div>
                  ) : filteredDeals.length === 0 ? (
                    <div className="py-8 text-center text-zinc-700 text-xs italic border-2 border-dashed border-zinc-800/50 rounded-lg">
                      No deals here
                    </div>
                  ) : (
                    filteredDeals.map((deal) => (
                      <div 
                        key={deal.id} 
                        className="group p-4 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 shadow-lg cursor-pointer hover:shadow-indigo-500/5"
                        onClick={(e) => {
                          if (e.target.tagName !== 'A') openModal(deal);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/deals/${deal.id}`} className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {deal.title}
                          </Link>
                          <span className="text-[10px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">
                            {deal.probability}%
                          </span>
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <Building2 className="w-3.5 h-3.5" />
                            <span className="truncate">{deal.account?.name || 'No Account'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{deal.expected_close_date || 'No date'}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-700">
                              {deal.assignee?.name?.[0] || 'U'}
                            </div>
                            <span className="text-[10px] text-zinc-500 truncate max-w-[80px]">
                              {deal.assignee?.name || 'Unassigned'}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-emerald-400">
                            {formatCurrency(deal.value)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {/* Quick add placeholder */}
                  <button className="w-full py-2 flex items-center justify-center gap-2 text-[11px] text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/5 border border-dashed border-zinc-800 hover:border-indigo-500/20 rounded-lg transition-all duration-200">
                    <Plus className="w-3 h-3" />
                    New Deal
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Stage Column */}
          <button className="w-80 flex-shrink-0 h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-200">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Stage</span>
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedDeal ? 'Edit Deal' : 'Create New Deal'}
        maxWidth="2xl"
      >
        <DealForm 
          deal={selectedDeal} 
          pipelines={pipelines}
          onSuccess={handleSuccess} 
          onCancel={closeModal} 
        />
      </Modal>
    </div>
  );
};
