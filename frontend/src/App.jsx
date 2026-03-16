import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { LeadsIndex } from './pages/leads/LeadsIndex';
import { LeadDetails } from './pages/leads/LeadDetails';
import { DealsKanban } from './pages/deals/DealsKanban';
import { DealDetails } from './pages/deals/DealDetails';
import { WhatsappSettings } from './pages/settings/WhatsappSettings';
import { PipelineSettings } from './pages/settings/PipelineSettings';
import { WhatsappChat } from './pages/whatsapp/WhatsappChat';
import { AccountsIndex } from './pages/accounts/AccountsIndex';
import { AccountDetails } from './pages/accounts/AccountDetails';
import { ContactsIndex } from './pages/contacts/ContactsIndex';
import { ContactDetails } from './pages/contacts/ContactDetails';
import { TasksIndex } from './pages/tasks/TasksIndex';
import { CalendarView } from './pages/calendar/CalendarView';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<LeadsIndex />} />
            <Route path="/leads/:id" element={<LeadDetails />} />
            <Route path="/deals" element={<DealsKanban />} />
            <Route path="/deals/:id" element={<DealDetails />} />
            <Route path="/contacts" element={<ContactsIndex />} />
            <Route path="/contacts/:id" element={<ContactDetails />} />
            <Route path="/accounts" element={<AccountsIndex />} />
            <Route path="/accounts/:id" element={<AccountDetails />} />
            <Route path="/tasks" element={<TasksIndex />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/whatsapp" element={<WhatsappChat />} />
            <Route path="/settings" element={<PipelineSettings />} />
            <Route path="/settings/pipelines" element={<PipelineSettings />} />
            <Route path="/settings/whatsapp" element={<WhatsappSettings />} />
          </Route>

          {/* Super Admin God-Mode Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tenants" element={<div className="p-8"><h1 className="text-2xl font-bold text-white">Tenants Management</h1><p className="text-zinc-400 mt-2">Coming soon...</p></div>} />
            <Route path="/admin/users" element={<div className="p-8"><h1 className="text-2xl font-bold text-white">System Users</h1><p className="text-zinc-400 mt-2">Coming soon...</p></div>} />
            <Route path="/admin/activity" element={<div className="p-8"><h1 className="text-2xl font-bold text-white">Activity Log</h1><p className="text-zinc-400 mt-2">Coming soon...</p></div>} />
            <Route path="/admin/settings" element={<div className="p-8"><h1 className="text-2xl font-bold text-white">System Settings</h1><p className="text-zinc-400 mt-2">Coming soon...</p></div>} />
          </Route>

          {/* Fallback routing */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
