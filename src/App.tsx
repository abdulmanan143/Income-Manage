import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { IncomeHistoryView } from './components/income/IncomeHistoryView';
import { DailyIncomeView } from './components/daily/DailyIncomeView';
import { MonthlyIncomeView } from './components/monthly/MonthlyIncomeView';
import { IncomeCalendarView } from './components/calendar/IncomeCalendarView';
import { SourcesView } from './components/sources/SourcesView';
import { CategoriesView } from './components/categories/CategoriesView';
import { TargetsView } from './components/targets/TargetsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AddIncomeModal } from './components/income/AddIncomeModal';
import { DeleteConfirmModal } from './components/income/DeleteConfirmModal';
import { IncomeDetailModal } from './components/income/IncomeDetailModal';
import { AuthModal } from './components/auth/AuthModal';
import { ExportModal } from './components/export/ExportModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';

const MainAppLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Subtle Fintech Ambient Background: Midnight Navy -> Deep Blue -> Emerald Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 no-print">
        {/* Top radial gradient */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-emerald-500/10 dark:from-emerald-500/5 via-blue-500/5 dark:via-blue-600/5 to-transparent blur-3xl opacity-80" />
        {/* Soft radial glow in corner */}
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -left-32 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        {/* Ultra-subtle geometric grid */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Workspace Canvas: Sidebar + Scrollable Viewport */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar onOpenExport={() => setIsExportOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-full overflow-x-hidden min-h-[calc(100vh-4rem)]">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'history' && <IncomeHistoryView onOpenExport={() => setIsExportOpen(true)} />}
          {activeTab === 'daily' && <DailyIncomeView />}
          {activeTab === 'monthly' && <MonthlyIncomeView />}
          {activeTab === 'calendar' && <IncomeCalendarView />}
          {activeTab === 'sources' && <SourcesView />}
          {activeTab === 'categories' && <CategoriesView />}
          {activeTab === 'targets' && <TargetsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Modals & Slide-out Drawers */}
      <AddIncomeModal />
      <DeleteConfirmModal />
      <IncomeDetailModal />
      <AuthModal />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
