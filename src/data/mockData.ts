import {
  Asset,
  Transaction,
  HistoricalDataPoint,
  AiChatMessage,
  StockPrediction,
  MarketNewsItem,
  TaxReport,
  ExpenseItem,
  IncomeItem,
  CalendarEvent,
  DebtItem,
  InsurancePolicy,
  GoalItem,
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
  {
    id: 'ast_9',
    symbol: 'REALESTATE_BLR',
    name: 'Bangalore East 2BHK Rental Flat',
    category: 'REAL_ESTATE',
    quantity: 1,
    averageBuyPrice: 9500.0,
    currentMarketPrice: 11200.0,
    currency: 'USD',
    institution: 'Prestige Group / Sub-Registrar',
    expectedReturnRate: 8.5,
    lastUpdated: '2026-10-26T10:00:00Z',
  },
  {
    id: 'ast_10',
    symbol: 'PPF_GOVT',
    name: 'Public Provident Fund (PPF 7.1%)',
    category: 'RETIREMENT_PPF',
    quantity: 1,
    averageBuyPrice: 2800.0,
    currentMarketPrice: 3100.0,
    currency: 'USD',
    institution: 'State Bank of India',
    expectedReturnRate: 7.1,
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

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp_1',
    title: 'Apartment Rent & Society Maintenance',
    category: 'HOUSING_RENT',
    amount: 320.0,
    paymentMethod: 'NET_BANKING',
    frequency: 'MONTHLY_RECURRING',
    date: '2026-10-01',
    notes: 'Paid to Landlord via Net Banking',
  },
  {
    id: 'exp_2',
    title: 'Car Loan EMI (HDFC Bank)',
    category: 'EMI_LOANS',
    amount: 185.0,
    paymentMethod: 'NET_BANKING',
    frequency: 'MONTHLY_RECURRING',
    date: '2026-10-05',
    notes: 'Auto-debit for EV Car loan',
  },
  {
    id: 'exp_3',
    title: 'Supermarket Groceries & Organic Produce',
    category: 'FOOD_DINING',
    amount: 140.0,
    paymentMethod: 'UPI',
    frequency: 'ONE_TIME',
    date: '2026-10-18',
    notes: 'Nature Basket monthly grocery haul',
  },
  {
    id: 'exp_4',
    title: 'Electricity, High-speed Fiber & Utility Bills',
    category: 'UTILITIES_BILLS',
    amount: 45.0,
    paymentMethod: 'UPI',
    frequency: 'MONTHLY_RECURRING',
    date: '2026-10-10',
    notes: 'BESCOM + Airtel Fiber broadband',
  },
  {
    id: 'exp_5',
    title: 'Cloud & Productivity Subscriptions',
    category: 'ENTERTAINMENT_SUBS',
    amount: 35.0,
    paymentMethod: 'CREDIT_CARD',
    frequency: 'MONTHLY_RECURRING',
    date: '2026-10-12',
    notes: 'ChatGPT Plus, Spotify, Netflix 4K',
  },
];

