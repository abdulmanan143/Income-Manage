/**
 * Income Manager Types & Domain Definitions
 */

export type PaymentMethod =
  | 'Cash'
  | 'Bank Transfer'
  | 'JazzCash'
  | 'Easypaisa'
  | 'PayPal'
  | 'Stripe'
  | 'Other';

export interface IncomeCategory {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface IncomeSource {
  id: string;
  userId: string;
  name: string;
  type: string; // 'Client' | 'Platform' | 'Direct' | 'Business' | 'Other'
  isDefault?: boolean;
}

export interface IncomeRecord {
  id: string;
  userId: string;
  amount: number;
  date: string; // ISO format 'YYYY-MM-DD'
  sourceId: string;
  categoryId: string;
  paymentMethod: PaymentMethod;
  clientName?: string;
  description?: string;
  referenceNumber?: string;
  attachmentName?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyTarget {
  id: string;
  userId: string;
  month: number; // 1-12
  year: number; // e.g. 2026
  targetAmount: number;
}

export interface NotificationPreferences {
  dailyReminder: boolean;
  monthlyTargetReminder: boolean;
  endOfMonthSummary: boolean;
  targetAchievementAlert: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string; // e.g. 'PKR', 'USD', 'EUR', 'GBP', 'AED', 'INR'
  timezone: string;
  dateFormat: string; // 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY'
  language: string;
  avatar?: string;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'success' | 'warning' | 'reminder';
  read: boolean;
  actionView?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'history'
  | 'daily'
  | 'monthly'
  | 'calendar'
  | 'categories'
  | 'sources'
  | 'targets'
  | 'reports'
  | 'settings';

export interface DateFilterPreset {
  label: string;
  id: 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'custom';
}
