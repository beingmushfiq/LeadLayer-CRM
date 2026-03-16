import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers } from 'lucide-react';

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Background decorations - left side only */}
      <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden z-0 pointer-events-none hidden lg:block">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* Left Form Panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 lg:w-[500px] xl:w-[600px] bg-white relative">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8 flex items-center gap-2 text-2xl font-display font-medium text-gray-900 tracking-tight">
            <Layers className="h-8 w-8 text-brand-600" />
            <span>LeadLayer<span className="text-gray-400">CRM</span></span>
          </div>
          
          <Outlet />

          <div className="mt-8">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} LeadLayer Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Image/Brand Panel */}
      <div className="relative hidden w-0 flex-1 lg:flex flex-col justify-end p-12 lg:p-16 z-0 bg-zinc-900">
        <div className="absolute inset-0">
           <img
            className="h-full w-full object-cover opacity-20 mix-blend-luminosity"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
            alt="Office background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/50 to-zinc-900/20" />
        </div>
        
        <div className="relative z-20 glass-dark rounded-2xl p-8 mb-12 max-w-lg border-white/5 shadow-2xl">
          <h2 className="text-3xl font-display font-medium tracking-tight text-white mb-4">
            Scale your <span className="text-brand-400">sales momentum</span>
          </h2>
          <p className="text-gray-300">
            A premium, multi-tenant CRM designed for elite sales teams. Manage pipelines, integrate WhatsApp automatically, and generate more revenue without the noise.
          </p>
        </div>
      </div>
    </div>
  );
}
