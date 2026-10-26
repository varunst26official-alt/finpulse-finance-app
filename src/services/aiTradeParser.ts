import { COMPREHENSIVE_STOCK_DIRECTORY } from './stockSearchService';
import {
  TradeActionPayload,
  Currency,
  AssetCategory,
} from '@/types/finance';
import { CURRENCY_CONFIGS } from '@/utils/formatters';

/**
 * Parses user natural language prompts to detect actionable trade or financial logging intents.
 * e.g.:
 * "Buy 10 Reliance"
 * "Buy 20 shares of TCS at 4050 on Zerodha"
 * "Sell 5 Apple"
 * "Spent 25000 on rent"
 * "Log 180000 salary income"
 */
export function parseTradeIntent(
  prompt: string,
  currency: Currency
): TradeActionPayload | null {
  const text = prompt.trim();
  const lower = text.toLowerCase();
  const rateToUSD = CURRENCY_CONFIGS[currency].rateFromUSD;

  // 1. Check for Buy / Sell / Trade Intents
  const isBuy = /\b(buy|bought|purchase|purchased|invest in|long|add trade)\b/i.test(lower);
  const isSell = /\b(sell|sold|exit|dump|short|liquidate)\b/i.test(lower);
  const isSip = /\b(sip|monthly sip|start sip)\b/i.test(lower);
  const isExpense = /\b(spent|expense|paid|bill|shopping|grocery|rent)\b/i.test(lower);
  const isIncome = /\b(earned|salary|income|inflow|freelance pay|dividend received)\b/i.test(lower);

  const today = new Date().toISOString().split('T')[0];

  // --- Case A: Trades (Equities, Mutual Funds, Crypto, Gold) ---
  if (isBuy || isSell || isSip) {
    const tradeType = isSell ? 'SELL' : isSip ? 'SIP' : 'BUY';

    // Find matched stock in directory
    let matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((item) => {
      const sym = item.symbol.toLowerCase();
      const name = item.name.toLowerCase();
      // Match whole word for symbol or name snippet
      const symRegex = new RegExp(`\\b${sym}\\b`, 'i');
      return symRegex.test(lower) || lower.includes(name.split(' ')[0].toLowerCase());
    });

    // Special common aliases
    if (!matchedStock) {
      if (lower.includes('reliance')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'RELIANCE');
      else if (lower.includes('tcs') || lower.includes('tata consultancy')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'TCS');
      else if (lower.includes('hdfc')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'HDFCBANK');
      else if (lower.includes('infosys') || lower.includes('infy')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'INFY');
      else if (lower.includes('zomato')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'ZOMATO');
      else if (lower.includes('tata motors')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'TATAMOTORS');
      else if (lower.includes('tata power')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'TATAPOWER');
      else if (lower.includes('suzlon')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'SUZLON');
      else if (lower.includes('apple') || lower.includes('aapl')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'AAPL');
      else if (lower.includes('nvidia') || lower.includes('nvda')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'NVDA');
      else if (lower.includes('tesla') || lower.includes('tsla')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'TSLA');
      else if (lower.includes('bitcoin') || lower.includes('btc')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'BTC');
      else if (lower.includes('gold') || lower.includes('sgb')) matchedStock = COMPREHENSIVE_STOCK_DIRECTORY.find((s) => s.symbol === 'SGB_2024');
    }

    const symbol = matchedStock?.symbol || 'EQUITY_ORDER';
    const name = matchedStock?.name || `${symbol} Listed Asset`;
    const category: AssetCategory = matchedStock?.category || 'EQUITY';

    // Extract quantity (e.g. "10 shares", "20 units", or the number before/after stock name)
    let quantity = 1;
    const qtyMatch = lower.match(/(\d+(\.\d+)?)\s*(shares|units|qty|stocks)?/i);
    if (qtyMatch && qtyMatch[1]) {
      const parsed = parseFloat(qtyMatch[1]);
      if (parsed > 0) quantity = parsed;
    }

    // Extract price (e.g. "at 2940", "@ 2940", "at ₹2940", "for $230")
    let pricePerUnitUSD = matchedStock?.currentPriceUSD || 50.0;
    const priceMatch = lower.match(/(?:at|@|for|price)\s*[$₹]?\s*(\d+(\.\d+)?)/i);
    if (priceMatch && priceMatch[1]) {
      const parsedPrice = parseFloat(priceMatch[1]);
      if (parsedPrice > 0) {
        // If price is large (e.g. > 500 in INR context), convert to USD
        pricePerUnitUSD = currency === 'INR' || parsedPrice > 500 ? parsedPrice / rateToUSD : parsedPrice;
      }
    }

    const totalAmountUSD = quantity * pricePerUnitUSD;

    return {
      id: `act_${Date.now()}`,
      actionType: 'TRADE',
      symbol,
      name,
      tradeType,
      quantity,
      pricePerUnit: pricePerUnitUSD,
      totalAmount: totalAmountUSD,
      category,
      platform: 'Zerodha Kite',
      date: today,
      notes: `Executed via FinPulse AI Copilot`,
      status: 'PENDING',
    };
  }

  // --- Case B: Expenses ---
  if (isExpense) {
    let amountUSD = 50.0;
    const amountMatch = lower.match(/(?:rs\.?|inr|[$₹])?\s*(\d+(\.\d+)?)/i);
    if (amountMatch && amountMatch[1]) {
      const num = parseFloat(amountMatch[1]);
      amountUSD = currency === 'INR' || num > 100 ? num / rateToUSD : num;
    }

    return {
      id: `act_${Date.now()}`,
      actionType: 'EXPENSE',
      name: text.length > 30 ? text.slice(0, 30) : text,
      tradeType: 'BUY',
      quantity: 1,
      pricePerUnit: amountUSD,
      totalAmount: amountUSD,
      category: 'LIQUID_CASH',
      date: today,
      notes: `Outflow logged via AI Copilot`,
      status: 'PENDING',
    };
  }

  // --- Case C: Income ---
  if (isIncome) {
    let amountUSD = 1000.0;
    const amountMatch = lower.match(/(?:rs\.?|inr|[$₹])?\s*(\d+(\.\d+)?)/i);
    if (amountMatch && amountMatch[1]) {
      const num = parseFloat(amountMatch[1]);
      amountUSD = currency === 'INR' || num > 500 ? num / rateToUSD : num;
    }

    return {
      id: `act_${Date.now()}`,
      actionType: 'INCOME',
      name: text.length > 30 ? text.slice(0, 30) : text,
      tradeType: 'BUY',
      quantity: 1,
      pricePerUnit: amountUSD,
      totalAmount: amountUSD,
      category: 'LIQUID_CASH',
      date: today,
      notes: `Inflow logged via AI Copilot`,
      status: 'PENDING',
    };
  }

  return null;
}
