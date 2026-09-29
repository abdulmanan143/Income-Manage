import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setActiveTab,
  } = useApp();

  if (!isOpen) return null;

  const handleAction = (notifId: string, actionView?: string) => {
    markNotificationAsRead(notifId);
    if (actionView) {
      setActiveTab(actionView as ActiveTab);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="w-full max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Notifications & Reminders
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs">No notifications right now.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const isUnread = !item.read;

              return (
                <div
                  key={item.id}
                  onClick={() => handleAction(item.id, item.actionView)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isUnread
                      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30'
                  }`}
                >
                  {isUnread && (
                    <span className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-emerald-500" />
                  )}

                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'success' && (
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                      )}
                      {item.type === 'reminder' && (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      {item.type === 'warning' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {item.type === 'info' && (
                        <Bell className="w-4 h-4 text-blue-500" />
                      )}
                    </div>

                    <div className="flex-1 pr-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatDate(item.date.slice(0, 10), 'DD MMM YYYY')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
            <span className="text-[11px] text-slate-400">Income Manager</span>
          </div>
        )}
      </div>
    </div>
  );
};
