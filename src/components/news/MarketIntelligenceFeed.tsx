import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import {
  Newspaper,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { MarketNewsItem } from '@/types/finance';

export const MarketIntelligenceFeed: React.FC = () => {
  const { newsItems, assets } = useFinanceStore();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const heldSymbols = new Set(assets.map((a) => a.symbol));

  const filteredNews = newsItems.filter(
    (item) => activeCategory === 'ALL' || item.category === activeCategory
  );

  const categories = ['ALL', 'MACRO', 'EQUITIES', 'COMMODITIES', 'CRYPTO'] as const;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs shadow-xs">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-emerald-400" />
            Live Market Intelligence & Macro News
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Curated financial headlines with AI sentiment classification and portfolio impact alerts
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((news: MarketNewsItem) => {
          // Check if user owns any impacted assets
          const userImpactedAssets = news.impactedAssets.filter((sym) => heldSymbols.has(sym));
          const hasUserImpact = userImpactedAssets.length > 0;

          const sentimentBadge =
            news.sentiment === 'BULLISH'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : news.sentiment === 'BEARISH'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700';

          return (
            <div
              key={news.id}
              className={`rounded-2xl border ${
                hasUserImpact
                  ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 via-slate-900/80 to-slate-900/50'
                  : 'border-slate-800 bg-slate-900/60'
              } p-5 backdrop-blur-xs flex flex-col justify-between transition-all hover:border-slate-700 shadow-xs group`}
            >
              <div>
                {/* Meta row: Category, Sentiment, Time */}
                <div className="flex items-center justify-between gap-2 mb-3 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-bold uppercase">
                      {news.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border font-bold ${sentimentBadge}`}>
                      {news.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{news.publishedAt}</span>
                  </div>
                </div>

                {/* Headline */}
                <h4 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug group-hover:text-emerald-400 transition-colors">
                  {news.headline}
                </h4>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                  {news.summary}
                </p>
              </div>

              {/* Footer: Portfolio Impact Warning & Source */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                {hasUserImpact && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Directly impacts your holdings:{' '}
                      <strong className="text-white">{userImpactedAssets.join(', ')}</strong>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Source: {news.source}</span>
                  <span className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer">
                    {news.readTime} • Read Full <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
