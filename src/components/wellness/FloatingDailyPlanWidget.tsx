import React, { useState, useEffect } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { MealItem, WorkoutRoutineDay } from '@/services/adaptiveLifeEngine';
import {
  Dumbbell,
  Apple,
  Flame,
  Droplets,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  Activity,
  Heart,
  Timer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WEEKDAYS = [
  { key: 'Monday', short: 'Mon', index: 1 },
  { key: 'Tuesday', short: 'Tue', index: 2 },
  { key: 'Wednesday', short: 'Wed', index: 3 },
  { key: 'Thursday', short: 'Thu', index: 4 },
  { key: 'Friday', short: 'Fri', index: 5 },
  { key: 'Saturday', short: 'Sat', index: 6 },
  { key: 'Sunday', short: 'Sun', index: 0 },
];

export const FloatingDailyPlanWidget: React.FC = () => {
  const {
    activeBlueprint,
    userInputs,
    wellness,
    mealLogs,
    workoutSessions,
    addMealLog,
    logWorkoutMinutes,
    logWater,
    setIsAiModalOpen,
  } = useLifeOSStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'WORKOUT' | 'DIET'>('ALL');

  // Determine current day of the week
  const todayDate = new Date();
  const currentDayIndex = todayDate.getDay(); // 0 is Sunday, 1 is Monday...
  const todayWeekday = WEEKDAYS.find((d) => d.index === currentDayIndex) || WEEKDAYS[0];
  const [selectedDay, setSelectedDay] = useState<string>(todayWeekday.key);

  const todayStr = todayDate.toISOString().split('T')[0];

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Rest timer tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && restSeconds !== null && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restSeconds === 0) {
      setTimerRunning(false);
      showNotification('⏰ Rest period finished! Ready for next set.');
    }
    return () => clearInterval(interval);
  }, [timerRunning, restSeconds]);

  const startTimer = (seconds: number) => {
    setRestSeconds(seconds);
    setTimerRunning(true);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Resolve routine for selected day
  const resolveRoutineForDay = (dayName: string): WorkoutRoutineDay | null => {
    if (!activeBlueprint?.routines || activeBlueprint.routines.length === 0) return null;

    // Check direct matching in day title
    const directMatch = activeBlueprint.routines.find((r) =>
      r.dayName.toLowerCase().includes(dayName.toLowerCase())
    );
    if (directMatch) return directMatch;

    // Fallback split mapping
    const routineCount = activeBlueprint.routines.length;
    switch (dayName) {
      case 'Monday':
        return activeBlueprint.routines[0] || null;
      case 'Tuesday':
        return routineCount >= 4 ? activeBlueprint.routines[1] : null;
      case 'Wednesday':
        return routineCount >= 2 ? activeBlueprint.routines[1] : null;
      case 'Thursday':
        return routineCount >= 4 ? activeBlueprint.routines[2] : null;
      case 'Friday':
        return routineCount >= 3 ? activeBlueprint.routines[routineCount - 2] : null;
      case 'Saturday':
        return routineCount >= 4 ? activeBlueprint.routines[routineCount - 1] : null;
      case 'Sunday':
      default:
        return null; // Active Recovery Day
    }
  };

  const currentRoutine = resolveRoutineForDay(selectedDay);
  const isSelectedToday = selectedDay === todayWeekday.key;

  // Active blueprint meal plan (4 meals)
  const mealPlan: MealItem[] = activeBlueprint?.dailyMealPlan || [];

  // Check if today's workout has been completed
  const isWorkoutDoneToday =
    isSelectedToday &&
    (wellness.workoutMinutesLogged > 0 || workoutSessions.some((w) => w.date === todayStr));

  // Check which meals are logged today
  const isMealLoggedToday = (mealType: string) => {
    if (!isSelectedToday) return false;
    return mealLogs.some((m) => m.date === todayStr && m.mealType === mealType);
  };

  // Quick action: log meal as eaten
  const handleQuickLogMeal = (meal: MealItem) => {
    addMealLog({
      mealType: meal.mealType as any,
      name: meal.title,
      calories: meal.calories,
      proteinGrams: meal.proteinG,
      carbsGrams: meal.carbsG,
      fatGrams: meal.fatG,
      portionDescription: '1 prescribed serving',
    });
    showNotification(`✓ ${meal.title} logged (+${meal.calories} kcal)`);
  };

  // Quick action: mark workout complete
  const handleCompleteWorkout = (duration: number) => {
    logWorkoutMinutes(duration);
    showNotification(`💪 Completed ${duration} min workout session!`);
  };

  // Meal type icons and colors
  const getMealVisual = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BREAKFAST':
        return {
          icon: <Sun className="w-4 h-4 text-amber-500" />,
          bgColor: 'bg-amber-50/70',
          borderColor: 'border-amber-200/80',
          badgeColor: 'bg-amber-100 text-amber-800',
        };
      case 'LUNCH':
        return {
          icon: <Flame className="w-4 h-4 text-emerald-600" />,
          bgColor: 'bg-emerald-50/70',
          borderColor: 'border-emerald-200/80',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        };
      case 'SNACK':
        return {
          icon: <Coffee className="w-4 h-4 text-rose-500" />,
          bgColor: 'bg-rose-50/70',
          borderColor: 'border-rose-200/80',
          badgeColor: 'bg-rose-100 text-rose-800',
        };
      case 'DINNER':
      default:
        return {
          icon: <Moon className="w-4 h-4 text-indigo-500" />,
          bgColor: 'bg-indigo-50/70',
          borderColor: 'border-indigo-200/80',
          badgeColor: 'bg-indigo-100 text-indigo-800',
        };
    }
  };

  // Progress metrics
  const targetCals = activeBlueprint?.targetCalories || 2000;
  const loggedCals = wellness.caloriesLogged;
  const caloriePercent = Math.min(100, Math.round((loggedCals / targetCals) * 100));

  return (
    <>
      {/* ============================================================== */}
      {/* 1. FLOATING LAUNCHER BUTTON (Bottom-Right, above AI Copilot)   */}
      {/* ============================================================== */}
      <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Teaser pill on desktop when closed */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-[#e8e0d1] text-xs font-bold text-slate-800 shadow-xl shadow-black/5 hover:border-[#a47b3c] hover:text-[#a47b3c] cursor-pointer backdrop-blur-md transition-all group"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#a47b3c] animate-ping" />
            <span>
              Today's Protocol: <strong>{currentRoutine ? currentRoutine.dayName.split('(')[0] : 'Rest & Fuel'}</strong>
            </span>
          </motion.div>
        )}

        {/* Circular Action Launcher Button */}
        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-tr from-[#17365d] via-[#244b7a] to-[#a47b3c] text-white shadow-xl shadow-[#17365d]/30 flex items-center justify-center border-2 border-white/60 hover:shadow-2xl transition-all cursor-pointer relative group"
            title="Today's Workout & Meal Protocol"
          >
            <div className="relative">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
            </div>
          </motion.button>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. FLOATING DAILY ACTION MODAL / BOTTOM SHEET                  */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs sm:bg-slate-900/20"
            />

            {/* Modal Body: Slide-up Sheet on Mobile, Floating Card on Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[480px] max-w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#e4e9f1] flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#17365d] via-[#244b7a] to-[#17365d] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#a47b3c] text-white flex items-center justify-center shadow-md shadow-[#a47b3c]/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold tracking-tight">
                        Daily Protocol & Nutrition
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#a47b3c]/30 text-amber-200 text-[10px] font-bold">
                        {userInputs.dietaryPreference ? userInputs.dietaryPreference.replace(/_/g, ' ') : 'Balanced'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/80">
                      Prescribed workout split & 4-meal clinical nutrition
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notification Banner */}
              <AnimatePresence>
                {feedbackMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center shrink-0 flex items-center justify-center gap-1.5 shadow-inner"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{feedbackMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Day Selector Strip */}
              <div className="px-3 py-2 bg-[#faf8f5] border-b border-[#e4e9f1] shrink-0 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5 justify-between min-w-[340px]">
                  {WEEKDAYS.map((day) => {
                    const isToday = day.index === currentDayIndex;
                    const isSelected = selectedDay === day.key;
                    return (
                      <button
                        key={day.key}
                        onClick={() => setSelectedDay(day.key)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                          isSelected
                            ? 'bg-[#17365d] text-white shadow-sm'
                            : isToday
                            ? 'bg-[#f5eee3] text-[#a47b3c] border border-[#a47b3c]/30'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span className="text-[11px] font-extrabold">{day.short}</span>
                        {isToday && (
                          <span className={`text-[8px] font-extrabold px-1 rounded-full ${isSelected ? 'bg-[#a47b3c] text-white' : 'bg-[#17365d] text-white'}`}>
                            Today
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtabs Filter (All, Workout, Diet) */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#e4e9f1] shrink-0 bg-white">
                <div className="flex items-center gap-1.5 bg-[#faf8f5] p-1 rounded-xl border border-[#e4e9f1]">
                  <button
                    onClick={() => setActiveTab('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'ALL'
                        ? 'bg-[#17365d] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Protocol
                  </button>
                  <button
                    onClick={() => setActiveTab('WORKOUT')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeTab === 'WORKOUT'
                        ? 'bg-[#17365d] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Dumbbell className="w-3.5 h-3.5 text-[#d45b73]" />
                    <span>Workout</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('DIET')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeTab === 'DIET'
                        ? 'bg-[#17365d] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Apple className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Meals</span>
                  </button>
                </div>

                {/* Quick Water Button */}
                <button
                  onClick={() => {
                    logWater(0.25);
                    showNotification('+250ml Hydration Logged!');
                  }}
                  className="px-2.5 py-1 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Log 250ml water"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  <span>+250ml</span>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. Daily Calorie & Macro Target Progress Meter */}
                <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#243047]">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>Today's Energy Balance</span>
                    </span>
                    <span className="text-[#a47b3c]">
                      {loggedCals} / {targetCals} kcal ({caloriePercent}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${caloriePercent}%` }}
                    />
                  </div>

                  {/* Target Macros Pill Strip */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-1.5 rounded-xl bg-white border border-[#e4e9f1]">
                      <span className="text-[10px] text-rose-600 font-bold uppercase block">Protein</span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {activeBlueprint?.macros.proteinGrams || 120}g
                      </span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white border border-[#e4e9f1]">
                      <span className="text-[10px] text-amber-600 font-bold uppercase block">Fats</span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {activeBlueprint?.macros.fatGrams || 50}g
                      </span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white border border-[#e4e9f1]">
                      <span className="text-[10px] text-indigo-600 font-bold uppercase block">Carbs</span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {activeBlueprint?.macros.carbsGrams || 180}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Workout Section */}
                {(activeTab === 'ALL' || activeTab === 'WORKOUT') && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <Dumbbell className="w-4 h-4 text-[#d45b73]" />
                        <span>Workout: {selectedDay}</span>
                      </h4>

                      {/* Rest timer mini pill */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-bold">Rest:</span>
                        <button
                          onClick={() => startTimer(60)}
                          className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                        >
                          60s
                        </button>
                        <button
                          onClick={() => startTimer(90)}
                          className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                        >
                          90s
                        </button>
                      </div>
                    </div>

                    {/* Rest timer banner if running */}
                    {timerRunning && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between text-xs font-bold animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <Timer className="w-4 h-4 text-rose-600" />
                          <span>Rest countdown:</span>
                        </span>
                        <span className="font-mono text-sm">{restSeconds}s</span>
                      </div>
                    )}

                    {currentRoutine ? (
                      <div className="p-4 rounded-2xl bg-white border border-[#e4e9f1] shadow-xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-[#17365d]">
                                {currentRoutine.focusTitle}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-[#fdebf0] text-[#d45b73] text-[10px] font-bold">
                                {currentRoutine.durationMin} mins
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                              {currentRoutine.targetIntensity} · Progressive Overload
                            </span>
                          </div>

                          {/* Complete Workout Button */}
                          {isSelectedToday && (
                            <button
                              onClick={() => handleCompleteWorkout(currentRoutine.durationMin)}
                              disabled={isWorkoutDoneToday}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isWorkoutDoneToday
                                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                  : 'bg-[#d45b73] text-white hover:bg-[#b8485e] shadow-sm cursor-pointer'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isWorkoutDoneToday ? 'Completed' : 'Log Done'}</span>
                            </button>
                          )}
                        </div>

                        {/* Exercise Checklist */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-100">
                          {currentRoutine.exercises.map((ex, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-[#faf8f5] border border-slate-100 flex items-center justify-between text-xs font-medium"
                            >
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-800 block">• {ex.name}</span>
                                {ex.notes && (
                                  <span className="text-[10px] text-slate-500 block">{ex.notes}</span>
                                )}
                              </div>
                              <div className="text-right shrink-0 font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                {ex.sets} × {ex.reps}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Active Recovery Day Card
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200 text-xs space-y-2">
                        <div className="flex items-center gap-2 font-extrabold text-emerald-900">
                          <Heart className="w-4 h-4 text-emerald-600" />
                          <span>Active Recovery & Mobility Day</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          No heavy compound resistance prescribed for {selectedDay}. Focus on 8,000 brisk steps, light thoracic mobility, optimal hydration, and tissue repair.
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleCompleteWorkout(20)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Log 20m Light Walk</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Meal Plan Section (All 4 Meals) */}
                {(activeTab === 'ALL' || activeTab === 'DIET') && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <Apple className="w-4 h-4 text-emerald-600" />
                        <span>Prescribed Diet: All 4 Meals</span>
                      </h4>
                      <span className="text-[11px] text-[#a47b3c] font-bold">
                        {activeBlueprint?.dailyMealPlan.length || 4} Prescribed Meals
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {mealPlan.map((meal, idx) => {
                        const visual = getMealVisual(meal.mealType);
                        const isLogged = isMealLoggedToday(meal.mealType);

                        return (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-2xl border ${visual.borderColor} ${visual.bgColor} space-y-2 transition-all`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-xl bg-white shadow-xs">
                                  {visual.icon}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                                      {meal.mealType} ({meal.time})
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${visual.badgeColor}`}>
                                      {meal.calories} kcal
                                    </span>
                                  </div>
                                  <h5 className="text-xs font-extrabold text-slate-900 mt-0.5">
                                    {meal.title}
                                  </h5>
                                </div>
                              </div>

                              {/* 1-Click Mark as Eaten Button */}
                              {isSelectedToday && (
                                <button
                                  onClick={() => handleQuickLogMeal(meal)}
                                  disabled={isLogged}
                                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 ${
                                    isLogged
                                      ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-300 cursor-default'
                                      : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-xs cursor-pointer'
                                  }`}
                                  title="Log this meal to today's nutrition diary"
                                >
                                  {isLogged ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>Eaten</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Log Eaten</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Ingredients preview */}
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed bg-white/70 p-2 rounded-xl border border-white">
                              {meal.ingredients}
                            </p>

                            {/* Macro mini tags */}
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600">
                              <span className="text-rose-700">P: {meal.proteinG}g</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-indigo-700">C: {meal.carbsG}g</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-amber-700">F: {meal.fatG}g</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer: Calibrate Shortcut */}
              <div className="p-3 sm:p-4 bg-[#faf8f5] border-t border-[#e4e9f1] flex items-center justify-between text-xs shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">
                  Adaptive LifeOS Engine v2.0
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsAiModalOpen(true);
                  }}
                  className="text-[#a47b3c] hover:text-[#866632] font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Calibrate Targets →</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
