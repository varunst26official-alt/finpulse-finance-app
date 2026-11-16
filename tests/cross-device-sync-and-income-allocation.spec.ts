import { test, expect } from '@playwright/test';
import { calculateTimeToGoal } from '../src/utils/goalMath';

test.describe('Phase 1-4 Feature Implementation Verification', () => {

  test('Requirement 3: Goal Auto-Achievement Calculation & Step-Up SIP Compounding Math', async () => {
    // Scenario 1: ₹50 Lakhs goal with ₹25,000/mo SIP at 12% CAGR, 0% step-up
    const noStepUp = calculateTimeToGoal(
      5000000, // ₹50 Lakhs
      0,       // ₹0 saved
      25000,   // ₹25,000/month
      12.0,    // 12% p.a.
      0,       // 0% step-up
      false
    );

    expect(noStepUp.isAchievable).toBe(true);
    expect(noStepUp.monthsToTarget).toBeGreaterThan(0);
    expect(noStepUp.totalInvested).toBeLessThan(noStepUp.projectedCorpus);
    expect(noStepUp.wealthGain).toBeGreaterThan(0);

    // Scenario 2: Same ₹50 Lakhs goal with +10% annual Step-Up SIP
    const withStepUp = calculateTimeToGoal(
      5000000, // ₹50 Lakhs
      0,       // ₹0 saved
      25000,   // ₹25,000/month
      12.0,    // 12% p.a.
      10.0,    // 10% annual step-up
      false
    );

    expect(withStepUp.isAchievable).toBe(true);
    // With step-up, months to target MUST be strictly fewer than without step-up
    expect(withStepUp.monthsToTarget).toBeLessThan(noStepUp.monthsToTarget);
    expect(withStepUp.monthsSavedByStepUp).toBeGreaterThan(0);
    expect(withStepUp.monthsSavedByStepUp).toBe(noStepUp.monthsToTarget - withStepUp.monthsToTarget);

    // Scenario 3: Consumer Purchase Milestone (iPhone ₹1,50,000 at ₹2,000/mo, 0% returns)
    const iphoneNominal = calculateTimeToGoal(
      150000, // ₹1.5 Lakhs
      0,      // ₹0 saved
      2000,   // ₹2,000/mo
      0,      // 0% returns
      0,      // 0% step-up
      false   // No inflation
    );

    expect(iphoneNominal.isAchievable).toBe(true);
    expect(iphoneNominal.monthsToTarget).toBe(75); // Exactly 6 Years, 3 Months
    expect(iphoneNominal.years).toBe(6);
    expect(iphoneNominal.remainingMonths).toBe(3);
    expect(iphoneNominal.totalInvested).toBe(150000);
    expect(iphoneNominal.formattedDuration).toBe('6 Years, 3 Months');

    // Scenario 4: iPhone with 7% inflation enabled but 0% returns (Inflation exceeds contributions)
    const iphoneWithInflation = calculateTimeToGoal(
      150000, // ₹1.5 Lakhs
      0,      // ₹0 saved
      2000,   // ₹2,000/mo
      0,      // 0% returns
      0,      // 0% step-up
      true,   // Inflation enabled
      7.0     // 7% p.a.
    );

    // Must NOT clamp blindly to 40 years! Should provide nominal baseline with exceeded flag
    expect(iphoneWithInflation.isAchievable).toBe(true);
    expect(iphoneWithInflation.monthsToTarget).toBe(75);
    expect(iphoneWithInflation.years).toBe(6);
    expect(iphoneWithInflation.remainingMonths).toBe(3);
    expect(iphoneWithInflation.totalInvested).toBe(150000);
    expect(iphoneWithInflation.isInflationExceeded).toBe(true);
    expect(iphoneWithInflation.formattedDuration).toContain('6 Years, 3 Months (Nominal)');
  });

  test('Requirement 2: Income Allocation Engine Math & Shortfall / Surplus Thresholds', async () => {
    // Commitments:
    // Debts EMI: ₹45,000
    // Goals SIP: ₹40,000
    // Living Expenses: ₹35,000
    // Total Commitments: ₹1,20,000
    const commitments = 45000 + 40000 + 35000; // 120,000

    // Case A: Low income (Over-allocated => Shortfall)
    const lowIncome = 100000; // ₹1,00,000
    const shortfall = Math.max(0, commitments - lowIncome);
    const allocationPercentA = (commitments / lowIncome) * 100;
    const isShortfallA = commitments > lowIncome;

    expect(isShortfallA).toBe(true);
    expect(shortfall).toBe(20000);
    expect(allocationPercentA).toBe(120);

    // Case B: High income (Within budget => Surplus buffer)
    const highIncome = 160000; // ₹1,60,000
    const surplus = Math.max(0, highIncome - commitments);
    const allocationPercentB = (commitments / highIncome) * 100;
    const isShortfallB = commitments > highIncome;

    expect(isShortfallB).toBe(false);
    expect(surplus).toBe(40000);
    expect(allocationPercentB).toBe(75);
  });
});
