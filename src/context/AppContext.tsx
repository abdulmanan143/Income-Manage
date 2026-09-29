import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  IncomeCategory,
  IncomeRecord,
  IncomeSource,
  MonthlyTarget,
  NotificationItem,
  UserProfile,
  ActiveTab,
} from '../types';
import {
  DEFAULT_USER,
  DEFAULT_CATEGORIES,
  DEFAULT_SOURCES,
  DEFAULT_TARGETS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_INCOME_RECORDS,
} from '../utils/seedData';
import { getTodayDateString, isSameDay, isSameMonth } from '../utils/formatters';

interface AppContextType {
  // User & Auth
  user: UserProfile | null;
  users: UserProfile[];
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  signup: (name: string, email: string, pass: string, currency?: string) => boolean;
  logout: () => void;
  resetPassword: (email: string) => boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  switchUser: (userId: string) => void;

  // Income records
  incomes: IncomeRecord[];
  addIncome: (record: Omit<IncomeRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => IncomeRecord;
  updateIncome: (id: string, record: Partial<Omit<IncomeRecord, 'id' | 'userId' | 'createdAt'>>) => void;
  deleteIncome: (id: string) => void;

  // Categories
  categories: IncomeCategory[];
  addCategory: (cat: Omit<IncomeCategory, 'id' | 'userId'>) => IncomeCategory;
  updateCategory: (id: string, updates: Partial<IncomeCategory>) => void;
  deleteCategory: (id: string) => void;

  // Sources
  sources: IncomeSource[];
  addSource: (src: Omit<IncomeSource, 'id' | 'userId'>) => IncomeSource;
  updateSource: (id: string, updates: Partial<IncomeSource>) => void;
  deleteSource: (id: string) => void;

  // Monthly Targets
  targets: MonthlyTarget[];
  setMonthlyTarget: (month: number, year: number, targetAmount: number) => void;
  getMonthlyTarget: (month: number, year: number) => number;

  // Theme & Navigation
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Selected Date / Month View
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMonth: { month: number; year: number };
  setSelectedMonth: (val: { month: number; year: number }) => void;

  // Modals & UI States
  isAddModalOpen: boolean;
  openAddModal: (preset?: Partial<IncomeRecord>) => void;
  closeAddModal: () => void;
  editingRecord: IncomeRecord | null;
  viewingRecord: IncomeRecord | null;
  setViewingRecord: (record: IncomeRecord | null) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Search & Global state
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Computed metrics for current context
  todayIncome: number;
  thisWeekIncome: number;
  thisMonthIncome: number;
  currentMonthTarget: number;
  targetProgressPercent: number;

  // Data helpers
  resetToDemoData: () => void;
  clearAllUserData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'income_manager_current_user',
  USERS_LIST: 'income_manager_users_list',
  INCOMES: 'income_manager_incomes',
  CATEGORIES: 'income_manager_categories',
  SOURCES: 'income_manager_sources',
  TARGETS: 'income_manager_targets',
  NOTIFICATIONS: 'income_manager_notifications',
  THEME: 'income_manager_theme',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved user or default
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      return saved ? JSON.parse(saved) : [DEFAULT_USER];
    } catch {
      return [DEFAULT_USER];
    }
  });

  const [incomes, setIncomes] = useState<IncomeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCOMES);
      return saved ? JSON.parse(saved) : DEFAULT_INCOME_RECORDS;
    } catch {
      return DEFAULT_INCOME_RECORDS;
    }
  });

  const [categories, setCategories] = useState<IncomeCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [sources, setSources] = useState<IncomeSource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOURCES);
      return saved ? JSON.parse(saved) : DEFAULT_SOURCES;
    } catch {
      return DEFAULT_SOURCES;
    }
  });

  const [targets, setTargets] = useState<MonthlyTarget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TARGETS);
      return saved ? JSON.parse(saved) : DEFAULT_TARGETS;
    } catch {
      return DEFAULT_TARGETS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light' | 'system') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number }>({
    month: 9,
    year: 2026,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<IncomeRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Synchronize localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
    } catch (e) {
      console.error(e);
    }
  }, [incomes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
    } catch (e) {
      console.error(e);
    }
  }, [sources]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
    } catch (e) {
      console.error(e);
    }
  }, [targets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  // Apply Dark/Light theme class to html element
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const setTheme = (newTheme: 'dark' | 'light' | 'system') => {
    setThemeState(newTheme);
  };

  // Auth operations
  const login = (email: string, _pass: string): boolean => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setUser(existing);
      return true;
    }
    // Auto-create demo Ahmed if matching or fallback
    if (email.toLowerCase().includes('ahmed') || email === 'demo@incomemanager.app') {
      setUser(DEFAULT_USER);
      return true;
    }
    // Generic fallback login
    const newUser: UserProfile = {
      id: 'user_' + Date.now(),
      name: email.split('@')[0],
      email,
      currency: 'PKR',
      timezone: 'Asia/Karachi (GMT+5)',
      dateFormat: 'DD/MM/YYYY',
      language: 'English',
      notificationPreferences: {
        dailyReminder: true,
        monthlyTargetReminder: true,
        endOfMonthSummary: true,
        targetAchievementAlert: true,
      },
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const signup = (name: string, email: string, _pass: string, currency: string = 'PKR'): boolean => {
    const newUser: UserProfile = {
      id: 'user_' + Date.now(),
      name,
      email,
      currency,
      timezone: 'Asia/Karachi (GMT+5)',
      dateFormat: 'DD/MM/YYYY',
      language: 'English',
      notificationPreferences: {
        dailyReminder: true,
        monthlyTargetReminder: true,
        endOfMonthSummary: true,
        targetAchievementAlert: true,
      },
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);

    // Bootstrap user categories
    const userCategories = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: newUser.id,
    }));
    setCategories((prev) => [...prev, ...userCategories]);

    // Bootstrap user sources
    const userSources = DEFAULT_SOURCES.map((src) => ({
      ...src,
      id: 'src_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: newUser.id,
    }));
    setSources((prev) => [...prev, ...userSources]);

    // Add default target for current month
    setMonthlyTarget(9, 2026, 200000);

    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const resetPassword = (email: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return !!found;
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setUser(target);
    }
  };

  // Income Operations
  const addIncome = (record: Omit<IncomeRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: IncomeRecord = {
      ...record,
      id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user?.id || 'guest',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setIncomes((prev) => [newRecord, ...prev]);

    // Target achievement notification check
    const currentMonth = 9;
    const currentYear = 2026;
    const target = getMonthlyTarget(currentMonth, currentYear);
    const existingMonthTotal = incomes
      .filter((i) => i.userId === (user?.id || 'guest') && isSameMonth(i.date, currentMonth, currentYear))
      .reduce((acc, curr) => acc + curr.amount, 0);

    const newMonthTotal = existingMonthTotal + newRecord.amount;
    if (target > 0 && existingMonthTotal < target && newMonthTotal >= target) {
      const celebrationNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        userId: user?.id || 'guest',
        title: 'Target Achieved! 🎯🎉',
        message: `Outstanding! You reached and exceeded your monthly target of ${user?.currency || 'PKR'} ${target.toLocaleString()}!`,
        date: new Date().toISOString(),
        type: 'success',
        read: false,
        actionView: 'targets',
      };
      setNotifications((prev) => [celebrationNotif, ...prev]);
    }

    return newRecord;
  };

  const updateIncome = (id: string, record: Partial<Omit<IncomeRecord, 'id' | 'userId' | 'createdAt'>>) => {
    setIncomes((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...record,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
    if (deleteConfirmId === id) setDeleteConfirmId(null);
  };

  // Category Operations
  const addCategory = (cat: Omit<IncomeCategory, 'id' | 'userId'>) => {
    const newCat: IncomeCategory = {
      ...cat,
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user?.id || 'guest',
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<IncomeCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    // Reassign affected incomes to "Other" category
    const fallbackCategory = categories.find((c) => c.name.toLowerCase() === 'other') || categories[0];
    if (fallbackCategory) {
      setIncomes((prev) =>
        prev.map((inc) => (inc.categoryId === id ? { ...inc, categoryId: fallbackCategory.id } : inc))
      );
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Source Operations
  const addSource = (src: Omit<IncomeSource, 'id' | 'userId'>) => {
    const newSrc: IncomeSource = {
      ...src,
      id: 'src_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user?.id || 'guest',
    };
    setSources((prev) => [...prev, newSrc]);
    return newSrc;
  };

  const updateSource = (id: string, updates: Partial<IncomeSource>) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSource = (id: string) => {
    const fallbackSource = sources.find((s) => s.name.toLowerCase().includes('other')) || sources[0];
    if (fallbackSource) {
      setIncomes((prev) =>
        prev.map((inc) => (inc.sourceId === id ? { ...inc, sourceId: fallbackSource.id } : inc))
      );
    }
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  // Target Operations
  const setMonthlyTarget = (month: number, year: number, targetAmount: number) => {
    setTargets((prev) => {
      const filtered = prev.filter(
        (t) => !(t.userId === (user?.id || 'guest') && t.month === month && t.year === year)
      );
      return [
        ...filtered,
        {
          id: `tgt_${year}_${String(month).padStart(2, '0')}`,
          userId: user?.id || 'guest',
          month,
          year,
          targetAmount,
        },
      ];
    });
  };

  const getMonthlyTarget = (month: number, year: number): number => {
    const found = targets.find(
      (t) => t.userId === (user?.id || 'guest') && t.month === month && t.year === year
    );
    return found ? found.targetAmount : 250000;
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Modal helpers
  const openAddModal = (preset?: Partial<IncomeRecord>) => {
    if (preset && preset.id) {
      setEditingRecord(preset as IncomeRecord);
    } else {
      setEditingRecord(null);
    }
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingRecord(null);
  };

  // Demo data reset
  const resetToDemoData = () => {
    setUser(DEFAULT_USER);
    setIncomes(DEFAULT_INCOME_RECORDS);
    setCategories(DEFAULT_CATEGORIES);
    setSources(DEFAULT_SOURCES);
    setTargets(DEFAULT_TARGETS);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setSelectedDate(getTodayDateString());
    setSelectedMonth({ month: 9, year: 2026 });
  };

  const clearAllUserData = () => {
    if (!user) return;
    setIncomes((prev) => prev.filter((i) => i.userId !== user.id));
    setNotifications((prev) => prev.filter((n) => n.userId !== user.id));
    setTargets((prev) => prev.filter((t) => t.userId !== user.id));
  };

  // User Incomes filter
  const userIncomes = useMemo(() => {
    const currentUserId = user?.id || 'guest';
    return incomes.filter((i) => i.userId === currentUserId || (currentUserId === 'user_ahmed' && !i.userId));
  }, [incomes, user]);

  // Computed metrics for current active month (September 2026) and today (2026-09-29)
  const todayStr = getTodayDateString();

  const todayIncome = useMemo(() => {
    return userIncomes
      .filter((i) => isSameDay(i.date, todayStr))
      .reduce((sum, item) => sum + item.amount, 0);
  }, [userIncomes, todayStr]);

  const thisWeekIncome = useMemo(() => {
    // Current week: Sep 27 - Sep 29, 2026
    const weekDates = ['2026-09-27', '2026-09-28', '2026-09-29'];
    return userIncomes
      .filter((i) => weekDates.includes(i.date))
      .reduce((sum, item) => sum + item.amount, 0);
  }, [userIncomes]);

  const thisMonthIncome = useMemo(() => {
    return userIncomes
      .filter((i) => isSameMonth(i.date, selectedMonth.month, selectedMonth.year))
      .reduce((sum, item) => sum + item.amount, 0);
  }, [userIncomes, selectedMonth]);

  const currentMonthTarget = useMemo(() => {
    return getMonthlyTarget(selectedMonth.month, selectedMonth.year);
  }, [targets, selectedMonth, user]);

  const targetProgressPercent = useMemo(() => {
    if (currentMonthTarget <= 0) return 0;
    return Math.round((thisMonthIncome / currentMonthTarget) * 100);
  }, [thisMonthIncome, currentMonthTarget]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
        switchUser,

        incomes: userIncomes,
        addIncome,
        updateIncome,
        deleteIncome,

        categories: categories.filter((c) => c.userId === (user?.id || 'guest') || c.userId === 'user_ahmed'),
        addCategory,
        updateCategory,
        deleteCategory,

        sources: sources.filter((s) => s.userId === (user?.id || 'guest') || s.userId === 'user_ahmed'),
        addSource,
        updateSource,
        deleteSource,

        targets,
        setMonthlyTarget,
        getMonthlyTarget,

        theme,
        setTheme,
        activeTab,
        setActiveTab,

        selectedDate,
        setSelectedDate,
        selectedMonth,
        setSelectedMonth,

        isAddModalOpen,
        openAddModal,
        closeAddModal,
        editingRecord,
        viewingRecord,
        setViewingRecord,
        deleteConfirmId,
        setDeleteConfirmId,
        isAuthModalOpen,
        setIsAuthModalOpen,

        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,

        globalSearch,
        setGlobalSearch,

        todayIncome,
        thisWeekIncome,
        thisMonthIncome,
        currentMonthTarget,
        targetProgressPercent,

        resetToDemoData,
        clearAllUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
