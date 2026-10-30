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

test.describe('Complete Web App Desktop Screens (Varun Senthil kumar & Live Cohort)', () => {
  test('Capture all web app screens at 1920x1080', async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1920, height: 1080 });

    // -------------------------------------------------------------
    // Screen 01: Minimalist Login & 5-Slide Feature Carousel
    // -------------------------------------------------------------
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(800);

    const demoBtn = page.locator('button:has-text("Instant Demo Access (Preloaded Portfolio)")');
    await expect(demoBtn).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_01_web_login_carousel.png` });

    // -------------------------------------------------------------
    // Inject Live Real-Time Data for Varun Senthil kumar & Cohort
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
          originalPrincipal: 1500000,
          currentOutstanding: 450000,
          interestRate: 8.55,
          monthlyEmi: 32000,
          emiDueDay: 5,
          startDate: '2023-01-10',
          tenureMonths: 120,
          repayments: [],
        },
      ];

      const policies = [
        {
          id: 'pol_1',
          title: 'HDFC Ergo Optima Secure Health Shield',
          category: 'HEALTH',
          policyNumber: 'HE-9842-SEC',
          provider: 'HDFC Ergo General Insurance',
          sumInsured: 2500000,
          annualPremium: 22400,
          renewalDate: '2027-04-15',
          status: 'ACTIVE',
          nominee: 'Family Trust',
        },
        {
          id: 'pol_2',
          title: 'Tata AIA Sampoorna Raksha Term Plan',
          category: 'TERM_LIFE',
          policyNumber: 'TATA-7741-LIFE',
          provider: 'Tata AIA Life Insurance',
          sumInsured: 20000000,
          annualPremium: 31500,
          renewalDate: '2027-08-20',
          status: 'ACTIVE',
          nominee: 'Primary Nominee',
        },
      ];

      const financeData = {
        assets,
        transactions: txns,
        expenses: exps,
        incomes: incs,
        calendarEvents: calevs,
        debts,
        policies,
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
          workoutSplitName: 'Hypertrophy & Fat Loss Split (Push / Pull / Legs)',
          dailyCaloriesTarget: 2200,
          targetCalories: 2200,
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
            iconSymbol: '💪',
          },
          {
            id: 'task_demo_3',
            title: 'Log Daily Macro Protein & 3L Water Target',
            category: 'WELLNESS',
            priority: 'HIGH',
            status: 'TODO',
            badgeLabel: '2.25L / 3L',
            time: '02:00 PM',
            iconSymbol: '💧',
          },
          {
            id: 'task_demo_4',
            title: 'Review System Design Chapter 5: Distributed Caching',
            category: 'LEARNING',
            priority: 'MEDIUM',
            status: 'TODO',
            badgeLabel: 'In Progress',
            time: '05:30 PM',
            iconSymbol: '📖',
          },
          {
            id: 'task_demo_5',
            title: 'File Q3 Medical Insurance Claim Receipts into Vault',
            category: 'LIFEADMIN',
            priority: 'LOW',
            status: 'COMPLETED',
            badgeLabel: 'Archived',
            time: 'Yesterday',
            iconSymbol: '🛡️',
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
            icon: '💎',
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
        documents: [
          {
            id: 'doc_1',
            title: 'Republic of India Passport (Varun)',
            category: 'ID_CARD',
            documentNumber: 'Z5849301',
            expiryDate: '2032-11-14',
            issuingAuthority: 'MEA India',
            isSecured: true,
          },
          {
            id: 'doc_2',
            title: 'Permanent Account Number (PAN Card)',
            category: 'TAX_RECORD',
            documentNumber: 'ABCDE1234F',
            expiryDate: '2099-12-31',
            issuingAuthority: 'Income Tax Dept',
            isSecured: true,
          },
          {
            id: 'doc_3',
            title: 'Comprehensive Vehicle Policy (MH-02)',
            category: 'VEHICLE',
            documentNumber: 'POL-ICICI-9921',
            expiryDate: '2027-05-18',
            issuingAuthority: 'ICICI Lombard',
            isSecured: true,
          },
        ],
      };

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

      localStorage.setItem('lifeos-auth-storage', JSON.stringify(authData));
      localStorage.setItem('lifeos_usr_varun_quantra_io_finance', JSON.stringify(financeData));
      localStorage.setItem('lifeos_usr_varun_quantra_io_lifeos', JSON.stringify(lifeosData));
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
      await page.waitForTimeout(400);
    }

    // Verify user avatar
    await expect(page.locator('text=Varun').first()).toBeVisible({ timeout: 5000 });

    // =============================================================
    // 1. WEB APP: LIFE OVERVIEW (COMMAND CENTRE)
    // =============================================================
    await page.waitForSelector('text=Finance net worth', { timeout: 5000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_02_web_life_overview.png` });

    // =============================================================
    // 2. WEB APP: FINANCE WORKSPACE & SUBTABS
    // =============================================================
    const navFinance = page.locator('#tour-section-switcher button:has-text("Finance")').first();
    await navFinance.click({ force: true });
    await page.waitForTimeout(800);

    // Screen 03: Finance Overview (StatCards, Net Worth Chart, Allocation Donut)
    const subOverview = page.locator('button:has-text("Overview")').nth(1);
    if (await subOverview.isVisible()) await subOverview.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_03_web_finance_overview.png` });

    // Screen 04: Finance Holdings Table
    const subHoldings = page.locator('button:has-text("Holdings")').first();
    if (await subHoldings.isVisible()) {
      await subHoldings.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_04_web_finance_holdings.png` });
    }

    // Screen 05: Finance Calendar & Ledger
    const subCalendar = page.locator('button:has-text("Calendar & Ledger"), button:has-text("Calendar")').first();
    if (await subCalendar.isVisible()) {
      await subCalendar.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_05_web_finance_calendar_ledger.png` });
    }

    // Screen 06: Finance Commitments - Debts
    const subCommitments = page.locator('button:has-text("Commitments Vault"), button:has-text("Commitments")').first();
    if (await subCommitments.isVisible()) {
      await subCommitments.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_06_web_finance_commitments_debts.png` });

      // Screen 07: Finance Commitments - Insurance
      const tabInsurance = page.locator('button:has-text("Insurance")').first();
      if (await tabInsurance.isVisible()) {
        await tabInsurance.click({ force: true });
        await page.waitForTimeout(600);
        await page.screenshot({ path: `${ARTIFACT_DIR}/screen_07_web_finance_commitments_insurance.png` });
      }
    }

    // Screen 08: Finance Goals & FIRE Calculator
    const subGoals = page.locator('button:has-text("Goals & FIRE"), button:has-text("Goals")').first();
    if (await subGoals.isVisible()) {
      await subGoals.click({ force: true });
      await page.waitForTimeout(600);
      const fireWidget = page.locator('text=FIRE Number Calculator, text=Financial Independence Number').first();
      if (await fireWidget.isVisible()) await fireWidget.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_08_web_finance_fire_calculator.png` });
    }

    // Screen 09: Smart Statement Ingestion Hub Modal
    const smartIngestBtn = page.locator('button:has-text("Statement Hub"), button:has-text("Auto-Import"), button:has-text("Smart Ingestion")').first();
    if (await smartIngestBtn.isVisible()) {
      await smartIngestBtn.click({ force: true });
      await page.waitForTimeout(700);
      const sampleBtn = page.locator('button:has-text("Google Pay"), button:has-text("Sample")').first();
      if (await sampleBtn.isVisible()) await sampleBtn.click({ force: true });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_09_web_finance_smart_ingestion_hub.png` });
      const closeHub = page.locator('button[aria-label="Close modal"], button:has(svg.lucide-x)').first();
      if (await closeHub.isVisible()) await closeHub.click({ force: true });
      await page.waitForTimeout(400);
    }

    // =============================================================
    // 3. WEB APP: FITNESS & WELLNESS WORKSPACE
    // =============================================================
    const navWellness = page.locator('#tour-section-switcher button:has-text("Fitness & Wellness")').first();
    await navWellness.click({ force: true });
    await page.waitForTimeout(800);

    // Screen 10: Wellness Overview & Daily Metrics (Hydration 2.25L, Sleep, Calories, BMI)
    const wellOverviewTab = page.locator('button:has-text("Wellness Overview & Metrics"), button:has-text("Wellness Overview")').first();
    if (await wellOverviewTab.isVisible()) await wellOverviewTab.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_10_web_wellness_overview.png` });

    // Screen 11: Wellness Workouts & Movement Catalog
    const wellWorkoutsTab = page.locator('button:has-text("Workouts")').first();
    if (await wellWorkoutsTab.isVisible()) {
      await wellWorkoutsTab.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_11_web_wellness_workouts.png` });
    }

    // Screen 12: Wellness Clinical Nutrition & Meal Planner
    const wellNutritionTab = page.locator('button:has-text("Nutrition")').first();
    if (await wellNutritionTab.isVisible()) {
      await wellNutritionTab.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_12_web_wellness_nutrition.png` });
    }

    // =============================================================
    // 4. WEB APP: PRODUCTIVITY WORKSPACE
    // =============================================================
    const navProd = page.locator('#tour-section-switcher button:has-text("Productivity")').first();
    await navProd.click({ force: true });
    await page.waitForTimeout(800);

    // Screen 13: Tasks Checklist & Action Board
    const prodTasksTab = page.locator('button:has-text("Tasks"), button:has-text("Action Checklist")').first();
    if (await prodTasksTab.isVisible()) await prodTasksTab.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_13_web_productivity_tasks.png` });

    // Screen 14: Habits Routines & Streaks
    const prodHabitsTab = page.locator('button:has-text("Habits")').first();
    if (await prodHabitsTab.isVisible()) {
      await prodHabitsTab.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_14_web_productivity_habits.png` });
    }

    // Screen 15: Deep Work Focus Timer
    const prodFocusTab = page.locator('button:has-text("Focus Timer")').first();
    if (await prodFocusTab.isVisible()) {
      await prodFocusTab.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_15_web_productivity_focus_timer.png` });
    }

    // Screen 16: Unified Master Calendar
    const prodCalendarTab = page.locator('button:has-text("Calendar"), button:has-text("Unified Calendar")').first();
    if (await prodCalendarTab.isVisible()) {
      await prodCalendarTab.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_16_web_productivity_calendar.png` });
    }

    // =============================================================
    // 5. WEB APP: LEARNING & CAREER WORKSPACE
    // =============================================================
    const navLearning = page.locator('#tour-section-switcher button:has-text("Learning & Career")').first();
    await navLearning.click({ force: true });
    await page.waitForTimeout(800);

    // Screen 17: Competency Roadmaps & Skill Trees
    const learnSkillsTab = page.locator('button:has-text("Skill Trees"), button:has-text("Skills")').first();
    if (await learnSkillsTab.isVisible()) await learnSkillsTab.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_17_web_learning_skills.png` });

    // Screen 18: Live Study Stopwatch & Logger
    const learnTimerTab = page.locator('button:has-text("Study Stopwatch"), button:has-text("Study Timer")').first();
    if (await learnTimerTab.isVisible()) {
      await learnTimerTab.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_18_web_learning_study_timer.png` });
    }

    // Screen 19: Books & Course Vault
    const learnBooksTab = page.locator('button:has-text("Books")').first();
    if (await learnBooksTab.isVisible()) {
      await learnBooksTab.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_19_web_learning_books.png` });
    }

    // =============================================================
    // 6. WEB APP: LIFE ADMINISTRATION WORKSPACE
    // =============================================================
    const navLifeAdmin = page.locator('#tour-section-switcher button:has-text("Life Administration")').first();
    await navLifeAdmin.click({ force: true });
    await page.waitForTimeout(800);

    // Screen 20: Encrypted Document Vault & Expiry Reminders
    const adminVaultTab = page.locator('button:has-text("Document Vault"), button:has-text("Vault")').first();
    if (await adminVaultTab.isVisible()) await adminVaultTab.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_20_web_lifeadmin_vault.png` });

    // Screen 21: Emergency Medical & ICE Contact Card
    const adminEmergencyTab = page.locator('button:has-text("Emergency Card"), button:has-text("Emergency")').first();
    if (await adminEmergencyTab.isVisible()) {
      await adminEmergencyTab.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_21_web_lifeadmin_emergency.png` });
    }

    // Screen 22: Recurring Life Admin & Vehicle Checklists
    const adminChecklistsTab = page.locator('button:has-text("Checklists")').first();
    if (await adminChecklistsTab.isVisible()) {
      await adminChecklistsTab.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_22_web_lifeadmin_checklists.png` });
    }

    // =============================================================
    // 7. WEB APP: COMMUNITY & GAMIFICATION WORKSPACE
    // =============================================================
    const navCommunity = page.locator('#tour-section-switcher button:has-text("Community & Ranks")').first();
    await navCommunity.click({ force: true });
    await page.waitForTimeout(1000);

    // Screen 23: Community Leaderboard (Varun Senthil kumar #1, Raghav #2, Dharshini #3, Shameer #4, Krishna #5)
    await page.screenshot({ path: `${ARTIFACT_DIR}/screen_23_web_community_leaderboard.png` });

    // Screen 24: Badges & Achievement Showcase Shelf
    const badgesSection = page.locator('text=Achievement Shelf, text=Badges & Milestones').first();
    if (await badgesSection.isVisible()) {
      await badgesSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_24_web_community_badges.png` });
    }

    // =============================================================
    // 8. WEB APP: QUANTRIX AI ASSISTANT (FLOATING COPILOT)
    // =============================================================
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const quantrixLauncher = page.locator('#tour-floating-copilot, button[aria-label="Toggle Quantrix Copilot"]');
    if (await quantrixLauncher.isVisible()) {
      await quantrixLauncher.click({ force: true });
      await page.waitForTimeout(800);

      const fireChip = page.locator('button:has-text("FIRE Progress")').first();
      if (await fireChip.isVisible()) {
        await fireChip.click({ force: true });
        await page.waitForTimeout(1800);
      }

      // Screen 25: Quantrix AI Copilot In Action
      await page.screenshot({ path: `${ARTIFACT_DIR}/screen_25_web_quantrix_ai_assistant.png` });

      const closeQuantrix = page.locator('button[aria-label="Close Assistant"], button:has(svg.lucide-x)').first();
      if (await closeQuantrix.isVisible()) await closeQuantrix.click({ force: true });
      await page.waitForTimeout(400);
    }
  });
});
