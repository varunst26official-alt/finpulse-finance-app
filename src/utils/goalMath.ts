/**
 * Quantra Advanced Goal Compounding & Step-Up Mathematical Engine
 * Computes exact duration, projected achievement dates, and compounding wealth gains.
 */

export interface GoalAchievementProjection {
  monthsToTarget: number;
  years: number;
  remainingMonths: number;
  achievementDate: string; // ISO date YYYY-MM-DD
  formattedDuration: string; // e.g. "3 Years, 5 Months"
  achievementMonthYear: string; // e.g. "October 2029"
  totalInvested: number;
  wealthGain: number;
  projectedCorpus: number;
  withoutStepUpMonths: number;
  monthsSavedByStepUp: number;
  isAchievable: boolean;
}

/**
 * Calculates exact time required to reach a target corpus based on monthly contribution,
 * compound returns, and optional annual step-up contribution.
 */
export function calculateTimeToGoal(
  targetAmount: number,
  currentSaved: number = 0,
  initialMonthlyContribution: number,
  annualReturnRate: number = 12.0,
  annualStepUpPercent: number = 0,
  inflationAdjusted: boolean = false,
  annualInflationRate: number = 6.0
): GoalAchievementProjection {
  const now = new Date();

  // If already reached or target <= 0
  if (currentSaved >= targetAmount || targetAmount <= 0) {
    return {
      monthsToTarget: 0,
      years: 0,
      remainingMonths: 0,
      achievementDate: now.toISOString().split('T')[0],
      formattedDuration: 'Goal Achieved! 🎉',
      achievementMonthYear: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalInvested: currentSaved,
      wealthGain: 0,
      projectedCorpus: currentSaved,
      withoutStepUpMonths: 0,
      monthsSavedByStepUp: 0,
      isAchievable: true,
    };
  }

  // If contribution is 0, goal will only grow via currentSaved compounding
  const monthlyReturn = Math.max(0, annualReturnRate / 100 / 12);
  const monthlyInflation = Math.max(0, annualInflationRate / 100 / 12);
  const maxSimulationMonths = 480; // 40 years cap

  // 1. Simulate with Step-Up
  let corpus = currentSaved;
  let totalInvested = currentSaved;
  let monthsWithStepUp = -1;

  for (let m = 1; m <= maxSimulationMonths; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    const monthlyDeposit =
      initialMonthlyContribution * Math.pow(1 + annualStepUpPercent / 100, yearIndex);

    totalInvested += monthlyDeposit;
    corpus = (corpus + monthlyDeposit) * (1 + monthlyReturn);

    const threshold = inflationAdjusted
      ? targetAmount * Math.pow(1 + monthlyInflation, m)
      : targetAmount;

    if (corpus >= threshold) {
      monthsWithStepUp = m;
      break;
    }
  }

  // 2. Simulate without Step-Up (for comparative benefit calculation)
  let corpusNoStep = currentSaved;
  let monthsWithoutStepUp = -1;

  for (let m = 1; m <= maxSimulationMonths; m++) {
    corpusNoStep = (corpusNoStep + initialMonthlyContribution) * (1 + monthlyReturn);
    const threshold = inflationAdjusted
      ? targetAmount * Math.pow(1 + monthlyInflation, m)
      : targetAmount;

    if (corpusNoStep >= threshold) {
      monthsWithoutStepUp = m;
      break;
    }
  }

  const finalMonths = monthsWithStepUp > 0 ? monthsWithStepUp : maxSimulationMonths;
  const isAchievable = monthsWithStepUp > 0;

  const years = Math.floor(finalMonths / 12);
  const remainingMonths = finalMonths % 12;

  // Calculate target date
  const targetDateObj = new Date(now.getFullYear(), now.getMonth() + finalMonths, now.getDate());
  const isoDate = targetDateObj.toISOString().split('T')[0];
  const monthYearStr = targetDateObj.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const durationStr =
    years === 0
      ? `${remainingMonths} ${remainingMonths === 1 ? 'Month' : 'Months'}`
      : remainingMonths === 0
      ? `${years} ${years === 1 ? 'Year' : 'Years'}`
      : `${years} ${years === 1 ? 'Year' : 'Years'}, ${remainingMonths} ${
          remainingMonths === 1 ? 'Month' : 'Months'
        }`;

  const monthsSaved =
    annualStepUpPercent > 0 && monthsWithoutStepUp > 0 && monthsWithStepUp > 0
      ? Math.max(0, monthsWithoutStepUp - monthsWithStepUp)
      : 0;

  return {
    monthsToTarget: finalMonths,
    years,
    remainingMonths,
    achievementDate: isoDate,
    formattedDuration: durationStr,
    achievementMonthYear: monthYearStr,
    totalInvested: Math.round(totalInvested),
    wealthGain: Math.max(0, Math.round(corpus - totalInvested)),
    projectedCorpus: Math.round(corpus),
    withoutStepUpMonths: monthsWithoutStepUp > 0 ? monthsWithoutStepUp : maxSimulationMonths,
    monthsSavedByStepUp: monthsSaved,
    isAchievable,
  };
}
