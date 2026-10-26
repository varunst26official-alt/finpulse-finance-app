import React from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { useFinanceStore } from '@/stores/financeStore';
import { SectionHero } from '@/components/layout/SectionHero';
import { formatCurrency } from '@/utils/formatters';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

export const LifeOverviewWorkspace: React.FC = () => {
  const {
    tasks,
    toggleTaskComplete,
    wellness,
    userInputs,
    activeBlueprint,
    setIsAiModalOpen,
    setCurrentSection,
    timePeriod,
    setTimePeriod,
  } = useLifeOSStore();

  const { goals, currency, getPortfolioSummary } = useFinanceStore();
  const summary = getPortfolioSummary();

  // Completed tasks count
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const remainingTasksCount = tasks.length - completedTasksCount;

  // Adult BMI calculation: Weight (kg) / [Height (m)]^2
  const heightM = wellness.heightCm / 100;
  const bmi = Math.round((wellness.weightKg / (heightM * heightM)) * 10) / 10;
  const bmiCategory =
    bmi < 18.5
      ? 'Underweight'
      : bmi < 25
      ? 'Normal'
      : bmi < 30
      ? 'Overweight'
      : 'Obesity';

  return (
    <div className="space-y-6">
      {/* 1. Gradient Hero Banner */}
      <SectionHero
        section="overview"
        onPrimaryAction={() => setIsAiModalOpen(true)}
        primaryActionLabel="✨ AI Adaptive Engine"
        onSecondaryAction={() => setCurrentSection('finance')}
        secondaryActionLabel="Open Finance Portfolio"
      />

      {/* Adaptive Blueprint Active Status Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f5eee3] via-[#fbf9f5] to-white border border-[#e8e0d1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#a47b3c] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#a47b3c]/20">
            <Sparkles className="w-4 h-4 text-[#f5eee3]" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#243047] flex items-center gap-2">
              <span>Personalized LifeOS Blueprint Active</span>
              <span className="px-2 py-0.5 rounded-full bg-[#f5eee3] text-[#a47b3c] text-[10px] font-bold">
                {userInputs.fitnessGoal.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-[#6f7c91] font-medium mt-0.5">
              Split: <strong className="text-slate-800">{activeBlueprint.workoutSplitName}</strong> · Daily Target: <strong className="text-slate-800">{activeBlueprint.targetCalories} kcal</strong> · Water: <strong className="text-slate-800">{activeBlueprint.dailyWaterTargetLiters} L</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-[#a47b3c] text-[#a47b3c] text-xs font-bold hover:bg-[#f5eee3] transition-all cursor-pointer shadow-xs whitespace-nowrap"
        >
          ⚡ Recalibrate Entire LifeOS
        </button>
      </div>

      {/* 2. Heading Row with Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#243047]">At a glance</h2>
          <p className="text-xs text-[#6f7c91]">
            A live summary across your personal life, finances, and wellness
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#e9edf4] p-1 rounded-xl self-start sm:self-auto text-xs font-bold text-[#6f7c91]">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                timePeriod === period
                  ? 'bg-white text-[#243047] shadow-xs'
                  : 'hover:text-[#243047]'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Metrics Grid (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Goals */}
        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs hover:border-[#a47b3c]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Active goals</span>
            <div className="w-9 h-9 rounded-xl bg-[#f5eee3] text-[#a47b3c] flex items-center justify-center font-bold text-sm">
              ◎
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {goals.length}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Across your life areas</div>
        </article>

        {/* Metric 2: Today's Tasks */}
        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs hover:border-[#a47b3c]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Today's tasks</span>
            <div className="w-9 h-9 rounded-xl bg-[#edf0ff] text-[#5574d9] flex items-center justify-center font-bold text-sm">
              ☑
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {completedTasksCount} / {tasks.length}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">
            {remainingTasksCount === 0 ? 'All tasks complete! 🎉' : `${remainingTasksCount} tasks remaining`}
          </div>
        </article>

        {/* Metric 3: Finance Snapshot */}
        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs hover:border-[#a47b3c]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Finance net worth</span>
            <div className="w-9 h-9 rounded-xl bg-[#e5f5ef] text-[#16836b] flex items-center justify-center font-bold text-sm">
              ▤
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {formatCurrency(summary.totalNetWorth, currency)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-bold">
            +{summary.pnlPercentage.toFixed(1)}% portfolio growth
          </div>
        </article>

        {/* Metric 4: Wellness Check-in */}
        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs hover:border-[#a47b3c]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Wellness check-in</span>
            <div className="w-9 h-9 rounded-xl bg-[#fdebf0] text-[#d45b73] flex items-center justify-center font-bold text-sm">
              ♡
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {wellness.workoutMinutesLogged > 0 ? 'Active' : 'Pending'}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">
            {wellness.workoutMinutesLogged}m workout · {wellness.waterLitersLogged}L water
          </div>
        </article>
      </div>

      {/* 4. Content Grid (1.35fr to 1fr) */}
      <div id="todays-plan" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Today's Priorities (1.35fr -> col-span-7) */}
        <section className="lg:col-span-7 bg-white border border-[#e4e9f1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#e4e9f1]">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
                  Today's priorities
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#f5eee3] text-[#a47b3c] text-[10px] font-extrabold">
                  {tasks.length} items
                </span>
              </div>
              <button
                onClick={() => setCurrentSection('productivity')}
                className="text-xs font-bold text-[#a47b3c] hover:underline cursor-pointer"
              >
                View all tasks →
              </button>
            </div>

            <div className="divide-y divide-[#e4e9f1]">
              {tasks.map((task) => {
                const isCompleted = task.status === 'COMPLETED';
                return (
                  <div
                    key={task.id}
                    className="py-3.5 flex items-center gap-3.5 group transition-colors"
                  >
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="shrink-0 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 hover:text-[#a47b3c]" />
                      )}
                    </button>

                    <div className="w-9 h-9 rounded-xl bg-[#f5f7fb] text-[#17365d] font-bold text-sm flex items-center justify-center shrink-0">
                      {task.iconSymbol || '◎'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isCompleted ? 'line-through text-slate-400' : 'text-[#243047]'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.time && (
                          <span className="text-[10px] font-semibold text-[#6f7c91]">
                            {task.time}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6f7c91] truncate mt-0.5 font-medium">
                        {task.notes}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700'
                          : task.badgeLabel === 'Planned'
                          ? 'bg-[#f5eee3] text-[#a47b3c]'
                          : task.badgeLabel === 'In progress'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.badgeLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#e4e9f1] flex items-center justify-between text-xs text-[#6f7c91]">
            <span>Click any check circle to update task completion</span>
            <button
              onClick={() => setCurrentSection('productivity')}
              className="text-[#a47b3c] font-bold hover:underline cursor-pointer"
            >
              + Add new task
            </button>
          </div>
        </section>

        {/* Right Panel: Goal Progress (1fr -> col-span-5) */}
        <section className="lg:col-span-5 bg-white border border-[#e4e9f1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#e4e9f1]">
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
                Goal progress
              </h3>
              <button
                onClick={() => setCurrentSection('finance')}
                className="text-xs font-bold text-[#a47b3c] hover:underline cursor-pointer"
              >
                Manage goals →
              </button>
            </div>

            <div className="divide-y divide-[#e4e9f1]">
              {goals.slice(0, 4).map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentSaved / Math.max(1, goal.targetAmount)) * 100));

                return (
                  <div key={goal.id} className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs sm:text-sm font-bold text-[#243047] truncate">
                        {goal.title}
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#f5eee3] text-[#a47b3c] shrink-0">
                        {percent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#6f7c91] font-medium">
                      <span>
                        {formatCurrency(goal.currentSaved, currency)} / {formatCurrency(goal.targetAmount, currency)}
                      </span>
                      <span>Target: {goal.targetDate.split('-')[0]}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 rounded-full bg-[#edf0f5] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-[#a47b3c] rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#e4e9f1] flex items-center justify-between text-xs">
            <span className="text-[#6f7c91]">Inflation-adjusted goals</span>
            <button
              onClick={() => setCurrentSection('finance')}
              className="text-[#a47b3c] font-bold hover:underline cursor-pointer"
            >
              + Create life goal
            </button>
          </div>
        </section>
      </div>

      {/* 5. Fitness & Nutrition Snapshot (Reference HTML Footer Row) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#243047]">
            Fitness & Nutrition snapshot
          </h3>
          <button
            onClick={() => setCurrentSection('wellness')}
            className="text-xs font-bold text-[#d45b73] hover:underline cursor-pointer"
          >
            Open wellness workspace →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <article className="bg-white border border-[#e4e9f1] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#6f7c91]">
              <span>Adult BMI</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px]">
                {bmiCategory}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#243047] mt-2">{bmi}</div>
            <div className="text-[11px] text-[#6f7c91] mt-0.5 font-medium">
              {wellness.heightCm} cm · {wellness.weightKg} kg
            </div>
          </article>

          <article className="bg-white border border-[#e4e9f1] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#6f7c91]">
              <span>Workout minutes</span>
              <span className="text-[10px] font-bold text-[#d45b73]">This week</span>
            </div>
            <div className="text-2xl font-extrabold text-[#243047] mt-2">
              {wellness.workoutMinutesLogged} min
            </div>
            <div className="text-[11px] text-[#6f7c91] mt-0.5 font-medium">
              Target: 150 min / week
            </div>
          </article>

          <article className="bg-white border border-[#e4e9f1] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#6f7c91]">
              <span>Nutrition logged</span>
              <span className="text-[10px] font-bold text-amber-600">Today</span>
            </div>
            <div className="text-2xl font-extrabold text-[#243047] mt-2">
              {wellness.caloriesLogged} kcal
            </div>
            <div className="text-[11px] text-[#6f7c91] mt-0.5 font-medium">
              Target: {wellness.caloriesTarget} kcal
            </div>
          </article>

          <article className="bg-white border border-[#e4e9f1] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#6f7c91]">
              <span>Water intake</span>
              <span className="text-[10px] font-bold text-sky-600">Hydration</span>
            </div>
            <div className="text-2xl font-extrabold text-[#243047] mt-2">
              {wellness.waterLitersLogged} L
            </div>
            <div className="text-[11px] text-[#6f7c91] mt-0.5 font-medium">
              Goal: {wellness.waterTargetLiters} L / day
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
