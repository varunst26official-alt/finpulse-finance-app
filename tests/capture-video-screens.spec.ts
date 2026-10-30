import { test, expect } from '@playwright/test';
import {
  INITIAL_ASSETS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_INCOMES,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_GOALS,
  INITIAL_HISTORY,
  INITIAL_AI_MESSAGES,
} from '../src/data/mockData';

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146';

test.describe('Capture Video Demo Screens with Varun Senthil kumar & Real-Time Values', () => {
  test('Capture all 7 screens with live non-zero data and Varun Senthil kumar as user', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // -------------------------------------------------------------
    // Screen 1: Minimalist Login Screen & 5-Slide Feature Carousel
    // -------------------------------------------------------------
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(1000);

    const demoBtn = page.locator('button:has-text("Instant Demo Access (Preloaded Portfolio)")');
    await expect(demoBtn).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_01_login_carousel.png` });

    // -------------------------------------------------------------
    // Setup Live Real-time Portfolio for Varun Senthil kumar
    // -------------------------------------------------------------
    await page.evaluate(({ assets, txns, exps, incs, calevs, goals, hist, aiMsgs }) => {
      const user = {
        id: 'demo_varun_senthil_kumar',
        fullName: 'Varun Senthil kumar',
        email: 'varun@quantra.io',
        investorType: 'HNI',
        joinedDate: 'Verified Pro Member',
      };

      const authData = {
        state: {
          user,
          isAuthenticated: true,
          isDemoMode: true,
          authModalOpen: false,
          authModalFeatureName: 'this feature',
          isLoading: false,
        },
        version: 0,
      };

      const debts = [
        {
          id: 'debt_demo_1',
          title: 'HDFC Priority Home Loan',
          category: 'HOME_LOAN',
          lender: 'HDFC Bank',
          originalPrincipal: 15000,
          currentOutstanding: 4500,
          interestRate: 8.55,
          monthlyEmi: 320,
          emiDueDay: 5,
          startDate: '2023-01-10',
          tenureMonths: 120,
          repayments: [],
        },
      ];

      const financeData = {
        assets,
        transactions: txns,
        expenses: exps,
        incomes: incs,
        calendarEvents: calevs,
        debts,
        policies: [],
        goals,
        emergencyTargetMonths: 6,
        history: hist,
        currency: 'INR',
        aiMessages: aiMsgs,
      };

      const lifeosData = {
        userInputs: {
          age: 28,
          gender: 'MALE',
          heightCm: 178,
          weightKg: 73.5,
          fitnessGoal: 'FAT_LOSS',
          intensityLevel: 'MODERATE_FITNESS',
          dietaryPreference: 'BALANCED_NON_VEG',
          workHoursPerDay: 8,
          riskProfile: 'AGGRESSIVE',
        },
        activeBlueprint: {
          protocolName: 'Joint-Friendly Low-Impact Fat Loss & Hypertrophy Split',
          dailyCaloriesTarget: 2200,
          dailyWaterTargetLiters: 3.0,
          dailyWorkoutMinutes: 45,
          splitSummary: '4-Day Hypertrophy & Fat Loss Protocol',
        },
        wellness: {
          heightCm: 178,
          weightKg: 73.5,
          targetWeightKg: 70,
          workoutMinutesLogged: 45,
          caloriesLogged: 1680,
          caloriesTarget: 2200,
          waterLitersLogged: 2.25,
          waterTargetLiters: 3.0,
          sleepHours: 7.5,
        },
        tasks: [
          {
            id: 'task_demo_1',
            title: 'Rebalance Q4 Equity & Index Fund Allocations',
            category: 'FINANCE',
            priority: 'HIGH',
            status: 'TODO',
            badgeLabel: 'High Priority',
            time: '11:00 AM',
            iconSymbol: '₹',
          },
          {
            id: 'task_demo_2',
            title: 'Morning Push Day: 45m Chest & Triceps Protocol',
            category: 'WELLNESS',
            priority: 'MEDIUM',
            status: 'COMPLETED',
            badgeLabel: 'Done',
            time: '07:30 AM',
            iconSymbol: '♡',
          },
          {
            id: 'task_demo_3',
            title: 'Log Daily Macro Protein & 3L Water Target',
            category: 'WELLNESS',
            priority: 'HIGH',
            status: 'TODO',
            badgeLabel: '2.25L / 3L',
            time: '02:00 PM',
            iconSymbol: '♡',
          },
          {
            id: 'task_demo_4',
            title: 'Review System Design Chapter 5: Distributed Caching',
            category: 'LEARNING',
            priority: 'MEDIUM',
            status: 'TODO',
            badgeLabel: 'In Progress',
            time: '05:30 PM',
            iconSymbol: '▧',
          },
          {
            id: 'task_demo_5',
            title: 'File Q3 Medical Insurance Claim Receipts into Vault',
            category: 'LIFEADMIN',
            priority: 'LOW',
            status: 'COMPLETED',
            badgeLabel: 'Archived',
            time: 'Yesterday',
            iconSymbol: '◇',
          },
        ],
        habits: [
          {
            id: 'hbt_1',
            title: 'Drink 3L Hydration Target',
            category: 'ANYTIME',
            streakCount: 14,
            isCompletedToday: false,
            icon: '💧',
          },
          {
            id: 'hbt_2',
            title: 'Morning 45-Min Workout',
            category: 'MORNING',
            streakCount: 8,
            isCompletedToday: true,
            icon: '⚡',
          },
          {
            id: 'hbt_3',
            title: 'Zero Unplanned Expense Day',
            category: 'EVENING',
            streakCount: 6,
            isCompletedToday: true,
            icon: '₹',
          },
          {
            id: 'hbt_4',
            title: 'Read 20 Pages Non-Fiction',
            category: 'AFTERNOON',
            streakCount: 21,
            isCompletedToday: false,
            icon: '📚',
          },
        ],
      };

      localStorage.setItem('lifeos-auth-storage', JSON.stringify(authData));
      localStorage.setItem('lifeos_usr_varun_quantra_io_finance', JSON.stringify(financeData));
      localStorage.setItem('lifeos_usr_varun_quantra_io_lifeos', JSON.stringify(lifeosData));

      const masteryData = {
        state: {
          sectionPoints: {
            FINANCE: 580,
            WELLNESS: 340,
            PRODUCTIVITY: 260,
            LEARNING: 140,
            LIFEADMIN: 100,
          },
          weeklyPoints: 426,
          streakDays: 21,
          lastActiveDate: new Date().toISOString().split('T')[0],
          league: 'DIAMOND',
          displayNameMode: 'REAL_NAME',
          customAlias: '@varun_sk',
          isGhostMode: false,
          badges: [
            {
              id: 'badge-fire-starter',
              name: 'FIRE Strategist',
              description: 'Calculated and modeled your financial independence number with annual step-up SIP.',
              category: 'FINANCE',
              icon: '🔥',
              color: '#d97706',
              requirementText: 'Run the FIRE Number Calculator',
              isUnlocked: true,
              progressPercent: 100,
              unlockedAt: 'Active',
            },
            {
              id: 'badge-budget-boss',
              name: 'Budget Disciplinarian',
              description: 'Maintained 0 negative cash flows across 10+ ledger entries.',
              category: 'FINANCE',
              icon: '💎',
              color: '#16836b',
              requirementText: 'Log 10 transactions within budget',
              isUnlocked: true,
              progressPercent: 100,
              unlockedAt: 'Active',
            },
            {
              id: 'badge-hydration-hero',
              name: 'Hydration Hero',
              description: 'Consistently achieved 2.5L daily water target.',
              category: 'WELLNESS',
              icon: '💧',
              color: '#0284c7',
              requirementText: 'Log 2.5L+ water today',
              isUnlocked: true,
              progressPercent: 100,
              unlockedAt: 'Active',
            },
            {
              id: 'badge-iron-discipline',
              name: 'Iron Habit',
              description: 'Maintained a 7-day continuous activity streak across fitness & workouts.',
              category: 'WELLNESS',
              icon: '⚡',
              color: '#d45b73',
              requirementText: 'Log 7 workout sessions',
              isUnlocked: true,
              progressPercent: 100,
              unlockedAt: 'Active',
            },
          ],
          pinnedBadgeIds: ['badge-fire-starter', 'badge-hydration-hero'],
          leaderboard: [
            {
              id: 'demo_varun_senthil_kumar',
              name: 'Varun Senthil kumar',
              alias: '@varun_sk',
              avatarSeed: 'varun senthil kumar',
              league: 'DIAMOND',
              rank: 1,
              totalPoints: 1420,
              weeklyPoints: 426,
              streakDays: 21,
              level: 6,
              sectionPoints: {
                FINANCE: 580,
                WELLNESS: 340,
                PRODUCTIVITY: 260,
                LEARNING: 140,
                LIFEADMIN: 100,
              },
              badges: ['badge-fire-starter', 'badge-budget-boss', 'badge-hydration-hero', 'badge-iron-discipline'],
              kudosCount: 24,
              statusMessage: 'Compounding wealth & daily habit discipline',
              location: 'HNI Member • Chennai, India',
              isCurrentUser: true,
            },
            {
              id: 'usr_raghav',
              name: 'Raghav',
              alias: '@raghav_invests',
              avatarSeed: 'raghav',
              league: 'PLATINUM',
              rank: 2,
              totalPoints: 1280,
              weeklyPoints: 384,
              streakDays: 19,
              level: 6,
              sectionPoints: {
                FINANCE: 520,
                WELLNESS: 280,
                PRODUCTIVITY: 260,
                LEARNING: 120,
                LIFEADMIN: 100,
              },
              badges: ['badge-fire-starter', 'badge-budget-boss'],
              kudosCount: 18,
              statusMessage: 'FIRE Portfolio compounding • 19d streak',
              location: 'Bangalore, India',
              isCurrentUser: false,
            },
            {
              id: 'usr_dharshini',
              name: 'Dharshini',
              alias: '@dharshini_wellness',
              avatarSeed: 'dharshini',
              league: 'GOLD',
              rank: 3,
              totalPoints: 1140,
              weeklyPoints: 342,
              streakDays: 14,
              level: 5,
              sectionPoints: {
                FINANCE: 380,
                WELLNESS: 420,
                PRODUCTIVITY: 210,
                LEARNING: 80,
                LIFEADMIN: 50,
              },
              badges: ['badge-hydration-hero', 'badge-iron-discipline'],
              kudosCount: 21,
              statusMessage: 'Consistent 3L hydration & strength protocol',
              location: 'Chennai, India',
              isCurrentUser: false,
            },
            {
              id: 'usr_shameer',
              name: 'Shameer',
              alias: '@shameer_quant',
              avatarSeed: 'shameer',
              league: 'GOLD',
              rank: 4,
              totalPoints: 980,
              weeklyPoints: 294,
              streakDays: 11,
              level: 4,
              sectionPoints: {
                FINANCE: 460,
                WELLNESS: 180,
                PRODUCTIVITY: 220,
                LEARNING: 90,
                LIFEADMIN: 30,
              },
              badges: ['badge-deep-work'],
              kudosCount: 12,
              statusMessage: 'Algorithmic rebalancing & deep work',
              location: 'Hyderabad, India',
              isCurrentUser: false,
            },
            {
              id: 'usr_krishna',
              name: 'Krishna',
              alias: '@krishna_builder',
              avatarSeed: 'krishna',
              league: 'SILVER',
              rank: 5,
              totalPoints: 860,
              weeklyPoints: 258,
              streakDays: 8,
              level: 4,
              sectionPoints: {
                FINANCE: 320,
                WELLNESS: 240,
                PRODUCTIVITY: 180,
                LEARNING: 70,
                LIFEADMIN: 50,
              },
              badges: ['badge-budget-boss'],
              kudosCount: 9,
              statusMessage: 'Building wealth runway step-by-step',
              location: 'Mumbai, India',
              isCurrentUser: false,
            },
          ],
          pointHistory: [],
          activeNotification: null,
          isLoadingLeaderboard: false,
        },
        version: 0,
      };

      localStorage.setItem('quantra-mastery-storage', JSON.stringify(masteryData));
    }, {
      assets: INITIAL_ASSETS,
      txns: INITIAL_TRANSACTIONS,
      exps: INITIAL_EXPENSES,
      incs: INITIAL_INCOMES,
      calevs: INITIAL_CALENDAR_EVENTS,
      goals: INITIAL_GOALS,
      hist: INITIAL_HISTORY,
      aiMsgs: INITIAL_AI_MESSAGES,
    });

    await page.reload();
    await page.waitForTimeout(1500);

    // Dismiss tour modal if visible
    const skipTour = page.locator('button[title="Skip Tour"]');
    if (await skipTour.isVisible()) {
      await skipTour.click();
      await page.waitForTimeout(500);
    }

    // Verify user avatar shows 'VS' and 'Varun' in header
    await expect(page.locator('text=Varun').first()).toBeVisible({ timeout: 5000 });

    // -------------------------------------------------------------
    // Screen 2: Personal Command Centre (Varun Senthil kumar Real-time Values)
    // -------------------------------------------------------------
    await page.waitForSelector('text=Finance net worth', { timeout: 5000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_02_command_centre_desktop.png` });

    // -------------------------------------------------------------
    // Screen 3: FIRE Calculator & Wealth Runway in Finance Section
    // -------------------------------------------------------------
    const financeNav = page.locator('button:has-text("Finance")').first();
    await financeNav.click();
    await page.waitForTimeout(1200);

    // Switch to Goals & FIRE subtab
    const goalsSubtab = page.locator('button:has-text("Goals & FIRE"), button:has-text("Goals"), button:has-text("FIRE")').first();
    if (await goalsSubtab.isVisible()) {
      await goalsSubtab.click();
      await page.waitForTimeout(1000);
    }

    // Scroll to the FIRE Calculator widget
    const fireWidget = page.locator('text=FIRE Number Calculator, text=Financial Independence Number').first();
    if (await fireWidget.isVisible()) {
      await fireWidget.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
    }

    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_03_fire_calculator.png` });

    // -------------------------------------------------------------
    // Screen 4: Quantrix AI Assistant with Live Real-time Synthesis
    // -------------------------------------------------------------
    const quantrixLauncher = page.locator('#tour-floating-copilot, button[aria-label="Toggle Quantrix Copilot"]');
    if (await quantrixLauncher.isVisible()) {
      await quantrixLauncher.click();
      await page.waitForTimeout(800);

      // Click prompt chip "🔥 FIRE Progress"
      const fireChip = page.locator('button:has-text("🔥 FIRE Progress"), button:has-text("FIRE Progress")').first();
      if (await fireChip.isVisible()) {
        await fireChip.click();
        await page.waitForTimeout(1800);
      }

      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_04_quantrix_ai_assistant.png` });

      // Close Quantrix widget
      const closeQuantrix = page.locator('button[aria-label="Close Assistant"], button:has(svg.lucide-x)').first();
      if (await closeQuantrix.isVisible()) {
        await closeQuantrix.click();
        await page.waitForTimeout(500);
      }
    }

    // -------------------------------------------------------------
    // Screen 5: Real-time Community Leaderboard & Gamification Ranks
    // -------------------------------------------------------------
    const communityNav = page.locator('button:has-text("Community & Ranks"), button:has-text("Community")').first();
    if (await communityNav.isVisible()) {
      await communityNav.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_05_community_leaderboard.png` });
    }

    // -------------------------------------------------------------
    // Screen 6: Smart Statement Ingestion Hub (Bank & Demat)
    // -------------------------------------------------------------
    await financeNav.click();
    await page.waitForTimeout(800);
    const smartIngestBtn = page.locator('button:has-text("Auto-Import"), button:has-text("Statement Hub"), button:has-text("Smart Ingestion")').first();
    if (await smartIngestBtn.isVisible()) {
      await smartIngestBtn.click();
      await page.waitForTimeout(1000);

      const sampleGpayBtn = page.locator('button:has-text("Google Pay"), button:has-text("CDSL & CAMS Demat"), button:has-text("Sample")').first();
      if (await sampleGpayBtn.isVisible()) {
        await sampleGpayBtn.click();
        await page.waitForTimeout(1200);
      }

      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_06_smart_ingestion_hub.png` });

      const closeHub = page.locator('button[aria-label="Close modal"], button:has(svg.lucide-x)').first();
      if (await closeHub.isVisible()) {
        await closeHub.click();
        await page.waitForTimeout(500);
      }
    }

    // -------------------------------------------------------------
    // Screen 7: Native Mobile Experience (390 x 844 Android Viewport)
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 390, height: 844 });
    const overviewNav = page.locator('button:has-text("Overview"), button:has-text("Life Overview")').first();
    if (await overviewNav.isVisible()) {
      await overviewNav.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_07_mobile_command_centre.png` });
  });
});
