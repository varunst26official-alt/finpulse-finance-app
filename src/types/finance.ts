/**
 * FinPulse - Financial Domain Models
 * Strong TypeScript typing for assets, transactions, allocations, and currencies.
 */

export type Currency = 'INR' | 'AED' | 'USD';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rateToUSD: number; // Conversion anchor
  locale: string;
}

export type AssetCategory =
  | 'EQUITY'        // Indian & US Stocks
  | 'MUTUAL_FUNDS'  // Index & Flexi-cap funds
  | 'FIXED_DEPOSIT' // Bank FDs / Bonds
  | 'GOLD_SGB'      // Sovereign Gold Bonds / Physical Gold
  | 'CRYPTO'        // Bitcoin / Ethereum
  | 'LIQUID_CASH';  // Savings account / Emergency reserve

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  quantity: number;
  averageBuyPrice: number; // in USD base
  currentMarketPrice: number; // in USD base
  currency: Currency;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  assetId: string;
  assetSymbol: string;
  assetName: string;
  category: AssetCategory;
  type: TransactionType;
  quantity: number;
  pricePerUnit: number; // in USD base
  totalAmount: number; // quantity * pricePerUnit
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
}

export interface PortfolioSummary {
  totalNetWorth: number; // in USD base
  totalInvested: number; // in USD base
  totalUnrealizedPnL: number; // in USD base
  pnlPercentage: number;
  todaysChange: number;
  todaysChangePercentage: number;
  allocationBreakdown: {
    category: AssetCategory;
    currentValue: number;
    percentage: number;
    color: string;
  }[];
}

export interface HistoricalDataPoint {
  date: string;
  netWorth: number;
  invested: number;
}
