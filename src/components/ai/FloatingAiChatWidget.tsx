import React, { useState, useRef, useEffect } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
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
  Mic,
  MicOff,
  Flame,
  CheckSquare,
  Square,
  Droplets,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/utils/formatters';
import { FormattedMessageContent } from '@/components/ai/FormattedMessageContent';

export const FloatingAiChatWidget: React.FC = () => {
  const {
    isFloatingChatOpen,
    toggleFloatingChat,
    setIsFloatingChatOpen,
    aiMessages,
    isAiTyping,
    sendAiMessage,
    executeChatTradeAction,
    executeSystemAction,
    clearAiChat,
    currency,
  } = useFinanceStore();

  const { requireAuth } = useAuthStore();
  const { toggleTaskComplete } = useLifeOSStore();

  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isFloatingChatOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiTyping, isFloatingChatOpen, isMinimized]);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceListening = () => {
    if (!speechRecognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isAiTyping) return;
    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }
    sendAiMessage(text.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const starterPrompts = [
    '🌅 Generate morning brief',
    '💎 What is my current net worth?',
    '📋 Add task: Review Q4 portfolio by 5 PM',
    '💧 Drank 500ml water',
    '🔥 Am I on track for FIRE?',
    '💳 Spent 500 for coffee',
  ];

  return (
    <>
      {/* ============================================================== */}
      {/* 1. FLOATING LAUNCHER TRIGGER (Bottom-Right)                    */}
      {/* ============================================================== */}
      <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto">
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
              Ask Quantrix: <strong className="font-bold text-slate-900">"Generate morning brief"</strong>
            </span>
          </motion.div>
        )}

        {!isFloatingChatOpen && (
          <motion.button
            id="tour-floating-copilot"
            data-testid="quantrix-floating-btn"
            aria-label="Open Quantrix AI Copilot"
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
      {/* 2. ENHANCED CHAT WINDOW                                        */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isFloatingChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`fixed bottom-18 sm:bottom-6 right-3 sm:right-6 z-[60] w-[calc(100vw-24px)] sm:w-[440px] max-h-[86vh] sm:max-h-[90vh] rounded-[24px] border border-[#e8dfcf] bg-white shadow-2xl overflow-hidden flex flex-col transition-all ${
              isMinimized ? 'h-16' : 'h-[640px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e8dfcf] bg-gradient-to-r from-[#faf8f4] via-white to-[#faf8f4] px-4 py-3 select-none">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#17365d] to-[#0f233d] text-white shadow-xs">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-heading font-extrabold text-slate-900 leading-none tracking-tight">
                      Quantrix 2.0
                    </h4>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Autonomous LifeOS Copilot • Action Engine
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

            {/* Chat Body */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-white to-[#faf8f4]/60 text-xs">
                  {/* Empty Welcome State */}
                  {aiMessages.length === 0 && (
                    <div className="py-6 text-center space-y-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf8f4] border border-[#e8dfcf] text-[#9e783e] shadow-xs">
                        <Bot className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-heading font-bold text-slate-900 text-sm">
                          Autonomous Copilot Ready
                        </h5>
                        <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto">
                          I can execute trades, add agenda tasks, log water & workouts, or generate your morning brief.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col gap-1.5 max-w-[340px] mx-auto">
                        {starterPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(prompt.replace(/^[^\w]+/, '').trim())}
                            className="text-left text-[11px] font-medium py-2 px-3 rounded-xl bg-white hover:bg-[#f4efe4] border border-[#e8dfcf] text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages View */}
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
                          className={`max-w-[88%] rounded-2xl p-3.5 space-y-2.5 shadow-xs ${
                            isUser
                              ? 'bg-[#17365d] text-white font-medium rounded-tr-sm'
                              : 'bg-white border border-[#e8dfcf] text-slate-800 rounded-tl-sm'
                          }`}
                        >
                          {/* Formatted Markdown Content */}
                          <FormattedMessageContent content={msg.content} isUser={isUser} />

                          {/* ========================================================= */}
                          {/* GENERATIVE UI CARD 1: DAILY BRIEFING CARD                */}
                          {/* ========================================================= */}
                          {msg.cardType === 'BRIEFING' && msg.cardData && (
                            <div className="rounded-xl border border-[#ded3bf] bg-gradient-to-br from-[#faf8f4] to-white p-3.5 shadow-xs space-y-3 text-xs">
                              <div className="flex items-center justify-between border-b border-[#e8dfcf] pb-2">
                                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                                  <span>Daily Command Brief</span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                  LIVE SYNC
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 rounded-lg bg-white border border-[#e8dfcf]">
                                  <span className="text-[10px] text-slate-500 block font-semibold">Net Worth</span>
                                  <span className="font-extrabold text-[#17365d]">
                                    {formatCurrency(msg.cardData.netWorth, currency)}
                                  </span>
                                </div>
                                <div className="p-2 rounded-lg bg-white border border-[#e8dfcf]">
                                  <span className="text-[10px] text-slate-500 block font-semibold">Cash Runway</span>
                                  <span className="font-extrabold text-emerald-700">
                                    {msg.cardData.liquidRunwayMonths?.toFixed(1)} mo
                                  </span>
                                </div>
                              </div>

                              {/* Hydration progress bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <Droplets className="h-3 w-3 text-sky-500" />
                                    <span>Hydration</span>
                                  </span>
                                  <span>
                                    {msg.cardData.waterLiters?.toFixed(1)}L / {msg.cardData.waterTarget?.toFixed(1)}L
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full bg-sky-500 transition-all rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        ((msg.cardData.waterLiters || 0) / Math.max(1, msg.cardData.waterTarget || 3)) * 100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Top Tasks */}
                              {msg.cardData.topTasks && msg.cardData.topTasks.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                    Top Priority Queue
                                  </span>
                                  {msg.cardData.topTasks.map((t: any) => (
                                    <div
                                      key={t.id}
                                      onClick={() => toggleTaskComplete(t.id)}
                                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e8dfcf] hover:border-slate-400 cursor-pointer transition-all"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Square className="h-3.5 w-3.5 text-slate-400 hover:text-emerald-600" />
                                        <span className="font-medium text-slate-800 text-[11px] truncate max-w-[210px]">
                                          {t.title}
                                        </span>
                                      </div>
                                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                        {t.priority}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* ========================================================= */}
                          {/* GENERATIVE UI CARD 2: INTERACTIVE TASK LIST CARD          */}
                          {/* ========================================================= */}
                          {msg.cardType === 'TASK_LIST' && msg.cardData?.tasks && (
                            <div className="rounded-xl border border-[#ded3bf] bg-[#faf8f4] p-3 shadow-xs space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <CheckSquare className="h-3.5 w-3.5 text-[#9e783e]" />
                                  <span>Pending Agenda Tasks</span>
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 font-bold">
                                  {msg.cardData.tasks.length} remaining
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {msg.cardData.tasks.map((task: any) => {
                                  const isDone = task.status === 'COMPLETED';
                                  return (
                                    <div
                                      key={task.id}
                                      onClick={() => toggleTaskComplete(task.id)}
                                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e8dfcf] hover:border-emerald-500 cursor-pointer transition-all group"
                                    >
                                      <div className="flex items-center gap-2">
                                        {isDone ? (
                                          <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                                        ) : (
                                          <Square className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500" />
                                        )}
                                        <span
                                          className={`text-[11px] font-medium ${
                                            isDone ? 'line-through text-slate-400' : 'text-slate-800'
                                          }`}
                                        >
                                          {task.title}
                                        </span>
                                      </div>
                                      <span
                                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                          task.priority === 'HIGH'
                                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        {task.priority}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* ========================================================= */}
                          {/* GENERATIVE UI CARD 3: FIRE READINESS GAUGE CARD           */}
                          {/* ========================================================= */}
                          {msg.cardType === 'FIRE_GAUGE' && msg.cardData && (
                            <div className="rounded-xl border border-[#ded3bf] bg-gradient-to-br from-amber-50/50 via-white to-[#faf8f4] p-3.5 shadow-xs space-y-2.5 text-xs">
                              <div className="flex items-center justify-between border-b border-[#e8dfcf] pb-1.5">
                                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                                  <Flame className="h-4 w-4 text-amber-600" />
                                  <span>FIRE Milestone Readiness</span>
                                </span>
                                <span className="text-[11px] font-mono font-extrabold text-amber-800">
                                  {msg.cardData.progressPct?.toFixed(1)}%
                                </span>
                              </div>

                              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, msg.cardData.progressPct || 0)}%` }}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                                <div>
                                  <span className="text-[10px] text-slate-500 block">Corpus Target</span>
                                  <span className="font-extrabold text-slate-900">
                                    {formatCurrency(msg.cardData.fireCorpus, currency)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-500 block">Accumulated</span>
                                  <span className="font-extrabold text-emerald-700">
                                    {formatCurrency(msg.cardData.currentCorpus, currency)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ========================================================= */}
                          {/* GENERATIVE UI CARD 4: SYSTEM ACTION EXECUTION SLIP        */}
                          {/* ========================================================= */}
                          {msg.systemAction && (
                            <div className="pt-2 border-t border-[#e8dfcf] space-y-2">
                              <div className="rounded-xl border border-[#ded3bf] bg-[#faf8f4] p-3 shadow-xs space-y-2.5 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                                    <span>{msg.systemAction.title}</span>
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                                    {msg.systemAction.actionType.replace('_', ' ')}
                                  </span>
                                </div>

                                {msg.systemAction.status === 'PENDING' ? (
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      if (!requireAuth('execute LifeOS autonomous actions')) return;
                                      executeSystemAction(msg.id, msg.systemAction!);
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#17365d] hover:bg-[#122b4a] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Confirm & Execute Action</span>
                                  </motion.button>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Action Executed in LifeOS</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ========================================================= */}
                          {/* GENERATIVE UI CARD 5: TRADE / EXPENSE SLIP               */}
                          {/* ========================================================= */}
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
                          Quantrix synthesizing...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar with Voice Recognition Mic */}
                <div className="p-3 border-t border-[#e8dfcf] bg-white">
                  <div className="relative flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        data-testid="quantrix-chat-input"
                        placeholder={isListening ? 'Listening to your voice...' : 'Ask or command: "Add task...", "Drank 500ml water"...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isAiTyping}
                        className={`w-full h-11 rounded-xl border pl-3.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:border-[#17365d] focus:bg-white focus:outline-hidden font-medium transition-all ${
                          isListening
                            ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200'
                            : 'bg-[#faf8f4] border-[#e4d9c7]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={toggleVoiceListening}
                        title={isListening ? 'Stop listening' : 'Speak with voice'}
                        className={`absolute right-2 top-2.5 p-1 rounded-lg transition-colors cursor-pointer ${
                          isListening
                            ? 'text-rose-600 bg-rose-100 animate-pulse'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isAiTyping}
                      className="h-11 w-11 rounded-xl bg-[#17365d] hover:bg-[#122b4a] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <Send className="h-4 w-4" />
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
