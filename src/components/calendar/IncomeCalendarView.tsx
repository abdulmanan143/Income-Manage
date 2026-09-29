import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  getMonthName,
  getTodayDateString,
  isSameDay,
} from '../../utils/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
  CreditCard,
  Building2,
  FolderTree,
  Eye,
} from 'lucide-react';
import { IncomeRecord } from '../../types';

export const IncomeCalendarView: React.FC = () => {
  const {
    incomes,
    sources,
    categories,
    selectedMonth,
    setSelectedMonth,
    openAddModal,
    setViewingRecord,
    user,
  } = useApp();

  const [activeDateModal, setActiveDateModal] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    let newMonth = selectedMonth.month - 1;
    let newYear = selectedMonth.year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setSelectedMonth({ month: newMonth, year: newYear });
  };

  const handleNextMonth = () => {
    let newMonth = selectedMonth.month + 1;
    let newYear = selectedMonth.year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setSelectedMonth({ month: newMonth, year: newYear });
  };

  // Generate calendar days for selected month
  const calendarDays = useMemo(() => {
    const year = selectedMonth.year;
    const month = selectedMonth.month; // 1-12
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday, 1 is Monday...
    const adjustedFirstDay = (firstDayIndex + 6) % 7; // Monday = 0, Sunday = 6
    const totalDays = new Date(year, month, 0).getDate();

    const days: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      totalIncome: number;
      records: IncomeRecord[];
    }[] = [];

    // Empty padding cells for previous month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({
        dayNumber: 0,
        dateStr: '',
        isCurrentMonth: false,
        totalIncome: 0,
        records: [],
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dStr = String(d).padStart(2, '0');
      const mStr = String(month).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      const records = incomes.filter((item) => item.date === dateStr);
      const totalIncome = records.reduce((sum, item) => sum + item.amount, 0);

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        totalIncome,
        records,
      });
    }

    return days;
  }, [selectedMonth, incomes]);

  const todayStr = getTodayDateString();

  // Active day details modal data
  const activeDayRecords = useMemo(() => {
    if (!activeDateModal) return [];
    return incomes.filter((i) => i.date === activeDateModal);
  }, [incomes, activeDateModal]);

  const activeDayTotal = useMemo(() => {
    return activeDayRecords.reduce((sum, item) => sum + item.amount, 0);
  }, [activeDayRecords]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Income Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visual day-by-day earnings heat grid and quick entry log
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[130px] text-center">
            {getMonthName(selectedMonth.month)} {selectedMonth.year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend Card as per PRD Section 13 */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-400 font-medium">Income Intensity:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              High Income (&gt; {user?.currency || 'PKR'} 10,000)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Medium Income ({user?.currency || 'PKR'} 1 – 10,000)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
            <span className="text-slate-500">No Income</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">Click any day to view entries</span>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center text-xs font-semibold text-slate-500 py-3">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
          {calendarDays.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={`empty_${idx}`}
                  className="min-h-[85px] sm:min-h-[105px] p-2 bg-slate-50/30 dark:bg-slate-950/20 opacity-30 pointer-events-none"
                />
              );
            }

            const isToday = cell.dateStr === todayStr;
            const isHigh = cell.totalIncome > 10000;
            const isMedium = cell.totalIncome > 0 && cell.totalIncome <= 10000;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setActiveDateModal(cell.dateStr)}
                className={`min-h-[85px] sm:min-h-[105px] p-2 transition-all cursor-pointer flex flex-col justify-between group hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 ${
                  isToday ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-medium ${
                      isToday
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Income status dot */}
                  {isHigh && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" title="High Income" />
                  )}
                  {isMedium && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/20" title="Medium Income" />
                  )}
                  {!isHigh && !isMedium && (
                    <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700/60" />
                  )}
                </div>

                {/* Day Total Earnings */}
                <div className="mt-1">
                  {cell.totalIncome > 0 ? (
                    <div className="space-y-0.5">
                      <p
                        className={`text-xs font-bold font-mono truncate tabular-nums ${
                          isHigh
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        +{formatCurrency(cell.totalIncome, user?.currency)}
                      </p>
                      <p className="text-[10px] text-slate-400 hidden sm:block">
                        {cell.records.length} {cell.records.length === 1 ? 'entry' : 'entries'}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono hidden sm:inline">
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Details Drawer / Modal when clicked */}
      {activeDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {formatDate(activeDateModal, 'DD MMMM YYYY')}
                </h3>
                <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Total Income: {formatCurrency(activeDayTotal, user?.currency)}
                </p>
              </div>
              <button
                onClick={() => setActiveDateModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Records */}
            <div className="p-5 max-h-96 overflow-y-auto space-y-3">
              {activeDayRecords.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-slate-500">No income logged on this date.</p>
                  <button
                    onClick={() => {
                      const d = activeDateModal;
                      setActiveDateModal(null);
                      openAddModal({ date: d });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Income</span>
                  </button>
                </div>
              ) : (
                activeDayRecords.map((item) => {
                  const src = sources.find((s) => s.id === item.sourceId);
                  const cat = categories.find((c) => c.id === item.categoryId);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {src?.name || 'Direct'}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${cat?.color || '#10B981'}20`,
                              color: cat?.color || '#10B981',
                            }}
                          >
                            {cat?.name || 'Category'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.paymentMethod} {item.clientName && `· ${item.clientName}`}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold font-mono text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(item.amount, user?.currency)}
                        </span>
                        <div className="mt-1">
                          <button
                            onClick={() => {
                              setActiveDateModal(null);
                              setViewingRecord(item);
                            }}
                            className="text-[11px] text-slate-500 hover:text-emerald-600 underline"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const d = activeDateModal;
                  setActiveDateModal(null);
                  openAddModal({ date: d });
                }}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add another entry for this date</span>
              </button>

              <button
                onClick={() => setActiveDateModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
