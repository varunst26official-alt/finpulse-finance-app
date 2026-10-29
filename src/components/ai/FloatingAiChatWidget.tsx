import React, { useState, useRef, useEffect } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  User,
  Zap,
  CheckCircle2,
  Minimize2,
  Maximize2,
  Bot,
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
    currency,
  } = useFinanceStore();

  const { requireAuth } = useAuthStore();

  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  const starterPrompts = [
    '💎 What is my current net worth?',
    '🔥 Am I on track for FIRE?',
    '📋 What tasks are due today?',
    '💪 How much water did I log today?',
    '💳 Spent 500 for coffee',
  ];

  return (
    <>
      {/* ============================================================== */}
      {/* 1. FLOATING LAUNCHER TRIGGER (Bottom-Right) */}
      {/* ============================================================== */}
      <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Subtle Minimalist Teaser Pill */}
        {!isFloatingChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={toggleFloatingChat}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#e8dfcf] text-xs font-semibold text-slate-800 shadow-lg shadow-black/5 hover:border-[#9e783e] hover:text-[#9e783e] cursor-pointer backdrop-blur-md transition-all group"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Ask Quantrix: <strong className="font-bold text-slate-900">"What's my net worth?"</strong>
            </span>
          </motion.div>
        )}

        {/* Circular Floating Trigger Button */}
        {!isFloatingChatOpen && (
          <motion.button
            id="tour-floating-copilot"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleFloatingChat}
            className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#17365d] hover:bg-[#122b4a] text-white shadow-xl shadow-[#17365d]/25 border-2 border-white cursor-pointer group transition-colors"
          >
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300 transition-transform group-hover:rotate-12" />
          </motion.button>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. MINIMALIST CHAT WINDOW POP-IN */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isFloatingChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`fixed bottom-18 sm:bottom-6 right-3 sm:right-6 z-[60] w-[calc(100vw-24px)] sm:w-[410px] max-h-[84vh] sm:max-h-[88vh] rounded-[24px] border border-[#e8dfcf] bg-white shadow-2xl overflow-hidden flex flex-col transition-all ${
              isMinimized ? 'h-16' : 'h-[600px]'
            }`}
          >
            {/* Minimalist Header */}
            <div className="flex items-center justify-between border-b border-[#e8dfcf] bg-gradient-to-r from-[#faf8f4] via-white to-[#faf8f4] px-4 py-3 select-none">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#17365d] to-[#0f233d] text-white shadow-xs">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-heading font-extrabold text-slate-900 leading-none tracking-tight">
                      Quantrix
                    </h4>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Your AI Assistant • Live Synced
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

            {/* Chat Body (When Not Minimized) */}
            {!isMinimized && (
              <>
                {/* Messages View Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-white to-[#faf8f4]/60 text-xs">
                  {/* Empty / Welcome State if no messages */}
                  {aiMessages.length === 0 && (
                    <div className="py-6 text-center space-y-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf8f4] border border-[#e8dfcf] text-[#9e783e] shadow-xs">
                        <Bot className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-heading font-bold text-slate-900 text-sm">
                          How can I help you today?
                        </h5>
                        <p className="text-[11px] text-slate-500 max-w-[260px] mx-auto">
                          I can analyze your portfolio, track FIRE goals, report tasks, or log expenses.
                        </p>
                      </div>

                      {/* Minimalist Starter Suggestions */}
                      <div className="pt-2 flex flex-col gap-1.5 max-w-[320px] mx-auto">
                        {starterPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(prompt.slice(2).trim())}
                            className="text-left text-[11px] font-medium py-2 px-3 rounded-xl bg-white hover:bg-[#f4efe4] border border-[#e8dfcf] text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Messages */}
                  {aiMessages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#17365d] text-white shadow-xs">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                          </div>
                        )}

                        <div
                          className={`max-w-[86%] rounded-2xl p-3.5 space-y-2.5 shadow-xs ${
                            isUser
                              ? 'bg-[#17365d] text-white font-medium rounded-tr-sm'
                              : 'bg-white border border-[#e8dfcf] text-slate-800 rounded-tl-sm'
                          }`}
                        >
                          {/* Markdown Text Splitting */}
                          <div className="whitespace-pre-wrap text-xs leading-relaxed">
                            {msg.content.split('\n').map((line, idx) => {
                              if (!line.trim()) return <div key={idx} className="h-1" />;
                              if (line.startsWith('- ')) {
                                return (
                                  <div key={idx} className="flex items-start gap-1.5 my-0.5">
                                    <span className="text-[#9e783e] font-bold">•</span>
                                    <span>{line.slice(2)}</span>
                                  </div>
                                );
                              }
                              return (
                                <p key={idx} className="mb-1 last:mb-0">
                                  {line}
                                </p>
                              );
                            })}
                          </div>

                          {/* Interactive Trade Execution Card */}
                          {msg.tradeAction && (
                            <div className="pt-2 border-t border-[#e8dfcf] space-y-2">
                              <div className="rounded-xl border border-[#ded3bf] bg-[#faf8f4] p-3 shadow-xs space-y-2 text-xs">
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
                                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                                      Units
                                    </span>
                                    <span className="font-bold font-mono text-slate-900">
                                      {msg.tradeAction.quantity}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
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
                                    onClick={() => {
                                      if (!requireAuth('execute portfolio trade orders')) return;
                                      executeChatTradeAction(msg.id, msg.tradeAction!);
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#9e783e] hover:bg-[#866632] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
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

                          {/* Dynamic Follow-up Prompt Pills */}
                          {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                            <div className="pt-2 border-t border-[#e8dfcf] flex flex-wrap gap-1">
                              {msg.suggestedPrompts.map((p, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSend(p)}
                                  className="text-[10px] px-2.5 py-1 rounded-lg bg-[#faf8f4] hover:bg-[#f4efe4] border border-[#ded3bf] text-[#866632] hover:text-slate-900 font-semibold transition-colors cursor-pointer text-left"
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {isUser && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
                            <User className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isAiTyping && (
                    <div className="flex gap-2.5 justify-start items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#17365d] text-white shadow-xs">
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-white border border-[#e8dfcf] px-3.5 py-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#17365d] animate-bounce"></span>
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-[#17365d] animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></span>
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-[#17365d] animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        ></span>
                        <span className="ml-1.5 text-[11px] font-medium text-slate-600">
                          Quantrix analyzing...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Minimalist Input Bar */}
                <div className="p-3 border-t border-[#e8dfcf] bg-white">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Ask Quantrix about wealth, FIRE, tasks, habits..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isAiTyping}
                      className="w-full h-11 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-3.5 pr-11 text-xs text-slate-900 placeholder-slate-400 focus:border-[#17365d] focus:bg-white focus:outline-hidden font-medium transition-all"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isAiTyping}
                      className="absolute right-1.5 h-8 w-8 rounded-lg bg-[#17365d] hover:bg-[#122b4a] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
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
