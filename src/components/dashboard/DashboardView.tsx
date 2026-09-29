import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  getGreeting,
  getMonthName,
  getTodayDateString,
  isSameDay,
  isSameMonth,
} from '../../utils/formatters';
import {
  TrendingUp,
  Calendar,
  Target,
  ArrowUpRight,
  Plus,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle,
  Receipt,
  Building2,
  FolderTree,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    user,
    incomes,
    categories,
    sources,
    todayIncome,
    thisWeekIncome,
    thisMonthIncome,
    currentMonthTarget,
    targetProgressPercent,
    openAddModal,
    setActiveTab,
    setViewingRecord,
    selectedMonth,
  } = useApp();

  const [hoveredDailyDay, setHoveredDailyDay] = useState<{ day: number; amount: number } | null>(null);

  // Remaining target calculation
  const remainingTarget = Math.max(0, currentMonthTarget - thisMonthIncome);
  const isTargetAchieved = thisMonthIncome >= currentMonthTarget;

  // 1. Calculate Daily Income for all 30 days of September 2026
  const daysInSeptember = 30;
  const dailySeries = useMemo(() => {
    const days: { day: number; dateStr: string; amount: number }[] = [];
    for (let d = 1; d <= daysInSeptember; d++) {
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `2026-09-${dayStr}`;
      const dayTotal = incomes
        .filter((i) => i.date === dateStr)
        .reduce((sum, item) => sum + item.amount, 0);
      days.push({ day: d, dateStr, amount: dayTotal });
    }
    return days;
  }, [incomes]);

  const maxDailyAmount = Math.max(...dailySeries.map((d) => d.amount), 35000);

  // 2. Source distribution for current month
  const sourceBreakdown = useMemo(() => {
    const monthIncomes = incomes.filter((i) => isSameMonth(i.date, selectedMonth.month, selectedMonth.year));
    const total = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    if (total === 0) return [];

    const grouped: Record<string, { sourceId: string; name: string; amount: number }> = {};
    monthIncomes.forEach((item) => {
      const src = sources.find((s) => s.id === item.sourceId);
      const name = src ? src.name : 'Other Source';
      if (!grouped[name]) {
        grouped[name] = { sourceId: item.sourceId, name, amount: 0 };
      }
      grouped[name].amount += item.amount;
    });

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        percentage: Math.round((item.amount / total) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [incomes, sources, selectedMonth]);

  // 3. Category distribution for current month
  const categoryBreakdown = useMemo(() => {
    const monthIncomes = incomes.filter((i) => isSameMonth(i.date, selectedMonth.month, selectedMonth.year));
    const total = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    if (total === 0) return [];

    const grouped: Record<string, { name: string; color: string; amount: number }> = {};
    monthIncomes.forEach((item) => {
      const cat = categories.find((c) => c.id === item.categoryId);
      const name = cat ? cat.name : 'Other';
      const color = cat ? cat.color : '#64748B';
      if (!grouped[name]) {
        grouped[name] = { name, color, amount: 0 };
      }
      grouped[name].amount += item.amount;
    });

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        percentage: Math.round((item.amount / total) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [incomes, categories, selectedMonth]);

  // 4. Monthly Trend Data (Last 5 months: May, Jun, Jul, Aug, Sep 2026)
  const monthlyTrends = useMemo(() => {
    const months = [
      { name: 'May', month: 5, year: 2026 },
      { name: 'Jun', month: 6, year: 2026 },
      { name: 'Jul', month: 7, year: 2026 },
      { name: 'Aug', month: 8, year: 2026 },
      { name: 'Sep', month: 9, year: 2026 },
    ];
    return months.map((m) => {
      const total = incomes
        .filter((i) => isSameMonth(i.date, m.month, m.year))
        .reduce((sum, item) => sum + item.amount, 0);
      return { ...m, total: total || (m.month === 5 ? 140000 : m.month === 6 ? 155000 : total) };
    });
  }, [incomes]);

  const maxMonthTrend = Math.max(...monthlyTrends.map((m) => m.total), 220000);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...incomes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.amount - a.amount)
      .slice(0, 5);
  }, [incomes]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Hero Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {getGreeting(user?.name || 'Ahmed')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Here's your income overview for {getMonthName(selectedMonth.month)} {selectedMonth.year}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('monthly')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {getMonthName(selectedMonth.month)} Analytics
          </button>
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Target Achievement Banner if achieved */}
      {isTargetAchieved && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-bold">Monthly Target Achieved! 🎉</p>
              <p className="text-xs text-emerald-100">
                You surpassed your {getMonthName(selectedMonth.month)} target of{' '}
                {formatCurrency(currentMonthTarget, user?.currency)}. Outstanding financial performance!
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-mono font-bold">
            {targetProgressPercent}% Hit
          </span>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Income */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Today's Income
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(todayIncome, user?.currency)}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              29 September 2026
            </p>
          </div>
        </div>

        {/* This Week's Income */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              This Week's Income
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(thisWeekIncome, user?.currency)}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Current 7-day period
            </p>
          </div>
        </div>

        {/* This Month's Income */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              This Month's Income
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(thisMonthIncome, user?.currency)}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {getMonthName(selectedMonth.month)} total earnings
            </p>
          </div>
        </div>

        {/* Monthly Target & Progress */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Monthly Target
            </span>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {targetProgressPercent}%
            </span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(currentMonthTarget, user?.currency)}
            </p>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(targetProgressPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Target Detailed Progress Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              September 2026 Target Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTargetAchieved
                ? `You reached 100% of your target! Exceeded by ${formatCurrency(thisMonthIncome - currentMonthTarget, user?.currency)}`
                : `${formatCurrency(remainingTarget, user?.currency)} remaining to achieve your goal`}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('targets')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Adjust Target</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Large Progress Bar with Markers */}
        <div className="space-y-2">
          <div className="relative w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${Math.min(targetProgressPercent, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-slate-600 dark:text-slate-400">
            <span>Current: {formatCurrency(thisMonthIncome, user?.currency)}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {targetProgressPercent}%
            </span>
            <span>Target: {formatCurrency(currentMonthTarget, user?.currency)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Daily Bar Chart & Monthly Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Income Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Income Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                September 1 – 30, 2026 earnings per day
              </p>
            </div>
            {hoveredDailyDay ? (
              <div className="text-right">
                <span className="text-[11px] text-slate-400">Sep {hoveredDailyDay.day}:</span>
                <span className="ml-1 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(hoveredDailyDay.amount, user?.currency)}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">Hover bars to view day total</span>
            )}
          </div>

          {/* SVG Bar Chart */}
          <div className="h-52 w-full pt-4 flex items-end gap-1 sm:gap-1.5">
            {dailySeries.map((item) => {
              const heightPercent = maxDailyAmount > 0 ? (item.amount / maxDailyAmount) * 100 : 0;
              const isToday = item.day === 29;
              const hasIncome = item.amount > 0;

              return (
                <div
                  key={item.day}
                  onMouseEnter={() => setHoveredDailyDay({ day: item.day, amount: item.amount })}
                  onMouseLeave={() => setHoveredDailyDay(null)}
                  className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-9 z-20 hidden group-hover:flex flex-col items-center pointer-events-none">
                    <div className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-mono whitespace-nowrap shadow-md">
                      Sep {item.day}: {formatCurrency(item.amount, user?.currency)}
                    </div>
                    <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-1" />
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t transition-all duration-200 ${
                      isToday
                        ? 'bg-emerald-500 ring-2 ring-emerald-400/40'
                        : hasIncome
                        ? 'bg-emerald-600/70 group-hover:bg-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                    style={{
                      height: `${Math.max(hasIncome ? heightPercent : 4, 3)}%`,
                    }}
                  />

                  {/* Day number label */}
                  {item.day % 5 === 0 || item.day === 1 || item.day === 29 ? (
                    <span
                      className={`text-[9px] mt-1 font-mono ${
                        isToday
                          ? 'font-bold text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.day}
                    </span>
                  ) : (
                    <span className="text-[9px] mt-1 opacity-0">.</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500" />
                <span>Today (Sep 29: {formatCurrency(todayIncome, user?.currency)})</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-600/70" />
                <span>Recorded Income</span>
              </span>
            </div>
            <button
              onClick={() => setActiveTab('daily')}
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              Open Daily View →
            </button>
          </div>
        </div>

        {/* Monthly Trend Area / Line Chart (1 col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Income Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                May — September 2026
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+32% YTD</span>
            </span>
          </div>

          {/* Interactive Trend SVG */}
          <div className="h-52 w-full pt-2 flex flex-col justify-between">
            <div className="relative h-40 w-full flex items-end justify-between px-2">
              {monthlyTrends.map((trend, idx) => {
                const height = (trend.total / maxMonthTrend) * 100;
                const isCurrent = trend.month === selectedMonth.month;
                return (
                  <div key={trend.name} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] font-mono text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(trend.total, user?.currency)}
                    </div>
                    <div
                      className={`w-7 sm:w-10 rounded-t-lg transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCurrent
                          ? 'font-bold text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {trend.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Best Month: Aug ({formatCurrency(210000, user?.currency)})</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              Full Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Row: Sources Donut & Categories Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Sources Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Income Sources
            </h3>
            <button
              onClick={() => setActiveTab('sources')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {sourceBreakdown.slice(0, 5).map((src) => (
              <div key={src.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                    {src.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500">{src.percentage}%</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(src.amount, user?.currency)}
                    </span>
                  </div>
                </div>
                {/* Micro bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${src.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Contribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Income Categories
            </h3>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.slice(0, 5).map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500">{cat.percentage}%</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(cat.amount, user?.currency)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color, width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              See All
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentTransactions.map((tx) => {
              const src = sources.find((s) => s.id === tx.sourceId);
              return (
                <div
                  key={tx.id}
                  onClick={() => setViewingRecord(tx)}
                  className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-1 rounded-lg transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {src?.name || 'Direct Source'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {formatDate(tx.date, 'DD MMM')} · {tx.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(tx.amount, user?.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
