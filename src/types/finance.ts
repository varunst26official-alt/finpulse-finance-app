/**
 * FinPulse - Financial Domain Models
 * Strong TypeScript typing for assets, transactions, allocations, currencies,
 * AI copilot, market intelligence, stock predictions, tax analytics,
 * expense tracking, income cash flows, and listed stock directories.
 */

export type Currency = 'INR' | 'AED' | 'USD';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rateToUSD: number; // Conversion anchor ($1 USD = ~84.5 INR)
  locale: string;
}

export type AssetCategory =
  | 'EQUITY'          // Indian & US Listed Stocks
  | 'MUTUAL_FUNDS'    // Index, Flexi-cap & ELSS funds
  | 'FIXED_DEPOSIT'   // Bank FDs / Term Deposits
  | 'GOLD_SGB'        // Sovereign Gold Bonds / Physical Gold / Silver
  | 'REAL_ESTATE'     // Land, Residential flats, Commercial properties
  | 'RETIREMENT_PPF'  // PPF, EPF, National Pension System (NPS)
  | 'BONDS_DEBT'      // Corporate & Government Bonds
  | 'STARTUP_EQUITY'  // Angel investments & Private equity
  | 'CRYPTO'          // Bitcoin, Ethereum & Digital assets
  | 'LIQUID_CASH';    // Bank savings & Emergency reserves

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST' | 'SIP';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  quantity: number;
  averageBuyPrice: number; // in USD base
  currentMarketPrice: number; // in USD base
  currency: Currency;
  institution?: string; // e.g. "Zerodha", "HDFC Bank", "Builder Registry"
  expectedReturnRate?: number; // e.g. 7.5% for FD / Rental yield
  maturityDate?: string;
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
  platform?: string; // e.g. Zerodha, Groww, Upstox, Direct
  notes?: string;
}

// ============================================================================
// Expense & Cash Flow Tracking Types
// ============================================================================

export type ExpenseCategory =
  | 'HOUSING_RENT'
  | 'EMI_LOANS'
  | 'FOOD_DINING'
  | 'UTILITIES_BILLS'
  | 'SHOPPING_LIFESTYLE'
  | 'TRAVEL_COMMUTE'
  | 'HEALTHCARE_INSURANCE'
  | 'ENTERTAINMENT_SUBS'
  | 'EDUCATION'
  | 'OTHER_EXPENSE';

export type PaymentMethod =
  | 'UPI'
  | 'CREDIT_CARD'
  | 'NET_BANKING'
  | 'DEBIT_CARD'
  | 'CASH';

export interface ExpenseItem {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number; // in USD base
  paymentMethod: PaymentMethod;
  frequency: 'ONE_TIME' | 'MONTHLY_RECURRING';
  date: string; // YYYY-MM-DD
  notes?: string;
}

// ============================================================================
// Income & Inflow Tracking Types
// ============================================================================

export type IncomeCategory =
  | 'SALARY'
  | 'BUSINESS'
  | 'FREELANCE'
  | 'RENTAL'
  | 'DIVIDEND_INTEREST'
  | 'CAPITAL_GAINS'
  | 'OTHER_INCOME';

export interface IncomeItem {
  id: string;
  source: string;
  category: IncomeCategory;
  amount: number; // in USD base
  frequency: 'MONTHLY' | 'ONE_TIME' | 'ANNUAL';
  date: string; // YYYY-MM-DD
  account?: string; // e.g. "HDFC Salary A/c", "ICICI Savings"
  notes?: string;
}

// ============================================================================
// Listed Stock Directory Model (Free searchable stock catalog)
// ============================================================================

export interface ListedStockItem {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'CRYPTO';
  sector: string;
  currentPriceUSD: number;
  currentPriceINR: number;
  category: AssetCategory;
}

// ============================================================================
// Portfolio Summary & Analytics
// ============================================================================

export interface PortfolioSummary {
  totalNetWorth: number; // in USD base
  totalInvested: number; // in USD base
  totalUnrealizedPnL: number; // in USD base
  pnlPercentage: number;
  todaysChange: number;
  todaysChangePercentage: number;
  totalMonthlyIncome: number; // in USD base
  totalMonthlyExpenses: number; // in USD base
  monthlySavingsRate: number; // percentage
  liquidRunwayMonths: number; // emergency runway
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
