import {
  Currency,
  AssetCategory,
  ExpenseCategory,
  PaymentMethod,
  IncomeCategory,
  CalendarEventType,
  DebtCategory,
  InsuranceType,
} from '@/types/finance';

export const CURRENCY_CONFIGS: Record<Currency, { symbol: string; rateFromUSD: number; locale: string }> = {
  USD: { symbol: '$', rateFromUSD: 1.0, locale: 'en-US' },
  INR: { symbol: '₹', rateFromUSD: 84.5, locale: 'en-IN' },
  AED: { symbol: 'د.إ', rateFromUSD: 3.67, locale: 'ar-AE' },
};

/**
 * Converts a base USD amount to the selected currency and formats it with appropriate symbols
 */
export function formatCurrency(amountUSD: number, currency: Currency): string {
  const config = CURRENCY_CONFIGS[currency];
  const convertedAmount = amountUSD * config.rateFromUSD;

  // Use Intl.NumberFormat for precision
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(convertedAmount);
}

/**
 * Formats percentage changes with + or - sign
 */
export function formatPercentage(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

/**
 * Color mapping for asset categories
 */
export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  EQUITY: '#3b82f6',         // Blue
  MUTUAL_FUNDS: '#0ea5e9',   // Sky Blue
  FIXED_DEPOSIT: '#10b981',  // Emerald Green
  GOLD_SGB: '#f59e0b',       // Amber Gold
  REAL_ESTATE: '#8b5cf6',    // Purple / Property
  RETIREMENT_PPF: '#06b6d4', // Cyan
  BONDS_DEBT: '#64748b',     // Slate
  STARTUP_EQUITY: '#ec4899', // Pink / Venture
  CRYPTO: '#f97316',         // Orange
  LIQUID_CASH: '#78716c',    // Stone
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  EQUITY: 'Stocks & Equity',
  MUTUAL_FUNDS: 'Mutual Funds',
  FIXED_DEPOSIT: 'Fixed Deposits',
  GOLD_SGB: 'Gold & SGB',
  REAL_ESTATE: 'Real Estate & Land',
  RETIREMENT_PPF: 'PPF & Retirement',
  BONDS_DEBT: 'Bonds & Debt',
  STARTUP_EQUITY: 'Startup & Private',
  CRYPTO: 'Crypto Assets',
  LIQUID_CASH: 'Liquid Cash',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  HOUSING_RENT: 'Rent & Housing',
  EMI_LOANS: 'EMI & Loan Repayment',
  FOOD_DINING: 'Food, Groceries & Dining',
  UTILITIES_BILLS: 'Utilities & Electricity',
  SHOPPING_LIFESTYLE: 'Shopping & Lifestyle',
  TRAVEL_COMMUTE: 'Travel & Fuel',
  HEALTHCARE_INSURANCE: 'Healthcare & Insurance',
  ENTERTAINMENT_SUBS: 'Subscriptions & Movies',
  EDUCATION: 'Education & Upskilling',
  OTHER_EXPENSE: 'General Expenses',
};

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  SALARY: 'Salary / Employment',
  BUSINESS: 'Business Profit',
  FREELANCE: 'Freelance & Consulting',
  RENTAL: 'Real Estate Rental',
  DIVIDEND_INTEREST: 'Dividends & Interest',
  CAPITAL_GAINS: 'Realized Capital Gains',
  OTHER_INCOME: 'Other Income',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  UPI: 'UPI (GPay / PhonePe)',
  CREDIT_CARD: 'Credit Card',
  NET_BANKING: 'Net Banking',
  DEBIT_CARD: 'Debit Card',
  CASH: 'Cash',
};

export const CALENDAR_EVENT_LABELS: Record<CalendarEventType, string> = {
  PLANNED_EXPENSE: 'Planned Expense & Bills',
  PLANNED_INVESTMENT: 'Planned Investment / SIP',
  LIFE_EVENT: 'Life Event & Celebration',
  MEDICAL_CHECKUP: 'Health & Medical Checkup',
  EXPECTED_INCOME: 'Expected Income Inflow',
};

