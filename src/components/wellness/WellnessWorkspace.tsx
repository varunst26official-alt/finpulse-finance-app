import React, { useState } from 'react';
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
  Apple,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const WellnessWorkspace: React.FC = () => {
  const {
    wellness,
    updateBodyMetrics,
    logWater,
    resetWater,
    logWorkoutMinutes,
    logCalories,
  } = useLifeOSStore();

  const [height, setHeight] = useState(wellness.heightCm);
  const [weight, setWeight] = useState(wellness.weightKg);

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

  const handleMetricsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBodyMetrics(height, weight);
  };

  return (
    <div className="space-y-6">
      {/* 1. Rose Gradient Hero Banner */}
      <SectionHero
        section="wellness"
        onPrimaryAction={() => {
          const el = document.getElementById('bmi-calculator');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        primaryActionLabel="Calculate BMI & Metrics"
        onSecondaryAction={() => logWater(0.25)}
        secondaryActionLabel="+ Log 250ml Water"
      />

      {/* 2. Top 4 Wellness Metric Cards */}
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

      {/* 3. Interactive Body Metrics & BMI Calculator Panel */}
      <div id="bmi-calculator" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
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
            {/* Height Slider */}
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

            {/* Weight Slider */}
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

          {/* Medical Disclaimer Banner (BRD §8.2 & §11 mandatory rule) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Medical Disclaimer:</strong> Body Mass Index (BMI) is an observational screening tool. It does not measure body fat percentage, muscle density, bone mass, or cardiovascular fitness directly. Always consult a certified healthcare professional before starting an intensive training regimen.
            </div>
          </div>
        </section>

        {/* 4. Hydration & Quick Workout Logging Panel */}
        <section className="lg:col-span-6 bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>Daily Water Hydration Tracker</span>
              </h3>
              <button
                onClick={resetWater}
                className="text-xs text-[#6f7c91] hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                title="Reset water log"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Hydration Bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-[#243047]">
                  {wellness.waterLitersLogged} Liters Logged
                </span>
                <span className="text-sky-700 font-mono">{waterProgress}% of target</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${waterProgress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
                />
              </div>
            </div>

            {/* Quick Water Logging Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => logWater(0.25)}
                className="py-2.5 px-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 text-xs font-bold hover:bg-sky-100 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+250 ml Glass</span>
              </button>
              <button
                onClick={() => logWater(0.5)}
                className="py-2.5 px-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 text-xs font-bold hover:bg-sky-100 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+500 ml Bottle</span>
              </button>
              <button
                onClick={() => logWater(1.0)}
                className="py-2.5 px-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 text-xs font-bold hover:bg-sky-100 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+1.0 L Flask</span>
              </button>
            </div>

            {/* Quick Workout Session Logger */}
            <div className="pt-3 border-t border-[#e4e9f1]">
              <div className="text-xs font-extrabold text-[#243047] mb-2 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-[#a47b3c]" />
                <span>Log Movement & Workout Time</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => logWorkoutMinutes(20)}
                  className="py-2 px-3 rounded-xl border border-[#e4e9f1] bg-[#faf8f5] text-xs font-bold text-[#243047] hover:bg-[#f5eee3] transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#a47b3c]" />
                  <span>+20m Yoga</span>
                </button>
                <button
                  onClick={() => logWorkoutMinutes(30)}
                  className="py-2 px-3 rounded-xl border border-[#e4e9f1] bg-[#faf8f5] text-xs font-bold text-[#243047] hover:bg-[#f5eee3] transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#a47b3c]" />
                  <span>+30m Cardio</span>
                </button>
                <button
                  onClick={() => logWorkoutMinutes(45)}
                  className="py-2 px-3 rounded-xl border border-[#e4e9f1] bg-[#faf8f5] text-xs font-bold text-[#243047] hover:bg-[#f5eee3] transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#a47b3c]" />
                  <span>+45m Strength</span>
                </button>
              </div>
            </div>

            {/* Quick Food Energy Logger */}
            <div className="pt-3 border-t border-[#e4e9f1]">
              <div className="text-xs font-extrabold text-[#243047] mb-2 flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-orange-600" />
                <span>Quick Log Meal Energy</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => logCalories(450)}
                  className="py-2 px-3 rounded-xl border border-orange-200 bg-orange-50 text-xs font-bold text-orange-800 hover:bg-orange-100 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+450 kcal Breakfast</span>
                </button>
                <button
                  onClick={() => logCalories(650)}
                  className="py-2 px-3 rounded-xl border border-orange-200 bg-orange-50 text-xs font-bold text-orange-800 hover:bg-orange-100 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+650 kcal Lunch</span>
                </button>
                <button
                  onClick={() => logCalories(550)}
                  className="py-2 px-3 rounded-xl border border-orange-200 bg-orange-50 text-xs font-bold text-orange-800 hover:bg-orange-100 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+550 kcal Dinner</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
