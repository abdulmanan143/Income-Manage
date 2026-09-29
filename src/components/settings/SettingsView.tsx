import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENCIES } from '../../utils/formatters';
import {
  User,
  Moon,
  Sun,
  Laptop,
  Bell,
  Globe,
  RotateCcw,
  Trash2,
  Check,
  Shield,
  CreditCard,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateProfile,
    theme,
    setTheme,
    resetToDemoData,
    clearAllUserData,
  } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'PKR');
  const [dateFormat, setDateFormat] = useState(user?.dateFormat || 'DD/MM/YYYY');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Karachi (GMT+5)');
  const [language, setLanguage] = useState(user?.language || 'English');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Notifications
  const [dailyReminder, setDailyReminder] = useState(
    user?.notificationPreferences.dailyReminder ?? true
  );
  const [monthlyTargetReminder, setMonthlyTargetReminder] = useState(
    user?.notificationPreferences.monthlyTargetReminder ?? true
  );
  const [endOfMonthSummary, setEndOfMonthSummary] = useState(
    user?.notificationPreferences.endOfMonthSummary ?? true
  );
  const [targetAchievementAlert, setTargetAchievementAlert] = useState(
    user?.notificationPreferences.targetAchievementAlert ?? true
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      currency,
      dateFormat,
      timezone,
      language,
      avatar: avatar.trim() || undefined,
      notificationPreferences: {
        dailyReminder,
        monthlyTargetReminder,
        endOfMonthSummary,
        targetAchievementAlert,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all income data, categories, and targets back to initial demo state?')) {
      resetToDemoData();
      alert('Demo data restored successfully.');
    }
  };

  const handleClearData = () => {
    if (window.confirm('WARNING: This will wipe all recorded transactions for your user profile. Are you sure?')) {
      clearAllUserData();
      alert('Your records have been cleared.');
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize currency, profile details, theme appearance, and automated alerts
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              User Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Avatar Image URL
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Currency & Financial Preferences */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Financial & Localization
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                {Object.entries(CURRENCIES).map(([code, config]) => (
                  <option key={code} value={code}>
                    {code} ({config.symbol}) — {config.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (29/09/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-29)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (09/29/2026)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Asia/Karachi (GMT+5)">Asia/Karachi (GMT+5)</option>
                <option value="Asia/Dubai (GMT+4)">Asia/Dubai (GMT+4)</option>
                <option value="Asia/Kolkata (GMT+5:30)">Asia/Kolkata (GMT+5:30)</option>
                <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                <option value="America/New_York (GMT-4)">America/New_York (EST)</option>
                <option value="Europe/London (GMT+1)">Europe/London (BST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dark & Light Mode Theme Options */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Appearance & Theme
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-emerald-500 bg-slate-950 text-white shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-5 h-5 text-emerald-400" />
              <span>Dark Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                theme === 'system'
                  ? 'border-emerald-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Laptop className="w-5 h-5 text-blue-500" />
              <span>System Default</span>
            </button>
          </div>
        </div>

        {/* Notifications & Reminders */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Notifications & Reminders
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Daily Income Entry Reminder
                </span>
                <span className="text-[11px] text-slate-500">
                  Receive a prompt if no income has been logged before the end of the day
                </span>
              </div>
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => setDailyReminder(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Monthly Target Progress Reminder
                </span>
                <span className="text-[11px] text-slate-500">
                  Mid-month alert with remaining balance and projected run rate
                </span>
              </div>
              <input
                type="checkbox"
                checked={monthlyTargetReminder}
                onChange={(e) => setMonthlyTargetReminder(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Target Achievement Celebration
                </span>
                <span className="text-[11px] text-slate-500">
                  Trigger celebratory feedback when monthly target milestone is met
                </span>
              </div>
              <input
                type="checkbox"
                checked={targetAchievementAlert}
                onChange={(e) => setTargetAchievementAlert(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  End-of-Month Summary Ready
                </span>
                <span className="text-[11px] text-slate-500">
                  Notify when the automated month-end financial summary report is generated
                </span>
              </div>
              <input
                type="checkbox"
                checked={endOfMonthSummary}
                onChange={(e) => setEndOfMonthSummary(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences saved!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Data Management Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Data Management & Sandbox Reset
        </h3>
        <p className="text-xs text-slate-500">
          Restore initial PRD figures (September 2026 with Rs. 185,500 income and Ahmed Khan account) or purge records.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-emerald-500" />
            <span>Restore Demo Dataset</span>
          </button>

          <button
            type="button"
            onClick={handleClearData}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe My Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
