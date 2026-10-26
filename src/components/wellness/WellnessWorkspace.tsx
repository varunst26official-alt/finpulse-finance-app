import React, { useState, useEffect } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { SectionHero } from '@/components/layout/SectionHero';
import {
  Heart,
  Activity,
  Flame,
  Droplets,
  Plus,
  RotateCcw,
  AlertCircle,
  Dumbbell,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Trash2,
  Filter,
  Check,
  Utensils,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExerciseDefinition, MealType } from '@/types/lifeos';

// Clinically categorized exercise database
const EXERCISE_CATALOG: ExerciseDefinition[] = [
  {
    id: 'barbell_bench',
    name: 'Barbell Flat Bench Press',
    muscleGroup: 'Chest',
    targetSubMuscles: 'Pectoralis Major, Sternal Head, Anterior Deltoid',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    cues: ['Retract scapula', 'Tuck elbows at 45-degree angle', 'Drive feet through the floor'],
  },
  {
    id: 'incline_dumbbell',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    targetSubMuscles: 'Clavicular Head (Upper Chest), Front Delts',
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    cues: ['Set bench at 30 degrees', 'Controlled eccentric 3 seconds', 'Converge dumbbells slightly at apex'],
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown (Neutral/Wide Grip)',
    muscleGroup: 'Back',
    targetSubMuscles: 'Latissimus Dorsi, Teres Major, Rhomboids',
    equipment: 'Cable',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    cues: ['Depress shoulder blades first', 'Pull bar to upper sternum', 'Avoid excessive torso swinging'],
  },
  {
    id: 'barbell_row',
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'Back',
    targetSubMuscles: 'Mid Traps, Rhomboids, Latissimus Dorsi',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    cues: ['Hinge hips back at 45 degrees', 'Pull with elbows towards hip crease', 'Maintain neutral lumbar spine'],
  },
  {
    id: 'barbell_squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    targetSubMuscles: 'Quadriceps, Gluteus Maximus, Adductor Magnus',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    mechanics: 'Compound',
    cues: ['Brace core with Valsalva maneuver', 'Break at hips and knees together', 'Knees track over toes'],
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    targetSubMuscles: 'Hamstrings, Gluteus Maximus, Erector Spinae',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    cues: ['Soft bend in knees', 'Push hips back towards the wall', 'Stop when hamstrings reach full stretch'],
  },
  {
    id: 'overhead_press',
    name: 'Standing Overhead Barbell Press',
    muscleGroup: 'Shoulders',
    targetSubMuscles: 'Anterior & Lateral Deltoids, Triceps',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    cues: ['Squeeze glutes and brace core', 'Press vertical bar path', 'Lockout directly over midfoot'],
  },
  {
    id: 'tricep_rope',
    name: 'Triceps Rope Pushdown',
    muscleGroup: 'Arms',
    targetSubMuscles: 'Triceps Brachii Lateral & Medial Heads',
    equipment: 'Cable',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    cues: ['Keep elbows pinned to ribcage', 'Flare rope outward at bottom', 'Full contraction 1 second'],
  },
  {
    id: 'cable_curl',
    name: 'Biceps Cable Curl',
    muscleGroup: 'Arms',
    targetSubMuscles: 'Biceps Brachii, Brachialis',
    equipment: 'Cable',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    cues: ['Constant tension on cable', 'Avoid shoulder flexion', 'Controlled eccentric phase'],
  },
  {
    id: 'zone2_cardio',
    name: 'Incline Treadmill Walk (Zone 2)',
    muscleGroup: 'Cardio',
    targetSubMuscles: 'Cardiovascular System, Mitochondrial Density',
    equipment: 'Machine',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    cues: ['Keep heart rate between 60-70% max HR', 'Nasal breathing pace', '30-45 minutes continuous'],
  },
];

