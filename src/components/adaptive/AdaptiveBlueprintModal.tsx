import React, { useState, useEffect } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { UserAdaptiveInputs, computeAdaptiveBlueprint } from '@/services/adaptiveLifeEngine';
import { useModalDismiss } from '@/hooks/useModalDismiss';
import {
  Sparkles,
  X,
  Dumbbell,
  Apple,
  Activity,
  DollarSign,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AdaptiveBlueprintModal: React.FC = () => {
  const {
    userInputs,
    isAiModalOpen,
    setIsAiModalOpen,
    generateAndApplyBlueprint,
  } = useLifeOSStore();

  const [formInputs, setFormInputs] = useState<UserAdaptiveInputs>(userInputs);
  const [activeTab, setActiveTab] = useState<'PARAMETERS' | 'PREVIEW'>('PARAMETERS');

  const { overlayProps, contentProps } = useModalDismiss(isAiModalOpen, () => setIsAiModalOpen(false));

  useEffect(() => {
    if (isAiModalOpen) {
      setFormInputs(userInputs);
    }
  }, [isAiModalOpen, userInputs]);

  const hasPhysicalMetrics = Boolean(
    formInputs.age &&
    formInputs.heightCm &&
    formInputs.weightKg &&
    Number(formInputs.age) > 0 &&
    Number(formInputs.heightCm) > 0 &&
    Number(formInputs.weightKg) > 0
  );

  // Compute live preview on the fly
  const previewBlueprint = computeAdaptiveBlueprint(formInputs);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInputs.age || !formInputs.heightCm || !formInputs.weightKg) {
      alert('Please enter your age, height, and weight to generate your personalized blueprint.');
      return;
    }
    generateAndApplyBlueprint(formInputs);
    setIsAiModalOpen(false);
  };

  if (!isAiModalOpen) return null;

  return (
    <div
      {...overlayProps}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs select-none overflow-y-auto cursor-pointer"
    >
      <motion.div
        {...contentProps}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#e4e9f1] overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#17365d] via-[#244b7a] to-[#17365d] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#a47b3c] flex items-center justify-center text-white shadow-md shadow-[#a47b3c]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Adaptive LifeOS Blueprint Engine
              </h2>
              <p className="text-xs text-white/80 font-medium">
                Grounded in Mifflin-St Jeor metabolic math, progressive overload, and portfolio models
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs (Inputs vs Live Scientific Preview) */}
        <div className="flex items-center gap-4 px-4 sm:px-6 pt-4 border-b border-[#e4e9f1] shrink-0 bg-[#faf8f5] overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('PARAMETERS')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PARAMETERS'
                ? 'border-[#a47b3c] text-[#a47b3c]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1. Your Biological & Life Parameters</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PREVIEW')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PREVIEW'
                ? 'border-[#a47b3c] text-[#a47b3c]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Live Generated Blueprint Preview</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                hasPhysicalMetrics
                  ? 'bg-[#f5eee3] text-[#a47b3c]'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {hasPhysicalMetrics ? 'Ready' : 'Incomplete'}
            </span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs font-semibold text-slate-700">
          {activeTab === 'PARAMETERS' && (
            <form onSubmit={handleApply} id="blueprint-form" className="space-y-6">
              {/* Row 1: Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block mb-1 text-slate-600">Age (years)</label>
                  <input
                    type="number"
                    min="16"
                    max="90"
                    required
                    placeholder="e.g. 28"
                    value={formInputs.age ?? ''}
                    onChange={(e) =>
                      setFormInputs({
                        ...formInputs,
                        age: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs font-bold text-slate-900 focus:border-[#a47b3c] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Biological Sex</label>
                  <select
                    value={formInputs.gender || ''}
                    onChange={(e) =>
                      setFormInputs({ ...formInputs, gender: e.target.value as any })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs font-bold text-slate-900 focus:border-[#a47b3c] focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="" disabled>Select Biological Sex...</option>
                    <option value="MALE">Male (Mifflin +5)</option>
                    <option value="FEMALE">Female (Mifflin -161)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Height (cm)</label>
                  <input
                    type="number"
                    min="120"
                    max="225"
                    required
                    placeholder="e.g. 175"
                    value={formInputs.heightCm ?? ''}
                    onChange={(e) =>
                      setFormInputs({
                        ...formInputs,
                        heightCm: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs font-bold text-slate-900 focus:border-[#a47b3c] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Current Weight (kg)</label>
                  <input
                    type="number"
                    min="35"
                    max="180"
                    step="0.5"
                    required
                    placeholder="e.g. 70"
                    value={formInputs.weightKg ?? ''}
                    onChange={(e) =>
                      setFormInputs({
                        ...formInputs,
                        weightKg: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs font-bold text-slate-900 focus:border-[#a47b3c] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 2: Fitness Goal & Intensity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-600">Primary Fitness & Body Goal</label>
                  <select
                    value={formInputs.fitnessGoal || ''}
                    onChange={(e) =>
                      setFormInputs({ ...formInputs, fitnessGoal: e.target.value as any })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs font-bold text-slate-900 focus:border-[#a47b3c] focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="" disabled>Select Primary Goal...</option>
                    <option value="FAT_LOSS">Fat Loss & Muscle Preservation (20% Deficit)</option>
                    <option value="MUSCLE_HYPERTROPHY">Muscle Hypertrophy & Strength (10% Lean Surplus)</option>
                    <option value="ATHLETIC_CONDITIONING">Athletic Conditioning & VO2 Max (Maintenance)</option>
                    <option value="HEALTHY_LONGEVITY">Healthy Longevity & Mobility (Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Training Intensity Level</label>
                  <select
                    value={formInputs.intensityLevel || ''}
                    onChange={(e) =>
                      setFormInputs({ ...formInputs, intensityLevel: e.target.value as any })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs font-bold text-slate-900 focus:border-[#a47b3c] focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="" disabled>Select Intensity Level...</option>
                    <option value="BEGINNER_LIGHT">Beginner / Low Impact (1.25 PAL · 3 Days/Wk)</option>
                    <option value="MODERATE_FITNESS">Moderate Fitness Enthusiast (1.55 PAL · 4 Days/Wk)</option>
                    <option value="HIGH_INTENSITY">High-Intensity Athlete (1.725 PAL · 4-5 Days/Wk)</option>
                    <option value="MAX_BEAST">Maximum Beast Mode (1.90 PAL · 5-6 Days/Wk)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Nutrition & Productivity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-slate-600">Dietary Preference</label>
                  <select
                    value={formInputs.dietaryPreference || ''}
                    onChange={(e) =>
                      setFormInputs({ ...formInputs, dietaryPreference: e.target.value as any })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs font-bold text-slate-900 focus:border-[#a47b3c] focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="" disabled>Select Dietary Preference...</option>
                    <option value="BALANCED_NON_VEG">Balanced Non-Vegetarian (Eggs, Chicken, Salmon)</option>
                    <option value="VEGETARIAN">Vegetarian (Paneer, Soya, Dal, Sprouts)</option>
                    <option value="VEGAN">100% Plant-Based Vegan (Tofu, Tempeh, Legumes)</option>
                    <option value="EGGETARIAN">High-Protein Eggetarian (Eggs, Paneer, Whey)</option>
                    <option value="KETO">Low-Carb Ketogenic (Healthy Fats, Greens)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Daily Work & Focus Availability</label>
                  <select
                    value={formInputs.workHoursPerDay ?? ''}
                    onChange={(e) =>
                      setFormInputs({
                        ...formInputs,
                        workHoursPerDay: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs font-bold text-slate-900 focus:border-[#a47b3c] focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="" disabled>Select Daily Work Hours...</option>
                    <option value={4}>4 Hours (Part-time / Side Hustle)</option>
                    <option value={8}>8 Hours (Standard Full-Time Professional)</option>
                    <option value={10}>10 Hours (High-Output Executive / Founder)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Financial Risk Profile</label>
                  <select
                    value={formInputs.riskProfile || ''}
                    onChange={(e) =>
                      setFormInputs({ ...formInputs, riskProfile: e.target.value as any })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs font-bold text-slate-900 focus:border-[#a47b3c] focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="" disabled>Select Risk Profile...</option>
                    <option value="AGGRESSIVE">Aggressive Growth (70-80% Equities)</option>
                    <option value="BALANCED">Balanced Wealth Builder (55% Equities, 25% Debt)</option>
                    <option value="CONSERVATIVE">Conservative Capital Preservation (35% Equities)</option>
                  </select>
                </div>
              </div>

              {/* Instant Live Computed Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f5eee3] to-[#fbf9f5] border border-[#e8e0d1] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-[#866632] font-bold block uppercase tracking-wider">
                    Instant Clinical Computation
                  </span>
                  {hasPhysicalMetrics ? (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-extrabold text-[#243047]">
                        BMI: {previewBlueprint.bmi} ({previewBlueprint.bmiCategory})
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-sm font-extrabold text-[#a47b3c]">
                        Target: {previewBlueprint.targetCalories} kcal/day
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-sm font-extrabold text-sky-700">
                        Water: {previewBlueprint.dailyWaterTargetLiters} L/day
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Enter your age, height, and weight above to compute personalized clinical targets.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('PREVIEW')}
                  disabled={!hasPhysicalMetrics}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    hasPhysicalMetrics
                      ? 'border-[#a47b3c] bg-white text-[#a47b3c] hover:bg-[#f5eee3] cursor-pointer'
                      : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'
                  }`}
                >
                  Inspect Full Blueprint →
                </button>
              </div>
            </form>
          )}

          {activeTab === 'PREVIEW' && (
            !hasPhysicalMetrics ? (
              <div className="py-12 px-6 text-center bg-[#faf8f5] rounded-3xl border border-dashed border-[#e4e9f1] space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#f5eee3] text-[#a47b3c] flex items-center justify-center shadow-xs">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Parameters Required</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-medium">
                    Please enter your age, height, and weight in Step 1 so the LifeOS engine can calculate your scientific caloric target, BMR, TDEE, and personalized daily agenda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('PARAMETERS')}
                  className="px-5 py-2.5 rounded-xl bg-[#17365d] text-white text-xs font-bold hover:bg-[#132c4d] shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>← Fill In Parameters</span>
                </button>
              </div>
            ) : (
            <div className="space-y-6">
              {/* Scientific Energy Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e4e9f1]">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Mifflin BMR</div>
                  <div className="text-xl font-extrabold text-[#243047] mt-1">
                    {previewBlueprint.bmr} kcal
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Basal metabolic floor</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e4e9f1]">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Active TDEE</div>
                  <div className="text-xl font-extrabold text-[#243047] mt-1">
                    {previewBlueprint.tdee} kcal
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Total daily energy burned</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f5eee3] border border-[#e8e0d1]">
                  <div className="text-[10px] text-[#866632] font-bold uppercase">Target Budget</div>
                  <div className="text-xl font-extrabold text-[#a47b3c] mt-1">
                    {previewBlueprint.targetCalories} kcal
                  </div>
                  <div className="text-[10px] text-[#866632] mt-0.5">
                    {previewBlueprint.calorieDelta < 0
                      ? `${previewBlueprint.calorieDelta} kcal deficit`
                      : previewBlueprint.calorieDelta > 0
                      ? `+${previewBlueprint.calorieDelta} kcal surplus`
                      : 'Maintenance target'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
                  <div className="text-[10px] text-sky-700 font-bold uppercase">Hydration</div>
                  <div className="text-xl font-extrabold text-sky-800 mt-1">
                    {previewBlueprint.dailyWaterTargetLiters} L
                  </div>
                  <div className="text-[10px] text-sky-700 mt-0.5">35ml/kg + workout factor</div>
                </div>
              </div>

              {/* Macro Partitioning */}
              <div className="p-5 rounded-2xl bg-white border border-[#e4e9f1] space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Target Macronutrient Distribution</span>
                  <span className="text-[#a47b3c]">
                    Protein Priority: {previewBlueprint.macros.proteinGrams}g (
                    {previewBlueprint.macros.proteinCalPercent}%)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-center">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">Protein (4 kcal/g)</span>
                    <div className="text-lg font-extrabold text-rose-900 mt-1">
                      {previewBlueprint.macros.proteinGrams}g
                    </div>
                    <span className="text-[10px] text-rose-700">Muscle preservation</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">Healthy Fats (9 kcal/g)</span>
                    <div className="text-lg font-extrabold text-amber-900 mt-1">
                      {previewBlueprint.macros.fatGrams}g
                    </div>
                    <span className="text-[10px] text-amber-700">Hormone balance (25%)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Carbohydrates (4 kcal/g)</span>
                    <div className="text-lg font-extrabold text-indigo-900 mt-1">
                      {previewBlueprint.macros.carbsGrams}g
                    </div>
                    <span className="text-[10px] text-indigo-700">Glycogen energy</span>
                  </div>
                </div>
              </div>

              {/* Workout Routines Preview */}
              <div className="p-5 rounded-2xl bg-white border border-[#e4e9f1] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-[#a47b3c]" />
                      <span>{previewBlueprint.workoutSplitName}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {previewBlueprint.recommendedSessionsPerWeek} targeted sessions per week with prescribed RPE & rest times
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {previewBlueprint.routines.slice(0, 2).map((routine, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-[#e4e9f1] bg-[#faf8f5] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#17365d]">
                        <span>{routine.dayName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white text-[10px] border border-[#e4e9f1]">
                          {routine.durationMin} mins
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700">
                        {routine.focusTitle}
                      </div>
                      <ul className="text-[10px] text-slate-600 space-y-1">
                        {routine.exercises.slice(0, 3).map((ex, eIdx) => (
                          <li key={eIdx} className="flex justify-between">
                            <span>• {ex.name}</span>
                            <span className="font-mono font-bold text-slate-800">
                              {ex.sets} × {ex.reps}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition Meal Plan Preview */}
              <div className="p-5 rounded-2xl bg-white border border-[#e4e9f1] space-y-3">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <Apple className="w-4 h-4 text-emerald-600" />
                  <span>
                    Personalized Meal Plan ({formInputs.dietaryPreference ? formInputs.dietaryPreference.replace(/_/g, ' ') : 'Standard'})
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {previewBlueprint.dailyMealPlan.slice(0, 2).map((meal, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-[#e4e9f1] bg-[#faf8f5]">
                      <div className="flex justify-between text-[11px] font-bold text-emerald-800">
                        <span>{meal.mealType} ({meal.time})</span>
                        <span>{meal.calories} kcal</span>
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                        {meal.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 truncate">
                        {meal.ingredients}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Allocation Preview */}
              <div className="p-4 rounded-2xl bg-[#e5f5ef] border border-[#16836b]/20 space-y-1.5">
                <div className="text-xs font-extrabold text-[#16836b] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span>Adaptive Financial Allocation Blueprint</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  {previewBlueprint.financialAllocation.rationale}
                </p>
                <div className="flex gap-4 pt-1 text-[11px] font-bold text-slate-800">
                  <span>Equities: {previewBlueprint.financialAllocation.equityPercent}%</span>
                  <span>Debt/FD: {previewBlueprint.financialAllocation.debtFixedIncomePercent}%</span>
                  <span>Gold: {previewBlueprint.financialAllocation.goldHedgingPercent}%</span>
                  <span>Emergency Vault: {previewBlueprint.financialAllocation.recommendedEmergencyMonths} mo</span>
                </div>
              </div>
            </div>
            )
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#e4e9f1] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(false)}
            className="px-4 py-2 rounded-xl border border-[#e4e9f1] text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={!hasPhysicalMetrics}
            className={`px-6 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-lg transition-all flex items-center gap-2 ${
              hasPhysicalMetrics
                ? 'bg-gradient-to-r from-[#17365d] to-[#2c527e] hover:from-[#132c4d] hover:to-[#24456b] shadow-[#17365d]/20 cursor-pointer'
                : 'bg-slate-300 shadow-none cursor-not-allowed opacity-70'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#a47b3c]" />
            <span>Apply Blueprint to Entire LifeOS</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
