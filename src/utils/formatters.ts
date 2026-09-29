/**
 * Currency & Date formatting utilities
 */

export const CURRENCIES: Record<string, { symbol: string; name: string; position: 'prefix' | 'suffix' }> = {
  PKR: { symbol: 'Rs. ', name: 'Pakistani Rupee', position: 'prefix' },
  USD: { symbol: '$', name: 'US Dollar', position: 'prefix' },
  EUR: { symbol: '€', name: 'Euro', position: 'prefix' },
  GBP: { symbol: '£', name: 'British Pound', position: 'prefix' },
  AED: { symbol: 'AED ', name: 'UAE Dirham', position: 'prefix' },
  INR: { symbol: '₹', name: 'Indian Rupee', position: 'prefix' },
  SAR: { symbol: 'SAR ', name: 'Saudi Riyal', position: 'prefix' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', position: 'prefix' },
};

export function formatCurrency(amount: number, currencyCode: string = 'PKR'): string {
  const config = CURRENCIES[currencyCode] || { symbol: currencyCode + ' ', position: 'prefix' };
  const formattedNumber = Math.round(amount).toLocaleString('en-US');
  return config.position === 'prefix'
    ? `${config.symbol}${formattedNumber}`
    : `${formattedNumber} ${config.symbol}`;
}

export function formatNumber(amount: number): string {
  return amount.toLocaleString('en-US');
}

export function getTodayDateString(): string {
  // Current local date from environment is 2026-09-29
  return '2026-09-29';
}

export function formatDate(dateStr: string, format: string = 'DD/MM/YYYY'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const mIndex = parseInt(month, 10) - 1;
  const mName = monthNames[mIndex] || month;

  if (format === 'DD MMM YYYY') {
    return `${day} ${mName} ${year}`;
  }
  if (format === 'MMM DD, YYYY') {
    return `${mName} ${day}, ${year}`;
  }
  if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  }
  if (format === 'YYYY-MM-DD') {
    return dateStr;
  }
  return `${day}/${month}/${year}`;
}

export function getMonthName(monthNumber: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[monthNumber - 1] || `Month ${monthNumber}`;
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

export function isSameMonth(dateStr: string, month: number, year: number): boolean {
  if (!dateStr) return false;
  const [y, m] = dateStr.split('-').map(Number);
  return y === year && m === month;
}

export function getGreeting(name: string): string {
  const hours = 14; // Default afternoon or dynamic
  let timeOfDay = 'Afternoon';
  if (hours < 12) timeOfDay = 'Morning';
  else if (hours >= 18) timeOfDay = 'Evening';
  return `Good ${timeOfDay}, ${name} 👋`;
}
