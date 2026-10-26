import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import {
  Newspaper,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { MarketNewsItem } from '@/types/finance';
import { motion } from 'framer-motion';

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
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e8e0d1] bg-white p-6 shadow-xs"
      >
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[#9e783e]" />
            Live Market Intelligence & Macro News
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Curated financial headlines with AI sentiment classification and portfolio impact alerts
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#9e783e] text-white shadow-sm'
                  : 'bg-[#faf8f5] border border-[#e8e0d1] text-slate-600 hover:text-slate-900 hover:bg-[#f4efe4]'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((news: MarketNewsItem) => {
          const userImpactedAssets = news.impactedAssets.filter((sym) => heldSymbols.has(sym));
          const hasUserImpact = userImpactedAssets.length > 0;

          const sentimentBadge =
            news.sentiment === 'BULLISH'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : news.sentiment === 'BEARISH'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-slate-100 text-slate-700 border-slate-200';

          return (
            <motion.div
              key={news.id}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`rounded-2xl border ${
                hasUserImpact
                  ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/50 via-white to-white'
                  : 'border-[#e8e0d1] bg-white'
              } p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group`}
            >
              <div>
                {/* Meta row: Category, Sentiment, Time */}
                <div className="flex items-center justify-between gap-2 mb-3 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#faf8f5] border border-[#e8e0d1] text-slate-700 font-bold uppercase text-[10px] tracking-wide">
                      {news.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${sentimentBadge}`}>
                      {news.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{news.publishedAt}</span>
                  </div>
                </div>

                {/* Headline */}
                <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#9e783e] transition-colors">
                  {news.headline}
                </h4>

                {/* Summary */}
                <p className="text-xs text-slate-700 leading-relaxed font-sans mb-4">
                  {news.summary}
                </p>
              </div>

              {/* Footer: Portfolio Impact Warning & Source */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {hasUserImpact && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Portfolio impact:{' '}
                      <strong className="text-slate-900 font-bold">{userImpactedAssets.join(', ')}</strong>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-sans">
                  <span>Source: <strong className="text-slate-700">{news.source}</strong></span>
                  <span className="flex items-center gap-1 font-medium text-slate-700 hover:text-[#9e783e] cursor-pointer transition-colors">
                    {news.readTime} • Read article <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