export const INITIAL_INCOMES: IncomeItem[] = [
  {
    id: 'inc_1',
    source: 'Tech Enterprise Lead Salary',
    category: 'SALARY',
    amount: 1950.0,
    frequency: 'MONTHLY',
    date: '2026-10-01',
    account: 'HDFC Corporate Salary A/c',
    notes: 'Monthly fixed salary after PF deduction',
  },
  {
    id: 'inc_2',
    source: 'Software Consulting & Architecture Advisory',
    category: 'FREELANCE',
    amount: 450.0,
    frequency: 'ONE_TIME',
    date: '2026-10-14',
    account: 'ICICI Current A/c',
    notes: 'Fintech microservices architecture sprint',
  },
  {
    id: 'inc_3',
    source: 'Bangalore Flat Tenant Rental Yield',
    category: 'RENTAL',
    amount: 220.0,
    frequency: 'MONTHLY',
    date: '2026-10-05',
    account: 'SBI Savings A/c',
    notes: 'Direct tenant UPI transfer',
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal_oct_1',
    title: 'Enterprise Tech Lead Salary Credit',
    date: '2026-10-01',
    type: 'EXPECTED_INCOME',
    amount: 1950.0, // ~₹1,65,000
    categoryName: 'Employment Salary',
    isCompleted: true,
    notes: 'HDFC Corporate Salary Account',
  },
  {
    id: 'cal_oct_2',
    title: 'Apartment Rent & Society Maintenance',
    date: '2026-10-01',
    type: 'PLANNED_EXPENSE',
    amount: 320.0, // ~₹27,000
    categoryName: 'Housing & Rent',
    isCompleted: true,
    notes: 'Auto-schedule transfer to landlord',
  },
  {
    id: 'cal_oct_3',
    title: 'Monthly SIP: Parag Parikh Flexi Cap & UTI Nifty 50',
    date: '2026-10-05',
    type: 'PLANNED_INVESTMENT',
    amount: 415.0, // ~₹35,000
    categoryName: 'Equity Mutual Funds',
    isCompleted: true,
    notes: 'BSE Star MF mandate auto-debit',
  },
  {
    id: 'cal_oct_4',
    title: 'Car Loan EMI (HDFC Bank Auto-Debit)',
    date: '2026-10-05',
    type: 'PLANNED_EXPENSE',
    amount: 185.0, // ~₹15,600
    categoryName: 'EMI & Loans',
    isCompleted: true,
    notes: 'Standing instruction active',
  },
  {
    id: 'cal_oct_5',
    title: 'Executive Quarterly Health & Diagnostic Panel',
    date: '2026-10-12',
    type: 'MEDICAL_CHECKUP',
    amount: 75.0, // ~₹6,300
    categoryName: 'Preventive Healthcare',
    isCompleted: true,
    notes: 'Apollo Clinic - Fasting lipid & HbA1c test',
  },
  {
    id: 'cal_oct_6',
    title: 'Electricity (BESCOM) & Fiber Broadband Bill',
    date: '2026-10-15',
    type: 'PLANNED_EXPENSE',
    amount: 45.0, // ~₹3,800
    categoryName: 'Utilities & Bills',
    isCompleted: true,
    notes: 'Auto-paid via BBPS UPI',
  },
  {
    id: 'cal_1',
    title: "Sister's 30th Birthday Dinner & Gift",
    date: '2026-10-28',
    type: 'LIFE_EVENT',
    amount: 100.0, // ~₹8,450
    categoryName: 'Celebration & Gifts',
    isCompleted: false,
    notes: 'Reservation at The Leela Palace',
  },
  {
    id: 'cal_oct_7',
    title: 'Credit Card Statement Settlement (HDFC Millennia)',
    date: '2026-10-29',
    type: 'PLANNED_EXPENSE',
    amount: 215.0, // ~₹18,150
    categoryName: 'Credit Card Bill',
    isCompleted: false,
    notes: 'Total amount due auto-pay mandate',
  },
  {
    id: 'cal_2',
    title: 'Enterprise Tech Lead Salary Credit',
    date: '2026-11-01',
    type: 'EXPECTED_INCOME',
    amount: 1950.0, // ~₹1,65,000
    categoryName: 'Employment Salary',
    isCompleted: false,
    notes: 'HDFC Corporate Salary Account',
  },
  {
    id: 'cal_3',
    title: 'Apartment Rent & Society Maintenance',
    date: '2026-11-01',
    type: 'PLANNED_EXPENSE',
    amount: 320.0, // ~₹27,000
    categoryName: 'Housing & Rent',
    isCompleted: false,
    notes: 'Auto-schedule transfer to landlord',
  },
  {
    id: 'cal_4',
    title: 'Car Loan EMI (HDFC Bank Auto-Debit)',
    date: '2026-11-05',
    type: 'PLANNED_EXPENSE',
    amount: 185.0, // ~₹15,600
    categoryName: 'EMI & Loans',
    isCompleted: false,
    notes: 'Standing instruction active',
  },
  {
    id: 'cal_5',
    title: 'Monthly SIP: Parag Parikh Flexi Cap & UTI Nifty 50',
    date: '2026-11-05',
    type: 'PLANNED_INVESTMENT',
    amount: 415.0, // ~₹35,000
    categoryName: 'Equity Mutual Funds',
    isCompleted: false,
    notes: 'BSE Star MF mandate auto-debit',
  },
  {
    id: 'cal_6',
    title: 'Annual Executive Health Checkup & Blood Screening',
    date: '2026-11-10',
    type: 'MEDICAL_CHECKUP',
    amount: 140.0, // ~₹11,800
    categoryName: 'Preventive Healthcare',
    isCompleted: false,
    notes: 'Apollo Hospitals - Fasting lipid & cardiac profile',
  },
  {
    id: 'cal_7',
    title: 'Diwali Festival Celebrations & Family Sweets',
    date: '2026-11-12',
    type: 'LIFE_EVENT',
    amount: 295.0, // ~₹25,000
    categoryName: 'Festival & Family',
    isCompleted: false,
    notes: 'Budget for festive decorations and gift hampers',
  },
  {
    id: 'cal_8',
    title: 'Electricity (BESCOM) & Fiber Broadband Bill',
    date: '2026-11-15',
    type: 'PLANNED_EXPENSE',
    amount: 45.0, // ~₹3,800
    categoryName: 'Utilities & Bills',
    isCompleted: false,
    notes: 'Auto-paid via BBPS UPI',
  },
  {
    id: 'cal_9',
    title: 'Routine Dental Cleaning & Health Review',
    date: '2026-11-18',
    type: 'MEDICAL_CHECKUP',
    amount: 55.0, // ~₹4,650
    categoryName: 'Dental & Oral Health',
    isCompleted: false,
    notes: 'Smile Clinic appointment at 4:30 PM',
  },
  {
    id: 'cal_10',
    title: 'Sovereign Gold Bond (SGB) Semi-Annual Interest Inflow',
    date: '2026-11-20',
    type: 'EXPECTED_INCOME',
    amount: 50.0, // ~₹4,225
    categoryName: 'SGB RBI Interest Yield',
    isCompleted: false,
    notes: '2.5% p.a. RBI interest credited to bank',
  },
  {
    id: 'cal_11',
    title: 'Credit Card Statement Settlement',
    date: '2026-11-25',
    type: 'PLANNED_EXPENSE',
    amount: 215.0, // ~₹18,150
    categoryName: 'Credit Card Bill',
    isCompleted: false,
    notes: 'Total amount due zero interest rollover',
  },
  {
    id: 'cal_12',
    title: 'Dad 60th Milestone Birthday Celebration',
    date: '2026-12-15',
    type: 'LIFE_EVENT',
    amount: 240.0, // ~₹20,300
    categoryName: 'Milestone Celebration',
    isCompleted: false,
    notes: 'Family gathering dinner & gift planning',
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

// ============================================================================
// Sample Debt & Loan Repayments Data
// ============================================================================

export const INITIAL_DEBTS: DebtItem[] = [
  {
    id: 'debt_1',
    title: 'HDFC Smart Home Loan',
    category: 'HOME_LOAN',
    lender: 'HDFC Bank',
    originalPrincipal: 48000, // ~$48,000 = ~₹40.5 Lakhs
    currentOutstanding: 29500, // ~$29,500 = ~₹24.9 Lakhs
    interestRate: 8.55,
    monthlyEmi: 420, // ~$420 = ~₹35,500
    emiDueDay: 5,
    startDate: '2022-04-10',
    tenureMonths: 240,
    repayments: [
      {
        id: 'rep_1',
        debtId: 'debt_1',
        amount: 420,
        date: '2026-10-05',
        type: 'REGULAR_EMI',
        notes: 'October monthly EMI debited',
      },
      {
        id: 'rep_2',
        debtId: 'debt_1',
        amount: 1500,
        date: '2026-08-15',
        type: 'LUMP_SUM_PREPAYMENT',
        notes: 'Annual bonus prepayed directly to principal',
      },
    ],
    notes: 'Primary residence 3BHK flat in Bangalore. Prepayment allowed with zero foreclosure penalty.',
  },
  {
    id: 'debt_2',
    title: 'ICICI Auto Loan - Creta SUV',
    category: 'AUTO_LOAN',
    lender: 'ICICI Bank',
    originalPrincipal: 14000, // ~$14,000 = ~₹11.8 Lakhs
    currentOutstanding: 5200, // ~$5,200 = ~₹4.4 Lakhs
    interestRate: 8.85,
    monthlyEmi: 285, // ~$285 = ~₹24,000
    emiDueDay: 10,
    startDate: '2024-01-15',
    tenureMonths: 60,
    repayments: [
      {
        id: 'rep_3',
        debtId: 'debt_2',
        amount: 285,
        date: '2026-10-10',
        type: 'REGULAR_EMI',
        notes: 'Monthly auto-debit',
      },
    ],
    notes: '5-year fixed-rate auto finance.',
  },
  {
    id: 'debt_3',
    title: 'SBI Card ELITE Outstanding',
    category: 'CREDIT_CARD',
    lender: 'SBI Cards',
    originalPrincipal: 1200, // ~$1,200 = ~₹1,01,400
    currentOutstanding: 650, // ~$650 = ~₹55,000
    interestRate: 38.4,
    monthlyEmi: 95, // Minimum due / monthly pay
    emiDueDay: 22,
    startDate: '2026-09-01',
    tenureMonths: 12,
    repayments: [
      {
        id: 'rep_4',
        debtId: 'debt_3',
        amount: 150,
        date: '2026-10-22',
        type: 'REGULAR_EMI',
        notes: 'Paid above minimum due to cut high APR interest',
      },
    ],
    notes: 'Top priority for Avalanche payoff acceleration (38.4% APR).',
  },
];

// ============================================================================
// Sample Protection & Insurance Policies Data
// ============================================================================

export const INITIAL_POLICIES: InsurancePolicy[] = [
  {
    id: 'pol_1',
    policyName: 'HDFC Life Click 2 Protect Super',
    type: 'TERM_LIFE',
    provider: 'HDFC Life Insurance Co.',
    policyNumber: 'HD-884192-TL',
    sumAssured: 120000, // ~$120,000 = ~₹1.01 Crore
    annualPremium: 280, // ~$280 = ~₹23,600 / year
    renewalDueDate: '2026-11-20',
    coveredMembers: 'Self (Age 32, Non-smoker)',
    status: 'DUE_SOON',
    tpaHelpline: '1800-266-9777',
    notes: 'Pure protection term plan up to age 75 with terminal illness rider.',
  },
  {
    id: 'pol_2',
    policyName: 'Star Health Comprehensive Family Floater',
    type: 'HEALTH_FLOATER',
    provider: 'Star Health & Allied Insurance',
    policyNumber: 'SH-229104-HF',
    sumAssured: 25000, // ~$25,000 = ~₹21.1 Lakhs
    annualPremium: 350, // ~$350 = ~₹29,500 / year
    renewalDueDate: '2027-02-15',
    coveredMembers: 'Self, Spouse & 1 Child',
    status: 'ACTIVE',
    cashlessHospitalsCount: 14200,
    tpaHelpline: '1800-425-2255',
    notes: 'Zero room rent capping, pre/post hospitalisation covered, maternity benefit included.',
  },
  {
    id: 'pol_3',
    policyName: 'Tata AIG Auto Secure Comprehensive',
    type: 'MOTOR_VEHICLE',
    provider: 'Tata AIG General Insurance',
    policyNumber: 'TA-449102-MC',
    sumAssured: 12000, // ~$12,000 = ~₹10.1 Lakhs IDV
    annualPremium: 180, // ~$180 = ~₹15,200 / year
    renewalDueDate: '2027-04-10',
    coveredMembers: 'Hyundai Creta SX (KA-01-MJ-2024)',
    status: 'ACTIVE',
    tpaHelpline: '1800-266-7780',
    notes: 'Bumper-to-bumper zero depreciation cover + engine protector rider.',
  },
];

// ============================================================================
// Sample Goal-Based Bucket Investing & Milestones Data
// ============================================================================

export const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'goal_1',
    title: 'Retire Early at 48 (FIRE Corpus)',
    category: 'RETIREMENT_FIRE',
    targetAmount: 240000, // ~$240,000 = ~₹2.02 Crore
    targetDate: '2036-12-31',
    currentSaved: 88000, // ~$88,000 = ~₹74.3 Lakhs
    monthlyContribution: 450, // ~$450/mo = ~₹38,000/mo
    priority: 'HIGH',
    inflationRate: 6.5,
    expectedReturnRate: 12.0,
    allocatedAssetIds: ['ast_1', 'ast_3', 'ast_4'],
    notes: 'Financial independence fund based on 30x annual expenses safe withdrawal rate.',
  },
  {
    id: 'goal_2',
    title: 'Aarav Overseas College Fund',
    category: 'CHILD_EDUCATION',
    targetAmount: 60000, // ~$60,000 = ~₹50.7 Lakhs
    targetDate: '2034-06-30',
    currentSaved: 19500, // ~$19,500 = ~₹16.5 Lakhs
    monthlyContribution: 280, // ~$280/mo = ~₹23,600/mo
    priority: 'HIGH',
    inflationRate: 9.5, // High education inflation
    expectedReturnRate: 12.5,
    allocatedAssetIds: ['ast_3', 'ast_4'],
    notes: 'Targeting top engineering / business school in US or Europe.',
  },
  {
    id: 'goal_3',
    title: 'Coorg Holiday Villa Down Payment',
    category: 'HOME_PURCHASE',
    targetAmount: 38000, // ~$38,000 = ~₹32.1 Lakhs
    targetDate: '2028-10-31',
    currentSaved: 24000, // ~$24,000 = ~₹20.3 Lakhs
    monthlyContribution: 320, // ~$320/mo = ~₹27,000/mo
    priority: 'MEDIUM',
    inflationRate: 6.0,
    expectedReturnRate: 10.0,
    notes: 'Down payment for scenic plantation cottage.',
  },
  {
    id: 'goal_4',
    title: 'Europe & Alps Sabbatical Tour',
    category: 'LUXURY_VACATION',
    targetAmount: 8500, // ~$8,500 = ~₹7.18 Lakhs
    targetDate: '2027-05-15',
    currentSaved: 4600, // ~$4,600 = ~₹3.88 Lakhs
    monthlyContribution: 190, // ~$190/mo = ~₹16,000/mo
    priority: 'LOW',
    inflationRate: 5.0,
    expectedReturnRate: 8.0,
    notes: '3-week family vacation across Switzerland, Italy and Austria.',
  },
];
