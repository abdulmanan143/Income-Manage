import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { getTodayDateString, CURRENCIES } from '../../utils/formatters';
import { X, Plus, Calendar, Tag, FileText, Hash, Building2, CreditCard, Check, AlertCircle } from 'lucide-react';

export const AddIncomeModal: React.FC = () => {
  const {
    isAddModalOpen,
    closeAddModal,
    editingRecord,
    addIncome,
    updateIncome,
    categories,
    sources,
    addCategory,
    addSource,
    user,
  } = useApp();

  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [sourceId, setSourceId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [clientName, setClientName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick inline add toggles
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#10B981');

  const paymentMethods: PaymentMethod[] = [
    'Cash',
    'Bank Transfer',
    'JazzCash',
    'Easypaisa',
    'PayPal',
    'Stripe',
    'Other',
  ];

  // Pre-fill if editing
  useEffect(() => {
    if (editingRecord) {
      setAmount(editingRecord.amount.toString());
      setDate(editingRecord.date);
      setSourceId(editingRecord.sourceId);
      setCategoryId(editingRecord.categoryId);
      setPaymentMethod(editingRecord.paymentMethod);
      setClientName(editingRecord.clientName || '');
      setDescription(editingRecord.description || '');
      setReferenceNumber(editingRecord.referenceNumber || '');
      setAttachmentName(editingRecord.attachmentName || '');
      setTagsInput(editingRecord.tags ? editingRecord.tags.join(', ') : '');
    } else {
      setAmount('');
      setDate(getTodayDateString());
      setSourceId(sources[0]?.id || '');
      setCategoryId(categories[0]?.id || '');
      setPaymentMethod('Bank Transfer');
      setClientName('');
      setDescription('');
      setReferenceNumber('');
      setAttachmentName('');
      setTagsInput('');
    }
    setError('');
  }, [editingRecord, isAddModalOpen, sources, categories]);

  if (!isAddModalOpen) return null;

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleCreateNewSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    const created = addSource({ name: newSourceName.trim(), type: 'Direct' });
    setSourceId(created.id);
    setNewSourceName('');
    setShowAddSource(false);
  };

  const handleCreateNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const created = addCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
      icon: 'Tag',
    });
    setCategoryId(created.id);
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }
    if (!sourceId) {
      setError('Please select an income source.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    setIsSubmitting(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    try {
      if (editingRecord) {
        updateIncome(editingRecord.id, {
          amount: parsedAmount,
          date,
          sourceId,
          categoryId,
          paymentMethod,
          clientName: clientName.trim() || undefined,
          description: description.trim() || undefined,
          referenceNumber: referenceNumber.trim() || undefined,
          attachmentName: attachmentName.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
        });
      } else {
        addIncome({
          amount: parsedAmount,
          date,
          sourceId,
          categoryId,
          paymentMethod,
          clientName: clientName.trim() || undefined,
          description: description.trim() || undefined,
          referenceNumber: referenceNumber.trim() || undefined,
          attachmentName: attachmentName.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
        });
      }
      closeAddModal();
    } catch {
      setError('Failed to save income record. Please verify fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencySymbol = CURRENCIES[user?.currency || 'PKR']?.symbol || 'Rs. ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingRecord ? 'Edit Income Transaction' : 'Record New Income'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingRecord
                ? 'Update transaction details and attachments'
                : 'Log your earnings with source, category, and payment details'}
            </p>
          </div>
          <button
            onClick={closeAddModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount (Required) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount * ({user?.currency || 'PKR'})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-2.5 text-lg font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            {/* Quick Amount Pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1">Quick add:</span>
              {[1000, 5000, 10000, 25000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-emerald-500 focus:outline-none"
              >
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Income Source */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Income Source *
              </label>
              <button
                type="button"
                onClick={() => setShowAddSource(!showAddSource)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Source</span>
              </button>
            </div>

            {showAddSource ? (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg space-y-2 mb-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Upwork, Direct Client"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewSource}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSource(false)}
                    className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <select
              required
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.type})
                </option>
              ))}
            </select>
          </div>

          {/* Income Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Category</span>
              </button>
            </div>

            {showAddCategory ? (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg space-y-2 mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Web Development"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-8 h-7 p-0.5 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                    title="Category Color"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewCategory}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-emerald-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Fields Divider */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Optional Details
            </span>
          </div>

          {/* Client & Reference Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Client / Company Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Apex Systems"
                className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Invoice / Reference #
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. INV-2026-089"
                className="w-full px-3 py-2 text-xs font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Milestone 2 deliverable, frontend dashboard revision"
              className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Attachment & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Receipt / Invoice File
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="receipt_2026.pdf"
                  className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="freelance, retainer, web"
                className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 rounded-lg shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{editingRecord ? 'Update Record' : 'Save Income'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
