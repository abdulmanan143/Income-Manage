import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, isSameMonth } from '../../utils/formatters';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Calendar,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { IncomeSource } from '../../types';

export const SourcesView: React.FC = () => {
  const {
    sources,
    addSource,
    updateSource,
    deleteSource,
    incomes,
    selectedMonth,
    user,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('Client');
  const [error, setError] = useState('');

  // Source Analytics
  const sourceStats = useMemo(() => {
    const monthIncomes = incomes.filter((i) => isSameMonth(i.date, selectedMonth.month, selectedMonth.year));
    const totalMonthIncome = monthIncomes.reduce((sum, item) => sum + item.amount, 0);

    return sources.map((src) => {
      // Month
      const srcMonthIncomes = monthIncomes.filter((i) => i.sourceId === src.id);
      const monthAmount = srcMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
      const monthCount = srcMonthIncomes.length;
      const monthlyContribution = totalMonthIncome > 0 ? Math.round((monthAmount / totalMonthIncome) * 100) : 0;

      // All time
      const allSrcIncomes = incomes.filter((i) => i.sourceId === src.id);
      const totalIncome = allSrcIncomes.reduce((sum, i) => sum + i.amount, 0);
      const totalCount = allSrcIncomes.length;

      // Last payment date
      const sortedByDate = [...allSrcIncomes].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastPaymentDate = sortedByDate[0]?.date || null;

      return {
        ...src,
        monthAmount,
        monthCount,
        monthlyContribution,
        totalIncome,
        totalCount,
        lastPaymentDate,
      };
    }).sort((a, b) => b.totalIncome - a.totalIncome);
  }, [sources, incomes, selectedMonth]);

  const handleOpenAdd = () => {
    setEditingSource(null);
    setName('');
    setType('Client');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (src: IncomeSource) => {
    setEditingSource(src);
    setName(src.name);
    setType(src.type);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Source name is required.');
      return;
    }

    if (editingSource) {
      updateSource(editingSource.id, { name: name.trim(), type });
    } else {
      addSource({ name: name.trim(), type });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete income source "${name}"? Associated records will be safely reassigned.`)) {
      deleteSource(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Income Sources
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track individual clients, marketplaces, businesses, and regular payouts
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg shadow-sm shadow-emerald-600/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Source</span>
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sourceStats.map((src) => (
          <div
            key={src.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                      {src.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">Type: {src.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(src)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                    title="Edit source"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {sources.length > 1 && (
                    <button
                      onClick={() => handleDelete(src.id, src.name)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Monthly Contribution */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Monthly Share:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {src.monthlyContribution}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${src.monthlyContribution}%` }}
                  />
                </div>
              </div>

              {/* Transactions Count and Last Payment Date */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                <div>
                  <span className="text-slate-400 block">Total Txns:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {src.totalCount} {src.totalCount === 1 ? 'payment' : 'payments'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Last Payment:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {src.lastPaymentDate ? formatDate(src.lastPaymentDate, 'DD MMM') : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Income Stats Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  September 2026
                </span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrency(src.monthAmount, user?.currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  All Time
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(src.totalIncome, user?.currency)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Source Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSource ? 'Edit Income Source' : 'Add Income Source'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Upwork, Apex Systems, Shopify Store"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Client">Client</option>
                  <option value="Platform">Platform (Upwork, Fiverr)</option>
                  <option value="Business">Business / E-commerce</option>
                  <option value="Direct">Direct / Retainer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSource ? 'Update' : 'Add Source'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