export const CALENDAR_EVENT_COLORS: Record<CalendarEventType, { badge: string; dot: string; text: string }> = {
  PLANNED_EXPENSE: { badge: 'bg-rose-50 text-rose-800 border-rose-200', dot: '#e11d48', text: 'text-rose-700' },
  PLANNED_INVESTMENT: { badge: 'bg-sky-50 text-sky-800 border-sky-200', dot: '#0284c7', text: 'text-sky-700' },
  LIFE_EVENT: { badge: 'bg-purple-50 text-purple-800 border-purple-200', dot: '#9333ea', text: 'text-purple-700' },
  MEDICAL_CHECKUP: { badge: 'bg-amber-50 text-amber-800 border-amber-200', dot: '#d97706', text: 'text-amber-700' },
  EXPECTED_INCOME: { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: '#16a34a', text: 'text-emerald-700' },
};

export const DEBT_CATEGORY_LABELS: Record<DebtCategory, string> = {
  HOME_LOAN: 'Home Loan / Mortgage',
  AUTO_LOAN: 'Car & Auto Loan',
  PERSONAL_LOAN: 'Personal Loan',
  EDUCATION_LOAN: 'Education Loan',
  CREDIT_CARD: 'Credit Card Outstanding',
  BUSINESS_LOAN: 'Business & Commercial',
  PEER_OR_FAMILY: 'Family & Peer Borrowing',
};

export const DEBT_CATEGORY_COLORS: Record<DebtCategory, { badge: string; border: string; text: string; hex: string }> = {
  HOME_LOAN: { badge: 'bg-indigo-50 text-indigo-800', border: 'border-indigo-200', text: 'text-indigo-700', hex: '#6366f1' },
  AUTO_LOAN: { badge: 'bg-sky-50 text-sky-800', border: 'border-sky-200', text: 'text-sky-700', hex: '#0284c7' },
  PERSONAL_LOAN: { badge: 'bg-amber-50 text-amber-800', border: 'border-amber-200', text: 'text-amber-700', hex: '#d97706' },
  EDUCATION_LOAN: { badge: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-200', text: 'text-emerald-700', hex: '#16a34a' },
  CREDIT_CARD: { badge: 'bg-rose-50 text-rose-800', border: 'border-rose-200', text: 'text-rose-700', hex: '#e11d48' },
  BUSINESS_LOAN: { badge: 'bg-purple-50 text-purple-800', border: 'border-purple-200', text: 'text-purple-700', hex: '#9333ea' },
  PEER_OR_FAMILY: { badge: 'bg-stone-50 text-stone-800', border: 'border-stone-200', text: 'text-stone-700', hex: '#78716c' },
};

export const INSURANCE_TYPE_LABELS: Record<InsuranceType, string> = {
  TERM_LIFE: 'Term Life Insurance',
  HEALTH_FLOATER: 'Family Health Floater',
  CRITICAL_ILLNESS: 'Critical Illness Rider',
  MOTOR_VEHICLE: 'Comprehensive Motor Auto',
  HOME_PROPERTY: 'Home & Property Protection',
};

export const INSURANCE_TYPE_COLORS: Record<InsuranceType, { badge: string; border: string; text: string; hex: string }> = {
  TERM_LIFE: { badge: 'bg-indigo-50 text-indigo-800', border: 'border-indigo-200', text: 'text-indigo-700', hex: '#6366f1' },
  HEALTH_FLOATER: { badge: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-200', text: 'text-emerald-700', hex: '#16a34a' },
  CRITICAL_ILLNESS: { badge: 'bg-rose-50 text-rose-800', border: 'border-rose-200', text: 'text-rose-700', hex: '#e11d48' },
  MOTOR_VEHICLE: { badge: 'bg-sky-50 text-sky-800', border: 'border-sky-200', text: 'text-sky-700', hex: '#0284c7' },
  HOME_PROPERTY: { badge: 'bg-amber-50 text-amber-800', border: 'border-amber-200', text: 'text-amber-700', hex: '#d97706' },
};
