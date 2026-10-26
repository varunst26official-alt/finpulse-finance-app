import {
  Asset,
  Transaction,
  HistoricalDataPoint,
  AiChatMessage,
  StockPrediction,
  MarketNewsItem,
  TaxReport,
} from '@/types/finance';

// All baseline prices stored in USD for universal calculation ($1 USD = ~₹84.5 INR)
export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'ast_1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    category: 'EQUITY',
    quantity: 45,
    averageBuyPrice: 28.5, // ~$28.5 = ~₹2,400
    currentMarketPrice: 34.8, // ~$34.8 = ~₹2,940
    currency: 'USD',
    lastUpdated: '2026-10-26T10:00:00Z',
  },
  {
    id: 'ast_2',
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    category: 'EQUITY',
    quantity: 30,
    averageBuyPrice: 42.0,
    currentMarketPrice: 48.2,
    currency: 'USD',
    lastUpdated: '2026-10-26T10:00:00Z',
  },
  {
    id: 'ast_3',
    symbol: 'PPFAS',
    name: 'Parag Parikh Flexi Cap Fund',
    category: 'MUTUAL_FUNDS',
    quantity: 120,
    averageBuyPrice: 22.0,
    currentMarketPrice: 29.4,
    currency: 'USD',
    lastUpdated: '2026-10-26T10:00:00Z',
  },
  {
    id: 'ast_4',
    symbol: 'NIFTY50',
    name: 'UTI Nifty 50 Index Fund',
    category: 'MUTUAL_FUNDS',
    quantity: 200,
    averageBuyPrice: 15.0,
    currentMarketPrice: 19.8,
    currency: 'USD',
    lastUpdated: '2026-10-26T10:00:00Z',
  },
  {
    id: 'ast_5',
    symbol: 'HDFC_FD',
    name: 'HDFC 3-Yr Fixed Deposit (7.6%)',
    category: 'FIXED_DEPOSIT',
    quantity: 1,
    averageBuyPrice: 3500.0,
    currentMarketPrice: 3780.0,
    currency: 'USD',
    lastUpdated: '2026-10-26T10:00:00Z',
  },
  {
    id: 'ast_6',
    symbol: 'SGB_2024',
    name: 'Sovereign Gold Bond Series IV',
    category: 'GOLD_SGB',
    quantity: 15,
    averageBuyPrice: 72.0,
    currentMarketPrice: 88.5,
    currency: 'USD',
    lastUpdated: '2026-10-26T10:00:00Z',
  },
  {
    id: 'ast_7',
    symbol: 'BTC',
    name: 'Bitcoin (Cold Storage)',
    category: 'CRYPTO',
    quantity: 0.045,
    averageBuyPrice: 52000.0,
    currentMarketPrice: 68400.0,
    currency: 'USD',
    lastUpdated: '2026-10-26T10:00:00Z',
  },
  {
    id: 'ast_8',
    symbol: 'CASH',
    name: 'Emergency Savings Reserve',
    category: 'LIQUID_CASH',
    quantity: 1,
    averageBuyPrice: 2000.0,
    currentMarketPrice: 2000.0,
    currency: 'USD',
    lastUpdated: '2026-10-26T10:00:00Z',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    assetId: 'ast_1',
    assetSymbol: 'RELIANCE',
    assetName: 'Reliance Industries Ltd',
    category: 'EQUITY',
    type: 'BUY',
    quantity: 20,
    pricePerUnit: 28.5,
    totalAmount: 570.0,
    date: '2026-10-15',
    notes: 'Dip buying after Q2 earnings announcement',
  },
  {
    id: 'tx_2',
    assetId: 'ast_3',
    assetSymbol: 'PPFAS',
    assetName: 'Parag Parikh Flexi Cap Fund',
    category: 'MUTUAL_FUNDS',
    type: 'BUY',
    quantity: 30,
    pricePerUnit: 22.0,
    totalAmount: 660.0,
    date: '2026-10-05',
    notes: 'Monthly SIP installment',
  },
  {
    id: 'tx_3',
    assetId: 'ast_6',
    assetSymbol: 'SGB_2024',
    assetName: 'Sovereign Gold Bond Series IV',
    category: 'GOLD_SGB',
    type: 'BUY',
    quantity: 5,
    pricePerUnit: 72.0,
    totalAmount: 360.0,
    date: '2026-09-20',
    notes: 'Hedge against currency inflation',
  },
  {
    id: 'tx_4',
    assetId: 'ast_2',
    assetSymbol: 'TCS',
    assetName: 'Tata Consultancy Services',
    category: 'EQUITY',
    type: 'DIVIDEND',
    quantity: 30,
    pricePerUnit: 1.5,
    totalAmount: 45.0,
    date: '2026-09-01',
    notes: 'Interim dividend credited',
  },
];

