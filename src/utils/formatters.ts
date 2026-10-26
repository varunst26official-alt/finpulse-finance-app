import { Currency, AssetCategory } from '@/types/finance';

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
  EQUITY: '#6366f1', // Indigo
  MUTUAL_FUNDS: '#38bdf8', // Sky Blue
  FIXED_DEPOSIT: '#10b981', // Emerald Green
  GOLD_SGB: '#f59e0b', // Amber
  CRYPTO: '#a855f7', // Purple
  LIQUID_CASH: '#64748b', // Slate
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  EQUITY: 'Stocks & Equity',
  MUTUAL_FUNDS: 'Mutual Funds',
  FIXED_DEPOSIT: 'Fixed Deposits',
  GOLD_SGB: 'Gold & SGB',
  CRYPTO: 'Crypto Assets',
  LIQUID_CASH: 'Liquid Cash',
};
