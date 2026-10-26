import React, { useState, useRef, useEffect } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { Bot, Send, Sparkles, RotateCcw, User, ShieldCheck } from 'lucide-react';

export const AiWealthCopilot: React.FC = () => {
  const { aiMessages, isAiTyping, sendAiMessage, clearAiChat, getPortfolioSummary } =
    useFinanceStore();
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
    <div className="rounded-2xl border border-[#e8dfcf] bg-white p-5 shadow-xs space-y-4 flex flex-col h-[750px]">
      {/* Header with AI Status & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8dfcf] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9c783e] text-white shadow-md shadow-[#9c783e]/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#2b2823]">FinPulse AI Wealth Copilot</h3>
              <span className="flex items-center gap-1 rounded-full bg-[#eef7f2] px-2 py-0.5 text-[10px] font-mono font-bold text-[#2d6a4f] border border-[#c6e4d2]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2d6a4f] animate-pulse"></span>
                Active Engine
              </span>
            </div>
            <p className="text-xs text-[#786e5e] font-mono mt-0.5">
              Trained on your real-time holdings, risk appetite, and tax guidelines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearAiChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e8dfcf] bg-[#faf8f5] text-xs font-mono text-[#786e5e] hover:text-[#2b2823] hover:bg-[#f4efe4] transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Portfolio Quick Context Pill Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e8dfcf]">
          <span className="text-[10px] text-[#786e5e] uppercase block">Monitored Corpus</span>
          <span className="text-[#2b2823] font-bold">
            ${Math.round(summary.totalNetWorth).toLocaleString()}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e8dfcf]">
          <span className="text-[10px] text-[#786e5e] uppercase block">Unrealized P&L</span>
          <span className="text-[#2d6a4f] font-bold">
            +{summary.pnlPercentage.toFixed(1)}% Return
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e8dfcf]">
          <span className="text-[10px] text-[#786e5e] uppercase block">Risk Score</span>
          <span className="text-[#866632] font-bold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Balanced
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#e8dfcf]">
          <span className="text-[10px] text-[#786e5e] uppercase block">Tax Harvesting</span>
          <span className="text-[#9c783e] font-bold">₹1.25L Eligible</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {aiMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f4efe4] text-[#866632] border border-[#ded3bf]">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-[#9c783e] text-white font-medium rounded-tr-none shadow-xs'
                    : 'bg-[#faf8f5] border border-[#e8dfcf] text-[#2b2823] rounded-tl-none font-sans shadow-xs'
                }`}
              >
                {/* Message Body */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-2 last:mb-0">
                      {paragraph.startsWith('- ') ? (
                        <span className="inline-block pl-2 border-l-2 border-[#9c783e]/50 my-0.5">
                          {paragraph.slice(2)}
                        </span>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))}
                </div>

                {/* Metrics Context Badges (if present) */}
                {msg.metricsContext && (
                  <div className="pt-2 border-t border-[#e8dfcf] flex flex-wrap gap-2 font-mono text-[11px]">
                    {msg.metricsContext.map((metric, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#ded3bf] text-[#443f36]"
                      >
                        <strong className="text-[#2b2823]">{metric.label}:</strong> {metric.value}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-up Prompt Pills */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="pt-2 border-t border-[#e8dfcf]">
                    <span className="text-[10px] font-mono uppercase text-[#786e5e] block mb-1.5">
                      Suggested Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(prompt)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#ded3bf] text-[#866632] text-[11px] font-mono hover:bg-[#f4efe4] hover:text-[#2b2823] transition-all cursor-pointer text-left"
                        >
                          <Sparkles className="h-3 w-3 shrink-0 text-[#9c783e]" />
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#9c783e]/20 text-[#866632] border border-[#9c783e]/30">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isAiTyping && (
          <div className="flex gap-3 justify-start items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f4efe4] text-[#866632] border border-[#ded3bf]">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-[#faf8f5] border border-[#e8dfcf] px-4 py-3 text-xs text-[#786e5e] flex items-center gap-1.5 font-mono">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9c783e] animate-bounce"></span>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#9c783e] animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></span>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#9c783e] animate-bounce"
                style={{ animationDelay: '0.4s' }}
              ></span>
              <span className="ml-1 text-[11px] text-[#786e5e]">
                Synthesizing portfolio intelligence...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box Bar */}
      <div className="pt-3 border-t border-[#e8dfcf]">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask AI Copilot: 'Audit my portfolio risk' or 'Simulate LTCG tax liability'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAiTyping}
            className="w-full h-11 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-4 pr-12 text-xs text-[#2b2823] placeholder-[#8c8273] focus:border-[#9c783e] focus:bg-white focus:outline-hidden font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isAiTyping}
            className="absolute right-1.5 h-8 w-8 rounded-lg bg-[#9c783e] text-white flex items-center justify-center hover:bg-[#866632] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-[#786e5e] mt-1.5 px-1">
          <span>AI outputs are for analytical guidance. Always verify with qualified advisors.</span>
          <span>Shift + Enter for multiline</span>
        </div>
      </div>
    </div>
  );
};