export const INITIAL_HISTORY: HistoricalDataPoint[] = [
  { date: 'Nov 25', netWorth: 14200, invested: 13100 },
  { date: 'Dec 25', netWorth: 15400, invested: 13800 },
  { date: 'Jan 26', netWorth: 16100, invested: 14400 },
  { date: 'Feb 26', netWorth: 15800, invested: 14700 },
  { date: 'Mar 26', netWorth: 17200, invested: 15200 },
  { date: 'Apr 26', netWorth: 18100, invested: 15900 },
  { date: 'May 26', netWorth: 17900, invested: 16400 },
  { date: 'Jun 26', netWorth: 19400, invested: 17100 },
  { date: 'Jul 26', netWorth: 20200, invested: 17800 },
  { date: 'Aug 26', netWorth: 21100, invested: 18400 },
  { date: 'Sep 26', netWorth: 22300, invested: 19000 },
  { date: 'Oct 26', netWorth: 23640, invested: 19700 },
];

// ============================================================================
// AI Chatbot Initial Seed Messages
// ============================================================================

export const INITIAL_AI_MESSAGES: AiChatMessage[] = [
  {
    id: 'msg_welcome',
    role: 'assistant',
    content:
      "Hello Varun! I'm your **FinPulse AI Wealth Copilot**. I have synced with your real-time portfolio:\n\n- **Net Worth:** ~$23,640 (₹19.98 Lakhs)\n- **Overall Return:** +20.0% Unrealized Profit\n- **Diversification Health:** 8 instruments across 6 asset classes.\n\nHow can I help optimize your wealth today? You can ask me to analyze asset risk, simulate tax savings, or forecast market trends.",
    timestamp: 'Just now',
    suggestedPrompts: [
      'Audit my asset allocation risk',
      'How much LTCG tax do I owe under Indian rules?',
      'Should I increase my SIP in Mutual Funds?',
      'Forecast Reliance & Bitcoin price trends',
    ],
    metricsContext: [
      { label: 'Portfolio Health', value: '94/100 (Strong)', type: 'positive' },
      { label: 'Liquid Runway', value: '4.8 Months', type: 'neutral' },
      { label: 'Equity Exposure', value: '47.2% (Balanced)', type: 'positive' },
    ],
  },
];

// ============================================================================
// AI Stock Predictions & Statistical Projections
// ============================================================================

