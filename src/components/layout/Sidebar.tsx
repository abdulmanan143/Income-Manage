import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  CalendarDays,
  FolderTree,
  Building2,
  Target,
  FileBarChart2,
  Settings,
  CalendarCheck2,
  DownloadCloud,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface SidebarProps {
  onOpenExport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenExport }) => {
  const {
    activeTab,
    setActiveTab,
    thisMonthIncome,
    currentMonthTarget,
    targetProgressPercent,
    user,
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Income History', icon: Receipt },
    { id: 'daily', label: 'Daily View', icon: CalendarCheck2 },
    { id: 'monthly', label: 'Monthly Analytics', icon: CalendarDays },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'sources', label: 'Income Sources', icon: Building2 },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'targets', label: 'Monthly Targets', icon: Target },
    { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Export Button */}
        <div>
          <button
            onClick={onOpenExport}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV / Reports</span>
          </button>
        </div>
      </div>

      {/* Monthly Target Progress Widget Card */}
      <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
              Sep 2026 Target
            </span>
          </div>
          <span className="text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {targetProgressPercent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(targetProgressPercent, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span>{formatCurrency(thisMonthIncome, user?.currency)}</span>
          <span>/</span>
          <span>{formatCurrency(currentMonthTarget, user?.currency)}</span>
        </div>
      </div>
    </aside>
  );
};
