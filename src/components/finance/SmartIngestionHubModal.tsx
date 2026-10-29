import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QuantraLogo } from '@/components/ui/QuantraLogo';
import { useFinanceStore } from '@/stores/financeStore';
import {
  parseFinancialSms,
  parseBatchSmsLogs,
  ParsedTransactionResult,
  SAMPLE_INDIAN_BANK_SMS,
} from '@/services/smsParserService';
import {
  SAMPLE_CAS_DEMAT_PORTFOLIO,
  convertHoldingsToQuantraAssets,
  ParsedDematHolding,
} from '@/services/casStatementService';
import { ExpenseItem } from '@/types/finance';
import {
  X,
  UploadCloud,
  FileText,
  Smartphone,
  Camera,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface SmartIngestionHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type IngestionTab = 'statements' | 'sms' | 'screenshot';

export const SmartIngestionHubModal: React.FC<SmartIngestionHubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addExpense, addAsset } = useFinanceStore();
  const [activeTab, setActiveTab] = useState<IngestionTab>('statements');

  // Processing state & animations
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  // Parsed results
  const [parsedExpenses, setParsedExpenses] = useState<ParsedTransactionResult[]>([]);
  const [parsedHoldings, setParsedHoldings] = useState<ParsedDematHolding[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Input states
  const [rawSmsInput, setRawSmsInput] = useState('');
  const [casPanInput, setCasPanInput] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Toggle selection
  const toggleSelect = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const selectAll = (allIds: string[]) => {
    if (selectedIds.size === allIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  // Simulate High-Performance On-Device Parsing with Laser Scan effect
  const runSimulatedScan = (type: 'demat' | 'sms' | 'bank', callback: () => void) => {
    setIsProcessing(true);
    setProcessProgress(15);
    setProcessingStatus(`Decrypting & Initializing ${type.toUpperCase()} Parser Engine...`);

    const interval = setInterval(() => {
      setProcessProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setProcessingStatus('Calibrating Categories & Duplication Filters...');
          setTimeout(() => {
            setIsProcessing(false);
            setProcessProgress(100);
            callback();
          }, 450);
          return 95;
        }
        return prev + 25;
      });
    }, 180);
  };

  // 1. Handle Demat CAS Demo Ingestion
  const handleLoadSampleDematCas = () => {
    runSimulatedScan('demat', () => {
      setParsedHoldings(SAMPLE_CAS_DEMAT_PORTFOLIO);
      setParsedExpenses([]);
      setSelectedIds(new Set(SAMPLE_CAS_DEMAT_PORTFOLIO.map((h) => h.id)));
      setSuccessMessage('Successfully parsed CDSL & CAMS Demat statement!');
    });
  };

  // 2. Handle Indian SMS Sample Ingestion
  const handleLoadSampleSms = (sampleSms: string) => {
    setRawSmsInput(sampleSms);
    const parsed = parseFinancialSms(sampleSms);
    if (parsed) {
      setParsedExpenses([parsed]);
      setParsedHoldings([]);
      setSelectedIds(new Set([parsed.id]));
    }
  };

  const handleParseManualSmsBatch = () => {
    if (!rawSmsInput.trim()) return;
    runSimulatedScan('sms', () => {
      const results = parseBatchSmsLogs(rawSmsInput);
      if (results.length > 0) {
        setParsedExpenses(results);
        setParsedHoldings([]);
        setSelectedIds(new Set(results.map((r) => r.id)));
        setSuccessMessage(`Extracted ${results.length} transactions from SMS!`);
      } else {
        // Fallback single line
        const single = parseFinancialSms(rawSmsInput);
        if (single) {
          setParsedExpenses([single]);
          setParsedHoldings([]);
          setSelectedIds(new Set([single.id]));
        }
      }
    });
  };

  // 3. Confirm and Commit to Quantra SQLite Store
  const handleConfirmImport = () => {
    let count = 0;

    // A. Import Selected Expenses
    if (parsedExpenses.length > 0) {
      const toImport = parsedExpenses.filter((e) => selectedIds.has(e.id));
      const USD_INR_RATE = 84.5;

      toImport.forEach((item) => {
        const expensePayload: ExpenseItem = {
          id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: item.merchant,
          category: item.category,
          amount: Number((item.amount / USD_INR_RATE).toFixed(2)),
          paymentMethod: item.paymentMethod,
          frequency: 'ONE_TIME',
          date: item.date,
          notes: `Auto-Ingested via Quantra SMS Parser (${item.accountRef || 'UPI'})`,
        };
        addExpense(expensePayload);
        count++;
      });
    }

    // B. Import Selected Demat Holdings
    if (parsedHoldings.length > 0) {
      const toImport = parsedHoldings.filter((h) => selectedIds.has(h.id));
      const convertedAssets = convertHoldingsToQuantraAssets(toImport);

      convertedAssets.forEach((asset) => {
        addAsset(asset);
        count++;
      });
    }

    setSuccessMessage(`🎉 Successfully imported ${count} items into your Quantra portfolio!`);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QuantraLogo size="md" variant="horizontal" animated={false} />
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% On-Device & Zero-API</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            onClick={() => setActiveTab('statements')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'statements'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Demat & Bank Statements</span>
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'sms'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI SMS & Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('screenshot')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'screenshot'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Invoice / Screenshot OCR</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: Demat & Bank Statements */}
          {activeTab === 'statements' && (
            <div className="space-y-5">
              <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70 hover:border-indigo-400 transition-all text-center relative group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="font-heading font-extrabold text-slate-900 text-base">
                  Drop Demat CAS PDF or Bank Statement CSV here
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Supports CDSL & NSDL Consolidated Statements, CAMS Mutual Fund statements, and HDFC / SBI / ICICI NetBanking exports.
                </p>

                {/* Optional Password Input for CAS PDF */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <input
                    type="password"
                    placeholder="PDF Password (Usually your PAN)"
                    value={casPanInput}
                    onChange={(e) => setCasPanInput(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 w-64 shadow-xs"
                  />
                  <button
                    onClick={handleLoadSampleDematCas}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-heading font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Demo CAS Statement</span>
                  </button>
                </div>
              </div>

              {/* Informational feature pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    ₹
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">All Indian Equities</div>
                    <div className="text-[11px] text-slate-500">Auto-matches Zerodha, Groww & Upstox</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    MF
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Direct Mutual Funds</div>
                    <div className="text-[11px] text-slate-500">Folio units & NAV valuations</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    🔒
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">100% Privacy</div>
                    <div className="text-[11px] text-slate-500">Processed locally inside SQLite WASM</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPI SMS & Notifications */}
          {activeTab === 'sms' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-900">Native Android Auto-Detection:</strong> In the compiled Android APK, Quantra automatically detects incoming bank SMS with zero manual effort. Test the parser below by pasting any SMS or clicking a sample.
                </div>
              </div>

              {/* Sample SMS Quick Buttons */}
              <div>
                <span className="block text-xs font-mono font-semibold text-slate-500 mb-2">
                  CLICK TO TEST SAMPLE INDIAN BANK SMS:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_INDIAN_BANK_SMS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadSampleSms(item.sms)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paste Text Area */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
                  Paste Bank / UPI SMS Text
                </label>
                <textarea
                  rows={3}
                  value={rawSmsInput}
                  onChange={(e) => setRawSmsInput(e.target.value)}
                  placeholder="e.g. Sent Rs.450.00 from HDFC Bank A/c **1234 to SWIGGY on 29-OCT-24 via UPI Ref 4291823901..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none shadow-xs"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleParseManualSmsBatch}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Parse SMS Locally</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Invoice / Screenshot OCR */}
          {activeTab === 'screenshot' && (
            <div className="space-y-4">
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center hover:border-indigo-400 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-slate-200/80 text-slate-600 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h4 className="font-heading font-extrabold text-slate-900 text-base">
                  Drop Payment Screenshot or Paper Bill Photo
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Upload GPay green checkmark screens, Swiggy order summaries, or fuel receipts to auto-extract date, amount, and store details.
                </p>
                <button
                  onClick={() =>
                    handleLoadSampleSms(
                      'Paid Rs 850.00 to FUEL PUMP IOCL BANGALORE on 28-OCT-2024 via PhonePe UPI.'
                    )
                  }
                  className="mt-4 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-heading font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Test Sample Screenshot OCR
                </button>
              </div>
            </div>
          )}

          {/* Processing Laser-Scan Indicator */}
          {isProcessing && (
            <div className="p-5 rounded-2xl bg-indigo-950 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="font-heading font-bold text-xs text-cyan-300">
                    {processingStatus}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {processProgress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${processProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            </motion.div>
          )}

          {/* PARSED RESULTS: Review & Verify Section */}
          {(parsedHoldings.length > 0 || parsedExpenses.length > 0) && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Review & Verify Parsed Items</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Verify items before committing to Quantra local storage.
                  </p>
                </div>

                <button
                  onClick={() =>
                    selectAll(
                      parsedHoldings.length > 0
                        ? parsedHoldings.map((h) => h.id)
                        : parsedExpenses.map((e) => e.id)
                    )
                  }
                  className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  Toggle Select All ({selectedIds.size})
                </button>
              </div>

              {/* Table A: Demat Holdings View */}
              {parsedHoldings.length > 0 && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {parsedHoldings.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSelect(item.id)}
                          className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-extrabold text-slate-900 text-xs">
                                  {item.symbol}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {item.category}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {item.institution}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{item.name}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono font-extrabold text-xs text-slate-900">
                              ₹{item.currentValue.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.quantity} units @ ₹{item.currentMarketPrice}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Table B: Expenses View */}
              {parsedExpenses.length > 0 && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {parsedExpenses.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSelect(item.id)}
                          className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-extrabold text-slate-900 text-xs">
                                  {item.merchant}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {item.category}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {item.paymentMethod} • {item.accountRef || 'UPI'}
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                                {item.rawText}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono font-extrabold text-xs text-rose-600">
                              -₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-mono font-semibold">
                              {item.confidence}% Match
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={selectedIds.size === 0}
            onClick={handleConfirmImport}
            className={`px-6 py-2.5 rounded-xl font-heading font-bold text-xs transition-all flex items-center gap-2 ${
              selectedIds.size > 0
                ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white shadow-md shadow-indigo-600/25 hover:scale-[1.02] cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Confirm & Import ({selectedIds.size} Selected)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