export const STOCK_PREDICTIONS: StockPrediction[] = [
  {
    assetId: 'ast_1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    currentPrice: 34.8,
    target30d: 38.2,
    target90d: 42.5,
    changePercentage30d: 9.77,
    confidenceScore: 88,
    sentiment: 'STRONG_BUY',
    technicals: {
      rsi: 54.2,
      movingAvg200d: 31.5,
      volatility: 'MODERATE',
      supportLevel: 32.8,
      resistanceLevel: 39.0,
    },
    forecastPath: [
      { day: 'Day 0', actualPrice: 34.8, predictedPrice: 34.8, upperBand: 34.8, lowerBand: 34.8 },
      { day: 'Day 5', predictedPrice: 35.4, upperBand: 36.2, lowerBand: 34.6 },
      { day: 'Day 10', predictedPrice: 36.1, upperBand: 37.3, lowerBand: 34.9 },
      { day: 'Day 15', predictedPrice: 36.8, upperBand: 38.4, lowerBand: 35.2 },
      { day: 'Day 20', predictedPrice: 37.2, upperBand: 39.1, lowerBand: 35.5 },
      { day: 'Day 25', predictedPrice: 37.8, upperBand: 40.0, lowerBand: 35.9 },
      { day: 'Day 30', predictedPrice: 38.2, upperBand: 40.8, lowerBand: 36.2 },
    ],
    thesis:
      'Bullish consolidation above 200-DMA supported by 5G monetisation and retail margin expansion. Telecom ARPU increase expected in Q3.',
  },
  {
    assetId: 'ast_2',
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    currentPrice: 48.2,
    target30d: 51.0,
    target90d: 54.5,
    changePercentage30d: 5.8,
    confidenceScore: 82,
    sentiment: 'BUY',
    technicals: {
      rsi: 48.6,
      movingAvg200d: 45.1,
      volatility: 'LOW',
      supportLevel: 46.5,
      resistanceLevel: 52.0,
    },
    forecastPath: [
      { day: 'Day 0', actualPrice: 48.2, predictedPrice: 48.2, upperBand: 48.2, lowerBand: 48.2 },
      { day: 'Day 5', predictedPrice: 48.8, upperBand: 49.5, lowerBand: 48.1 },
      { day: 'Day 10', predictedPrice: 49.3, upperBand: 50.4, lowerBand: 48.3 },
      { day: 'Day 15', predictedPrice: 49.9, upperBand: 51.2, lowerBand: 48.7 },
      { day: 'Day 20', predictedPrice: 50.4, upperBand: 52.0, lowerBand: 49.0 },
      { day: 'Day 25', predictedPrice: 50.8, upperBand: 52.6, lowerBand: 49.3 },
      { day: 'Day 30', predictedPrice: 51.0, upperBand: 53.2, lowerBand: 49.5 },
    ],
    thesis:
      'BFSI spending revival in North America and steady UK government cloud transformation pipeline give strong dividend and revenue visibility.',
  },
  {
    assetId: 'ast_7',
    symbol: 'BTC',
    name: 'Bitcoin (Cold Storage)',
    currentPrice: 68400,
    target30d: 76500,
    target90d: 88000,
    changePercentage30d: 11.84,
    confidenceScore: 74,
    sentiment: 'BUY',
    technicals: {
      rsi: 62.8,
      movingAvg200d: 59200,
      volatility: 'HIGH',
      supportLevel: 64500,
      resistanceLevel: 74000,
    },
    forecastPath: [
      { day: 'Day 0', actualPrice: 68400, predictedPrice: 68400, upperBand: 68400, lowerBand: 68400 },
      { day: 'Day 5', predictedPrice: 69800, upperBand: 72500, lowerBand: 67100 },
      { day: 'Day 10', predictedPrice: 71200, upperBand: 74800, lowerBand: 67800 },
      { day: 'Day 15', predictedPrice: 72900, upperBand: 77200, lowerBand: 68600 },
      { day: 'Day 20', predictedPrice: 74100, upperBand: 79500, lowerBand: 69200 },
      { day: 'Day 25', predictedPrice: 75300, upperBand: 81800, lowerBand: 69900 },
      { day: 'Day 30', predictedPrice: 76500, upperBand: 84000, lowerBand: 70500 },
    ],
    thesis:
      'Institutional ETF inflows accelerating and post-halving supply shock continuing into Q4. High volatility but strong structural support at $64.5k.',
  },
  {
    assetId: 'ast_6',
    symbol: 'SGB_2024',
    name: 'Sovereign Gold Bond Series IV',
    currentPrice: 88.5,
    target30d: 92.0,
    target90d: 96.0,
    changePercentage30d: 3.95,
    confidenceScore: 91,
    sentiment: 'STRONG_BUY',
    technicals: {
      rsi: 58.4,
      movingAvg200d: 81.2,
      volatility: 'LOW',
      supportLevel: 85.0,
      resistanceLevel: 94.0,
    },
    forecastPath: [
      { day: 'Day 0', actualPrice: 88.5, predictedPrice: 88.5, upperBand: 88.5, lowerBand: 88.5 },
      { day: 'Day 5', predictedPrice: 89.1, upperBand: 89.8, lowerBand: 88.4 },
      { day: 'Day 10', predictedPrice: 89.8, upperBand: 90.7, lowerBand: 88.9 },
      { day: 'Day 15', predictedPrice: 90.5, upperBand: 91.6, lowerBand: 89.4 },
      { day: 'Day 20', predictedPrice: 91.1, upperBand: 92.4, lowerBand: 89.8 },
      { day: 'Day 25', predictedPrice: 91.6, upperBand: 93.1, lowerBand: 90.2 },
      { day: 'Day 30', predictedPrice: 92.0, upperBand: 93.8, lowerBand: 90.5 },
    ],
    thesis:
      'Global central bank reserve accumulation and interest rate easing cycles make Sovereign Gold an impenetrable geopolitical hedge.',
  },
];

// ============================================================================
// Real-Time Curated Market Intelligence & News Feed
// ============================================================================