export const WellnessWorkspace: React.FC = () => {
  const {
    wellness,
    userInputs,
    activeBlueprint,
    setIsAiModalOpen,
    updateBodyMetrics,
    logWater,
    resetWater,
    workoutSessions,
    recordWorkoutSession,
    deleteWorkoutSession,
    mealLogs,
    addMealLog,
    deleteMealLog,
  } = useLifeOSStore();

  // Workspace subtab: 'OVERVIEW' | 'WORKOUTS' | 'NUTRITION'
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WORKOUTS' | 'NUTRITION'>('OVERVIEW');

  // Body Metrics Slider State
  const [height, setHeight] = useState(wellness.heightCm);
  const [weight, setWeight] = useState(wellness.weightKg);

  // Phase 2: Live Workout Session Builder State
  const [activeExerciseId, setActiveExerciseId] = useState(EXERCISE_CATALOG[0].id);
  const [workoutDuration, setWorkoutDuration] = useState(45);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [liveSets, setLiveSets] = useState<
    Array<{
      exerciseId: string;
      exerciseName: string;
      muscleGroup: string;
      setNumber: number;
      weightKg: number;
      reps: number;
      rpe: number;
    }>
  >([]);

  // Current Set Inputs
  const [currentWeight, setCurrentWeight] = useState(60);
  const [currentReps, setCurrentReps] = useState(10);
  const [currentRpe, setCurrentRpe] = useState(8);

  // Exercise Filter
  const [exerciseFilter, setExerciseFilter] = useState<string>('ALL');

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Phase 3: Meal Logger State
  const [mealType, setMealType] = useState<MealType>('LUNCH');
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState<number>(550);
  const [mealProtein, setMealProtein] = useState<number>(45);
  const [mealCarbs, setMealCarbs] = useState<number>(50);
  const [mealFat, setMealFat] = useState<number>(15);
  const [mealPortion, setMealPortion] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Rest Timer Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && restSeconds !== null && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restSeconds === 0) {
      setIsTimerRunning(false);
      showToast('⏰ Rest period complete! Time for the next set.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restSeconds]);

  const startRestTimer = (seconds: number) => {
    setRestSeconds(seconds);
    setIsTimerRunning(true);
  };

  // Adult BMI Formula: Weight (kg) / [Height (m)]^2
  const heightM = height / 100;
  const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (val < 25.0) return { label: 'Normal / Healthy', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val < 30.0) return { label: 'Overweight', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Obesity Range', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const bmiCat = getBmiCategory(bmi);
  const waterProgress = Math.min(100, Math.round((wellness.waterLitersLogged / wellness.waterTargetLiters) * 100));
  const calorieProgress = Math.min(100, Math.round((wellness.caloriesLogged / wellness.caloriesTarget) * 100));

  // Macronutrient Totals from Meal Logs
  const totalProteinLogged = mealLogs.reduce((acc, m) => acc + m.proteinGrams, 0);
  const totalCarbsLogged = mealLogs.reduce((acc, m) => acc + m.carbsGrams, 0);
  const totalFatLogged = mealLogs.reduce((acc, m) => acc + m.fatGrams, 0);

  const handleMetricsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBodyMetrics(height, weight);
    showToast('Body metrics saved and persisted to database!');
  };

  // Phase 2: Add Set Handler
  const handleAddSet = () => {
    const exercise = EXERCISE_CATALOG.find((e) => e.id === activeExerciseId) || EXERCISE_CATALOG[0];
    const newSetNumber = liveSets.filter((s) => s.exerciseId === activeExerciseId).length + 1;

    setLiveSets([
      ...liveSets,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        setNumber: newSetNumber,
        weightKg: Number(currentWeight),
        reps: Number(currentReps),
        rpe: Number(currentRpe),
      },
    ]);

    startRestTimer(90);
    showToast(`Set logged: ${currentWeight}kg × ${currentReps} reps!`);
  };

  // Phase 2: Save Workout Session Handler
  const handleSaveWorkoutSession = () => {
    if (liveSets.length === 0) {
      alert('Please log at least one set before saving the workout.');
      return;
    }

    recordWorkoutSession({
      splitName: activeBlueprint.workoutSplitName,
      durationMinutes: workoutDuration,
      notes: workoutNotes.trim() || undefined,
      sets: liveSets,
    });

    setLiveSets([]);
    setWorkoutNotes('');
    showToast('🎉 Workout session saved to history and database!');
  };

  // Phase 3: Add Meal Handler
  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    addMealLog({
      mealType,
      name: mealName.trim(),
      calories: Number(mealCalories),
      proteinGrams: Number(mealProtein),
      carbsGrams: Number(mealCarbs),
      fatGrams: Number(mealFat),
      portionDescription: mealPortion.trim() || undefined,
    });

    setMealName('');
    setMealPortion('');
    showToast(`Logged "${mealName.trim()}" (${mealCalories} kcal)!`);
  };

  const selectedExercise = EXERCISE_CATALOG.find((e) => e.id === activeExerciseId) || EXERCISE_CATALOG[0];

  const filteredExercises = EXERCISE_CATALOG.filter(
    (ex) => exerciseFilter === 'ALL' || ex.muscleGroup.toUpperCase() === exerciseFilter
  );

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

      {/* 1. Rose Gradient Hero Banner */}
      <SectionHero
        section="wellness"
        onPrimaryAction={() => setIsAiModalOpen(true)}
        primaryActionLabel="✨ AI Adaptive Blueprint"
        onSecondaryAction={() => {
          logWater(0.25);
          showToast('+250ml Water Logged');
        }}
        secondaryActionLabel="+ Log 250ml Water"
      />

      {/* 2. Adaptive Calibration Notice Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#fdebf0] via-[#fff5f7] to-[#fbfcfe] border border-[#d45b73]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#d45b73] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#d45b73]/30">
            <Sparkles className="w-4 h-4 text-[#fdebf0]" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#243047] flex items-center gap-2">
              <span>Active Adaptive Plan:</span>
              <span className="text-[#d45b73] uppercase tracking-wider text-[11px]">
                {userInputs.fitnessGoal.replace('_', ' ')} · {userInputs.intensityLevel.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-[#6f7c91] font-medium mt-0.5">
              Split: <strong className="text-slate-800">{activeBlueprint.workoutSplitName}</strong> · Daily Target: <strong className="text-slate-800">{activeBlueprint.targetCalories} kcal</strong> · Water: <strong className="text-slate-800">{activeBlueprint.dailyWaterTargetLiters} L</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-[#d45b73]/40 text-[#d45b73] text-xs font-bold hover:bg-[#fdebf0] transition-all cursor-pointer shadow-xs whitespace-nowrap"
        >
          ⚡ Change Parameters & Recalibrate
        </button>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e4e9f1] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-[#d45b73] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          📊 Wellness Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('WORKOUTS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'WORKOUTS'
              ? 'bg-[#d45b73] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Workouts & Movement Catalog</span>
        </button>
        <button
          onClick={() => setActiveTab('NUTRITION')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'NUTRITION'
              ? 'bg-[#d45b73] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Clinical Nutrition & Meal Planner</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: WELLNESS OVERVIEW & BODY METRICS               */}
      {/* ======================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Top 4 Wellness Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6f7c91]">Adult BMI</span>
                <div className="w-9 h-9 rounded-xl bg-[#fdebf0] text-[#d45b73] flex items-center justify-center font-bold text-sm">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
                {bmi}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${bmiCat.color}`}>
                  {bmiCat.label}
                </span>
              </div>
            </article>

            <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6f7c91]">Workout minutes</span>
                <div className="w-9 h-9 rounded-xl bg-[#f5eee3] text-[#a47b3c] flex items-center justify-center font-bold text-sm">
                  <Dumbbell className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
                {wellness.workoutMinutesLogged} m
              </div>
              <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">
                Goal: 150 min weekly active cardio & strength
              </div>
            </article>

            <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6f7c91]">Nutrition calories</span>
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
                {wellness.caloriesLogged} / {wellness.caloriesTarget}
              </div>
              <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">
                {calorieProgress}% of estimated energy intake
              </div>
            </article>

            <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6f7c91]">Water hydration</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
                  <Droplets className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
                {wellness.waterLitersLogged} L
              </div>
              <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">
                {waterProgress}% toward {wellness.waterTargetLiters} L daily target
              </div>
            </article>
          </div>

          {/* Interactive Body Metrics & Hydration Station Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Panel: BMI Screening Calculator */}
            <section className="lg:col-span-6 bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#d45b73]" />
                    <span>Adult BMI Screening Calculator</span>
                  </h3>
                  <p className="text-[11px] text-[#6f7c91]">
                    Formula: Weight (kg) / [Height (m)]²
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${bmiCat.color}`}>
                  {bmiCat.label}
                </span>
              </div>

              <form onSubmit={handleMetricsSave} className="space-y-4 text-xs font-semibold">
                <div>
                  <div className="flex justify-between items-center mb-1 text-slate-700">
                    <span>Height: {height} cm ({(height / 100).toFixed(2)} m)</span>
                    <span className="font-mono text-slate-500">120 - 220 cm</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="220"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-[#d45b73] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-slate-700">
                    <span>Current Weight: {weight} kg</span>
                    <span className="font-mono text-slate-500">40 - 160 kg</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="160"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full accent-[#d45b73] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#6f7c91]">
                    Target: {wellness.targetWeightKg} kg ({weight > wellness.targetWeightKg ? `-${(weight - wellness.targetWeightKg).toFixed(1)} kg to goal` : 'Goal achieved!'})
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#d45b73] text-white text-xs font-bold hover:bg-[#b8485e] shadow-md shadow-[#d45b73]/20 cursor-pointer"
                  >
                    Save Measurements
                  </button>
                </div>
              </form>

              {/* Medical Disclaimer Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Medical Disclaimer:</strong> Body Mass Index (BMI) is an observational screening tool. It does not measure body fat percentage, muscle density, bone mass, or cardiovascular fitness directly. Always consult a certified healthcare professional before starting an intensive training regimen.
                </div>
              </div>
            </section>

            {/* Right Panel: Smart Hydration Station */}
            <section className="lg:col-span-6 bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span>Daily Water Hydration Station</span>
                  </h3>
                  <button
                    onClick={() => {
                      resetWater();
                      showToast('Water log reset to 0L');
                    }}
                    className="text-xs text-[#6f7c91] hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    title="Reset water log"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Animated Bottle Progress Bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 flex items-center gap-4">
                  <div className="w-14 h-24 rounded-2xl bg-white border-2 border-sky-300 relative overflow-hidden shrink-0 shadow-inner flex flex-col justify-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${waterProgress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="w-full bg-gradient-to-t from-sky-500 to-sky-300 rounded-b-xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-sky-900 drop-shadow-xs">
                      {waterProgress}%
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold text-slate-700">Daily Hydration Target:</div>
                    <div className="text-xl font-extrabold text-sky-800">
                      {wellness.waterLitersLogged} / {wellness.waterTargetLiters} Liters
                    </div>
                    <p className="text-[11px] text-sky-700">
                      Based on clinical standard of 35ml water per kg bodyweight ({wellness.weightKg}kg × 35ml).
                    </p>
                  </div>
                </div>

                {/* Quick Logging Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => {
                      logWater(0.25);
                      showToast('+250ml Glass Logged');
                    }}
                    className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-all flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span>🥛 Glass</span>
                    <span className="text-[10px] text-sky-600">+250 ml</span>
                  </button>
                  <button
                    onClick={() => {
                      logWater(0.5);
                      showToast('+500ml Bottle Logged');
                    }}
                    className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-all flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span>🍶 Bottle</span>
                    <span className="text-[10px] text-sky-600">+500 ml</span>
                  </button>
                  <button
                    onClick={() => {
                      logWater(0.75);
                      showToast('+750ml Flask Logged');
                    }}
                    className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-all flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span>🫗 Flask</span>
                    <span className="text-[10px] text-sky-600">+750 ml</span>
                  </button>
                  <button
                    onClick={() => {
                      logWater(1.0);
                      showToast('+1L Jug Logged');
                    }}
                    className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-all flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span>🪣 1L Jug</span>
                    <span className="text-[10px] text-sky-600">+1.0 Liter</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e4e9f1] text-[11px] text-[#6f7c91]">
                💧 Hydration improves cognitive focus, muscle recovery, and energy metabolism.
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: WORKOUTS & MOVEMENT CATALOG (PHASE 2)          */}
      {/* ======================================================== */}
      {activeTab === 'WORKOUTS' && (
        <div className="space-y-6">
          {/* Active Workout Split Header */}
          <div className="p-5 rounded-3xl bg-white border border-[#e4e9f1] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#d45b73]">
                <Sparkles className="w-4 h-4" />
                <span>Active Adaptive Workout Program</span>
              </div>
              <h3 className="text-lg font-extrabold text-[#243047] mt-1">
                {activeBlueprint.workoutSplitName}
              </h3>
              <p className="text-xs text-[#6f7c91] mt-0.5">
                Calibrated for your {userInputs.fitnessGoal.replace('_', ' ')} goal and {userInputs.intensityLevel.replace('_', ' ')} intensity.
              </p>
            </div>

            {/* Rest Timer Widget */}
            <div className="flex items-center gap-3 bg-[#fdebf0] p-3 rounded-2xl border border-[#d45b73]/20 self-stretch sm:self-auto justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d45b73]" />
                <div>
                  <div className="text-[10px] font-extrabold text-[#d45b73] uppercase">Rest Timer</div>
                  <div className="text-base font-extrabold text-[#243047] font-mono">
                    {restSeconds !== null ? `${Math.floor(restSeconds / 60)}:${(restSeconds % 60).toString().padStart(2, '0')}` : '0:00'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => startRestTimer(60)}
                  className="px-2 py-1 rounded-lg bg-white text-[10px] font-bold text-slate-700 hover:bg-[#d45b73] hover:text-white transition-all cursor-pointer"
                >
                  60s
                </button>
                <button
                  onClick={() => startRestTimer(90)}
                  className="px-2 py-1 rounded-lg bg-white text-[10px] font-bold text-slate-700 hover:bg-[#d45b73] hover:text-white transition-all cursor-pointer"
                >
                  90s
                </button>
                <button
                  onClick={() => startRestTimer(120)}
                  className="px-2 py-1 rounded-lg bg-white text-[10px] font-bold text-slate-700 hover:bg-[#d45b73] hover:text-white transition-all cursor-pointer"
                >
                  120s
                </button>
                {isTimerRunning ? (
                  <button
                    onClick={() => setIsTimerRunning(false)}
                    className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTimerRunning(true)}
                    className="p-1.5 rounded-lg bg-[#d45b73] text-white hover:bg-[#b8485e] cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Set-by-Set Workout Logger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Set Logger Form (col-span-7) */}
            <section className="lg:col-span-7 bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#d45b73]" />
                  <span>Interactive Set Logger</span>
                </h3>
                <span className="text-xs font-bold text-[#6f7c91]">
                  {liveSets.length} sets logged in session
                </span>
              </div>

              {/* Select Exercise & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Exercise
                  </label>
                  <select
                    value={activeExerciseId}
                    onChange={(e) => setActiveExerciseId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-[#243047] focus:ring-2 focus:ring-[#d45b73]/20"
                  >
                    {EXERCISE_CATALOG.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        [{ex.muscleGroup}] {ex.name} ({ex.equipment})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Selected Exercise Form Cues Card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Target: {selectedExercise.targetSubMuscles}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-extrabold">
                    {selectedExercise.mechanics}
                  </span>
                </div>
                <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                  {selectedExercise.cues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ul>
              </div>

              {/* Set Inputs: Weight, Reps, RPE */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={currentReps}
                    onChange={(e) => setCurrentReps(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RPE (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={currentRpe}
                    onChange={(e) => setCurrentRpe(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSet}
                  className="flex-1 py-2.5 rounded-xl bg-[#d45b73] hover:bg-[#b8485e] text-white text-xs font-bold transition-all shadow-sm shadow-[#d45b73]/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log This Set & Start Rest Timer</span>
                </button>
              </div>

              {/* Live Sets Table */}
              {liveSets.length > 0 && (
                <div className="pt-2 border-t border-[#e4e9f1] space-y-2">
                  <div className="text-xs font-bold text-slate-700">Current Session Sets:</div>
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {liveSets.map((s, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-extrabold">
                            #{s.setNumber}
                          </span>
                          <span className="font-bold text-slate-800">{s.exerciseName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-600 font-semibold">
                            {s.weightKg} kg × {s.reps} reps (RPE {s.rpe})
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600">
                            {s.weightKg * s.reps} kg tonnage
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Save Session Actions */}
                  <div className="pt-3 border-t border-[#e4e9f1] flex items-center justify-between">
                    <div className="text-xs text-[#6f7c91]">
                      Total Tonnage:{' '}
                      <strong className="text-slate-800">
                        {liveSets.reduce((acc, s) => acc + s.weightKg * s.reps, 0)} kg
                      </strong>
                    </div>
                    <button
                      onClick={handleSaveWorkoutSession}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete & Save Workout</span>
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Right: Exercise Movement Catalog (col-span-5) */}
            <section className="lg:col-span-5 bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#a47b3c]" />
                  <span>Exercise Movement Catalog</span>
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {filteredExercises.length} movements
                </span>
              </div>

              {/* Muscle Filters */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold scrollbar-none">
                {['ALL', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CARDIO'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setExerciseFilter(cat)}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      exerciseFilter === cat
                        ? 'bg-[#17365d] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Exercise Items List */}
              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1 space-y-1">
                {filteredExercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => setActiveExerciseId(ex.id)}
                    className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                      activeExerciseId === ex.id
                        ? 'border-[#d45b73] bg-[#fdebf0]/30'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#243047]">{ex.name}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#f5eee3] text-[#a47b3c]">
                        {ex.muscleGroup}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6f7c91] mt-0.5 truncate">
                      {ex.equipment} · {ex.difficulty}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Past Workout Sessions History Log */}
          <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
              Completed Workout History
            </h3>

            {workoutSessions.length === 0 ? (
              <p className="text-xs text-[#6f7c91]">No completed workouts logged yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workoutSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{session.splitName}</span>
                      <button
                        onClick={() => deleteWorkoutSession(session.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-[#6f7c91]">
                      Date: {session.date} · Duration: {session.durationMinutes} min
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1 border-t border-slate-200">
                      <span>{session.totalSets} Sets performed</span>
                      <span className="text-emerald-700">{session.totalTonnage} kg total volume</span>
                    </div>

                    {session.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1">{session.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: CLINICAL NUTRITION & MEAL PLANNER (PHASE 3)   */}
      {/* ======================================================== */}
      {activeTab === 'NUTRITION' && (
        <div className="space-y-6">
          {/* Daily Energy & Macro Target Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <article className="p-4 rounded-2xl bg-white border border-[#e4e9f1] shadow-xs">
              <span className="text-xs font-bold text-[#6f7c91]">Calories Intake</span>
              <div className="text-2xl font-extrabold text-[#243047] mt-1">
                {wellness.caloriesLogged} / {wellness.caloriesTarget} kcal
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${calorieProgress}%` }}
                />
              </div>
            </article>

            <article className="p-4 rounded-2xl bg-white border border-[#e4e9f1] shadow-xs">
              <span className="text-xs font-bold text-[#6f7c91]">Protein (1.8-2.2g/kg)</span>
              <div className="text-2xl font-extrabold text-[#243047] mt-1">
                {Math.round(totalProteinLogged)} / {activeBlueprint.macros.proteinGrams} g
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">
                {Math.round((totalProteinLogged / Math.max(1, activeBlueprint.macros.proteinGrams)) * 100)}% of muscle target
              </div>
            </article>

            <article className="p-4 rounded-2xl bg-white border border-[#e4e9f1] shadow-xs">
              <span className="text-xs font-bold text-[#6f7c91]">Carbohydrates</span>
              <div className="text-2xl font-extrabold text-[#243047] mt-1">
                {Math.round(totalCarbsLogged)} / {activeBlueprint.macros.carbsGrams} g
              </div>
              <div className="text-[11px] text-amber-600 font-bold mt-1">
                Energy & glycogen replenishment
              </div>
            </article>

            <article className="p-4 rounded-2xl bg-white border border-[#e4e9f1] shadow-xs">
              <span className="text-xs font-bold text-[#6f7c91]">Healthy Fats</span>
              <div className="text-2xl font-extrabold text-[#243047] mt-1">
                {Math.round(totalFatLogged)} / {activeBlueprint.macros.fatGrams} g
              </div>
              <div className="text-[11px] text-indigo-600 font-bold mt-1">
                Hormonal balance & cell function
              </div>
            </article>
          </div>

          {/* Meal Logger & Today's Meals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Add Meal Form (col-span-5) */}
            <section className="lg:col-span-5 bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2 pb-3 border-b border-[#e4e9f1]">
                <Utensils className="w-4 h-4 text-orange-600" />
                <span>Log Meal or Snack</span>
              </h3>

              <form onSubmit={handleAddMeal} className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="BREAKFAST">🍳 Breakfast</option>
                    <option value="LUNCH">🥗 Lunch</option>
                    <option value="DINNER">🍲 Dinner</option>
                    <option value="SNACK">🍎 Snack / Pre-Workout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Meal / Food Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Grilled salmon with brown rice & broccoli"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Calories (kcal) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={mealCalories}
                      onChange={(e) => setMealCalories(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Portion Size</label>
                    <input
                      type="text"
                      placeholder="e.g., 200g salmon + 1 cup rice"
                      value={mealPortion}
                      onChange={(e) => setMealPortion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                {/* Macros Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Protein (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealProtein}
                      onChange={(e) => setMealProtein(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Carbs (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealCarbs}
                      onChange={(e) => setMealCarbs(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Fat (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={mealFat}
                      onChange={(e) => setMealFat(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-md shadow-orange-600/20 cursor-pointer mt-2"
                >
                  + Add to Today's Nutrition Log
                </button>
              </form>
            </section>

            {/* Right: Today's Logged Meals (col-span-7) */}
            <section className="lg:col-span-7 bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
                  Today's Meals Logged ({mealLogs.length})
                </h3>
                <span className="text-xs font-bold text-orange-600">
                  {wellness.caloriesLogged} kcal total
                </span>
              </div>

              {mealLogs.length === 0 ? (
                <p className="text-xs text-[#6f7c91]">No meals logged for today yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 space-y-1">
                  {mealLogs.map((m) => (
                    <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {m.mealType === 'BREAKFAST'
                            ? '🍳'
                            : m.mealType === 'LUNCH'
                            ? '🥗'
                            : m.mealType === 'DINNER'
                            ? '🍲'
                            : '🍎'}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{m.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {m.portionDescription ? `${m.portionDescription} · ` : ''}
                            {m.calories} kcal · {m.proteinGrams}g P · {m.carbsGrams}g C · {m.fatGrams}g F
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteMealLog(m.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        title="Delete meal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Adaptive Meal Plan Recommendations */}
          <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#a47b3c]" />
                  <span>Adaptive Meal Plan Suggestions</span>
                </h3>
                <p className="text-xs text-[#6f7c91]">
                  Tailored to your {userInputs.dietaryPreference.replace('_', ' ')} preference and {activeBlueprint.targetCalories} kcal target.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeBlueprint.dailyMealPlan.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#a47b3c]">{rec.mealType} ({rec.time})</span>
                      <span className="text-slate-500 font-mono">{rec.calories} kcal</span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-800 mt-1">
                      {rec.title}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{rec.ingredients}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>{rec.proteinG}g Protein</span>
                    <button
                      onClick={() => {
                        addMealLog({
                          mealType: (rec.mealType.toUpperCase() as MealType) || 'SNACK',
                          name: rec.title,
                          calories: rec.calories,
                          proteinGrams: rec.proteinG,
                          carbsGrams: rec.carbsG,
                          fatGrams: rec.fatG,
                          portionDescription: 'Recommended standard serving',
                        });
                        showToast(`Logged suggested meal "${rec.title}"!`);
                      }}
                      className="text-xs font-bold text-[#d45b73] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>+ Log This Meal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
