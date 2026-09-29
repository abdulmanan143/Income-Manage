import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteConfirmId, setDeleteConfirmId, incomes, deleteIncome, user } = useApp();

  if (!deleteConfirmId) return null;

  const targetRecord = incomes.find((i) => i.id === deleteConfirmId);

  const handleConfirm = () => {
    deleteIncome(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confirm Delete
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to delete this income record?
            </p>
          </div>
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {targetRecord && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(targetRecord.amount, user?.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {formatDate(targetRecord.date)}
              </span>
            </div>
            {targetRecord.clientName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Client:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {targetRecord.clientName}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          This action cannot be undone. The income will be permanently removed from your history and analytics.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setDeleteConfirmId(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:scale-95 rounded-lg shadow-sm shadow-red-600/20 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
