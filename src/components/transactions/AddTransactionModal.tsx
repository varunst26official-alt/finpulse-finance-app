import React, { useState, useEffect, useRef } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import {
  X,
  TrendingUp,
  Building2,
  Receipt,
  Wallet,
  Search,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import {
  AssetCategory,
  TransactionType,
  ExpenseCategory,
  IncomeCategory,
  PaymentMethod,
  ListedStockItem,
} from '@/types/finance';
import { searchListedStocks, COMPREHENSIVE_STOCK_DIRECTORY } from '@/services/stockSearchService';
import {
  formatCurrency,
  EXPENSE_CATEGORY_LABELS,
  INCOME_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  CURRENCY_CONFIGS,
} from '@/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

type ModalMode = 'TRADE' | 'FIXED_ASSET' | 'EXPENSE' | 'INCOME';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const {
    currency,
    addTransaction,
    addAsset,
    addExpense,
    addIncome,
  } = useFinanceStore();

  const [mode, setMode] = useState<ModalMode>('TRADE');

  // --- Trade Mode State ---
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockSearchResults, setStockSearchResults] = useState<ListedStockItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<ListedStockItem | null>(null);

  const [tradeType, setTradeType] = useState<TransactionType>('BUY');
  const [quantity, setQuantity] = useState<number>(10);
  const [pricePerUnit, setPricePerUnit] = useState<number>(34.8);
  const [tradePlatform, setTradePlatform] = useState('Zerodha Kite');
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split('T')[0]);
  const [tradeNotes, setTradeNotes] = useState('');

  // --- Fixed Asset / Real Estate Mode State ---
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('REAL_ESTATE');
  const [assetInvestedAmount, setAssetInvestedAmount] = useState<number>(10000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(8.0);
  const [assetInstitution, setAssetInstitution] = useState('');
  const [assetDate, setAssetDate] = useState(new Date().toISOString().split('T')[0]);
  const [assetNotes, setAssetNotes] = useState('');

  // --- Expense Mode State ---
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('HOUSING_RENT');
  const [expenseAmount, setExpenseAmount] = useState<number>(300);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [expenseFrequency, setExpenseFrequency] = useState<'ONE_TIME' | 'MONTHLY_RECURRING'>('MONTHLY_RECURRING');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');

  // --- Income Mode State ---
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>('SALARY');
  const [incomeAmount, setIncomeAmount] = useState<number>(2000);
  const [incomeFrequency, setIncomeFrequency] = useState<'MONTHLY' | 'ONE_TIME' | 'ANNUAL'>('MONTHLY');
  const [incomeAccount, setIncomeAccount] = useState('Primary Salary Bank A/c');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [incomeNotes, setIncomeNotes] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize stock search on load
  useEffect(() => {
    if (COMPREHENSIVE_STOCK_DIRECTORY.length > 0 && !selectedStock) {
      const defaultStock = COMPREHENSIVE_STOCK_DIRECTORY[0];
      setSelectedStock(defaultStock);
      setStockSearchQuery(`${defaultStock.symbol} — ${defaultStock.name}`);
      setPricePerUnit(currency === 'INR' ? defaultStock.currentPriceINR : defaultStock.currentPriceUSD);
    }
  }, [currency]);

  // Handle dynamic stock search
  useEffect(() => {
    let isMounted = true;
    searchListedStocks(stockSearchQuery).then((results) => {
      if (isMounted) setStockSearchResults(results);
    });
    return () => {
      isMounted = false;
    };
  }, [stockSearchQuery]);

  // Handle outside click for search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const currentRate = CURRENCY_CONFIGS[currency].rateFromUSD;

  // Select stock from search dropdown
  const handleSelectStock = (stock: ListedStockItem) => {
    setSelectedStock(stock);
    setStockSearchQuery(`${stock.symbol} — ${stock.name}`);
    setPricePerUnit(currency === 'INR' ? stock.currentPriceINR : stock.currentPriceUSD);
    setIsSearchOpen(false);
  };

  // Add custom unlisted stock directly
  const handleAddCustomStock = () => {
    const customSymbol = stockSearchQuery.trim().toUpperCase() || 'CUSTOM_ASSET';
    const customItem: ListedStockItem = {
      symbol: customSymbol,
      name: `${customSymbol} Listed Asset`,
      exchange: 'NSE',
      sector: 'Custom Holding',
      currentPriceUSD: currency === 'INR' ? pricePerUnit / currentRate : pricePerUnit,
      currentPriceINR: currency === 'INR' ? pricePerUnit : pricePerUnit * currentRate,
      category: 'EQUITY',
    };
    setSelectedStock(customItem);
    setIsSearchOpen(false);
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'TRADE') {
      if (!selectedStock) return;
      const unitPriceUSD = currency === 'INR' ? pricePerUnit / currentRate : pricePerUnit;
      const totalAmountUSD = quantity * unitPriceUSD;

      addTransaction({
        assetId: `ast_${selectedStock.symbol.toLowerCase()}`,
        assetSymbol: selectedStock.symbol,
        assetName: selectedStock.name,
        category: selectedStock.category,
        type: tradeType,
        quantity: Number(quantity),
        pricePerUnit: unitPriceUSD,
        totalAmount: totalAmountUSD,
        date: tradeDate,
        platform: tradePlatform,
        notes: tradeNotes || `Executed on ${tradePlatform}`,
      });
    } else if (mode === 'FIXED_ASSET') {
      const amountUSD = currency === 'INR' ? assetInvestedAmount / currentRate : assetInvestedAmount;

      addAsset({
        symbol: assetName.replace(/\s+/g, '_').toUpperCase().slice(0, 12) || 'FIXED_ASSET',
        name: assetName || 'Fixed Investment Asset',
        category: assetCategory,
        quantity: 1,
        averageBuyPrice: amountUSD,
        currentMarketPrice: amountUSD,
        currency: 'USD',
        institution: assetNotes ? `${assetInstitution || 'Direct'} (${assetNotes})` : (assetInstitution || 'Direct Ownership'),
        expectedReturnRate: Number(expectedReturnRate),
        maturityDate: assetDate,
      });
    } else if (mode === 'EXPENSE') {
      const amountUSD = currency === 'INR' ? expenseAmount / currentRate : expenseAmount;

      addExpense({
        title: expenseTitle || 'General Outflow',
        category: expenseCategory,
        amount: amountUSD,
        paymentMethod: paymentMethod,
        frequency: expenseFrequency,
        date: expenseDate,
        notes: expenseNotes,
      });
    } else if (mode === 'INCOME') {
      const amountUSD = currency === 'INR' ? incomeAmount / currentRate : incomeAmount;

      addIncome({
        source: incomeSource || 'Monthly Inflow',
        category: incomeCategory,
        amount: amountUSD,
        frequency: incomeFrequency,
        account: incomeAccount,
        date: incomeDate,
        notes: incomeNotes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/45 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-[#e8e0d1] bg-white p-5 sm:p-7 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e0d1] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9e783e] text-white shadow-md shadow-[#9e783e]/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Unified Financial Entry & Planner
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Log listed stocks, real estate, spent expenses, or income inflows in one place
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-900 hover:bg-[#faf8f5] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Mode Switcher Segment Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl bg-[#faf8f5] p-1.5 border border-[#e8e0d1]">
          {[
            { id: 'TRADE', label: 'Stocks & Equities', icon: TrendingUp },
            { id: 'FIXED_ASSET', label: 'Fixed Assets & RE', icon: Building2 },
            { id: 'EXPENSE', label: 'Spent Expenses', icon: Receipt },
            { id: 'INCOME', label: 'Income Inflows', icon: Wallet },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id as ModalMode)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#9e783e] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#f4efe4]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {/* ============================================================== */}
            {/* MODE 1: STOCKS & EQUITIES TRADE ENTRY */}
            {/* ============================================================== */}
            {mode === 'TRADE' && (
              <motion.div
                key="trade-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                {/* Searchable Listed Stock Selector */}
                <div className="relative" ref={searchRef}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5 text-[#9e783e]" />
                      Search & Select Listed Stock / ETF / Crypto
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Free Live Index API
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={stockSearchQuery}
                      onChange={(e) => {
                        setStockSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                      placeholder="Type asset symbol or company name (e.g. AAPL, MSFT, GOOG)..."
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-4 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden transition-all"
                    />
                    <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
                  </div>

                  {/* Stock Search Dropdown Results */}
                  {isSearchOpen && (
                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-[#e8e0d1] bg-white p-2 shadow-xl space-y-1">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Listed Instruments ({stockSearchResults.length} Matches)
                      </div>
                      {stockSearchResults.map((stock) => (
                        <div
                          key={stock.symbol}
                          onClick={() => handleSelectStock(stock)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs hover:bg-[#faf8f5] cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold font-mono text-slate-900 group-hover:text-[#9e783e]">
                              {stock.symbol}
                            </span>
                            <span className="text-slate-600 truncate max-w-[170px] sm:max-w-xs">
                              {stock.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 font-mono">
                              {stock.exchange}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              {formatCurrency(
                                currency === 'INR' ? stock.currentPriceINR / currentRate : stock.currentPriceUSD,
                                currency
                              )}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Custom Ticker Adder Option */}
                      {stockSearchQuery.trim() && (
                        <div
                          onClick={handleAddCustomStock}
                          className="flex items-center gap-2 rounded-xl border border-dashed border-[#9e783e] bg-[#faf8f5] px-3 py-2 text-xs text-[#9e783e] font-bold hover:bg-[#f4efe4] cursor-pointer mt-1"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Add custom unlisted ticker: <strong>"{stockSearchQuery.trim().toUpperCase()}"</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Transaction Type Radio Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['BUY', 'SELL', 'DIVIDEND', 'SIP'] as const).map((t) => {
                      const isSelected = tradeType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTradeType(t)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? t === 'BUY'
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : t === 'SELL'
                                ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                                : 'bg-[#9e783e] text-white border-[#9e783e] shadow-xs'
                              : 'bg-[#faf8f5] border-[#e8e0d1] text-slate-700 hover:bg-[#f4efe4]'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity and Price Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Quantity (Units)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Price / Unit ({CURRENCY_CONFIGS[currency].symbol} {currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Broker Platform & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Platform / Broker
                    </label>
                    <select
                      value={tradePlatform}
                      onChange={(e) => setTradePlatform(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      <option value="Zerodha Kite">Zerodha Kite (NSE/BSE)</option>
                      <option value="Groww">Groww</option>
                      <option value="Angel One">Angel One</option>
                      <option value="Upstox Pro">Upstox Pro</option>
                      <option value="Interactive Brokers">Interactive Brokers (US / Global)</option>
                      <option value="Binance / Cold Vault">Binance / Hardware Wallet (Crypto)</option>
                      <option value="Bank Direct">Bank Direct Demat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Execution Date
                    </label>
                    <input
                      type="date"
                      required
                      value={tradeDate}
                      onChange={(e) => setTradeDate(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Investment Thesis / Trade Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={tradeNotes}
                    onChange={(e) => setTradeNotes(e.target.value)}
                    placeholder="e.g. Q2 Earnings breakout entry, 3-year holding horizon"
                    className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* MODE 2: FIXED ASSET & REAL ESTATE ENTRY */}
            {/* ============================================================== */}
            {mode === 'FIXED_ASSET' && (
              <motion.div
                key="asset-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Asset / Property Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Residential Property, High Yield Bond"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Asset Classification
                    </label>
                    <select
                      value={assetCategory}
                      onChange={(e) => setAssetCategory(e.target.value as AssetCategory)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      <option value="REAL_ESTATE">🏠 Real Estate & Physical Property</option>
                      <option value="FIXED_DEPOSIT">🏦 Fixed Deposit (Bank FD / RD)</option>
                      <option value="GOLD_SGB">🪙 Sovereign Gold Bonds / Gold Bullion</option>
                      <option value="RETIREMENT_PPF">🛡️ PPF / EPF / National Pension (NPS)</option>
                      <option value="BONDS_DEBT">📑 Corporate & Govt Bonds</option>
                      <option value="STARTUP_EQUITY">🚀 Startup Equity / Angel Investment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Invested Capital / Valuation ({CURRENCY_CONFIGS[currency].symbol})
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={assetInvestedAmount}
                      onChange={(e) => setAssetInvestedAmount(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Expected Annual Yield / Return (% p.a.)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={expectedReturnRate}
                      onChange={(e) => setExpectedReturnRate(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Bank / Registry / Fund House
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bank or Financial Institution"
                      value={assetInstitution}
                      onChange={(e) => setAssetInstitution(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Maturity / Valuation Date
                    </label>
                    <input
                      type="date"
                      value={assetDate}
                      onChange={(e) => setAssetDate(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Asset Details / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Long-term investment, lock-in period details"
                    value={assetNotes}
                    onChange={(e) => setAssetNotes(e.target.value)}
                    className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* MODE 3: SPENT EXPENSE & OUTFLOW ENTRY */}
            {/* ============================================================== */}
            {mode === 'EXPENSE' && (
              <motion.div
                key="expense-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Expense Title / Merchant
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Monthly Apartment Rent, Groceries, Car EMI"
                      value={expenseTitle}
                      onChange={(e) => setExpenseTitle(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Expense Category
                    </label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Amount ({CURRENCY_CONFIGS[currency].symbol})
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Frequency
                    </label>
                    <select
                      value={expenseFrequency}
                      onChange={(e) => setExpenseFrequency(e.target.value as any)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      <option value="MONTHLY_RECURRING">Monthly Recurring</option>
                      <option value="ONE_TIME">One-Time Outflow</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Expense Date
                    </label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Receipt Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Invoice #2026-OCT, reimbursed 50%"
                      value={expenseNotes}
                      onChange={(e) => setExpenseNotes(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* MODE 4: INCOME & CASH INFLOW ENTRY */}
            {/* ============================================================== */}
            {mode === 'INCOME' && (
              <motion.div
                key="income-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Income Stream / Source
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Monthly Salary, Freelance Consulting, Rental Income"
                      value={incomeSource}
                      onChange={(e) => setIncomeSource(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Income Classification
                    </label>
                    <select
                      value={incomeCategory}
                      onChange={(e) => setIncomeCategory(e.target.value as IncomeCategory)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      {Object.entries(INCOME_CATEGORY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Inflow Amount ({CURRENCY_CONFIGS[currency].symbol})
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={incomeAmount}
                      onChange={(e) => setIncomeAmount(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Frequency
                    </label>
                    <select
                      value={incomeFrequency}
                      onChange={(e) => setIncomeFrequency(e.target.value as any)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      <option value="MONTHLY">Monthly Regular</option>
                      <option value="ONE_TIME">One-Time Credit</option>
                      <option value="ANNUAL">Annual Bonus / Payout</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Credited Account
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Primary Bank Account"
                      value={incomeAccount}
                      onChange={(e) => setIncomeAccount(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Credit Date
                    </label>
                    <input
                      type="date"
                      value={incomeDate}
                      onChange={(e) => setIncomeDate(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Reference / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Performance bonus or milestone payment"
                      value={incomeNotes}
                      onChange={(e) => setIncomeNotes(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Impact Preview Callout */}
          <div className="rounded-2xl border border-[#e8e0d1] bg-[#faf8f5] p-3.5 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#9e783e]"></span>
              <span>
                {mode === 'TRADE' && (
                  <>
                    Total Value:{' '}
                    <strong className="font-mono font-bold text-slate-900">
                      {formatCurrency(
                        currency === 'INR'
                          ? (quantity * pricePerUnit) / currentRate
                          : quantity * pricePerUnit,
                        currency
                      )}
                    </strong>{' '}
                    will be audited into your active portfolio.
                  </>
                )}
                {mode === 'FIXED_ASSET' && (
                  <>
                    Capital:{' '}
                    <strong className="font-mono font-bold text-slate-900">
                      {formatCurrency(
                        currency === 'INR' ? assetInvestedAmount / currentRate : assetInvestedAmount,
                        currency
                      )}
                    </strong>{' '}
                    added to Net Worth diversification.
                  </>
                )}
                {mode === 'EXPENSE' && (
                  <>
                    Outflow of{' '}
                    <strong className="font-mono font-bold text-rose-700">
                      {formatCurrency(
                        currency === 'INR' ? expenseAmount / currentRate : expenseAmount,
                        currency
                      )}
                    </strong>{' '}
                    will update monthly savings analytics.
                  </>
                )}
                {mode === 'INCOME' && (
                  <>
                    Inflow of{' '}
                    <strong className="font-mono font-bold text-emerald-700">
                      {formatCurrency(
                        currency === 'INR' ? incomeAmount / currentRate : incomeAmount,
                        currency
                      )}
                    </strong>{' '}
                    boosts your monthly cash flow surplus.
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e8e0d1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9e783e] text-xs font-bold text-white shadow-md shadow-[#9e783e]/25 hover:bg-[#866632] transition-all cursor-pointer"
            >
              <span>Confirm & Save Entry</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
