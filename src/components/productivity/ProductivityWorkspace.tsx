import React, { useState, useEffect } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { useFinanceStore } from '@/stores/financeStore';
import { SectionHero } from '@/components/layout/SectionHero';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Calendar as CalendarIcon,
  Check,
  X,
  BrainCircuit,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeOSCategory, PriorityLevel } from '@/types/lifeos';
import { formatCurrency } from '@/utils/formatters';

export const ProductivityWorkspace: React.FC = () => {
  const {
    tasks,
    toggleTaskComplete,
    addTask,
    deleteTask,
    habits,
    addHabit,
    toggleHabit,
    deleteHabit,
    focusSessions,
    logFocusSession,
  } = useLifeOSStore();

  const { calendarEvents, debts, policies, currency } = useFinanceStore();

  // Active Sub-Tab: 'TASKS' | 'HABITS' | 'FOCUS_TIMER' | 'CALENDAR'
  const [subTab, setSubTab] = useState<'TASKS' | 'HABITS' | 'FOCUS_TIMER' | 'CALENDAR'>('TASKS');

  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  // New Task Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newCategory, setNewCategory] = useState<LifeOSCategory>('PRODUCTIVITY');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('MEDIUM');
  const [newNotes, setNewNotes] = useState('');

  // New Habit Modal
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState<'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME'>('MORNING');
  const [habitIcon, setHabitIcon] = useState('⚡');

  // Focus Timer State
  const [timerMode, setTimerMode] = useState<'POMODORO' | 'DEEP_WORK' | 'SHORT_BREAK'>('POMODORO');
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [focusTask, setFocusTask] = useState('Core Work Sprint');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Timer Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0) {
      setIsTimerRunning(false);
      const minutesLogged = timerMode === 'DEEP_WORK' ? 50 : timerMode === 'POMODORO' ? 25 : 5;
      logFocusSession({
        durationMinutes: minutesLogged,
        sessionType: timerMode,
        taskTitle: focusTask,
      });
      showToast(`🎉 Focus session completed: ${minutesLogged} minutes logged!`);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft, timerMode, focusTask, logFocusSession]);

  const switchTimerMode = (mode: 'POMODORO' | 'DEEP_WORK' | 'SHORT_BREAK') => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    if (mode === 'POMODORO') setTimerSecondsLeft(25 * 60);
    if (mode === 'DEEP_WORK') setTimerSecondsLeft(50 * 60);
    if (mode === 'SHORT_BREAK') setTimerSecondsLeft(5 * 60);
  };

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingCount = tasks.length - completedCount;

  // Filtered task items
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'PENDING' && t.status === 'COMPLETED') return false;
    if (filterStatus === 'COMPLETED' && t.status !== 'COMPLETED') return false;
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      priority: newPriority,
      status: 'TODO',
      badgeLabel: 'To do',
      notes: newNotes.trim() || undefined,
      iconSymbol:
        newCategory === 'FINANCE'
          ? '₹'
          : newCategory === 'WELLNESS'
          ? '♡'
          : newCategory === 'LEARNING'
          ? '▧'
          : newCategory === 'LIFEADMIN'
          ? '◇'
          : '☑',
    });

    setNewTitle('');
    setNewNotes('');
    setIsAddModalOpen(false);
    showToast(`Task "${newTitle.trim()}" added to agenda!`);
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    addHabit({
      title: habitTitle.trim(),
      category: habitCategory,
      icon: habitIcon,
    });

    setHabitTitle('');
    setIsHabitModalOpen(false);
    showToast(`Habit "${habitTitle.trim()}" added to daily routine!`);
  };

  // Cross-Module Unified Master Calendar Events Aggregator
  const aggregatedEvents = [
    ...calendarEvents.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      type: 'FINANCE' as const,
      amount: e.amount,
      badge: 'Financial Event',
    })),
    ...debts.map((d) => ({
      id: d.id,
      title: `EMI: ${d.title} (${d.lender})`,
      date: `Monthly (Day ${d.emiDueDay})`,
      type: 'FINANCE' as const,
      amount: d.monthlyEmi,
      badge: 'Debt EMI',
    })),
    ...policies.map((p) => ({
      id: p.id,
      title: `Renewal: ${p.policyName}`,
      date: p.renewalDueDate,
      type: 'LIFEADMIN' as const,
      amount: p.annualPremium,
      badge: 'Insurance Renewal',
    })),
    ...tasks.map((t) => ({
      id: t.id,
      title: t.title,
      date: t.time || 'Today',
      type: t.category,
      amount: 0,
      badge: t.priority + ' Priority',
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#17365d] text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-bold"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Indigo Hero Banner */}
      <SectionHero
        section="productivity"
        onPrimaryAction={() => setIsAddModalOpen(true)}
        primaryActionLabel="+ Add a Task"
        onSecondaryAction={() => setSubTab('CALENDAR')}
        secondaryActionLabel="Open Unified Calendar"
      />

      {/* 2. Top 4 Productivity Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Tasks due today</span>
            <div className="w-9 h-9 rounded-xl bg-[#edf0ff] text-[#5574d9] flex items-center justify-center font-bold text-sm">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {tasks.length}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Across all life areas</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {completedCount}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-bold">
            {Math.round((completedCount / Math.max(1, tasks.length)) * 100)}% daily completion rate
          </div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Pending actions</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {pendingCount}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Remaining to finish</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Active routines</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {habits.length}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">
            {habits.filter((h) => h.isCompletedToday).length} habits completed today
          </div>
        </article>
      </div>

      {/* 3. Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#e4e9f1] pb-2 text-xs font-bold">
        <button
          onClick={() => setSubTab('TASKS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'TASKS'
              ? 'bg-[#5574d9] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Task Checklist & Priorities</span>
        </button>
        <button
          onClick={() => setSubTab('HABITS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'HABITS'
              ? 'bg-[#5574d9] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Daily Habit Routines ({habits.length})</span>
        </button>
        <button
          onClick={() => setSubTab('FOCUS_TIMER')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'FOCUS_TIMER'
              ? 'bg-[#5574d9] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Deep Work Focus Timer</span>
        </button>
        <button
          onClick={() => setSubTab('CALENDAR')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'CALENDAR'
              ? 'bg-[#5574d9] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Unified Master Calendar</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: TASK CHECKLIST & ACTION BOARD                 */}
      {/* ======================================================== */}
      {subTab === 'TASKS' && (
        <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e4e9f1]">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
                Today's Focus & Action Checklist
              </h3>
              <p className="text-xs text-[#6f7c91]">
                Execute your high-priority items across finance, wellness, learning, and life administration
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#5574d9] hover:bg-[#435eb7] text-white text-xs font-bold transition-all shadow-md shadow-[#5574d9]/20 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Filters: Category & Priority */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 font-bold">
              {['ALL', 'FINANCE', 'WELLNESS', 'PRODUCTIVITY', 'LEARNING', 'LIFEADMIN'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-[#17365d] text-white'
                      : 'bg-slate-100 text-[#6f7c91] hover:text-[#243047]'
                  }`}
                >
                  {cat === 'ALL' ? 'All Areas' : cat.toLowerCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 p-1 rounded-xl">
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((pri) => (
                  <button
                    key={pri}
                    onClick={() => setFilterPriority(pri)}
                    className={`px-2 py-0.5 rounded-lg uppercase transition-all cursor-pointer ${
                      filterPriority === pri ? 'bg-amber-100 text-amber-800' : 'hover:bg-slate-200'
                    }`}
                  >
                    {pri}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                {(['ALL', 'PENDING', 'COMPLETED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                      filterStatus === st ? 'bg-[#5574d9] text-white' : 'hover:bg-slate-100'
                    }`}
                  >
                    {st.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="divide-y divide-[#e4e9f1] pt-2">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6f7c91]">
                No tasks match your selected filters. Click "+ Add Task" to create one.
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
                      onClick={() => toggleTaskComplete(task.id)}
                      className="shrink-0 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 hover:text-[#5574d9]" />
                      )}
                    </button>

                    <div className="w-9 h-9 rounded-xl bg-[#edf0ff] text-[#5574d9] font-bold text-sm flex items-center justify-center shrink-0">
                      {task.iconSymbol || '☑'}
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
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase ${
                            task.priority === 'HIGH'
                              ? 'bg-rose-50 text-rose-700'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority}
                        </span>
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

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition-all cursor-pointer p-1"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: DAILY HABIT ROUTINES & STREAKS (PHASE 4)      */}
      {/* ======================================================== */}
      {subTab === 'HABITS' && (
        <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#e4e9f1]">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Daily Habit Routines & Streak Tracking</span>
              </h3>
              <p className="text-xs text-[#6f7c91]">
                Build automatic life systems with daily streaks
              </p>
            </div>
            <button
              onClick={() => setIsHabitModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#5574d9] hover:bg-[#435eb7] text-white text-xs font-bold transition-all shadow-md shadow-[#5574d9]/20 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Habit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  habit.isCompletedToday
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      toggleHabit(habit.id);
                      showToast(habit.isCompletedToday ? 'Habit unchecked' : '🔥 Streak updated!');
                    }}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm transition-all cursor-pointer ${
                      habit.isCompletedToday
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-400 hover:border-emerald-500'
                    }`}
                  >
                    {habit.isCompletedToday ? <Check className="w-4 h-4" /> : habit.icon}
                  </button>

                  <div>
                    <div
                      className={`text-xs sm:text-sm font-bold ${
                        habit.isCompletedToday ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {habit.title}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                      {habit.category} Routine
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-extrabold flex items-center gap-1">
                    <span>🔥</span>
                    <span>{habit.streakCount} days</span>
                  </span>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer p-1"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: DEEP WORK FOCUS TIMER (PHASE 4)                */}
      {/* ======================================================== */}
      {subTab === 'FOCUS_TIMER' && (
        <section className="bg-white border border-[#e4e9f1] rounded-3xl p-8 shadow-xs max-w-2xl mx-auto space-y-6 text-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#edf0ff] text-[#5574d9] text-xs font-extrabold">
              🧠 Deep Work State
            </span>
            <h3 className="text-xl font-extrabold text-[#243047] mt-2">
              Focus Stopwatch & Session Logger
            </h3>
            <p className="text-xs text-[#6f7c91]">
              Zero interruptions. Eliminate context-switching and log high-output blocks.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
            <button
              onClick={() => switchTimerMode('POMODORO')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                timerMode === 'POMODORO' ? 'bg-white text-[#243047] shadow-xs' : 'text-slate-600'
              }`}
            >
              🍅 Pomodoro (25m)
            </button>
            <button
              onClick={() => switchTimerMode('DEEP_WORK')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                timerMode === 'DEEP_WORK' ? 'bg-white text-[#243047] shadow-xs' : 'text-slate-600'
              }`}
            >
              ⚡ Deep Work (50m)
            </button>
            <button
              onClick={() => switchTimerMode('SHORT_BREAK')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                timerMode === 'SHORT_BREAK' ? 'bg-white text-[#243047] shadow-xs' : 'text-slate-600'
              }`}
            >
              ☕ Rest Break (5m)
            </button>
          </div>

          {/* Giant Time Display */}
          <div className="py-6">
            <div className="text-6xl sm:text-7xl font-mono font-black text-[#17365d] tracking-tight">
              {Math.floor(timerSecondsLeft / 60)}:
              {(timerSecondsLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="mt-3">
              <input
                type="text"
                placeholder="What are you focusing on?"
                value={focusTask}
                onChange={(e) => setFocusTask(e.target.value)}
                className="text-center px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold max-w-sm w-full text-slate-800"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-6 py-3 rounded-2xl bg-[#5574d9] hover:bg-[#435eb7] text-white text-sm font-extrabold transition-all shadow-lg shadow-[#5574d9]/30 cursor-pointer flex items-center gap-2"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTimerRunning ? 'Pause Session' : 'Start Focus Sprint'}</span>
            </button>
            <button
              onClick={() => switchTimerMode(timerMode)}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Completed Focus Sessions */}
          {focusSessions.length > 0 && (
            <div className="pt-6 border-t border-slate-200 text-left space-y-2">
              <span className="text-xs font-bold text-slate-700">Recent Completed Focus Blocks:</span>
              <div className="divide-y divide-slate-100">
                {focusSessions.map((fs) => (
                  <div key={fs.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{fs.taskTitle || 'Focus Session'}</span>
                    <span className="font-mono text-emerald-600 font-bold">{fs.durationMinutes} min ({fs.sessionType})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 4: UNIFIED MASTER CALENDAR (PHASE 4)              */}
      {/* ======================================================== */}
      {subTab === 'CALENDAR' && (
        <section id="unified-calendar" className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e4e9f1] gap-2">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#5574d9]" />
                <span>Unified LifeOS Master Calendar</span>
              </h3>
              <p className="text-xs text-[#6f7c91]">
                Combines financial obligations, EMI dates, mutual fund SIPs, insurance renewals, and agenda tasks
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#edf0ff] text-[#5574d9] text-xs font-extrabold">
              {aggregatedEvents.length} scheduled occurrences
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {aggregatedEvents.map((evt) => (
              <div key={evt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                    {evt.type === 'FINANCE' ? '₹' : '☑'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{evt.title}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Due: {evt.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {evt.amount > 0 && (
                    <span className="font-mono font-bold text-slate-800">
                      {formatCurrency(evt.amount, currency)}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">
                    {evt.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e4e9f1] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-base text-[#243047]">Create New LifeOS Task</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Pay quarterly advance tax"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Time Schedule</label>
                    <input
                      type="text"
                      placeholder="e.g., 11:30 AM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as LifeOSCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="PRODUCTIVITY">Productivity & Habits</option>
                    <option value="FINANCE">Finance & Investments</option>
                    <option value="WELLNESS">Fitness & Wellness</option>
                    <option value="LEARNING">Learning & Growth</option>
                    <option value="LIFEADMIN">Life Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Checklist notes or URL link..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#5574d9] text-white font-bold"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {isHabitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e4e9f1] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-base text-[#243047]">Create Daily Habit Routine</h3>
                <button
                  onClick={() => setIsHabitModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateHabit} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Habit Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Read 20 pages of architecture books"
                    value={habitTitle}
                    onChange={(e) => setHabitTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Routine Category</label>
                    <select
                      value={habitCategory}
                      onChange={(e) => setHabitCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="MORNING">Morning Routine</option>
                      <option value="AFTERNOON">Afternoon Routine</option>
                      <option value="EVENING">Evening Routine</option>
                      <option value="ANYTIME">Anytime Routine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Emoji Icon</label>
                    <input
                      type="text"
                      value={habitIcon}
                      onChange={(e) => setHabitIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsHabitModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#5574d9] text-white font-bold"
                  >
                    Create Habit
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
