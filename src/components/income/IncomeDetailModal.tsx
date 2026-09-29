import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  Building2,
  FolderTree,
  CreditCard,
  Hash,
  Paperclip,
  Tag,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const IncomeDetailModal: React.FC = () => {
  const {
    viewingRecord,
    setViewingRecord,
    categories,
    sources,
    openAddModal,
    setDeleteConfirmId,
    user,
  } = useApp();

  if (!viewingRecord) return null;

  const category = categories.find((c) => c.id === viewingRecord.categoryId);
  const source = sources.find((s) => s.id === viewingRecord.sourceId);

  const handleEdit = () => {
    const record = viewingRecord;
    setViewingRecord(null);
    openAddModal(record);
  };

  const handleDelete = () => {
    const id = viewingRecord.id;
    setViewingRecord(null);
    setDeleteConfirmId(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Amount */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Income Receipt
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              +{formatCurrency(viewingRecord.amount, user?.currency)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(viewingRecord.date, 'DD MMM YYYY')}</span>
            </div>
          </div>
          <button
            onClick={() => setViewingRecord(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Source
              </span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                {source?.name || 'Direct Source'}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <FolderTree className="w-3 h-3" /> Category
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category?.color || '#10B981' }}
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {category?.name || 'General'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Payment Method
              </span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                {viewingRecord.paymentMethod}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Client / Company
              </span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                {viewingRecord.clientName || '—'}
              </p>
            </div>
          </div>

          {viewingRecord.referenceNumber && (
            <div className="p-3 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> Reference / Invoice #
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {viewingRecord.referenceNumber}
              </span>
            </div>
          )}

          {viewingRecord.description && (
            <div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Notes & Description
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
                {viewingRecord.description}
              </p>
            </div>
          )}

          {viewingRecord.tags && viewingRecord.tags.length > 0 && (
            <div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1.5">
                <Tag className="w-3 h-3" /> Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {viewingRecord.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {viewingRecord.attachmentName && (
            <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-emerald-500" />
                <span className="text-slate-700 dark:text-slate-300 font-mono truncate max-w-[200px]">
                  {viewingRecord.attachmentName}
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Verified Attached
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewingRecord(null)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
