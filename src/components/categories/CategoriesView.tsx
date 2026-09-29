import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, isSameMonth } from '../../utils/formatters';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  TrendingUp,
  Tag,
  Palette,
  AlertCircle,
} from 'lucide-react';
import { IncomeCategory } from '../../types';

export const CategoriesView: React.FC = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    incomes,
    selectedMonth,
    user,
    openAddModal,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IncomeCategory | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10B981');
  const [error, setError] = useState('');

  // Calculate earnings per category
  const categoryStats = useMemo(() => {
    const monthIncomes = incomes.filter((i) => isSameMonth(i.date, selectedMonth.month, selectedMonth.year));
    const totalMonthIncome = monthIncomes.reduce((sum, item) => sum + item.amount, 0);

    return categories.map((cat) => {
      // Month metrics
      const catMonthIncomes = monthIncomes.filter((i) => i.categoryId === cat.id);
      const monthAmount = catMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
      const monthCount = catMonthIncomes.length;
      const monthPercent = totalMonthIncome > 0 ? Math.round((monthAmount / totalMonthIncome) * 100) : 0;

      // All-time metrics
      const allIncomes = incomes.filter((i) => i.categoryId === cat.id);
      const allTimeAmount = allIncomes.reduce((sum, i) => sum + i.amount, 0);
      const allTimeCount = allIncomes.length;

      return {
        ...cat,
        monthAmount,
        monthCount,
        monthPercent,
        allTimeAmount,
        allTimeCount,
      };
    }).sort((a, b) => b.monthAmount - a.monthAmount);
  }, [categories, incomes, selectedMonth]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setColor('#10B981');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: IncomeCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, { name: name.trim(), color });
    } else {
      addCategory({ name: name.trim(), color, icon: 'Tag' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"? Associated records will be safely moved to "Other".`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Income Categories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize earnings by revenue streams, services, and freelance types
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg shadow-sm shadow-emerald-600/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {cat.monthCount} {cat.monthCount === 1 ? 'txn' : 'txns'} this month
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {categories.length > 1 && (
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress & Contribution */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Monthly Share:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {cat.monthPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ backgroundColor: cat.color, width: `${cat.monthPercent}%` }}
                  />
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
                  {formatCurrency(cat.monthAmount, user?.currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  All Time
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatCurrency(cat.allTimeAmount, user?.currency)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Web Development, Graphic Design"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1', '#64748B'].map(
                      (presetColor) => (
                        <button
                          type="button"
                          key={presetColor}
                          onClick={() => setColor(presetColor)}
                          className="w-6 h-6 rounded-full border border-white dark:border-slate-900 shadow-sm transition-transform hover:scale-110"
                          style={{ backgroundColor: presetColor }}
                        />
                      )
                    )}
                  </div>
                </div>
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
                  <span>{editingCategory ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
