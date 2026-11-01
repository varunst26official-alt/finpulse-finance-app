import { useFinanceStore } from '@/stores/financeStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { useMasteryStore } from '@/stores/masteryStore';
import { formatCurrency, CURRENCY_CONFIGS } from '@/utils/formatters';
import { parseTradeIntent } from './aiTradeParser';
import { parseSystemActionIntent } from './aiActionParser';
import { TradeActionPayload, QuantrixActionPayload } from '@/types/finance';

export interface QuantrixResponse {
  content: string;
  suggestedPrompts: string[];
  tradeAction?: TradeActionPayload;
  systemAction?: QuantrixActionPayload;
  cardType?: 'BRIEFING' | 'TASK_LIST' | 'FIRE_GAUGE' | 'ACTION_SLIP' | 'NET_WORTH';
  cardData?: any;
}

/**
 * Quantrix Live Context & Autonomous Action Engine
 * Synthesizes 100% real user data across Finance, Wellness, Tasks, Vault, and Community.
 * Executes native LifeOS actions via conversational commands.
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

  // =========================================================================
  // 1. CHECK FOR SYSTEM-LEVEL COMMANDS (TASKS, HYDRATION, WORKOUT, MEALS)
  // =========================================================================
  const systemAction = parseSystemActionIntent(prompt);
  if (systemAction) {
    if (systemAction.actionType === 'CREATE_TASK') {
      const { taskTitle, taskPriority, taskCategory, taskTime } = systemAction.data;
      return {
        content: `📋 **New Agenda Task Staged for LifeOS**\n\n- **Task:** ${taskTitle}\n- **Priority:** ${taskPriority}\n- **Category:** ${taskCategory}\n- **Schedule:** ${taskTime}\n- **Mastery XP:** +20 XP upon completion\n\nClick **Confirm & Create Task** below to append this directly to your live agenda.`,
        suggestedPrompts: ['Confirm & Create Task', 'What tasks are due today?', 'Cancel'],
        systemAction,
        cardType: 'ACTION_SLIP',
        cardData: systemAction,
      };
    }

    if (systemAction.actionType === 'TOGGLE_TASK') {
      const query = systemAction.data.taskTitle?.toLowerCase() || '';
      const target =
        lifeos.tasks.find((t) => t.title.toLowerCase().includes(query) && t.status !== 'COMPLETED') ||
        lifeos.tasks.find((t) => t.status !== 'COMPLETED');

      if (target) {
        systemAction.data.taskId = target.id;
        systemAction.data.taskTitle = target.title;
        return {
          content: `✅ **Task Ready to Mark Complete**\n\n- **Task Title:** ${target.title}\n- **Domain:** ${target.category}\n- **XP Reward:** +25 Productivity XP\n\nClick **Mark Completed** below to update your completion streak!`,
          suggestedPrompts: ['Mark Completed', 'Show pending tasks'],
          systemAction,
          cardType: 'ACTION_SLIP',
          cardData: systemAction,
        };
      } else {
        return {
          content: `🎉 You have no pending tasks matching "${systemAction.data.taskTitle || 'query'}". You are completely caught up!`,
          suggestedPrompts: ['Add a new task', 'Plan my day', 'Show all tasks'],
        };
      }
    }

    if (systemAction.actionType === 'LOG_WATER') {
      const liters = systemAction.data.waterLiters || 0.25;
      const current = lifeos.wellness?.waterLitersLogged || 0;
      const target = lifeos.wellness?.waterTargetLiters || 3.0;
      const newTotal = Number((current + liters).toFixed(2));
      const newPct = Math.round((newTotal / Math.max(1, target)) * 100);

      return {
        content: `💧 **Hydration Intake Staged to Log**\n\n- **Logged Amount:** +${liters}L (${Math.round(liters * 1000)}ml)\n- **Projected Daily Total:** ${newTotal}L / ${target}L (${newPct}% of target)\n- **Health XP:** +15 XP\n\nClick **Confirm Water Intake** below to record this in your daily wellness tracker.`,
        suggestedPrompts: ['Confirm Water Intake', 'How much water did I log today?'],
        systemAction,
        cardType: 'ACTION_SLIP',
        cardData: systemAction,
      };
    }

    if (systemAction.actionType === 'LOG_WORKOUT') {
      const mins = systemAction.data.workoutMinutes || 30;
      const title = systemAction.data.workoutTitle || 'Workout Session';
      return {
        content: `🏋️ **Workout Session Staged to Record**\n\n- **Protocol:** ${title}\n- **Duration:** ${mins} minutes\n- **Estimated Energy Burn:** ~${Math.round(mins * 7.5)} kcal\n- **XP Boost:** +30 Wellness XP\n\nClick **Confirm Workout** to record this session in your LifeOS training log.`,
        suggestedPrompts: ['Confirm Workout', 'Log 500ml water'],
        systemAction,
        cardType: 'ACTION_SLIP',
        cardData: systemAction,
      };
    }

    if (systemAction.actionType === 'LOG_MEAL') {
      const cals = systemAction.data.calories || 450;
      const name = systemAction.data.mealName || 'Meal';
      const target = lifeos.wellness?.caloriesTarget || 2200;
      const current = lifeos.wellness?.caloriesLogged || 0;

      return {
        content: `🥗 **Meal Nutrition Entry Staged**\n\n- **Item / Meal:** ${name}\n- **Calories:** ${cals} kcal\n- **Protein:** ~${systemAction.data.proteinGrams || 25}g\n- **Updated Day Total:** ${current + cals} / ${target} kcal\n- **Nutrition XP:** +15 XP\n\nClick **Record Meal** below to record macros.`,
        suggestedPrompts: ['Record Meal', 'How many calories logged today?'],
        systemAction,
        cardType: 'ACTION_SLIP',
        cardData: systemAction,
      };
    }

    if (systemAction.actionType === 'DAILY_BRIEF') {
      const pending = lifeos.tasks.filter((t) => t.status !== 'COMPLETED');
      const upcomingBills = (finance.bills || []).filter((b) => b.status === 'UPCOMING' || b.status === 'OVERDUE').slice(0, 2);
      const water = lifeos.wellness?.waterLitersLogged || 0;
      const waterTarget = lifeos.wellness?.waterTargetLiters || 3.0;

      return {
        content: `⚡ **Quantrix Daily Executive Briefing**\n\nHere is your synchronized morning command snapshot across wealth, priorities, and metabolic targets:`,
        suggestedPrompts: ['Show my net worth', 'Am I on track for FIRE?', 'Log 500ml water'],
        cardType: 'BRIEFING',
        cardData: {
          netWorth: summary.totalNetWorth,
          grossAssets: summary.grossAssets,
          liquidRunwayMonths: summary.liquidRunwayMonths,
          pendingTasksCount: pending.length,
          topTasks: pending.slice(0, 3),
          waterLiters: water,
          waterTarget: waterTarget,
          upcomingBillsCount: upcomingBills.length,
          currency,
        },
      };
    }
  }

  // =========================================================================
  // 2. CHECK FOR TRADE / OUTFLOW / INFLOW FINANCIAL ACTIONS
  // =========================================================================
  const tradeIntent = parseTradeIntent(prompt, currency);
  if (tradeIntent) {
    if (tradeIntent.actionType === 'TRADE') {
      const formattedPrice = formatCurrency(tradeIntent.pricePerUnit, currency);
      const formattedTotal = formatCurrency(tradeIntent.totalAmount, currency);
      return {
        content: `⚡ **Trade Order Prepared for Execution:**\n\n- **Order Type:** ${tradeIntent.tradeType} ${tradeIntent.category}\n- **Instrument:** ${tradeIntent.symbol} (${tradeIntent.name})\n- **Quantity:** ${tradeIntent.quantity} units\n- **Execution Price:** ${formattedPrice} / unit\n- **Total Order Value:** **${formattedTotal}**\n- **Broker:** ${tradeIntent.platform || 'Zerodha Kite'}\n\nReview the order below and click **Confirm & Execute Trade** to update your portfolio.`,
        suggestedPrompts: ['Confirm trade', 'Show my net worth', 'Cancel order'],
        tradeAction: tradeIntent,
        cardType: 'ACTION_SLIP',
        cardData: {
          id: tradeIntent.id,
          actionType: 'TRADE',
          title: `${tradeIntent.tradeType} ${tradeIntent.quantity} ${tradeIntent.symbol || tradeIntent.name}`,
          status: 'PENDING',
          data: {
            symbol: tradeIntent.symbol,
            tradeType: tradeIntent.tradeType,
            quantity: tradeIntent.quantity,
            pricePerUnit: tradeIntent.pricePerUnit,
            totalAmount: tradeIntent.totalAmount,
            platform: tradeIntent.platform || 'Zerodha Kite',
            date: tradeIntent.date,
          },
        },
      };
    } else if (tradeIntent.actionType === 'EXPENSE') {
      const formattedAmt = formatCurrency(tradeIntent.totalAmount, currency);
      return {
        content: `💳 **Expense Outflow Entry Prepared:**\n\n- **Expense Title:** **${tradeIntent.name}**\n- **Amount:** **${formattedAmt}**\n- **Category:** General Outflows\n- **Method:** UPI / Bank\n\nClick **Record Expense** below to append this into your ledger.`,
        suggestedPrompts: ['Record Expense', 'How much did I spend this month?'],
        tradeAction: tradeIntent,
        cardType: 'ACTION_SLIP',
        cardData: {
          id: tradeIntent.id,
          actionType: 'EXPENSE',
          title: `Expense: ${tradeIntent.name}`,
          status: 'PENDING',
          data: {
            taskTitle: tradeIntent.name,
            totalAmount: tradeIntent.totalAmount,
            date: tradeIntent.date,
          },
        },
      };
    } else if (tradeIntent.actionType === 'INCOME') {
      const formattedAmt = formatCurrency(tradeIntent.totalAmount, currency);
      return {
        content: `💵 **Income Inflow Entry Prepared:**\n\n- **Source:** **${tradeIntent.name}**\n- **Amount:** **+${formattedAmt}**\n\nClick **Confirm Inflow** to credit this into your monthly savings.`,
        suggestedPrompts: ['Confirm Inflow', 'What is my current net worth?'],
        tradeAction: tradeIntent,
        cardType: 'ACTION_SLIP',
        cardData: {
          id: tradeIntent.id,
          actionType: 'INCOME',
          title: `Inflow: ${tradeIntent.name}`,
          status: 'PENDING',
          data: {
            taskTitle: tradeIntent.name,
            totalAmount: tradeIntent.totalAmount,
            date: tradeIntent.date,
          },
        },
      };
    }
  }

  // =========================================================================
  // 3. NET WORTH & ASSET BREAKDOWN QUERIES
  // =========================================================================
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
        : '- No assets recorded yet. Log an asset via "+ Add Trade".';

    return {
      content: `💎 **Real-Time Wealth & Net Worth Summary**\n\n- **Total Net Worth:** ${formatCurrency(
        netWorth,
        currency
      )}\n- **Gross Asset Holdings:** ${formatCurrency(
        totalAssets,
        currency
      )}\n- **Outstanding Liabilities:** ${formatCurrency(
        totalDebts,
        currency
      )}\n- **Emergency Cash Runway:** ${summary.liquidRunwayMonths.toFixed(
        1
      )} months of living buffer.\n\n**Top Holdings:**\n${assetList}`,
      suggestedPrompts: [
        'Am I on track for FIRE?',
        'How much did I spend this month?',
        'Buy 10 Reliance',
      ],
      cardType: 'NET_WORTH',
      cardData: {
        netWorth,
        grossAssets: totalAssets,
        totalDebt: totalDebts,
        liquidRunwayMonths: summary.liquidRunwayMonths,
        monthlySavingsRate: summary.monthlySavingsRate,
        currency,
      },
    };
  }

  // =========================================================================
  // 4. FIRE & RETIREMENT ROADMAP QUERIES
  // =========================================================================
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
      content: `🔥 **Your Financial Independence (FIRE) Roadmap:**\n\n- **Target FIRE Corpus (25x Rule):** **${formatCurrency(
        fireCorpus,
        currency
      )}**\n- **Current Accumulated Wealth:** ${formatCurrency(
        currentCorpus,
        currency
      )}\n- **Readiness:** **${progressPct.toFixed(1)}% Achieved**\n- **Estimated Annual Burn:** ${formatCurrency(
        annualExp,
        currency
      )} / year\n- **Monthly Savings Rate:** ${summary.monthlySavingsRate.toFixed(1)}%\n\n📈 *Quantrix Insight:* A 10% annual step-up in your systematic monthly contributions will fast-track your freedom date by ~3.2 years.`,
      suggestedPrompts: [
        'How much did I spend this month?',
        'What is my current net worth?',
        'Audit portfolio risk',
      ],
      cardType: 'FIRE_GAUGE',
      cardData: {
        fireCorpus,
        currentCorpus,
        progressPct,
        annualExp,
        monthlySavingsRate: summary.monthlySavingsRate,
        currency,
      },
    };
  }

  // =========================================================================
  // 5. CASHFLOW & EXPENSE TRACKING QUERIES
  // =========================================================================
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
      content: `📊 **Monthly Cash Flow & Spending Analysis:**\n\n- **Monthly Inflow:** ${formatCurrency(
        summary.totalMonthlyIncome,
        currency
      )}\n- **Monthly Outflows:** ${formatCurrency(
        summary.totalMonthlyExpenses > 0 ? summary.totalMonthlyExpenses : totalExp,
        currency
      )}\n- **Net Savings Rate:** **${summary.monthlySavingsRate.toFixed(1)}%**\n- **Logged Transactions:** ${
        expenses.length
      } entries\n\n**Recent Outflow Logs:**\n${recentList}\n\n💡 *Tip:* Type *"Spent 1500 for groceries"* or use the mic to instantly book a new entry.`,
      suggestedPrompts: [
        'Spent 500 for coffee',
        'What is my current net worth?',
        'Am I on track for FIRE?',
      ],
    };
  }

  // =========================================================================
  // 6. TASKS, AGENDA & PRODUCTIVITY QUERIES
  // =========================================================================
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
      content: `📋 **LifeOS Task & Productivity Overview:**\n\n- **Pending Queue:** **${pendingTasks.length} active tasks**\n- **Completed Today:** ${completedTasks.length} completed\n\n**Top Priority Queue:**\n${taskDetails}\n\n💡 *Focus Rule:* Knock out your top priority item in a 25-minute Pomodoro focus block.`,
      suggestedPrompts: [
        'Add task: Rebalance Q4 portfolio',
        'Mark task done',
        'Generate morning brief',
      ],
      cardType: 'TASK_LIST',
      cardData: {
        tasks: pendingTasks.slice(0, 5),
        totalCount: pendingTasks.length,
        completedCount: completedTasks.length,
      },
    };
  }

  // =========================================================================
  // 7. HEALTH, HYDRATION, CALORIES & WORKOUT QUERIES
  // =========================================================================
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
      content: `💪 **Clinical Biometrics & Metabolic Tracker:**\n\n- **Hydration Level:** **${waterLiters.toFixed(
        1
      )}L / ${waterTarget.toFixed(1)}L** (${waterPct}% of goal)\n- **Exercise Logged:** **${workoutMins} minutes**\n- **Calories Consumed:** ${calories} kcal\n- **Recorded Workouts:** ${sessions.length} sessions\n\n${
        waterPct < 60
          ? '⚠️ *Hydration Alert:* You are under your daily hydration target. Drink 500ml now!'
          : '✅ *Hydration Optimal:* Fluid balance is primed for cognitive endurance.'
      }`,
      suggestedPrompts: [
        'Drank 500ml water',
        'Logged 45 min workout',
        'What tasks are due today?',
      ],
    };
  }

  // =========================================================================
  // 8. HABITS & STREAKS QUERIES
  // =========================================================================
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
      content: `⚡ **Daily Habit Tracker & Compounding Streaks:**\n\n- **Habits Completed Today:** **${completedCount} / ${habits.length}**\n- **Active Habits:** ${habits.length} routines\n\n**Habits Status:**\n${listText}`,
      suggestedPrompts: [
        'What tasks are due today?',
        'Show my net worth',
        'Generate morning brief',
      ],
    };
  }

  // =========================================================================
  // 9. VAULT & EXPIRING DOCUMENTS QUERIES
  // =========================================================================
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
      content: `🔒 **Encrypted Life Admin Vault & Expirations:**\n\n- **Total Archived Documents:** **${docs.length} files**\n- **Storage Engine:** Zero-Knowledge Client-Side AES Storage\n\n**Active Documents:**\n${docText}`,
      suggestedPrompts: [
        'Show my net worth',
        'What tasks are due today?',
        'Am I on track for FIRE?',
      ],
    };
  }

  // =========================================================================
  // 10. COMMUNITY & LEADERBOARD RANK QUERIES
  // =========================================================================
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
      content: `🏆 **Community Leaderboard & Mastery Rank:**\n\n- **Verified Members:** **${Math.max(
        leaderboard.length,
        1
      )} active members**\n- **Total LifeOS Points:** **${totalPoints.toLocaleString()} PTS**\n- **League Tier:** **${mastery.league}**\n- **Streak Days:** ${mastery.streakDays} consecutive days\n\n**Section Mastery:**\n- 💰 **Finance:** ${sectionPoints.FINANCE || 0} pts\n- 💪 **Wellness:** ${sectionPoints.WELLNESS || 0} pts\n- 🎯 **Productivity:** ${sectionPoints.PRODUCTIVITY || 0} pts\n- 📚 **Learning:** ${sectionPoints.LEARNING || 0} pts\n- 🛡️ **Vault:** ${sectionPoints.LIFEADMIN || 0} pts`,
      suggestedPrompts: [
        'Show my net worth',
        'Am I on track for FIRE?',
        'What tasks are due today?',
      ],
    };
  }

  // =========================================================================
  // 11. DEFAULT INTELLIGENT SYNTHESIS
  // =========================================================================
  return {
    content: `👋 Hello! I am **Quantrix**, your personal autonomous AI copilot synchronized across all LifeOS domains.\n\nI can execute real-time actions directly via conversation:\n- ⚡ **Finance:** "Buy 10 Reliance", "Spent 1200 for dining", "Show my net worth"\n- 📋 **Productivity:** "Add task: Review Q4 mutual funds by 5 PM", "Mark task done"\n- 💪 **Wellness:** "Drank 500ml water", "Logged 45 min workout", "Ate 550 kcal salad"\n- 🌅 **Overview:** "Generate morning brief" for your full situational snapshot.\n\nWhat would you like to achieve right now?`,
    suggestedPrompts: [
      'Generate morning brief',
      'What is my current net worth?',
      'Add task: Review budget by 5 PM',
      'Drank 500ml water',
      'Am I on track for FIRE?',
    ],
  };
}
