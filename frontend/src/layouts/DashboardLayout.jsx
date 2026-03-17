import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Layers, 
  LayoutDashboard, 
  Users, 
  Target, 
  CheckSquare, 
  MessageSquare,
  FileText,
  LogOut,
  Settings,
  Bell,
  Calendar as CalendarIcon,
  Megaphone
} from 'lucide-react';
import { cn } from '../utils/cn';

export function DashboardLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: Target },
    { name: 'Deals', href: '/deals', icon: Layers },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Marketing', href: '/marketing', icon: Megaphone },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-950 text-white flex flex-col hidden md:flex border-r border-zinc-800 fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Layers className="h-6 w-6 text-brand-500 mr-2" />
          <span className="font-display font-medium text-xl tracking-tight">LeadLayer</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">
            Main Menu
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-brand-600 text-white" 
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-zinc-400 group-hover:text-white")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-medium">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.role?.display_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/10">
              {user?.tenant?.name}
            </span>
            <button className="text-gray-400 hover:text-gray-500 relative">
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            </button>
            
            <div className="h-5 w-px bg-gray-200" />
            
            <div className="flex items-center space-x-3">
              <Link to="/settings" className="text-gray-400 hover:text-gray-500">
                <Settings className="h-5 w-5" />
              </Link>
              <button 
                onClick={() => logout()}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
