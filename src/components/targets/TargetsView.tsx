import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getMonthName, isSameMonth } from '../../utils/formatters';
import {
  Target,
  Sparkles,
  CheckCircle2,
  Calendar,
  TrendingUp,
  ArrowRight,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

export const TargetsView: React.FC = () => {
  const {
    targets,
    setMonthlyTarget,
    getMonthlyTarget,
    incomes,
    selectedMonth,
    setSelectedMonth,
    user,
  } = useApp();

  const currentTargetAmount = getMonthlyTarget(selectedMonth.month, selectedMonth.year);
  const [newTargetInput, setNewTargetInput] = useState<string>(currentTargetAmount.toString());
  const [isSaved, setIsSaved] = useState(false);

  // Current month actual income
  const currentMonthActual = useMemo(() => {
    return incomes
      .filter((i) => isSameMonth(i.date, selectedMonth.month, selectedMonth.year))
      .reduce((sum, item) => sum + item.amount, 0);
  }, [incomes, selectedMonth]);

  const progressPercent = currentTargetAmount > 0
    ? Math.round((currentMonthActual / currentTargetAmount) * 100)
    : 0;

  const remainingAmount = Math.max(0, currentTargetAmount - currentMonthActual);
  const isAchieved = currentMonthActual >= currentTargetAmount;

  // Days left in September 2026: 30 - 29 = 1 day left!
  const daysLeftInMonth = selectedMonth.month === 9 ? 1 : 15;
  const requiredDailyIncome = daysLeftInMonth > 0 ? Math.round(remainingAmount / daysLeftInMonth) : 0;

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newTargetInput);
    if (!isNaN(val) && val >= 0) {
      setMonthlyTarget(selectedMonth.month, selectedMonth.year, val);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  // Target history across recent months
  const targetHistory = useMemo(() => {
    const months = [
      { month: 7, year: 2026, label: 'July 2026' },
      { month: 8, year: 2026, label: 'August 2026' },
      { month: 9, year: 2026, label: 'September 2026' },
      { month: 10, year: 2026, label: 'October 2026' },
    ];

    return months.map((m) => {
      const target = getMonthlyTarget(m.month, m.year);
      const actual = incomes
        .filter((i) => isSameMonth(i.date, m.month, m.year))
        .reduce((sum, item) => sum + item.amount, 0);
      const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
      const status = actual >= target ? 'Achieved' : m.month === 10 ? 'Upcoming' : 'In Progress';
      return {
        ...m,
        target,
        actual,
        pct,
        status,
      };
    });
  }, [incomes, targets, getMonthlyTarget]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Income Targets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set ambitious financial benchmarks and track daily velocity to achieve them
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Active Month:</span>
          <span className="px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            {getMonthName(selectedMonth.month)} {selectedMonth.year}
          </span>
        </div>
      </div>

      {/* Target Progress Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
          isAchieved
            ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 border-emerald-500/40 text-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
        }`}
      >
        {/* Subtle background glow */}
        {isAchieved && (
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        )}

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold">
                  {getMonthName(selectedMonth.month)} {selectedMonth.year} Goal
                </h2>
              </div>
              <p
                className={`text-xs mt-1 ${
                  isAchieved ? 'text-emerald-200' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isAchieved
                  ? `Goal surpassed by ${formatCurrency(currentMonthActual - currentTargetAmount, user?.currency)}! Outstanding progress!`
                  : `Currently at ${progressPercent}% of your ${formatCurrency(currentTargetAmount, user?.currency)} target.`}
              </p>
            </div>

            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-500">
                {progressPercent}%
              </span>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                Completion Rate
              </span>
            </div>
          </div>

          {/* Large Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-5 rounded-full overflow-hidden p-1">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isAchieved
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 shadow-md shadow-emerald-400/50'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className={isAchieved ? 'text-emerald-200' : 'text-slate-600 dark:text-slate-400'}>
                Current: {formatCurrency(currentMonthActual, user?.currency)}
              </span>
              <span className={isAchieved ? 'text-emerald-200' : 'text-slate-600 dark:text-slate-400'}>
                Target: {formatCurrency(currentTargetAmount, user?.currency)}
              </span>
            </div>
          </div>

          {/* Three Key Projection Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div
              className={`p-3.5 rounded-2xl border ${
                isAchieved
                  ? 'bg-white/5 border-white/10'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              <span className="text-[11px] text-slate-400 block">Remaining to Target</span>
              <span className="text-lg font-bold font-mono text-emerald-500 mt-0.5 block">
                {formatCurrency(remainingAmount, user?.currency)}
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isAchieved
                  ? 'bg-white/5 border-white/10'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              <span className="text-[11px] text-slate-400 block">Required Daily Run Rate</span>
              <span className="text-lg font-bold font-mono mt-0.5 block">
                {isAchieved ? 'Goal Met 🎯' : formatCurrency(requiredDailyIncome, user?.currency)}
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isAchieved
                  ? 'bg-white/5 border-white/10'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              <span className="text-[11px] text-slate-400 block">Days Left in Month</span>
              <span className="text-lg font-bold font-mono mt-0.5 block">
                {daysLeftInMonth} day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Setter Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Set or Adjust Target for {getMonthName(selectedMonth.month)} {selectedMonth.year}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define your income milestone. Dashboard and reports will update dynamically.
          </p>
        </div>

        <form onSubmit={handleSaveTarget} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {user?.currency || 'PKR'}
            </span>
            <input
              type="number"
              min="0"
              step="1000"
              required
              value={newTargetInput}
              onChange={(e) => setNewTargetInput(e.target.value)}
              placeholder="e.g. 250000"
              className="w-full pl-14 pr-4 py-2.5 text-sm font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            {isSaved ? 'Saved Successfully! ✓' : 'Update Target'}
          </button>
        </form>

        {/* Quick presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-[11px] text-slate-400">Quick set:</span>
          {[150000, 200000, 250000, 300000, 500000].map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => {
                setNewTargetInput(preset.toString());
                setMonthlyTarget(selectedMonth.month, selectedMonth.year, preset);
              }}
              className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 transition-colors"
            >
              {formatCurrency(preset, user?.currency)}
            </button>
          ))}
        </div>
      </div>

      {/* Target History Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Target Achievement Record (2026)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3 font-mono">Target</th>
                <th className="py-2.5 px-3 font-mono">Actual Earned</th>
                <th className="py-2.5 px-3 font-mono">Achievement</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {targetHistory.map((item) => (
                <tr key={item.label} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {item.label}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {formatCurrency(item.target, user?.currency)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(item.actual, user?.currency)}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="font-bold">{item.pct}%</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                        item.status === 'Achieved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : item.status === 'In Progress'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
