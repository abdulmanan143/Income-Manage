import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  getTodayDateString,
  isSameDay,
  isSameMonth,
} from '../../utils/formatters';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Download,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  Building2,
  FolderTree,
  CreditCard,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';
import { IncomeRecord } from '../../types';

interface IncomeHistoryViewProps {
  onOpenExport: () => void;
}

export const IncomeHistoryView: React.FC<IncomeHistoryViewProps> = ({ onOpenExport }) => {
  const {
    incomes,
    categories,
    sources,
    openAddModal,
    setViewingRecord,
    setDeleteConfirmId,
    user,
    globalSearch,
    setGlobalSearch,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<
    'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'custom'
  >('all');
  const [customStart, setCustomStart] = useState<string>('2026-09-01');
  const [customEnd, setCustomEnd] = useState<string>('2026-09-30');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    let result = [...incomes];
    const todayStr = getTodayDateString();

    // 1. Text Search across client, source name, notes, reference, category
    const search = globalSearch.toLowerCase().trim();
    if (search) {
      result = result.filter((item) => {
        const src = sources.find((s) => s.id === item.sourceId)?.name.toLowerCase() || '';
        const cat = categories.find((c) => c.id === item.categoryId)?.name.toLowerCase() || '';
        const client = (item.clientName || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const ref = (item.referenceNumber || '').toLowerCase();
        const tags = (item.tags || []).join(' ').toLowerCase();

        return (
          src.includes(search) ||
          cat.includes(search) ||
          client.includes(search) ||
          desc.includes(search) ||
          ref.includes(search) ||
          tags.includes(search) ||
          item.amount.toString().includes(search)
        );
      });
    }

    // 2. Date Presets
    if (dateFilter === 'today') {
      result = result.filter((i) => isSameDay(i.date, todayStr));
    } else if (dateFilter === 'yesterday') {
      result = result.filter((i) => i.date === '2026-09-28');
    } else if (dateFilter === 'this_week') {
      const weekDates = ['2026-09-27', '2026-09-28', '2026-09-29'];
      result = result.filter((i) => weekDates.includes(i.date));
    } else if (dateFilter === 'this_month') {
      result = result.filter((i) => isSameMonth(i.date, 9, 2026));
    } else if (dateFilter === 'last_month') {
      result = result.filter((i) => isSameMonth(i.date, 8, 2026));
    } else if (dateFilter === 'custom') {
      result = result.filter((i) => i.date >= customStart && i.date <= customEnd);
    }

    // 3. Source Filter
    if (selectedSource !== 'all') {
      result = result.filter((i) => i.sourceId === selectedSource);
    }

    // 4. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((i) => i.categoryId === selectedCategory);
    }

    // 5. Payment Method Filter
    if (selectedPaymentMethod !== 'all') {
      result = result.filter((i) => i.paymentMethod === selectedPaymentMethod);
    }

    // 6. Sorting
    result.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime() || b.amount - a.amount;
      }
      if (sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime() || a.amount - b.amount;
      }
      if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [
    incomes,
    globalSearch,
    dateFilter,
    customStart,
    customEnd,
    selectedSource,
    selectedCategory,
    selectedPaymentMethod,
    sortBy,
    sources,
    categories,
  ]);

  // Total amount of current filtered records
  const totalFilteredAmount = useMemo(() => {
    return filteredRecords.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredRecords]);

  // Export current filtered view to CSV file
  const exportToCSV = () => {
    const headers = ['Date', 'Amount', 'Currency', 'Source', 'Category', 'Payment Method', 'Client', 'Reference', 'Notes'];
    const rows = filteredRecords.map((item) => {
      const src = sources.find((s) => s.id === item.sourceId)?.name || 'Direct';
      const cat = categories.find((c) => c.id === item.categoryId)?.name || 'General';
      return [
        item.date,
        item.amount,
        user?.currency || 'PKR',
        `"${src}"`,
        `"${cat}"`,
        `"${item.paymentMethod}"`,
        `"${item.clientName || ''}"`,
        `"${item.referenceNumber || ''}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Income_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Income History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete transaction ledger with search, filtering, and export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
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

      {/* Filter and Search Bar Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Row 1: Search & Date Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search by client, source, notes, invoice #..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Date Presets Segmented Controls */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'this_week', label: 'This Week' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'custom', label: 'Custom' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDateFilter(preset.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  dateFilter === preset.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range picker if custom selected */}
        {dateFilter === 'custom' && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3 text-xs">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Source Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Source</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Sources</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Payment Method</label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Easypaisa">Easypaisa</option>
              <option value="PayPal">PayPal</option>
              <option value="Stripe">Stripe</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Bar for Filtered Results */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="text-slate-500">
          Showing <strong className="text-slate-900 dark:text-white">{filteredRecords.length}</strong> transactions
        </span>
        <span className="text-slate-500 font-mono">
          Total:{' '}
          <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
            {formatCurrency(totalFilteredAmount, user?.currency)}
          </strong>
        </span>
      </div>

      {/* Transaction Records List / Table */}
      {filteredRecords.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No income recorded yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Start tracking your income by adding your first transaction or adjust your filters.
            </p>
          </div>
          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Income</span>
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Source & Client</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Notes / Ref</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {filteredRecords.map((item) => {
                    const src = sources.find((s) => s.id === item.sourceId);
                    const cat = categories.find((c) => c.id === item.categoryId);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        {/* Date */}
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {formatDate(item.date, 'DD MMM YYYY')}
                        </td>

                        {/* Source & Client */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {src?.name || 'Direct Source'}
                          </p>
                          {item.clientName && (
                            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {item.clientName}
                            </p>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: cat?.color || '#10B981' }}
                            />
                            <span className="text-slate-700 dark:text-slate-300">
                              {cat?.name || 'Other'}
                            </span>
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {item.paymentMethod}
                        </td>

                        {/* Notes / Ref */}
                        <td className="py-3 px-4 max-w-[200px]">
                          {item.description ? (
                            <p className="text-slate-600 dark:text-slate-400 truncate text-[11px]">
                              {item.description}
                            </p>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          {item.referenceNumber && (
                            <span className="text-[10px] font-mono text-slate-400 block truncate">
                              #{item.referenceNumber}
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="font-bold font-mono text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                            +{formatCurrency(item.amount, user?.currency)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingRecord(item)}
                              title="View Details"
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openAddModal(item)}
                              title="Edit Record"
                              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              title="Delete Record"
                              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {filteredRecords.map((item) => {
              const src = sources.find((s) => s.id === item.sourceId);
              const cat = categories.find((c) => c.id === item.categoryId);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDate(item.date, 'DD MMM YYYY')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {src?.name || 'Direct Source'}
                      </h4>
                      {item.clientName && (
                        <p className="text-xs text-slate-500">{item.clientName}</p>
                      )}
                    </div>
                    <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(item.amount, user?.currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat?.color || '#10B981' }}
                      />
                      <span>{cat?.name || 'Other'}</span>
                    </span>
                    <span>·</span>
                    <span>{item.paymentMethod}</span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      onClick={() => setViewingRecord(item)}
                      className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => openAddModal(item)}
                      className="px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
