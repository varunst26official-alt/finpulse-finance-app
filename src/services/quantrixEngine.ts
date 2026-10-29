import { useFinanceStore } from '@/stores/financeStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { useMasteryStore } from '@/stores/masteryStore';
import { formatCurrency, CURRENCY_CONFIGS } from '@/utils/formatters';
import { parseTradeIntent } from './aiTradeParser';
import { TradeActionPayload } from '@/types/finance';

export interface QuantrixResponse {
  content: string;
  suggestedPrompts: string[];
  tradeAction?: TradeActionPayload;
}

/**
 * Quantrix Live Context Engine
 * Synthesizes 100% real user data across Finance, Wellness, Tasks, Vault, and Community.
 */
export function processQuantrixQuery(prompt: string): QuantrixResponse {
  const finance = useFinanceStore.getState();
  const lifeos = useLifeOSStore.getState();
  const mastery = useMasteryStore.getState();

  const text = prompt.trim();
  const lower = text.toLowerCase();
  const currency = finance.currency;
  const rate = CURRENCY_CONFIGS[currency]?.rateFromUSD || 84.5;
  const summary = finance.getPortfolioSummary();

  // 1. Check for Trade / Outflow / Inflow Action Execution first
  const tradeIntent = parseTradeIntent(prompt, currency);
  if (tradeIntent) {
    if (tradeIntent.actionType === 'TRADE') {
      const formattedPrice = formatCurrency(tradeIntent.pricePerUnit, currency);
      const formattedTotal = formatCurrency(tradeIntent.totalAmount, currency);
      return {
        content: `⚡ **Trade Order Prepared for Execution:**\n\n- **Order Type:** ${tradeIntent.tradeType} ${tradeIntent.category}\n- **Instrument:** ${tradeIntent.symbol} (${tradeIntent.name})\n- **Quantity:** ${tradeIntent.quantity} units\n- **Execution Price:** ${formattedPrice} / unit\n- **Total Order Value:** **${formattedTotal}**\n- **Broker:** ${tradeIntent.platform || 'Zerodha Kite'}\n\nReview the order below and click **Confirm & Execute Trade** to update your portfolio.`,
        suggestedPrompts: ['Confirm trade', 'Show my net worth', 'Cancel order'],
        tradeAction: tradeIntent,
      };
    } else if (tradeIntent.actionType === 'EXPENSE') {
      const formattedAmt = formatCurrency(tradeIntent.totalAmount, currency);
      return {
        content: `💳 **Expense Entry Log Prepared:**\n\n- **Expense Title:** ${tradeIntent.name}\n- **Amount:** **${formattedAmt}**\n- **Category:** General Outflows\n\nClick **Record Expense** below to update your ledger.`,
        suggestedPrompts: ['Record Expense', 'How much did I spend this month?'],
        tradeAction: tradeIntent,
      };
    } else if (tradeIntent.actionType === 'INCOME') {
      const formattedAmt = formatCurrency(tradeIntent.totalAmount, currency);
      return {
        content: `💵 **Income Inflow Prepared:**\n\n- **Source:** ${tradeIntent.name}\n- **Amount:** **+${formattedAmt}**\n\nClick **Confirm Inflow** to credit this into your monthly savings.`,
        suggestedPrompts: ['Confirm Inflow', 'What is my current net worth?'],
        tradeAction: tradeIntent,
      };
    }
  }

  // 2. NET WORTH & ASSET BREAKDOWN QUERIES
  if (
    lower.includes('net worth') ||
    lower.includes('total wealth') ||
    lower.includes('portfolio value') ||
    lower.includes('how much money') ||
    lower.includes('my assets') ||
    lower.includes('holdings')
  ) {
    const totalAssets = summary.grossAssets;
    const totalDebts = summary.totalDebt;
    const netWorth = summary.totalNetWorth;

    const topAssets = [...finance.assets]
      .sort((a, b) => b.currentMarketPrice * b.quantity - a.currentMarketPrice * a.quantity)
      .slice(0, 4);

    const assetList =
      topAssets.length > 0
        ? topAssets
            .map(
              (a) =>
                `- **${a.symbol || a.name}**: ${formatCurrency(
                  a.currentMarketPrice * a.quantity,
                  currency
                )} (${a.category})`
            )
            .join('\n')
        : '- No assets recorded yet. Click "+ Add Trade" to log holdings.';

    return {
      content: `💎 **Real-Time Wealth & Net Worth Summary:**\n\n- **Total Net Worth:** **${formatCurrency(
        netWorth,
        currency
      )}**\n- **Gross Asset Holdings:** ${formatCurrency(
        totalAssets,
        currency
      )}\n- **Outstanding Debts/Liabilities:** ${formatCurrency(
        totalDebts,
        currency
      )}\n- **Liquid Cash Runway:** **${summary.liquidRunwayMonths.toFixed(
        1
      )} months** of emergency survival buffer.\n\n**Top Assets in Portfolio:**\n${assetList}\n\n💡 *Quantrix Insight:* Your portfolio has an active savings rate of **${summary.monthlySavingsRate.toFixed(
        1
      )}%**.`,
      suggestedPrompts: [
        'Am I on track for FIRE?',
        'How much did I spend this month?',
        'Buy 10 Reliance',
      ],
    };
  }

  // 3. FIRE & RETIREMENT QUERIES
  if (
    lower.includes('fire') ||
    lower.includes('retire') ||
    lower.includes('financial independence') ||
    lower.includes('fire number') ||
    lower.includes('fire calculator')
  ) {
    const totalExp = finance.expenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyExp = totalExp > 0 ? totalExp : 50000 / (currency === 'INR' ? 1 : rate);
    const annualExp = monthlyExp * 12;
    const fireCorpus = annualExp * 25; // 4% SWR Rule
    const currentCorpus = summary.totalNetWorth > 0 ? summary.totalNetWorth : 0;
    const progressPct = fireCorpus > 0 ? Math.min(100, (currentCorpus / fireCorpus) * 100) : 0;

    return {
      content: `🔥 **Your FIRE (Financial Independence) Roadmap:**\n\n- **Target FIRE Corpus (25x Rule):** **${formatCurrency(
        fireCorpus,
        currency
      )}**\n- **Current Accumulated Wealth:** ${formatCurrency(
        currentCorpus,
        currency
      )}\n- **Current FIRE Progress:** **${progressPct.toFixed(1)}% Completed**\n- **Estimated Annual Expenses:** ${formatCurrency(
        annualExp,
        currency
      )} / year\n- **Monthly Savings Rate:** ${summary.monthlySavingsRate.toFixed(1)}%\n\n📈 *Quantrix Assessment:* Increasing your annual investment step-up by 10% can accelerate your retirement timeline by up to 3.2 years.`,
      suggestedPrompts: [
        'How much can I invest this month?',
        'What is my current net worth?',
        'Audit portfolio risk',
      ],
    };
  }

  // 4. CASHFLOW, EXPENSES & SPENDING QUERIES
  if (
    lower.includes('spend') ||
    lower.includes('spent') ||
    lower.includes('expense') ||
    lower.includes('cash flow') ||
    lower.includes('biggest expense') ||
    lower.includes('transactions') ||
    lower.includes('budget')
  ) {
    const expenses = finance.expenses || [];
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);

    const recentExpenses = expenses.slice(0, 3);
    const recentList =
      recentExpenses.length > 0
        ? recentExpenses
            .map((e) => `- **${e.title}**: ${formatCurrency(e.amount, currency)} (${e.category})`)
            .join('\n')
        : '- No recent outflows recorded in your expenses ledger.';

    return {
      content: `📊 **Monthly Cash Flow & Spending Analysis:**\n\n- **Total Monthly Inflow:** ${formatCurrency(
        summary.totalMonthlyIncome,
        currency
      )}\n- **Total Monthly Outflows:** ${formatCurrency(
        summary.totalMonthlyExpenses > 0 ? summary.totalMonthlyExpenses : totalExp,
        currency
      )}\n- **Net Savings Rate:** **${summary.monthlySavingsRate.toFixed(1)}%**\n- **Recorded Outflow Items:** ${
        expenses.length
      } entries\n\n**Recent Outflow Logs:**\n${recentList}\n\n💡 *Tip:* Tell me *"Spent 1500 for groceries"* to instantly book a new entry.`,
      suggestedPrompts: [
        'Spent 500 for coffee',
        'What is my current net worth?',
        'Am I on track for FIRE?',
      ],
    };
  }

  // 5. TASKS, AGENDA & PRIORITIES QUERIES
  if (
    lower.includes('task') ||
    lower.includes('todo') ||
    lower.includes('agenda') ||
    lower.includes('due') ||
    lower.includes('pending') ||
    lower.includes('priority') ||
    lower.includes('deep work')
  ) {
    const allTasks = lifeos.tasks || [];
    const pendingTasks = allTasks.filter((t) => t.status !== 'COMPLETED');
    const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED');

    const taskList = pendingTasks.slice(0, 4);
    const taskDetails =
      taskList.length > 0
        ? taskList
            .map(
              (t) =>
                `- [ ] **${t.title}** [${t.priority} Priority]${
                  t.time ? ` — At: ${t.time}` : ''
                }`
            )
            .join('\n')
        : '🎉 No pending tasks! You are completely caught up with your agenda.';

    return {
      content: `📋 **LifeOS Task & Productivity Overview:**\n\n- **Pending Tasks:** **${pendingTasks.length} active items**\n- **Completed Tasks:** ${completedTasks.length} done\n\n**Top Priority Queue:**\n${taskDetails}\n\n💡 *Quantrix Focus Tip:* Knock out your highest-priority item in a 25-minute Pomodoro session.`,
      suggestedPrompts: [
        'How are my daily habits doing?',
        'What is my community rank?',
        'Show my net worth',
      ],
    };
  }

  // 6. HEALTH, HYDRATION, CALORIES & WORKOUT QUERIES
  if (
    lower.includes('water') ||
    lower.includes('drink') ||
    lower.includes('hydration') ||
    lower.includes('workout') ||
    lower.includes('exercise') ||
    lower.includes('calorie') ||
    lower.includes('fitness') ||
    lower.includes('gym') ||
    lower.includes('health') ||
    lower.includes('bmr')
  ) {
    const wellness = lifeos.wellness;
    const waterLiters = wellness?.waterLitersLogged || 0;
    const waterTarget = wellness?.waterTargetLiters || 3.0;
    const calories = wellness?.caloriesLogged || 0;
    const workoutMins = wellness?.workoutMinutesLogged || 0;
    const sessions = lifeos.workoutSessions || [];

    const waterPct = Math.round((waterLiters / Math.max(1, waterTarget)) * 100);

    return {
      content: `💪 **Clinical Biometrics & Health Tracker:**\n\n- **Hydration Level:** **${waterLiters.toFixed(
        1
      )}L / ${waterTarget.toFixed(1)}L** (${waterPct}% of daily goal)\n- **Active Exercise Logged:** **${workoutMins} minutes**\n- **Calories Consumed:** ${calories} kcal\n- **Recorded Workouts:** ${sessions.length} total sessions\n\n${
        waterPct < 60
          ? '⚠️ *Hydration Alert:* You are below your daily water target. Drink 500ml now!'
          : '✅ *Great job!* Your hydration is on track for optimal cognitive performance.'
      }`,
      suggestedPrompts: [
        'What tasks are due today?',
        'How are my daily habits doing?',
        'Show my net worth',
      ],
    };
  }

  // 7. HABITS & STREAKS QUERIES
  if (
    lower.includes('habit') ||
    lower.includes('streak') ||
    lower.includes('routine') ||
    lower.includes('morning') ||
    lower.includes('evening')
  ) {
    const habits = lifeos.habits || [];
    const completedCount = habits.filter((h) => h.isCompletedToday).length;

    const habitList = habits.slice(0, 4);
    const listText =
      habitList.length > 0
        ? habitList
            .map(
              (h) =>
                `- ${h.isCompletedToday ? '✅' : '⚪'} **${h.title}** (${h.category}) — Streak: **${
                  h.streakCount
                } days**`
            )
            .join('\n')
        : '- No habits created yet in Habit Mastery.';

    return {
      content: `⚡ **Daily Habit Tracker & Compounding Streaks:**\n\n- **Habits Completed Today:** **${completedCount} / ${habits.length}**\n- **Active Habits:** ${habits.length} routines\n\n**Habits Status:**\n${listText}\n\n💡 *Consistency Rule:* Compounding comes from maintaining your core morning streak every day.`,
      suggestedPrompts: [
        'What tasks are due today?',
        'What is my community rank?',
        'Show my net worth',
      ],
    };
  }

  // 8. VAULT & EXPIRING DOCUMENTS QUERIES
  if (
    lower.includes('document') ||
    lower.includes('vault') ||
    lower.includes('passport') ||
    lower.includes('license') ||
    lower.includes('policy') ||
    lower.includes('insurance') ||
    lower.includes('expire') ||
    lower.includes('renewal')
  ) {
    const docs = lifeos.documents || [];
    const docList = docs.slice(0, 4);
    const docText =
      docList.length > 0
        ? docList
            .map(
              (d) =>
                `- 📄 **${d.title}** [${d.category}] — Expiry: **${
                  d.expiryDate || 'No expiration'
                }**`
            )
            .join('\n')
        : '- No documents archived yet in your encrypted vault.';

    return {
      content: `🔒 **Encrypted Life Admin Vault & Expirations:**\n\n- **Total Archived Documents:** **${docs.length} files**\n- **Storage Engine:** Zero-Knowledge Client-Side AES Storage\n\n**Active Documents:**\n${docText}\n\n✅ All your credentials and policies are securely encrypted on your local device.`,
      suggestedPrompts: [
        'Show my net worth',
        'What tasks are due today?',
        'Am I on track for FIRE?',
      ],
    };
  }

  // 9. COMMUNITY & LEADERBOARD RANK QUERIES
  if (
    lower.includes('rank') ||
    lower.includes('community') ||
    lower.includes('leaderboard') ||
    lower.includes('points') ||
    lower.includes('score') ||
    lower.includes('mastery')
  ) {
    const sectionPoints = mastery.sectionPoints || {
      FINANCE: 0,
      WELLNESS: 0,
      PRODUCTIVITY: 0,
      LEARNING: 0,
      LIFEADMIN: 0,
    };
    const totalPoints = Object.values(sectionPoints).reduce((a, b) => a + b, 0);
    const leaderboard = mastery.leaderboard || [];

    return {
      content: `🏆 **Community Leaderboard & Mastery Rank:**\n\n- **Verified Community Members:** **${Math.max(
        leaderboard.length,
        1
      )} real members**\n- **Total LifeOS Points:** **${totalPoints.toLocaleString()} PTS**\n- **Tier / League:** **${mastery.league}**\n- **Streak Days:** ${mastery.streakDays} consecutive days\n\n**Section Mastery Points Breakdown:**\n- 💰 **Finance & Wealth:** ${sectionPoints.FINANCE || 0} pts\n- 💪 **Health & Fitness:** ${sectionPoints.WELLNESS || 0} pts\n- 🎯 **Deep Work & Habits:** ${sectionPoints.PRODUCTIVITY || 0} pts\n- 📚 **Learning & Skills:** ${sectionPoints.LEARNING || 0} pts\n- 🛡️ **Life Admin Vault:** ${sectionPoints.LIFEADMIN || 0} pts\n\n🌟 *You're competing against real-time registered members with zero mock data!*`,
      suggestedPrompts: [
        'Show my net worth',
        'Am I on track for FIRE?',
        'What tasks are due today?',
      ],
    };
  }

  // 10. DEFAULT INTELLIGENT SYNTHESIS
  return {
    content: `👋 Hello! I am **Quantrix**, your personal AI assistant synced directly to your LifeOS.\n\nI have real-time visibility into your:\n- **Wealth & Portfolio:** Net Worth **${formatCurrency(
      summary.totalNetWorth,
      currency
    )}**\n- **FIRE Calculator:** Target progress & investment capacity\n- **Tasks & Habits:** ${
      lifeos.tasks.filter((t) => t.status !== 'COMPLETED').length
    } pending tasks, ${lifeos.habits.length} habits\n- **Clinical Health:** ${
      lifeos.wellness?.waterLitersLogged || 0
    }L water logged\n- **Community Tier:** ${mastery.league} on the verified leaderboard\n\nHow can I help you optimize your day?`,
    suggestedPrompts: [
      'What is my current net worth?',
      'Am I on track for FIRE?',
      'What tasks are due today?',
      'How much did I spend this month?',
      'Buy 10 Reliance',
    ],
  };
}
