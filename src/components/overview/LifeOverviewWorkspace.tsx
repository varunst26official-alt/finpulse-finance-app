import React, { useState } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { useFinanceStore } from '@/stores/financeStore';
import { SectionHero } from '@/components/layout/SectionHero';
import { formatCurrency } from '@/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Plus,
  X,
  Droplets,
  Dumbbell,
  Flame,
  ArrowRight,
  Clock,
  Target,
  Check,
} from 'lucide-react';
import { LifeOSCategory, PriorityLevel } from '@/types/lifeos';

export const LifeOverviewWorkspace: React.FC = () => {
  const {
    tasks,
    toggleTaskComplete,
    addTask,
    wellness,
    userInputs,
    activeBlueprint,
    setIsAiModalOpen,
    setCurrentSection,
    timePeriod,
    setTimePeriod,
    logWater,
    logWorkoutMinutes,
    logCalories,
  } = useLifeOSStore();

  const { goals, currency, getPortfolioSummary } = useFinanceStore();
  const summary = getPortfolioSummary();

  // Task filtering & creation state
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isQuickTaskModalOpen, setIsQuickTaskModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Task Form Inputs
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('09:00 AM');
  const [taskCategory, setTaskCategory] = useState<LifeOSCategory>('PRODUCTIVITY');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('MEDIUM');
  const [taskNotes, setTaskNotes] = useState('');

  // Toast trigger helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Completed tasks count
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const remainingTasksCount = tasks.length - completedTasksCount;

  // Filtered task items
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'PENDING' && t.status === 'COMPLETED') return false;
    if (taskFilter === 'COMPLETED' && t.status !== 'COMPLETED') return false;
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    return true;
  });

  // Adult BMI calculation: Weight (kg) / [Height (m)]^2
  const heightM = wellness.heightCm / 100;
  const bmi = Math.round((wellness.weightKg / (heightM * heightM)) * 10) / 10;
  const bmiCategory =
    bmi < 18.5
      ? { label: 'Underweight', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      : bmi < 25
      ? { label: 'Normal Weight', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      : bmi < 30
      ? { label: 'Overweight', color: 'text-orange-700 bg-orange-50 border-orange-200' }
      : { label: 'Obesity Range', color: 'text-rose-700 bg-rose-50 border-rose-200' };

  // Quick Add Task Handler
  const handleQuickCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      time: taskTime.trim() || undefined,
      category: taskCategory,
      priority: taskPriority,
      status: 'TODO',
      badgeLabel: 'To do',
      notes: taskNotes.trim() || undefined,
      iconSymbol:
        taskCategory === 'FINANCE'
          ? '₹'
          : taskCategory === 'WELLNESS'
          ? '♡'
          : taskCategory === 'LEARNING'
          ? '▧'
          : taskCategory === 'LIFEADMIN'
          ? '◇'
          : '☑',
    });

    setTaskTitle('');
    setTaskNotes('');
    setIsQuickTaskModalOpen(false);
    showToast(`Task "${taskTitle.trim()}" added to your day!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#17365d] text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-bold"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Gradient Hero Banner */}
      <SectionHero
        section="overview"
        onPrimaryAction={() => setIsAiModalOpen(true)}
        primaryActionLabel="✨ AI Adaptive Blueprint"
        onSecondaryAction={() => setIsQuickTaskModalOpen(true)}
        secondaryActionLabel="+ Quick Add Task"
      />

      {/* Adaptive Blueprint Active Status Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f5eee3] via-[#fbf9f5] to-white border border-[#e8e0d1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#a47b3c] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#a47b3c]/20">
            <Sparkles className="w-4 h-4 text-[#f5eee3]" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#243047] flex items-center gap-2">
              <span>Adaptive LifeOS Blueprint Active</span>
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
            A live summary across your personal life, finances, and wellness ({timePeriod} view)
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
              <Target className="w-4 h-4" />
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
              <Clock className="w-4 h-4" />
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
              ₹
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

      {/* 4. Interactive Quick-Action Drawer Bar */}
      <div
        id="tour-quick-actions"
        className="p-4 rounded-2xl bg-white border border-[#e4e9f1] shadow-xs flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#243047] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#a47b3c]" />
            <span>Quick Actions:</span>
          </span>
          <span className="text-[11px] text-[#6f7c91] hidden sm:inline">1-click logging to database</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Water quick log */}
          <button
            onClick={() => {
              logWater(0.25);
              showToast('+250ml Water Logged');
            }}
            className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-sky-200"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>+250ml</span>
          </button>
          <button
            onClick={() => {
              logWater(0.5);
              showToast('+500ml Water Logged');
            }}
            className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-sky-200"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>+500ml</span>
          </button>

          {/* Workout quick log */}
          <button
            onClick={() => {
              logWorkoutMinutes(15);
              showToast('+15m Workout Logged');
            }}
            className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-amber-200"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>+15m</span>
          </button>
          <button
            onClick={() => {
              logWorkoutMinutes(30);
              showToast('+30m Workout Logged');
            }}
            className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-amber-200"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>+30m</span>
          </button>

          {/* Calorie quick log */}
          <button
            onClick={() => {
              logCalories(300);
              showToast('+300 kcal Logged');
            }}
            className="px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-orange-200"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>+300 kcal</span>
          </button>

          {/* Add task button */}
          <button
            onClick={() => setIsQuickTaskModalOpen(true)}
            className="px-3 py-1 rounded-xl bg-[#17365d] hover:bg-[#204575] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 5. Content Grid (1.35fr to 1fr) */}
      <div id="todays-plan" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Today's Priorities (col-span-7) */}
        <section className="lg:col-span-7 bg-white border border-[#e4e9f1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e4e9f1] gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
                  Today's priorities
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#f5eee3] text-[#a47b3c] text-[10px] font-extrabold">
                  {tasks.length} items
                </span>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#f4f6fa] p-1 rounded-xl text-[11px] font-bold text-[#6f7c91]">
                {(['ALL', 'PENDING', 'COMPLETED'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTaskFilter(mode)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                      taskFilter === mode
                        ? 'bg-white text-[#243047] shadow-xs'
                        : 'hover:text-[#243047]'
                    }`}
                  >
                    {mode === 'ALL' ? 'All' : mode === 'PENDING' ? 'Pending' : 'Done'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-none text-[10px] font-bold">
              {['ALL', 'FINANCE', 'WELLNESS', 'PRODUCTIVITY', 'LEARNING', 'LIFEADMIN'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#17365d] text-white'
                      : 'bg-[#f4f6fa] text-[#6f7c91] hover:text-[#243047]'
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat.toLowerCase()}
                </button>
              ))}
            </div>

            {/* Task Items List */}
            <div className="divide-y divide-[#e4e9f1]">
              {filteredTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6f7c91]">
                  No tasks match the selected filters.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isCompleted = task.status === 'COMPLETED';
                  return (
                    <div
                      key={task.id}
                      className="py-3.5 flex items-center gap-3.5 group transition-colors"
                    >
                      <button
                        onClick={() => {
                          toggleTaskComplete(task.id);
                          showToast(isCompleted ? 'Marked as to-do' : 'Task completed! 🎉');
                        }}
                        className="shrink-0 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
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
                        {task.notes && (
                          <div className="text-[11px] text-[#6f7c91] truncate mt-0.5 font-medium">
                            {task.notes}
                          </div>
                        )}
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
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#e4e9f1] flex items-center justify-between text-xs text-[#6f7c91]">
            <span>Click circle to toggle completion state</span>
            <button
              onClick={() => setIsQuickTaskModalOpen(true)}
              className="text-[#a47b3c] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add new task</span>
            </button>
          </div>
        </section>

        {/* Right Panel: Goal Progress (col-span-5) */}
        <section className="lg:col-span-5 bg-white border border-[#e4e9f1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#e4e9f1]">
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
                Goal progress
              </h3>
              <button
                onClick={() => setCurrentSection('finance')}
                className="text-xs font-bold text-[#a47b3c] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Manage goals</span>
                <ArrowRight className="w-3.5 h-3.5" />
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

      {/* 6. Fitness & Nutrition Snapshot (Reference HTML Footer Row) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#243047]">
            Fitness & Nutrition snapshot
          </h3>
          <button
            onClick={() => setCurrentSection('wellness')}
            className="text-xs font-bold text-[#d45b73] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Open wellness workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <article className="bg-white border border-[#e4e9f1] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#6f7c91]">
              <span>Adult BMI</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${bmiCategory.color}`}>
                {bmiCategory.label}
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

      {/* Quick Add Task Modal */}
      <AnimatePresence>
        {isQuickTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e4e9f1] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-base text-[#243047] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#a47b3c]" />
                  <span>Add New Task to Today</span>
                </h3>
                <button
                  onClick={() => setIsQuickTaskModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuickCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Review mutual fund portfolios"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#17365d]/20 focus:border-[#17365d]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Time Schedule
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 10:00 AM"
                      value={taskTime}
                      onChange={(e) => setTaskTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#17365d]/20 focus:border-[#17365d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as PriorityLevel)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-hidden focus:ring-2 focus:ring-[#17365d]/20 focus:border-[#17365d]"
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    LifeOS Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as LifeOSCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-hidden focus:ring-2 focus:ring-[#17365d]/20 focus:border-[#17365d]"
                  >
                    <option value="PRODUCTIVITY">Productivity & Habits</option>
                    <option value="FINANCE">Finance & Investments</option>
                    <option value="WELLNESS">Fitness & Wellness</option>
                    <option value="LEARNING">Learning & Growth</option>
                    <option value="LIFEADMIN">Life Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notes & Action Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short description or checklist note..."
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#17365d]/20 focus:border-[#17365d]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsQuickTaskModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#17365d] hover:bg-[#204575] text-white text-xs font-bold transition-all shadow-md shadow-[#17365d]/20 cursor-pointer"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
