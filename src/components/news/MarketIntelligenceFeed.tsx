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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e8dfcf] bg-white p-5 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#2b2823] flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[#9c783e]" />
            Live Market Intelligence & Macro News
          </h3>
          <p className="text-xs text-[#786e5e] font-mono mt-0.5">
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
                  ? 'bg-[#9c783e] text-white shadow-xs'
                  : 'bg-[#faf8f5] border border-[#e4d9c7] text-[#786e5e] hover:text-[#2b2823] hover:bg-[#f4efe4]'
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
          const userImpactedAssets = news.impactedAssets.filter((sym) => heldSymbols.has(sym));
          const hasUserImpact = userImpactedAssets.length > 0;

          const sentimentBadge =
            news.sentiment === 'BULLISH'
              ? 'bg-[#eef7f2] text-[#2d6a4f] border-[#c6e4d2]'
              : news.sentiment === 'BEARISH'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-[#f4efe4] text-[#786e5e] border-[#ded3bf]';

          return (
            <div
              key={news.id}
              className={`rounded-2xl border ${
                hasUserImpact
                  ? 'border-[#c6e4d2] bg-gradient-to-br from-[#f2f9f5] via-white to-white'
                  : 'border-[#e8dfcf] bg-white'
              } p-5 flex flex-col justify-between transition-all hover:border-[#ded3bf] hover:shadow-md shadow-xs group`}
            >
              <div>
                {/* Meta row: Category, Sentiment, Time */}
                <div className="flex items-center justify-between gap-2 mb-3 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#faf8f5] border border-[#e4d9c7] text-[#6b6455] font-bold uppercase">
                      {news.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border font-bold ${sentimentBadge}`}>
                      {news.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#8c8273]">
                    <Clock className="h-3 w-3" />
                    <span>{news.publishedAt}</span>
                  </div>
                </div>

                {/* Headline */}
                <h4 className="text-sm sm:text-base font-bold text-[#2b2823] mb-2 leading-snug group-hover:text-[#9c783e] transition-colors">
                  {news.headline}
                </h4>

                {/* Summary */}
                <p className="text-xs text-[#544e43] leading-relaxed font-sans mb-4">
                  {news.summary}
                </p>
              </div>

              {/* Footer: Portfolio Impact Warning & Source */}
              <div className="pt-3 border-t border-[#f0ebe1] space-y-2">
                {hasUserImpact && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#2d6a4f] bg-[#eef7f2] border border-[#c6e4d2] px-2.5 py-1 rounded-lg">
                    <Sparkles className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0" />
                    <span>
                      Directly impacts your holdings:{' '}
                      <strong className="text-[#2b2823]">{userImpactedAssets.join(', ')}</strong>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono text-[#8c8273] pt-1">
                  <span>Source: {news.source}</span>
                  <span className="flex items-center gap-1 text-[#6b6455] hover:text-[#2b2823] cursor-pointer">
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
