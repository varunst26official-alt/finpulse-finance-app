# 🌟 LifeOS — Personal Life Command Centre

> **An all-in-one personal operating system uniting Finances, Fitness & Clinical Nutrition, Deep Work Productivity, Learning Vault, and Critical Life Administration into a high-performance command platform.**

---

## ⚡ Core Life Workspaces

1. **⌂ Life Overview**
   - High-level daily dashboard with vitals, active priority tasks, and urgent goals.
   - 1-click rapid action logger (hydration station, workout logging, calorie intake, quick tasks).

2. **▤ Financial Portfolio**
   - Multi-asset net worth tracking (listed equities, fixed assets, real estate, debts, and insurance policies).
   - Real-time multi-currency engine supporting Indian Rupee (₹ INR), US Dollar ($ USD), and UAE Dirham (د.إ AED).
   - Cash flow projections, financial calendar, and PDF/CSV statement exports.

3. **♡ Fitness & Wellness**
   - **Clinical Biometrics Engine:** Mifflin-St Jeor formula calculating Resting BMR, Physical Activity Level (PAL), and Total Daily Energy Expenditure (TDEE).
   - **Exercise Movement Catalog:** Form cues, mechanics, and set-by-set tracker with tonnage calculation and rest countdown stopwatch.
   - **Hydration & Nutrition:** Animated water bottle hydration station ($35\text{ ml/kg}$ baseline) and macro targets (protein $1.8\text{--}2.2\text{ g/kg}$, carbs, healthy fats).

4. **☑ Productivity & Habits**
   - Daily checklist with urgency/impact priority tags.
   - Habit routine trackers with streak counters.
   - Integrated Deep Work & Pomodoro countdown focus stopwatch.
   - Cross-module master calendar integrating debt EMIs, SIPs, renewals, and tasks.

5. **▧ Learning & Knowledge Vault**
   - Skill competency roadmaps with verified hours tracking.
   - Integrated deep study stopwatch.
   - Books & courses vault with reading progress and notes.

6. **◇ Life Administration**
   - Encrypted document vault with expiration countdown warning badges.
   - Emergency medical & hospital readiness card with 1-click clipboard summary export.
   - Recurring annual legal, insurance, and tax checklists.

---

## 🤖 Adaptive AI Blueprint & Conversational Copilot

- **Adaptive Life Blueprint:** Input age, gender, height, weight, activity factor, and target goal to generate an automated personalized 7-day hypertrophy/strength workout split, macro targets, and daily meal plans.
- **Situational LifeOS AI Copilot:** Floating AI assistant with cross-domain situational awareness across all 6 workspaces.

---

## 🚀 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS v4, Framer Motion, Lucide Icons, Recharts, Zustand.
- **Backend:** Node.js, Express, SQLite 3 (sql.js WASM engine).
- **Deployment:** Vercel (Frontend SPA) + Railway / Render / Fly.io (Backend REST API).

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
cd server && npm install && cd ..
```

### 2. Start Frontend & Backend
```bash
# Terminal 1: Frontend Dev Server (port 5173)
npm run dev

# Terminal 2: Backend REST Server (port 5001)
npm run server
```

### 3. Build for Production
```bash
npm run build
```

---

## ☁️ Deployment to Vercel

1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New Project** and select this repository.
3. Vercel automatically detects the Vite framework settings from `package.json` and [`vercel.json`](./vercel.json).
4. Click **Deploy**!
