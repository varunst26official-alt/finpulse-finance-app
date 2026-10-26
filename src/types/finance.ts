/**
 * FinPulse - Financial Domain Models
 * Strong TypeScript typing for assets, transactions, allocations, currencies,
 * AI copilot, market intelligence, stock predictions, and tax analytics.
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

// ============================================================================
// AI Copilot, Predictions & Intelligence Types
// ============================================================================

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
  metricsContext?: {
    label: string;
    value: string;
    type?: 'neutral' | 'positive' | 'warning';
  }[];
}

export interface PredictionPoint {
  day: string;
  actualPrice?: number;
  predictedPrice: number;
  upperBand: number;
  lowerBand: number;
}

export interface StockPrediction {
  assetId: string;
  symbol: string;
  name: string;
  currentPrice: number; // USD base
  target30d: number;    // USD base
  target90d: number;    // USD base
  changePercentage30d: number;
  confidenceScore: number; // 0 - 100%
  sentiment: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'REDUCE';
  technicals: {
    rsi: number;
    movingAvg200d: number;
    volatility: 'LOW' | 'MODERATE' | 'HIGH';
    supportLevel: number;
    resistanceLevel: number;
  };
  forecastPath: PredictionPoint[];
  thesis: string;
}

export interface MarketNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: 'MACRO' | 'EQUITIES' | 'COMMODITIES' | 'CRYPTO';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactedAssets: string[]; // e.g. ['RELIANCE', 'NIFTY50']
  readTime: string;
}

export interface TaxHoldingAnalysis {
  assetSymbol: string;
  category: AssetCategory;
  holdingPeriodDays: number;
  gainType: 'LTCG' | 'STCG';
  unrealizedGain: number; // USD base
  estimatedTaxLiability: number; // USD base
  isTaxHarvestable: boolean;
}

export interface TaxReport {
  stcgTotalGains: number; // USD base
  stcgEstimatedTax: number; // USD base (typically 20% in India)
  ltcgTotalGains: number; // USD base
  ltcgExemptionLimit: number; // e.g. ₹1.25L (~$1,480 USD)
  ltcgTaxableGains: number; // USD base
  ltcgEstimatedTax: number; // USD base (typically 12.5% in India)
  holdings: TaxHoldingAnalysis[];
  harvestingRecommendation: string;
}
