import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  getMonthName,
  isSameMonth,
} from '../../utils/formatters';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileCheck2,
  Download,
  Share2,
} from 'lucide-react';

export const MonthlyIncomeView: React.FC = () => {
  const {
    incomes,
    sources,
    categories,
    selectedMonth,
    setSelectedMonth,
    getMonthlyTarget,
    user,
    setActiveTab,
    setSelectedDate,
  } = useApp();

  // Navigate months
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

  // Monthly income records
  const monthIncomes = useMemo(() => {
    return incomes.filter((i) => isSameMonth(i.date, selectedMonth.month, selectedMonth.year));
  }, [incomes, selectedMonth]);

  const totalMonthIncome = useMemo(() => {
    return monthIncomes.reduce((sum, item) => sum + item.amount, 0);
  }, [monthIncomes]);

  const monthlyTarget = useMemo(() => {
    return getMonthlyTarget(selectedMonth.month, selectedMonth.year);
  }, [getMonthlyTarget, selectedMonth]);

  const targetProgress = monthlyTarget > 0 ? Math.round((totalMonthIncome / monthlyTarget) * 100) : 0;

  // Days in selected month
  const daysInMonth = new Date(selectedMonth.year, selectedMonth.month, 0).getDate();
  const averageDailyIncome = Math.round(totalMonthIncome / (selectedMonth.month === 9 ? 29 : daysInMonth));

  // Highest and Lowest Income Day
  const { bestDay, lowestDay, dailySums } = useMemo(() => {
    const dayMap: Record<number, number> = {};
    monthIncomes.forEach((item) => {
      const dayNum = parseInt(item.date.split('-')[2], 10);
      dayMap[dayNum] = (dayMap[dayNum] || 0) + item.amount;
    });

    let best = { day: 0, amount: 0 };
    let lowest = { day: 0, amount: Infinity };

    Object.entries(dayMap).forEach(([dayStr, amt]) => {
      const d = parseInt(dayStr, 10);
      if (amt > best.amount) {
        best = { day: d, amount: amt };
      }
      if (amt < lowest.amount) {
        lowest = { day: d, amount: amt };
      }
    });

    if (lowest.amount === Infinity) lowest = { day: 0, amount: 0 };

    return { bestDay: best, lowestDay: lowest, dailySums: dayMap };
  }, [monthIncomes]);

  // Top income source
  const topSource = useMemo(() => {
    const sourceMap: Record<string, number> = {};
    monthIncomes.forEach((i) => {
      sourceMap[i.sourceId] = (sourceMap[i.sourceId] || 0) + i.amount;
    });

    let topId = '';
    let topAmt = 0;
    Object.entries(sourceMap).forEach(([id, amt]) => {
      if (amt > topAmt) {
        topAmt = amt;
        topId = id;
      }
    });

    const srcObj = sources.find((s) => s.id === topId);
    return {
      name: srcObj?.name || 'Freelancing / Direct',
      amount: topAmt,
      percentage: totalMonthIncome > 0 ? Math.round((topAmt / totalMonthIncome) * 100) : 0,
    };
  }, [monthIncomes, sources, totalMonthIncome]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Income Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Comprehensive financial breakdown, KPI performance, and targets
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[130px] text-center">
            {getMonthName(selectedMonth.month)} {selectedMonth.year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Total Income</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(totalMonthIncome, user?.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {monthIncomes.length} total transactions
          </p>
        </div>

        {/* Average Daily Income */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Average Daily Income</span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {formatCurrency(averageDailyIncome, user?.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across active days</p>
        </div>

        {/* Highest Income Day */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Highest Income Day</span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {bestDay.day > 0
              ? `${bestDay.day} ${getMonthName(selectedMonth.month).slice(0, 3)}`
              : '—'}
          </p>
          <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            {bestDay.day > 0 ? formatCurrency(bestDay.amount, user?.currency) : 'No data'}
          </p>
        </div>

        {/* Target Progress */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500">Monthly Target</span>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {targetProgress}%
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {formatCurrency(monthlyTarget, user?.currency)}
          </p>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(targetProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section 15: Official Monthly Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {getMonthName(selectedMonth.month)} {selectedMonth.year} Summary
              </h3>
              <p className="text-xs text-slate-400">
                Official Monthly Financial Performance Ledger
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
            {targetProgress >= 100 ? 'Target Achieved 🎉' : `${targetProgress}% of Target`}
          </span>
        </div>

        {/* Summary Metric Rows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">Total Income</span>
            <span className="text-base sm:text-lg font-bold text-emerald-400 mt-1 block">
              {formatCurrency(totalMonthIncome, user?.currency)}
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">Average Daily Income</span>
            <span className="text-base sm:text-lg font-bold text-white mt-1 block">
              {formatCurrency(averageDailyIncome, user?.currency)}
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">Best Day</span>
            <span className="text-base sm:text-lg font-bold text-white mt-1 block">
              {bestDay.day > 0
                ? `${bestDay.day} ${getMonthName(selectedMonth.month).slice(0, 3)} — ${formatCurrency(bestDay.amount, user?.currency)}`
                : '—'}
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">Top Income Source</span>
            <span className="text-base sm:text-lg font-bold text-emerald-300 mt-1 block truncate">
              {topSource.name} ({topSource.percentage}%)
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80">
          <span>Prepared for {user?.name || 'Ahmed Khan'}</span>
          <span>Income Manager Verified System</span>
        </div>
      </div>

      {/* Month Days Overview Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Daily Transactions in {getMonthName(selectedMonth.month)}
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {monthIncomes.map((tx) => {
            const src = sources.find((s) => s.id === tx.sourceId);
            const cat = categories.find((c) => c.id === tx.categoryId);

            return (
              <div
                key={tx.id}
                onClick={() => {
                  setSelectedDate(tx.date);
                  setActiveTab('daily');
                }}
                className="py-3 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {src?.name || 'Source'}
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
                  <p className="text-[11px] text-slate-400">
                    {formatDate(tx.date, 'DD MMM YYYY')} · {tx.paymentMethod}
                    {tx.clientName && ` · ${tx.clientName}`}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(tx.amount, user?.currency)}
                  </span>
                  <span className="block text-[10px] text-slate-400">View Day →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
