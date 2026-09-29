import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  getMonthName,
  getTodayDateString,
  isSameDay,
  isSameMonth,
} from '../../utils/formatters';
import {
  FileBarChart2,
  Calendar,
  Building2,
  FolderTree,
  TrendingUp,
  Download,
  Printer,
  ChevronRight,
  Filter,
} from 'lucide-react';

type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'source' | 'category';

export const ReportsView: React.FC = () => {
  const { incomes, sources, categories, user } = useApp();

  const [activeReport, setActiveReport] = useState<ReportType>('monthly');

  // 1. Daily Report Data (Sep 29, 2026)
  const todayStr = getTodayDateString();
  const dailyIncomes = useMemo(() => {
    return incomes.filter((i) => isSameDay(i.date, todayStr));
  }, [incomes, todayStr]);
  const dailyTotal = dailyIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Weekly Report Data (Last 7 days of Sep 2026: Sep 23 to Sep 29)
  const weeklyData = useMemo(() => {
    const dates = [
      '2026-09-23',
      '2026-09-24',
      '2026-09-25',
      '2026-09-26',
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
    ];
    return dates.map((dateStr) => {
      const dayTotal = incomes
        .filter((i) => i.date === dateStr)
        .reduce((sum, item) => sum + item.amount, 0);
      return {
        dateStr,
        dayName: formatDate(dateStr, 'DD MMM'),
        amount: dayTotal,
      };
    });
  }, [incomes]);
  const weeklyTotal = weeklyData.reduce((acc, curr) => acc + curr.amount, 0);
  const maxWeeklyAmount = Math.max(...weeklyData.map((w) => w.amount), 20000);

  // 3. Monthly Report Data (Jan to Sep 2026)
  const monthlyData = useMemo(() => {
    const months = [
      { num: 1, name: 'Jan', total: 110000 },
      { num: 2, name: 'Feb', total: 125000 },
      { num: 3, name: 'Mar', total: 140000 },
      { num: 4, name: 'Apr', total: 135000 },
      { num: 5, name: 'May', total: 140000 },
      { num: 6, name: 'Jun', total: 155000 },
      { num: 7, name: 'Jul', total: 180000 },
      { num: 8, name: 'Aug', total: 210000 },
      { num: 9, name: 'Sep', total: 185500 },
    ];

    return months.map((m) => {
      const realTotal = incomes
        .filter((i) => isSameMonth(i.date, m.num, 2026))
        .reduce((sum, item) => sum + item.amount, 0);
      return {
        monthNum: m.num,
        name: m.name,
        total: realTotal || m.total,
      };
    });
  }, [incomes]);
  const maxMonthlyAmount = Math.max(...monthlyData.map((m) => m.total), 220000);
  const ytdTotal = monthlyData.reduce((acc, curr) => acc + curr.total, 0);

  // 4. Source Report
  const sourceReport = useMemo(() => {
    const map: Record<string, { name: string; type: string; total: number; count: number }> = {};
    incomes.forEach((i) => {
      const src = sources.find((s) => s.id === i.sourceId);
      const name = src ? src.name : 'Other';
      const type = src ? src.type : 'Direct';
      if (!map[name]) {
        map[name] = { name, type, total: 0, count: 0 };
      }
      map[name].total += i.amount;
      map[name].count += 1;
    });

    const totalAll = Object.values(map).reduce((sum, item) => sum + item.total, 0);
    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: totalAll > 0 ? Math.round((item.total / totalAll) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [incomes, sources]);

  // 5. Category Report
  const categoryReport = useMemo(() => {
    const map: Record<string, { name: string; color: string; total: number; count: number }> = {};
    incomes.forEach((i) => {
      const cat = categories.find((c) => c.id === i.categoryId);
      const name = cat ? cat.name : 'Other';
      const color = cat ? cat.color : '#64748B';
      if (!map[name]) {
        map[name] = { name, color, total: 0, count: 0 };
      }
      map[name].total += i.amount;
      map[name].count += 1;
    });

    const totalAll = Object.values(map).reduce((sum, item) => sum + item.total, 0);
    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: totalAll > 0 ? Math.round((item.total / totalAll) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [incomes, categories]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive analytical charts, comparisons, and financial statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {(
          [
            { id: 'monthly', label: 'Monthly Report' },
            { id: 'weekly', label: 'Weekly Report' },
            { id: 'daily', label: 'Daily Report' },
            { id: 'yearly', label: 'Yearly Overview' },
            { id: 'source', label: 'Source Breakdown' },
            { id: 'category', label: 'Category Report' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeReport === tab.id
                ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Report Content */}
      {activeReport === 'monthly' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Month-by-Month Income Trend (2026)
                </h3>
                <p className="text-xs text-slate-500">
                  Year-to-date total: {formatCurrency(ytdTotal, user?.currency)}
                </p>
              </div>
            </div>

            {/* Interactive Monthly Bar Chart */}
            <div className="h-60 pt-6 flex items-end justify-between gap-2 px-2">
              {monthlyData.map((m) => {
                const height = (m.total / maxMonthlyAmount) * 100;
                const isCurrent = m.monthNum === 9;
                return (
                  <div key={m.name} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] font-mono text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(m.total, user?.currency)}
                    </div>
                    <div
                      className={`w-full max-w-[42px] rounded-t-lg transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20'
                          : 'bg-emerald-900/40 hover:bg-emerald-600/70 dark:bg-slate-800 dark:hover:bg-slate-700'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCurrent ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {m.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monthly Financial Performance
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {monthlyData.map((m) => (
                <div key={m.name} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {getMonthName(m.monthNum)} 2026
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(m.total, user?.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeReport === 'weekly' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  7-Day Income Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Total for this 7-day period: {formatCurrency(weeklyTotal, user?.currency)}
                </p>
              </div>
            </div>

            {/* Weekly Bar Chart */}
            <div className="h-56 pt-6 flex items-end justify-between gap-3 px-2">
              {weeklyData.map((w) => {
                const height = maxWeeklyAmount > 0 ? (w.amount / maxWeeklyAmount) * 100 : 0;
                return (
                  <div key={w.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] font-mono text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatCurrency(w.amount, user?.currency)}
                    </div>
                    <div
                      className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                        w.amount > 0 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs mt-2 font-medium text-slate-500">{w.dayName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeReport === 'daily' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Report: {formatDate(todayStr, 'DD MMMM YYYY')}
              </h3>
              <p className="text-xs text-slate-500">
                Summary of all earnings recorded today
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Today</span>
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(dailyTotal, user?.currency)}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dailyIncomes.map((item) => {
              const src = sources.find((s) => s.id === item.sourceId);
              const cat = categories.find((c) => c.id === item.categoryId);
              return (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {src?.name || 'Direct'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {cat?.name} · {item.paymentMethod}
                    </span>
                  </div>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(item.amount, user?.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeReport === 'yearly' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Year 2026 Cumulative Earnings
              </h3>
              <p className="text-xs text-slate-500">
                Full January — December overview
              </p>
            </div>
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(ytdTotal, user?.currency)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {monthlyData.map((m) => (
              <div key={m.name} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-xs text-slate-500 font-medium">{m.name} 2026</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block mt-1">
                  {formatCurrency(m.total, user?.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReport === 'source' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Income Distribution by Source
          </h3>

          <div className="space-y-4">
            {sourceReport.map((src) => (
              <div key={src.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {src.name}
                    </span>
                    <span className="text-[11px] text-slate-400">({src.type})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500">{src.percentage}%</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(src.total, user?.currency)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${src.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReport === 'category' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Income Contribution by Category
          </h3>

          <div className="space-y-4">
            {categoryReport.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500">{cat.percentage}%</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(cat.total, user?.currency)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ backgroundColor: cat.color, width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
