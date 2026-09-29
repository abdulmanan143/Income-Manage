import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Receipt, CalendarDays, FileBarChart2, Settings, Plus } from 'lucide-react';
import { ActiveTab } from '../../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, openAddModal } = useApp();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-1.5 px-3">
      <div className="flex items-center justify-around relative">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center p-1.5 text-[10px] font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        {/* History */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center p-1.5 text-[10px] font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span>Income</span>
        </button>

        {/* Center Floating + Add Income Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={() => openAddModal()}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-all border-4 border-white dark:border-slate-950 cursor-pointer"
            aria-label="Add Income"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            Add
          </span>
        </div>

        {/* Reports */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center p-1.5 text-[10px] font-medium transition-colors ${
            activeTab === 'reports'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileBarChart2 className="w-5 h-5 mb-0.5" />
          <span>Reports</span>
        </button>

        {/* Calendar */}
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center p-1.5 text-[10px] font-medium transition-colors ${
            activeTab === 'calendar'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-5 h-5 mb-0.5" />
          <span>Calendar</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center p-1.5 text-[10px] font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
