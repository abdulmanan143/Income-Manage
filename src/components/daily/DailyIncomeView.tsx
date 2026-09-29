import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  getTodayDateString,
  isSameDay,
} from '../../utils/formatters';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const DailyIncomeView: React.FC = () => {
  const {
    incomes,
    sources,
    categories,
    selectedDate,
    setSelectedDate,
    openAddModal,
    setViewingRecord,
    setDeleteConfirmId,
    user,
  } = useApp();

  // Navigate dates
  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const handleSetToday = () => {
    setSelectedDate(getTodayDateString());
  };

  // Incomes for selected date
  const dayIncomes = useMemo(() => {
    return incomes.filter((item) => isSameDay(item.date, selectedDate));
  }, [incomes, selectedDate]);

  const totalDayIncome = useMemo(() => {
    return dayIncomes.reduce((sum, item) => sum + item.amount, 0);
  }, [dayIncomes]);

  // Mini September calendar row for quick picking
  const septemberDays = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 30; i++) {
      const dStr = String(i).padStart(2, '0');
      const dateStr = `2026-09-${dStr}`;
      const dayTotal = incomes
        .filter((inc) => inc.date === dateStr)
        .reduce((sum, curr) => sum + curr.amount, 0);
      list.push({
        dayNumber: i,
        dateStr,
        hasIncome: dayTotal > 0,
        amount: dayTotal,
      });
    }
    return list;
  }, [incomes]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Income View
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log, inspect, and analyze specific daily earnings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSetToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Go to Today
          </button>
          <button
            onClick={() => openAddModal({ date: selectedDate })}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add for this Day</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Carousel */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Selected Day
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-xs text-slate-500">
              {formatDate(selectedDate, 'DD MMM YYYY')}
            </span>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Mini-Calendar Strip with visually highlighted income dates */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 mb-2">
            September 2026 Days (Green dots = income recorded):
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {septemberDays.map((item) => {
              const isSelected = item.dateStr === selectedDate;
              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[36px] py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20'
                      : item.hasIncome
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[10px] uppercase">Sep</span>
                  <span className="font-mono text-sm">{item.dayNumber}</span>
                  {item.hasIncome && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Income Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 text-white border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            {formatDate(selectedDate, 'DD MMM YYYY')} Total Income
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 mt-1">
            {formatCurrency(totalDayIncome, user?.currency)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {dayIncomes.length} {dayIncomes.length === 1 ? 'transaction' : 'transactions'} recorded on this date
          </p>
        </div>

        <button
          onClick={() => openAddModal({ date: selectedDate })}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Entry</span>
        </button>
      </div>

      {/* Entries List for This Day */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Entries for {formatDate(selectedDate, 'DD MMM YYYY')}
        </h3>

        {dayIncomes.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Receipt className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500">
              No income recorded for this date.
            </p>
            <button
              onClick={() => openAddModal({ date: selectedDate })}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              + Log an entry for {formatDate(selectedDate, 'DD MMM')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {dayIncomes.map((item) => {
              const src = sources.find((s) => s.id === item.sourceId);
              const cat = categories.find((c) => c.id === item.categoryId);

              return (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {src?.name || 'Direct Source'}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${cat?.color || '#10B981'}20`,
                          color: cat?.color || '#10B981',
                        }}
                      >
                        {cat?.name || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Method: {item.paymentMethod}</span>
                      {item.clientName && <span>· Client: {item.clientName}</span>}
                      {item.referenceNumber && (
                        <span className="font-mono text-[11px]">· Ref: {item.referenceNumber}</span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">
                        "{item.description}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(item.amount, user?.currency)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingRecord(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openAddModal(item)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit entry"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
