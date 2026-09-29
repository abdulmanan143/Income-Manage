import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  getMonthName,
  isSameMonth,
} from '../../utils/formatters';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
  Check,
  Calendar,
  Layers,
  Building2,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { incomes, sources, categories, user } = useApp();

  const [exportType, setExportType] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [dateFilter, setDateFilter] = useState<'all' | 'september' | 'august' | 'custom'>('september');
  const [customStart, setCustomStart] = useState('2026-09-01');
  const [customEnd, setCustomEnd] = useState('2026-09-30');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  // Filter records according to export settings
  const filteredExportRecords = incomes.filter((item) => {
    // Date
    if (dateFilter === 'september' && !isSameMonth(item.date, 9, 2026)) return false;
    if (dateFilter === 'august' && !isSameMonth(item.date, 8, 2026)) return false;
    if (dateFilter === 'custom' && (item.date < customStart || item.date > customEnd)) return false;

    // Source
    if (selectedSource !== 'all' && item.sourceId !== selectedSource) return false;

    // Category
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;

    return true;
  });

  const totalExportAmount = filteredExportRecords.reduce((sum, item) => sum + item.amount, 0);

  // Trigger CSV Download
  const handleDownloadCSV = () => {
    const headers = [
      'Date',
      'Amount',
      'Currency',
      'Source',
      'Category',
      'Payment Method',
      'Client',
      'Reference Number',
      'Notes',
    ];

    const rows = filteredExportRecords.map((item) => {
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
    link.setAttribute('download', `Income_Manager_Export_${dateFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  // Trigger JSON Backup Download
  const handleDownloadJSON = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: {
        name: user?.name,
        email: user?.email,
        currency: user?.currency,
      },
      records: filteredExportRecords,
      categories,
      sources,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `Income_Manager_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    onClose();
  };

  // Trigger Print / PDF
  const handlePrintPDF = () => {
    window.print();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Export Income Data
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download spreadsheets, backup archives, or print official statements
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportType('csv')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  exportType === 'csv'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>CSV / Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setExportType('pdf')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  exportType === 'pdf'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Printer className="w-5 h-5" />
                <span>PDF Statement</span>
              </button>

              <button
                type="button"
                onClick={() => setExportType('json')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  exportType === 'json'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>JSON Backup</span>
              </button>
            </div>
          </div>

          {/* Date range filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Timeframe
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="september">September 2026 (Current Month)</option>
              <option value="august">August 2026</option>
              <option value="all">All-Time Transactions</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Source and Category Filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Source
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="all">All Sources</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Export preview stats */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs flex justify-between items-center font-mono">
            <span className="text-slate-500">
              Matching Records: <strong>{filteredExportRecords.length}</strong>
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Total: {formatCurrency(totalExportAmount, user?.currency)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 rounded-lg"
          >
            Cancel
          </button>

          {exportType === 'csv' && (
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          )}

          {exportType === 'json' && (
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          )}

          {exportType === 'pdf' && (
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
