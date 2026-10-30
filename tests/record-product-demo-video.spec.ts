import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
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
const OUTPUT_VIDEO_NAME = 'quantra_product_demo_30s.webm';

test.describe('Record Official Quantra 30s Product Demo Video', () => {
  test('Record high-definition 1080p 30-second live application video', async ({ browser }) => {
    test.setTimeout(120000);

    const videoDir = path.join(ARTIFACT_DIR, 'raw_video');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: videoDir,
        size: { width: 1920, height: 1080 },
      },
    });

    const page = await context.newPage();

    // Helper: smooth mouse movement
    const smoothMouseMove = async (startX: number, startY: number, targetX: number, targetY: number, steps = 18) => {
      for (let i = 1; i <= steps; i++) {
        const x = startX + ((targetX - startX) * i) / steps;
        const y = startY + ((targetY - startY) * i) / steps;
        await page.mouse.move(x, y);
        await page.waitForTimeout(14);
      }
    };

    // Helper: inject glowing pointer
    const injectGlowingCursor = async () => {
      await page.evaluate(() => {
        if (document.getElementById('quantra-demo-cursor')) return;
        const cursor = document.createElement('div');
        cursor.id = 'quantra-demo-cursor';
        cursor.style.position = 'fixed';
        cursor.style.width = '24px';
        cursor.style.height = '24px';
        cursor.style.borderRadius = '50%';
        cursor.style.backgroundColor = 'rgba(16, 185, 129, 0.75)';
        cursor.style.border = '2.5px solid #ffffff';
        cursor.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.9), 0 4px 10px rgba(0,0,0,0.35)';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '9999999';
        cursor.style.transition = 'transform 0.08s ease-out, background-color 0.15s, box-shadow 0.15s';
        cursor.style.transform = 'translate(-50%, -50%)';
        cursor.style.left = '960px';
        cursor.style.top = '540px';
        document.body.appendChild(cursor);

        window.addEventListener('mousemove', (e) => {
          cursor.style.left = `${e.clientX}px`;
          cursor.style.top = `${e.clientY}px`;
        });
        window.addEventListener('mousedown', () => {
          cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
          cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
          cursor.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.95)';
        });
        window.addEventListener('mouseup', () => {
          cursor.style.transform = 'translate(-50%, -50%) scale(1)';
          cursor.style.backgroundColor = 'rgba(16, 185, 129, 0.75)';
          cursor.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.9)';
        });
      });
    };

    // -------------------------------------------------------------
    // SCENE 1: Minimalist Login & Feature Carousel (0s – 5s)
    // -------------------------------------------------------------
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(600);
    await injectGlowingCursor();

    // Start cursor in center
    await page.mouse.move(960, 540);
    await page.waitForTimeout(600);

    // Glide toward "Instant Demo Access" button
    const demoBtn = page.locator('button:has-text("Instant Demo Access (Preloaded Portfolio)")');
    await expect(demoBtn).toBeVisible({ timeout: 5000 });
    const demoBox = await demoBtn.boundingBox();
    if (demoBox) {
      await smoothMouseMove(960, 540, demoBox.x + demoBox.width / 2, demoBox.y + demoBox.height / 2, 22);
      await page.waitForTimeout(300);
      await page.mouse.down();
      await page.waitForTimeout(120);
      await page.mouse.up();
    }

    // -------------------------------------------------------------
    // Inject Live State for Varun Senthil kumar & Community Cohort
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
          ],
          pinnedBadgeIds: ['badge-fire-starter'],
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
              badges: ['badge-fire-starter', 'badge-budget-boss'],
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
              badges: ['badge-fire-starter'],
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
              badges: [],
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
              badges: [],
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
              badges: [],
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
    await page.waitForTimeout(1000);
    await injectGlowingCursor();

    // Dismiss tour if present
    const skipTour = page.locator('button[title="Skip Tour"]');
    if (await skipTour.isVisible()) {
      await skipTour.click();
      await page.waitForTimeout(300);
    }

    // -------------------------------------------------------------
    // SCENE 2: Personal Command Centre (Varun Senthil kumar) (5s – 12s)
    // -------------------------------------------------------------
    await page.waitForSelector('text=Finance net worth', { timeout: 5000 });

    // Open User Profile in Header to show full Varun Senthil kumar details
    const profileBtn = page.locator('[data-testid="user-profile-button"]').first();
    const profBox = await profileBtn.boundingBox();
    if (profBox) {
      await smoothMouseMove(500, 300, profBox.x + profBox.width / 2, profBox.y + profBox.height / 2, 20);
      await page.waitForTimeout(200);
      await page.mouse.down();
      await page.waitForTimeout(100);
      await page.mouse.up();
      await page.waitForTimeout(700);

      // Close profile dropdown
      await page.mouse.down();
      await page.waitForTimeout(100);
      await page.mouse.up();
      await page.waitForTimeout(300);
    }

    // Move cursor to Net Worth card (₹25,82,450)
    const nwCard = page.locator('text=Finance net worth').first();
    const nwBox = await nwCard.boundingBox();
    if (nwBox) {
      await smoothMouseMove(profBox ? profBox.x : 500, profBox ? profBox.y : 100, nwBox.x + 80, nwBox.y + 20, 22);
      await page.waitForTimeout(700);
    }

    // Move cursor to water ring (2.25L / 3.0L)
    const waterCard = page.locator('text=Water intake, text=Hydration').first();
    if (await waterCard.isVisible()) {
      const wBox = await waterCard.boundingBox();
      if (wBox) {
        await smoothMouseMove(nwBox ? nwBox.x : 500, nwBox ? nwBox.y : 300, wBox.x + 50, wBox.y + 30, 18);
        await page.waitForTimeout(600);
      }
    }

    // -------------------------------------------------------------
    // SCENE 3: Finance Workspace & FIRE Calculator (12s – 19s)
    // -------------------------------------------------------------
    const navFinance = page.locator('#tour-section-switcher button:has-text("Finance")').first();
    const financeBox = await navFinance.boundingBox();
    if (financeBox) {
      await smoothMouseMove(600, 400, financeBox.x + 30, financeBox.y + 15, 20);
      await page.waitForTimeout(200);
      await page.mouse.down();
      await page.waitForTimeout(100);
      await page.mouse.up();
      await page.waitForTimeout(800);
    }

    // Click Goals & FIRE subtab
    const goalsTab = page.locator('button:has-text("Goals & FIRE"), button:has-text("Goals")').first();
    if (await goalsTab.isVisible()) {
      const goalsBox = await goalsTab.boundingBox();
      if (goalsBox) {
        await smoothMouseMove(financeBox ? financeBox.x : 300, financeBox ? financeBox.y : 100, goalsBox.x + 30, goalsBox.y + 15, 18);
        await page.waitForTimeout(150);
        await page.mouse.down();
        await page.waitForTimeout(100);
        await page.mouse.up();
        await page.waitForTimeout(600);
      }
    }

    // Scroll smoothly to FIRE Calculator
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
    await page.waitForTimeout(600);

    // Hover over FIRE Calculator widget
    const fireCard = page.locator('text=FIRE Number Calculator, text=Financial Independence Number').first();
    if (await fireCard.isVisible()) {
      const fireBox = await fireCard.boundingBox();
      if (fireBox) {
        await smoothMouseMove(600, 300, fireBox.x + 150, fireBox.y + 50, 22);
        await page.waitForTimeout(900);
      }
    }

    // -------------------------------------------------------------
    // SCENE 4: Quantrix AI Copilot In Action (19s – 24s)
    // -------------------------------------------------------------
    const quantrixLauncher = page.locator('#tour-floating-copilot, button[aria-label="Toggle Quantrix Copilot"]');
    if (await quantrixLauncher.isVisible()) {
      const qBox = await quantrixLauncher.boundingBox();
      if (qBox) {
        await smoothMouseMove(700, 400, qBox.x + qBox.width / 2, qBox.y + qBox.height / 2, 20);
        await page.waitForTimeout(200);
        await page.mouse.down();
        await page.waitForTimeout(100);
        await page.mouse.up();
        await page.waitForTimeout(800);

        // Click prompt chip "FIRE Progress"
        const fireChip = page.locator('button:has-text("FIRE Progress")').first();
        if (await fireChip.isVisible()) {
          const chipBox = await fireChip.boundingBox();
          if (chipBox) {
            await smoothMouseMove(qBox.x, qBox.y, chipBox.x + 40, chipBox.y + 15, 18);
            await page.waitForTimeout(150);
            await page.mouse.down();
            await page.waitForTimeout(100);
            await page.mouse.up();
            await page.waitForTimeout(1800);
          }
        }

        // Close Quantrix
        const closeBtn = page.locator('button[aria-label="Close Assistant"], button:has(svg.lucide-x)').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click({ force: true });
          await page.waitForTimeout(400);
        }
      }
    }

    // -------------------------------------------------------------
    // SCENE 5: Community Leaderboard & Gamification (24s – 30s)
    // -------------------------------------------------------------
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(300);

    const navCommunity = page.locator('#tour-section-switcher button:has-text("Community & Ranks")').first();
    const commBox = await navCommunity.boundingBox();
    if (commBox) {
      await smoothMouseMove(1000, 500, commBox.x + 40, commBox.y + 15, 20);
      await page.waitForTimeout(200);
      await page.mouse.down();
      await page.waitForTimeout(100);
      await page.mouse.up();
      await page.waitForTimeout(1000);
    }

    // Hover over Varun Senthil kumar at Rank #1
    const varunRow = page.locator('tr:has-text("Varun Senthil kumar"), div:has-text("Varun Senthil kumar")').first();
    if (await varunRow.isVisible()) {
      const vBox = await varunRow.boundingBox();
      if (vBox) {
        await smoothMouseMove(commBox ? commBox.x : 500, commBox ? commBox.y : 100, vBox.x + 150, vBox.y + 15, 20);
        await page.waitForTimeout(700);
      }
    }

    // Move to Raghav and click Kudos
    const kudosBtn = page.locator('button:has(svg.lucide-heart), button:has-text("Kudos")').nth(1);
    if (await kudosBtn.isVisible()) {
      const kBox = await kudosBtn.boundingBox();
      if (kBox) {
        await smoothMouseMove(600, 400, kBox.x + 15, kBox.y + 15, 20);
        await page.waitForTimeout(200);
        await page.mouse.down();
        await page.waitForTimeout(100);
        await page.mouse.up();
        await page.waitForTimeout(800);
      }
    }

    // Hold final majestic frame
    await page.waitForTimeout(1500);

    // Close context to flush video
    await page.close();
    await context.close();

    // Copy generated video to final destination
    const files = fs.readdirSync(videoDir);
    const videoFile = files.find((f) => f.endsWith('.webm'));
    if (videoFile) {
      const srcPath = path.join(videoDir, videoFile);
      const destPath = path.join(ARTIFACT_DIR, OUTPUT_VIDEO_NAME);
      fs.copyFileSync(srcPath, destPath);
      console.log(`[Success] Recorded official 30s Quantra Demo Video: ${destPath}`);
    }
  });
});
