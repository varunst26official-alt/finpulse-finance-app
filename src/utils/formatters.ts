import { Currency, AssetCategory, ExpenseCategory, PaymentMethod, IncomeCategory } from '@/types/finance';

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
