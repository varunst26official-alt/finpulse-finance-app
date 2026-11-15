# Quantra LifeOS — Regression Test Matrix

> **Version:** 1.0.0 (Phase 0 Baseline)  
> **Rule:** Every preserved feature must have either automated test coverage or a repeatable manual QA verification procedure.

---

## 1. Automated Test Suite Mapping

| Test Spec File | Domain / Workflow Covered | Test Count | Latest Status | Environment Profiles |
| :--- | :--- | :---: | :---: | :--- |
| `tests/gpay-calculation-reconciliation.spec.ts` | GPay statement inflow/outflow, zero-paise reconciliation, self-transfer isolation | 25 | `PASSED` | chromium, chrome, live, mobile-android, mobile-live |
| `tests/gpay-live-testing.spec.ts` | Real-world statement parsing (73 pages, 726 transactions) | 5 | `PASSED` | chromium, mobile-android |
| `tests/bank-statements-flow.spec.ts` | Bank CSV statement parser (HDFC, SBI, ICICI, Axis, Kotak) | 8 | `PASSED` | chromium, live |
| `tests/file-ingestion-deep.spec.ts` | Demat CAS PDF parsing, password handling, extraction pipeline | 6 | `PASSED` | chromium, live |
| `tests/smart-ingestion.spec.ts` | Ingestion modal lifecycle, staging review, duplicate alerts | 10 | `PASSED` | chromium, mobile-android |
| `tests/calendar-ledger-combined.spec.ts` | Unified Calendar and Transactions Ledger view switching | 6 | `PASSED` | chromium, live |
| `tests/event-secondary-filter.spec.ts` | Primary date range filter $\to$ Secondary dynamic merchant filter & charts | 8 | `PASSED` | chromium, mobile-android |
| `tests/finance.spec.ts` | Asset CRUD, Net Worth calculations, Holdings table, currency toggles | 12 | `PASSED` | chromium, live |
| `tests/auth.spec.ts` | Signup, login, JWT token persistence, session recovery | 6 | `PASSED` | chromium, live |
| `tests/demo-auth-flow.spec.ts` | Demo mode access, preloaded data isolation from authenticated users | 4 | `PASSED` | chromium, mobile-android |
| `tests/user-isolation.spec.ts` | Multi-user isolation, database user_id scoping, client storage namespaces | 8 | `PASSED` | chromium, live |
| `tests/user-persistence.spec.ts` | Local persistence resilience across reloads and offline states | 6 | `PASSED` | chromium, live |
| `tests/quantrix-bot.spec.ts` | Quantrix AI query parsing, action slips, voice command conversion | 10 | `PASSED` | chromium, mobile-android |
| `tests/mobile-fixes.spec.ts` | Mobile layout, touch targets ($44\text{px}$), viewport responsiveness | 12 | `PASSED` | mobile-android, mobile-live |
| `tests/mobile-live.spec.ts` | Live Android Capacitor WebView layout and navigation bar | 6 | `PASSED` | mobile-android |
| `tests/web-enhancements-flow.spec.ts` | Desktop layout, sidebar navigation, theme consistency | 8 | `PASSED` | chromium, live |
| `tests/navigation.spec.ts` | Top-level routing, browser back/forward, deep linking | 6 | `PASSED` | chromium, live |
| `tests/full-application-audit.spec.ts` | End-to-end audit across all 6 core workspaces | 18 | `PASSED` | chromium, live, mobile-android |

---

## 2. Mathematical Calculation Test Matrix

| Calculation / Formula | Valid Boundary Case | Edge / Zero Case | Negative / Error Case | Verification Tool |
| :--- | :--- | :--- | :--- | :--- |
| **Net Worth** | $V_{\text{gross}} - D_{\text{total}}$ | Assets = 0, Debt = 0 | Negative Net Worth (Debt > Assets) | Unit test / Playwright |
| **Paise Reconciliation** | Debits + Credits match exact file total | Empty statement (0 txns) | Quoted commas in numbers | `gpay-calculation-reconciliation.spec.ts` |
| **Amortization (Months to Free)**| Valid loan balance, interest, EMI | Principal = 0 $\to 0$ months | $\text{EMI} \le P \cdot r \to \infty$ handling | Unit test |
| **SIP Future Value** | $P=25\text{k}, r=12.5\%, n=10$ | $P=0 \to FV=0$ | Extreme inputs ($25\%$ p.a., 30 yrs) | `SipCalculator.tsx` |
| **FIRE Targets** | 25x Annual Expenses (4% SWR) | Expenses = 0 | High inflation vs return rate | `FireCalculatorWidget.tsx` |
| **Mifflin-St Jeor BMR** | Male / Female gender formulas | Age = 18, 100 | Height / Weight boundary checks | `adaptiveLifeEngine.ts` |
| **TDEE & PAL Multipliers** | Sedentary (1.25) to Beast (1.9) | Normal activity | Calorie floor ($1500\text{m} / 1250\text{f}$) | `adaptiveLifeEngine.ts` |
| **Hydration Target** | $35\text{ ml/kg} + \text{offset}$ | Weight = $45\text{kg}, 120\text{kg}$ | Max water intake caps | `adaptiveLifeEngine.ts` |
| **Workout Session Tonnage** | $\sum (\text{weight} \times \text{reps})$ | Bodyweight sets ($0\text{kg}$) | High volume ($>20\text{k kg}$) | `WellnessWorkspace.tsx` |

---

## 3. Manual QA Regression Protocol

Before any milestone is signed off, the following manual QA steps must be executed:
1. **Desktop Run:** Chrome / Edge at $1440\times 900$. Verify sidebar navigation, modals, charts, and drawer behavior.
2. **Tablet Run:** Viewport at $768\times 1024$. Verify horizontal overflow and collapsible sidebars.
3. **Android Mobile Run:** Viewport at $375\times 812$. Verify bottom navigation, touch targets, and hardware back button.
4. **State Persistence Test:** Reload page after adding an asset, logging a workout set, and completing a task; verify state remains identical.
5. **Session Isolation Test:** Open incognito window in Demo Mode; verify authenticated user data is completely invisible.
