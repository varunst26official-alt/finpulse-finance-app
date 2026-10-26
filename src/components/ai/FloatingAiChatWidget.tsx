import React, { useState, useRef, useEffect } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import {
  Bot,
  Send,
  Sparkles,
  X,
  RotateCcw,
  User,
  Zap,
  CheckCircle2,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/utils/formatters';

export const FloatingAiChatWidget: React.FC = () => {
  const {
    isFloatingChatOpen,
    toggleFloatingChat,
    setIsFloatingChatOpen,
    aiMessages,
    isAiTyping,
    sendAiMessage,
    executeChatTradeAction,
    clearAiChat,
    getPortfolioSummary,
    currency,
  } = useFinanceStore();

  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const summary = getPortfolioSummary();

  useEffect(() => {
    if (isFloatingChatOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiTyping, isFloatingChatOpen, isMinimized]);

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
    <>
      {/* ============================================================== */}
      {/* 1. FLOATING LAUNCHER BUTTON (Bottom-Right Corner) */}
      {/* ============================================================== */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Subtle Teaser Pill when closed */}
        {!isFloatingChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8 }}
            onClick={toggleFloatingChat}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-[#e8e0d1] text-xs font-semibold text-slate-700 shadow-lg shadow-black/5 hover:border-[#9e783e] hover:text-[#9e783e] cursor-pointer backdrop-blur-md transition-all group"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Ask LifeOS: <strong>"Show my life summary"</strong></span>
          </motion.div>
        )}

        {/* Circular Floating Trigger Button */}
        {!isFloatingChatOpen && (
          <motion.button
            id="tour-floating-copilot"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleFloatingChat}
            className="relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#9e783e] text-white shadow-xl shadow-[#9e783e]/35 border-2 border-white cursor-pointer group"
          >
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
            <Bot className="h-6 w-6 sm:h-7 sm:w-7 transition-transform group-hover:rotate-6" />
          </motion.button>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. FLOATING CHAT WINDOW POP-IN */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isFloatingChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-3 sm:bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[410px] max-h-[88vh] rounded-3xl border border-[#e8e0d1] bg-white shadow-2xl overflow-hidden flex flex-col transition-all ${
              isMinimized ? 'h-16' : 'h-[580px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e8e0d1] bg-gradient-to-r from-[#faf8f5] to-white px-4 py-3.5 select-none">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9e783e] text-white shadow-sm shadow-[#9e783e]/30">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 leading-none">
                      LifeOS Copilot
                    </h4>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Wealth · Fitness · Habits · Learning · Life Admin
                  </span>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={clearAiChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Expand' : 'Minimize'}
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Minimize2 className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={() => setIsFloatingChatOpen(false)}
                  title="Close"
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* If not minimized, show body */}
            {!isMinimized && (
              <>
                {/* Live Context Strip */}
                <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-[#faf8f5] border-b border-[#e8e0d1] text-[10px]">
                  <div>
                    <span className="text-slate-400 uppercase font-bold block">Net Worth</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(summary.totalNetWorth, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold block">24h Gain</span>
                    <span className="font-mono font-bold text-emerald-700">
                      +{summary.todaysChangePercentage}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 uppercase font-bold block">Savings Rate</span>
                    <span className="font-mono font-bold text-[#9e783e]">
                      {summary.monthlySavingsRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Quick Prompts Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 border-b border-[#e8e0d1] scrollbar-none text-[11px] bg-white">
                  {[
                    'Buy 10 Reliance',
                    'Buy 5 Apple',
                    'Spent 25000 rent',
                    'Audit portfolio risk',
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSend(chip)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#faf8f5] border border-[#e8e0d1] text-[#9e783e] font-semibold hover:bg-[#f4efe4] hover:text-slate-900 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>

                {/* Message Scroll Area */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-gradient-to-b from-white to-[#faf8f5]/40 text-xs">
                  {aiMessages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#faf8f5] text-[#9e783e] border border-[#e8e0d1]">
                            <Bot className="h-4 w-4" />
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl p-3 leading-relaxed space-y-2 shadow-xs ${
                            isUser
                              ? 'bg-[#9e783e] text-white font-medium rounded-tr-none'
                              : 'bg-white border border-[#e8e0d1] text-slate-800 rounded-tl-none font-sans'
                          }`}
                        >
                          {/* Message Content */}
                          <div className="whitespace-pre-wrap text-xs leading-relaxed">
                            {msg.content.split('\n').map((paragraph, idx) => (
                              <p key={idx} className="mb-1.5 last:mb-0">
                                {paragraph.startsWith('- ') ? (
                                  <span className="inline-block pl-1.5 border-l-2 border-[#9e783e] my-0.5">
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
                              <div className="rounded-xl border border-[#ded3bf] bg-[#faf8f5] p-3 shadow-xs space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        msg.tradeAction.tradeType === 'BUY'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : msg.tradeAction.tradeType === 'SELL'
                                          ? 'bg-rose-100 text-rose-800'
                                          : 'bg-sky-100 text-sky-800'
                                      }`}
                                    >
                                      {msg.tradeAction.tradeType}
                                    </span>
                                    <span className="font-bold text-slate-900">
                                      {msg.tradeAction.symbol || msg.tradeAction.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {msg.tradeAction.platform || 'Zerodha Kite'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-[10px] text-slate-500 uppercase block">
                                      Units
                                    </span>
                                    <span className="font-bold font-mono text-slate-900">
                                      {msg.tradeAction.quantity}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] text-slate-500 uppercase block">
                                      Total Order
                                    </span>
                                    <span className="font-bold font-mono text-slate-900">
                                      {formatCurrency(msg.tradeAction.totalAmount, currency)}
                                    </span>
                                  </div>
                                </div>

                                {msg.tradeAction.status === 'PENDING' ? (
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                      executeChatTradeAction(msg.id, msg.tradeAction!)
                                    }
                                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#9e783e] text-white font-bold text-xs shadow-xs hover:bg-[#866632] transition-all cursor-pointer"
                                  >
                                    <Zap className="h-3.5 w-3.5" />
                                    <span>Confirm & Execute Trade</span>
                                  </motion.button>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Order Executed in Portfolio</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Follow-up Prompts */}
                          {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                            <div className="pt-2 border-t border-[#e8e0d1] flex flex-wrap gap-1">
                              {msg.suggestedPrompts.map((p, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSend(p)}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#ded3bf] text-[#866632] hover:bg-[#f4efe4] font-medium transition-colors cursor-pointer text-left"
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {isUser && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#9e783e]/20 text-[#866632] border border-[#9e783e]/30">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isAiTyping && (
                    <div className="flex gap-2 justify-start items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#faf8f5] text-[#9e783e] border border-[#e8e0d1]">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-white border border-[#e8e0d1] px-3 py-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#9e783e] animate-bounce"></span>
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-[#9e783e] animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></span>
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-[#9e783e] animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        ></span>
                        <span className="ml-1 text-[11px] font-medium">Copilot thinking...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-3 border-t border-[#e8e0d1] bg-white">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Ask anything or log an entry..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isAiTyping}
                      className="w-full h-10 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] pl-3.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isAiTyping}
                      className="absolute right-1.5 h-7 w-7 rounded-lg bg-[#9e783e] text-white flex items-center justify-center hover:bg-[#866632] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