export const MARKET_NEWS_ITEMS: MarketNewsItem[] = [
  {
    id: 'news_1',
    headline: 'RBI Holds Repo Rate at 6.50%; Signals Focus on Disinflation While Growth Stays Resilient',
    summary:
      'Reserve Bank of India Monetary Policy Committee keeps benchmark policy rates steady. Liquidity conditions remain comfortable, providing strong tailwinds for Indian banking and domestic consumer equities.',
    source: 'Financial Express',
    publishedAt: '2 hours ago',
    category: 'MACRO',
    sentiment: 'BULLISH',
    impactedAssets: ['NIFTY50', 'HDFC_FD', 'PPFAS'],
    readTime: '3 min read',
  },
  {
    id: 'news_2',
    headline: 'Global Gold Surges to Fresh Record as Central Banks Continue Aggressive Bullion Accumulation',
    summary:
      'Spot gold holds firmly above $2,730/oz as sovereign reserves diversify away from USD dominance. Sovereign Gold Bond series trade at premium on NSE secondary market.',
    source: 'Bloomberg Markets',
    publishedAt: '4 hours ago',
    category: 'COMMODITIES',
    sentiment: 'BULLISH',
    impactedAssets: ['SGB_2024'],
    readTime: '2 min read',
  },
  {
    id: 'news_3',
    headline: 'Reliance Retail Expands Quick Commerce Footprint to 100 Cities; Eyes Double-Digit Margin Lift',
    summary:
      'JioMart & Smart Bazaar rollout dark stores across Tier-1 and Tier-2 hubs to counter standalone delivery apps. Analysts raise 12-month forward EPS estimates by 8.4%.',
    source: 'Economic Times',
    publishedAt: '6 hours ago',
    category: 'EQUITIES',
    sentiment: 'BULLISH',
    impactedAssets: ['RELIANCE'],
    readTime: '4 min read',
  },
  {
    id: 'news_4',
    headline: 'US SEC Approves New Crypto Derivatives Standards; Institutional Trading Volume Climbs 32%',
    summary:
      'Clearer regulatory framework opens doors for sovereign wealth funds and pension providers to allocate up to 1-2% into digital asset treasuries.',
    source: 'CoinDesk Pro',
    publishedAt: '12 hours ago',
    category: 'CRYPTO',
    sentiment: 'BULLISH',
    impactedAssets: ['BTC'],
    readTime: '3 min read',
  },
  {
    id: 'news_5',
    headline: 'Indian IT Services Sector Sees Cautious Client Budgets in Banking Tech Modernization',
    summary:
      'Gartner report notes European enterprise tech spend is delaying large multi-year migration deals, favoring agile, generative-AI native consultancies.',
    source: 'Reuters Tech',
    publishedAt: '1 day ago',
    category: 'EQUITIES',
    sentiment: 'NEUTRAL',
    impactedAssets: ['TCS'],
    readTime: '4 min read',
  },
];

// ============================================================================
// Tax & Capital Gains Analytics (India FY 2026-27 & Global Benchmarks)
// ============================================================================

export const TAX_REPORT_MOCK: TaxReport = {
  stcgTotalGains: 450.0, // ~$450 USD (~₹38,000)
  stcgEstimatedTax: 90.0, // 20% on STCG
  ltcgTotalGains: 3490.0, // ~$3,490 USD (~₹2,95,000)
  ltcgExemptionLimit: 1480.0, // ₹1.25 Lakhs standard exemption
  ltcgTaxableGains: 2010.0, // Excess above ₹1.25L
  ltcgEstimatedTax: 251.25, // 12.5% tax on excess
  holdings: [
    {
      assetSymbol: 'RELIANCE',
      category: 'EQUITY',
      holdingPeriodDays: 380,
      gainType: 'LTCG',
      unrealizedGain: 283.5,
      estimatedTaxLiability: 35.4,
      isTaxHarvestable: true,
    },
    {
      assetSymbol: 'TCS',
      category: 'EQUITY',
      holdingPeriodDays: 410,
      gainType: 'LTCG',
      unrealizedGain: 186.0,
      estimatedTaxLiability: 23.25,
      isTaxHarvestable: true,
    },
    {
      assetSymbol: 'PPFAS',
      category: 'MUTUAL_FUNDS',
      holdingPeriodDays: 520,
      gainType: 'LTCG',
      unrealizedGain: 888.0,
      estimatedTaxLiability: 111.0,
      isTaxHarvestable: false,
    },
    {
      assetSymbol: 'BTC',
      category: 'CRYPTO',
      holdingPeriodDays: 210,
      gainType: 'STCG',
      unrealizedGain: 738.0,
      estimatedTaxLiability: 221.4, // 30% Flat VDA Tax in India
      isTaxHarvestable: false,
    },
  ],
  harvestingRecommendation:
    'You have $1,480 (₹1.25 Lakhs) in tax-free LTCG exemption available this financial year. Consider booking partial gains on Reliance and TCS before March 31 and immediately re-entering to step up your cost basis with ZERO tax liability!',
};
