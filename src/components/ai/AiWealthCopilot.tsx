import React, { useState, useRef, useEffect } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  User,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/utils/formatters';

export const AiWealthCopilot: React.FC = () => {
  const {
    aiMessages,
    isAiTyping,
    sendAiMessage,
    executeChatTradeAction,
    clearAiChat,
    getPortfolioSummary,
    currency,
  } = useFinanceStore();

  const summary = getPortfolioSummary();
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAiTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isAiTyping) return;
    sendAiMessage(text.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs space-y-4 flex flex-col h-[750px]">
      {/* Header with AI Status & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8e0d1] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9e783e] text-white shadow-md shadow-[#9e783e]/25">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                FinPulse AI Wealth Copilot
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                Trade Execution Active
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Trained on your real-time holdings, risk appetite, and live order execution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearAiChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e8e0d1] bg-[#faf8f5] text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-[#f4efe4] transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Portfolio Quick Context Pill Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
          <span className="text-[11px] text-slate-500 uppercase font-bold block">
            Monitored Corpus
          </span>
          <span className="text-slate-900 font-extrabold text-sm font-mono">
            {formatCurrency(summary.totalNetWorth, currency)}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
          <span className="text-[11px] text-slate-500 uppercase font-bold block">
            Unrealized P&L
          </span>
          <span className="text-emerald-700 font-extrabold text-sm font-mono">
            +{summary.pnlPercentage.toFixed(1)}% Return
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
          <span className="text-[11px] text-slate-500 uppercase font-bold block">
            Risk Profile
          </span>
          <span className="text-[#866632] font-extrabold text-sm flex items-center gap-1 font-sans">
            <ShieldCheck className="h-4 w-4" /> Balanced
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
          <span className="text-[11px] text-slate-500 uppercase font-bold block">
            Savings Rate
          </span>
          <span className="text-[#9e783e] font-extrabold text-sm font-mono">
            {summary.monthlySavingsRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <AnimatePresence initial={false}>
          {aiMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4efe4] text-[#866632] border border-[#ded3bf]">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 shadow-xs ${
                    isUser
                      ? 'bg-[#9e783e] text-white font-medium rounded-tr-none'
                      : 'bg-[#faf8f5] border border-[#e8e0d1] text-slate-800 rounded-tl-none font-sans'
                  }`}
                >
                  {/* Message Body */}
                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {msg.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-2 last:mb-0">
                        {paragraph.startsWith('- ') ? (
                          <span className="inline-block pl-2 border-l-2 border-[#9e783e] my-0.5 font-medium">
                            {paragraph.slice(2)}
                          </span>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Interactive Trade Execution Card */}
                  {msg.tradeAction && (
                    <div className="pt-2 border-t border-[#e8e0d1] space-y-2">
                      <div className="rounded-xl border border-[#ded3bf] bg-white p-3.5 shadow-xs space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                msg.tradeAction.tradeType === 'BUY'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : msg.tradeAction.tradeType === 'SELL'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {msg.tradeAction.tradeType}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              {msg.tradeAction.symbol || msg.tradeAction.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">
                            {msg.tradeAction.platform || 'Zerodha Kite'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block">Quantity</span>
                            <span className="font-bold font-mono text-slate-900 text-sm">
                              {msg.tradeAction.quantity} Units
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase block">Total Value</span>
                            <span className="font-bold font-mono text-slate-900 text-sm">
                              {formatCurrency(msg.tradeAction.totalAmount, currency)}
                            </span>
                          </div>
                        </div>

                        {msg.tradeAction.status === 'PENDING' ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => executeChatTradeAction(msg.id, msg.tradeAction!)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#9e783e] text-white font-bold text-xs shadow-xs hover:bg-[#866632] transition-all cursor-pointer"
                          >
                            <Zap className="h-4 w-4" />
                            <span>Confirm & Execute Trade Order</span>
                          </motion.button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Order Executed & Logged to Portfolio</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metrics Context Badges */}
                  {msg.metricsContext && (
                    <div className="pt-2 border-t border-[#e8e0d1] flex flex-wrap gap-2 text-[11px]">
                      {msg.metricsContext.map((metric, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-white border border-[#ded3bf] text-slate-700 font-semibold"
                        >
                          <strong className="text-slate-900">{metric.label}:</strong> {metric.value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Follow-up Prompt Pills */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="pt-2.5 border-t border-[#e8e0d1]">
                      <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1.5">
                        Suggested Inquiries:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedPrompts.map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(prompt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#ded3bf] text-[#866632] text-xs font-semibold hover:bg-[#f4efe4] hover:text-slate-900 transition-all cursor-pointer text-left shadow-xs active:scale-95"
                          >
                            <Sparkles className="h-3 w-3 shrink-0 text-[#9e783e]" />
                            <span>{prompt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#9e783e]/20 text-[#866632] border border-[#9e783e]/30">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isAiTyping && (
          <div className="flex gap-3 justify-start items-center">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4efe4] text-[#866632] border border-[#ded3bf]">
              <Bot className="h-5 w-5" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-[#faf8f5] border border-[#e8e0d1] px-4 py-3 text-xs text-slate-600 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#9e783e] animate-bounce"></span>
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#9e783e] animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></span>
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#9e783e] animate-bounce"
                style={{ animationDelay: '0.4s' }}
              ></span>
              <span className="ml-1 text-xs text-slate-600 font-semibold">
                Synthesizing trade analysis & portfolio intelligence...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box Bar */}
      <div className="pt-3 border-t border-[#e8e0d1]">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask anything or trade directly: 'Buy 10 Reliance', 'Sell 5 TCS', or 'Audit portfolio'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAiTyping}
            className="w-full h-12 rounded-xl bg-[#faf8f5] border border-[#e2d8c7] pl-4 pr-12 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isAiTyping}
            className="absolute right-1.5 h-9 w-9 rounded-lg bg-[#9e783e] text-white flex items-center justify-center hover:bg-[#88642e] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1 font-medium">
          <span>Commands supported: "Buy 10 Reliance", "Spent ₹1500 grocery", "Earned ₹180000 salary"</span>
          <span>Shift + Enter for multiline</span>
        </div>
      </div>
    </div>
  );
};
