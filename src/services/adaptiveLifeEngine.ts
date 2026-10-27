/**
 * LifeOS Adaptive Intelligence Engine
 * Grounded in peer-reviewed sports science, clinical nutrition (Mifflin-St Jeor, TDEE,
 * macronutrient partitioning), and quantitative financial allocation algorithms.
 */

export interface UserAdaptiveInputs {
  age?: number | '';
  gender?: 'MALE' | 'FEMALE' | '';
  heightCm?: number | '';
  weightKg?: number | '';
  fitnessGoal?: 'FAT_LOSS' | 'MUSCLE_HYPERTROPHY' | 'ATHLETIC_CONDITIONING' | 'HEALTHY_LONGEVITY' | '';
  intensityLevel?: 'BEGINNER_LIGHT' | 'MODERATE_FITNESS' | 'HIGH_INTENSITY' | 'MAX_BEAST' | '';
  dietaryPreference?: 'BALANCED_NON_VEG' | 'VEGETARIAN' | 'VEGAN' | 'EGGETARIAN' | 'KETO' | '';
  workHoursPerDay?: number | ''; // 4 to 12
  riskProfile?: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE' | '';
  monthlyInflowUSD?: number;
}

export interface ExerciseItem {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  rpe: string;
  notes: string;
}

export interface WorkoutRoutineDay {
  dayName: string;
  focusTitle: string;
  durationMin: number;
  targetIntensity: string;
  exercises: ExerciseItem[];
}

export interface MealItem {
  mealType: string;
  time: string;
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients: string;
}

export interface AdaptiveLifeBlueprint {
  // Biometrics
  bmi: number;
  bmiCategory: string;
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  targetCalories: number;
  calorieDelta: number; // positive for surplus, negative for deficit
  macros: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    proteinCalPercent: number;
    carbsCalPercent: number;
    fatCalPercent: number;
  };
  dailyWaterTargetLiters: number;

  // Fitness Workouts
  workoutSplitName: string;
  recommendedSessionsPerWeek: number;
  routines: WorkoutRoutineDay[];

  // Nutrition Meal Plan
  dailyMealPlan: MealItem[];

  // Financial Asset Allocation
  financialAllocation: {
    equityPercent: number;
    debtFixedIncomePercent: number;
    goldHedgingPercent: number;
    liquidCashPercent: number;
    recommendedEmergencyMonths: number;
    rationale: string;
  };

  // Productivity Schedule
  productivityAgenda: Array<{
    time: string;
    title: string;
    category: 'WELLNESS' | 'FINANCE' | 'PRODUCTIVITY' | 'LEARNING' | 'LIFEADMIN';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    badge: string;
    icon: string;
    notes: string;
  }>;

  // Explainability & Scientific Foundations
  scientificPrinciples: string[];
}

export function computeAdaptiveBlueprint(inputs: UserAdaptiveInputs): AdaptiveLifeBlueprint {
  const age = Number(inputs.age) || 28;
  const gender = inputs.gender || 'MALE';
  const heightCm = Number(inputs.heightCm) || 170;
  const weightKg = Number(inputs.weightKg) || 70;
  const fitnessGoal = inputs.fitnessGoal || 'FAT_LOSS';
  const intensityLevel = inputs.intensityLevel || 'MODERATE_FITNESS';
  const dietaryPreference = inputs.dietaryPreference || 'BALANCED_NON_VEG';
  const workHoursPerDay = Number(inputs.workHoursPerDay) || 8;
  const riskProfile = inputs.riskProfile || 'BALANCED';

  // 1. Adult BMI Calculation
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let bmiCategory = 'Normal / Healthy Weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25.0 && bmi < 30.0) bmiCategory = 'Overweight';
  else if (bmi >= 30.0) bmiCategory = 'Obesity Range';

  // 2. Mifflin-St Jeor BMR Equation (Gold standard in clinical nutrition)
  // Men: 10 * W + 6.25 * H - 5 * A + 5
  // Women: 10 * W + 6.25 * H - 5 * A - 161
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'MALE') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  // 3. Physical Activity Level (PAL) Multiplier
  let pal = 1.375; // Light
  if (intensityLevel === 'BEGINNER_LIGHT') pal = 1.25;
  else if (intensityLevel === 'MODERATE_FITNESS') pal = 1.55;
  else if (intensityLevel === 'HIGH_INTENSITY') pal = 1.725;
  else if (intensityLevel === 'MAX_BEAST') pal = 1.9;

  const tdee = Math.round(bmr * pal);

  // 4. Caloric Budget & Goal Adjustment
  let targetCalories = tdee;
  let calorieDelta = 0;

  if (fitnessGoal === 'FAT_LOSS' || (bmi >= 25 && fitnessGoal !== 'MUSCLE_HYPERTROPHY')) {
    // 20% healthy deficit for sustainable fat loss without muscle catabolism
    calorieDelta = -Math.round(tdee * 0.2);
    targetCalories = tdee + calorieDelta;
    // Safety minimum floor (BRD §8.4 rule)
    const floor = gender === 'MALE' ? 1500 : 1250;
    targetCalories = Math.max(floor, targetCalories);
  } else if (fitnessGoal === 'MUSCLE_HYPERTROPHY' || bmi < 18.5) {
    // 10% controlled lean surplus
    calorieDelta = Math.round(tdee * 0.1);
    targetCalories = tdee + calorieDelta;
  } else {
    // Maintenance & athletic conditioning
    calorieDelta = 0;
    targetCalories = tdee;
  }

  // 5. Evidence-Based Macronutrient Partitioning
  // Protein: 1.8 to 2.2 g/kg (4 kcal/g)
  let proteinPerKg = 2.0;
  if (fitnessGoal === 'HEALTHY_LONGEVITY') proteinPerKg = 1.6;
  if (fitnessGoal === 'MUSCLE_HYPERTROPHY' || fitnessGoal === 'FAT_LOSS') proteinPerKg = 2.2;

  const proteinGrams = Math.round(weightKg * proteinPerKg);
  const proteinCals = proteinGrams * 4;

  // Fat: 25% of total calories (9 kcal/g) for endocrine and hormone optimization
  const fatCals = Math.round(targetCalories * 0.25);
  const fatGrams = Math.round(fatCals / 9);

  // Carbs: Remaining calories (4 kcal/g) for glycogen replenishment and cognitive output
  const carbsCals = Math.max(0, targetCalories - proteinCals - fatCals);
  const carbsGrams = Math.round(carbsCals / 4);

  const proteinCalPercent = Math.round((proteinCals / targetCalories) * 100);
  const fatCalPercent = Math.round((fatCals / targetCalories) * 100);
  const carbsCalPercent = Math.round((carbsCals / targetCalories) * 100);

  const macros = {
    proteinGrams,
    carbsGrams,
    fatGrams,
    proteinCalPercent,
    carbsCalPercent,
    fatCalPercent,
  };

  // 6. Scientific Water Hydration Target
  // 35 ml per kg bodyweight + workout factor
  let waterLiters = (weightKg * 35) / 1000;
  if (intensityLevel === 'MODERATE_FITNESS') waterLiters += 0.5;
  if (intensityLevel === 'HIGH_INTENSITY') waterLiters += 0.8;
  if (intensityLevel === 'MAX_BEAST') waterLiters += 1.2;
  const dailyWaterTargetLiters = Math.round(waterLiters * 10) / 10;

  // 7. Dynamic Workout Routines adapted to BMI, Goal, & Intensity
  let workoutSplitName = 'Full-Body Resistance & Metabolic Conditioning (3 Days/Week)';
  let recommendedSessionsPerWeek = 3;
  let routines: WorkoutRoutineDay[] = [];

  if (bmi >= 25 || fitnessGoal === 'FAT_LOSS') {
    // Low-joint-stress, high-calorie expenditure, core-stabilizing circuit
    workoutSplitName = 'Joint-Friendly Low-Impact Fat Loss & Resistance Split';
    recommendedSessionsPerWeek = 4;
    routines = [
      {
        dayName: 'Day 1 (Monday)',
        focusTitle: 'Full-Body Compound Movement & Joint Stability',
        durationMin: intensityLevel === 'BEGINNER_LIGHT' ? 30 : 45,
        targetIntensity: 'RPE 7 (Moderate Controlled)',
        exercises: [
          { name: 'Goblet Squats (Dumbbell or Kettlebell)', sets: 3, reps: '12-15 reps', restSec: 60, rpe: 'RPE 7', notes: 'Keep chest upright, engage core' },
          { name: 'Incline Dumbbell Bench Press', sets: 3, reps: '10-12 reps', restSec: 60, rpe: 'RPE 7', notes: 'Low shoulder strain angle at 30°' },
          { name: 'Cable Seated Lat Rows', sets: 3, reps: '12-15 reps', restSec: 60, rpe: 'RPE 7', notes: 'Squeeze shoulder blades for 1 second' },
          { name: 'Dumbbell Romanian Deadlift (Hip Hinge)', sets: 3, reps: '10-12 reps', restSec: 75, rpe: 'RPE 7', notes: 'Soft knees, feel hamstring stretch' },
          { name: 'Core Plank & Isometric Hold', sets: 3, reps: '30-45 sec', restSec: 45, rpe: 'RPE 8', notes: 'Brace abdominal wall tightly' },
        ],
      },
      {
        dayName: 'Day 2 (Wednesday)',
        focusTitle: 'Zone-2 Steady-State Cardio & Aerobic Base',
        durationMin: 35,
        targetIntensity: 'Heart Rate Zone 2 (Conversational Pace)',
        exercises: [
          { name: 'Incline Treadmill Walk (Speed 4.8 km/h, Incline 8%)', sets: 1, reps: '25 mins continuous', restSec: 0, rpe: 'RPE 6', notes: 'Maximizes fat oxidation without cortisol spike' },
          { name: 'Stationary Recumbent Bike Cooldown', sets: 1, reps: '10 mins smooth', restSec: 0, rpe: 'RPE 5', notes: 'Flushes lactic acid and mobilizes hips' },
        ],
      },
      {
        dayName: 'Day 3 (Friday)',
        focusTitle: 'Upper Body Tone & Core Density',
        durationMin: 40,
        targetIntensity: 'RPE 7-8',
        exercises: [
          { name: 'Seated Cable Lat Pulldowns', sets: 3, reps: '12 reps', restSec: 60, rpe: 'RPE 7', notes: 'Pull to upper clavicle' },
          { name: 'Standing Dumbbell Overhead Press', sets: 3, reps: '10-12 reps', restSec: 60, rpe: 'RPE 7', notes: 'Squeeze glutes to protect lower spine' },
          { name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '12-15 reps', restSec: 45, rpe: 'RPE 8', notes: 'Full stretch at bottom' },
          { name: 'Tricep Rope Overhead Extensions', sets: 3, reps: '12-15 reps', restSec: 45, rpe: 'RPE 8', notes: 'Flairs elbows out slightly at lockout' },
          { name: 'Bird-Dog & Deadbug Core Circuit', sets: 3, reps: '10 reps/side', restSec: 45, rpe: 'RPE 6', notes: 'Protects lumbar discs' },
        ],
      },
      {
        dayName: 'Day 4 (Saturday)',
        focusTitle: 'Lower Body Sculpt & Calorie Ignition',
        durationMin: 35,
        targetIntensity: 'RPE 7',
        exercises: [
          { name: 'Leg Press (Moderate Stance)', sets: 3, reps: '12-15 reps', restSec: 75, rpe: 'RPE 7', notes: 'Safe back support, 90° knee bend' },
          { name: 'Glute Bridges / Hip Thrusts', sets: 3, reps: '15 reps', restSec: 60, rpe: 'RPE 8', notes: '2 second squeeze at peak extension' },
          { name: 'Seated Hamstring Leg Curls', sets: 3, reps: '12 reps', restSec: 60, rpe: 'RPE 7', notes: 'Controlled 3-second eccentric release' },
          { name: 'Farmer Walk Carries', sets: 3, reps: '40 meters', restSec: 60, rpe: 'RPE 8', notes: 'Grip strength and postural endurance' },
        ],
      },
    ];
  } else if (fitnessGoal === 'MUSCLE_HYPERTROPHY' || bmi < 18.5) {
    // Push / Pull / Legs Hypertrophy Split for maximum muscle protein synthesis
    workoutSplitName = 'Push / Pull / Legs (PPL) Progressive Overload Hypertrophy';
    recommendedSessionsPerWeek = 4;
    routines = [
      {
        dayName: 'Day 1 (Push - Chest, Shoulders, Triceps)',
        focusTitle: 'Horizontal Pressing & Anterior Deltoid Volume',
        durationMin: 50,
        targetIntensity: 'RPE 8-9 (1-2 Reps in Reserve)',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: 4, reps: '8-10 reps', restSec: 90, rpe: 'RPE 8.5', notes: 'Primary horizontal press, progressive load' },
          { name: 'Incline Dumbbell Chest Press (30° Angle)', sets: 3, reps: '10-12 reps', restSec: 75, rpe: 'RPE 8', notes: 'Targets clavicular upper pectoral fibers' },
          { name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '8-10 reps', restSec: 75, rpe: 'RPE 8', notes: 'Full vertical lockout overhead' },
          { name: 'Cable Lateral Raises', sets: 4, reps: '12-15 reps', restSec: 60, rpe: 'RPE 9', notes: 'Constant tension on medial delt' },
          { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12-15 reps', restSec: 60, rpe: 'RPE 9', notes: 'Elbows pinned to sides' },
        ],
      },
      {
        dayName: 'Day 2 (Pull - Back, Rear Delts, Biceps)',
        focusTitle: 'Vertical/Horizontal Pulling & Posterior Thickness',
        durationMin: 50,
        targetIntensity: 'RPE 8-9',
        exercises: [
          { name: 'Barbell Bent-Over Row (Overhand Grip)', sets: 4, reps: '8-10 reps', restSec: 90, rpe: 'RPE 8.5', notes: 'Torso at 45°, pull to sternum' },
          { name: 'Wide-Grip Lat Pulldowns / Pull-ups', sets: 3, reps: '8-12 reps', restSec: 75, rpe: 'RPE 8', notes: 'Full lat stretch at peak elevation' },
          { name: 'Chest-Supported Incline Row', sets: 3, reps: '10-12 reps', restSec: 60, rpe: 'RPE 8', notes: 'Eliminates lower back momentum' },
          { name: 'Face Pulls with External Rotation', sets: 3, reps: '15 reps', restSec: 60, rpe: 'RPE 8', notes: 'Crucial for rotator cuff and rear delts' },
          { name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '10-12 reps', restSec: 60, rpe: 'RPE 9', notes: 'Peak supination at top' },
        ],
      },
      {
        dayName: 'Day 3 (Legs & Hamstrings)',
        focusTitle: 'Quad Sweep, Glute Drive & Hamstring Power',
        durationMin: 55,
        targetIntensity: 'RPE 8.5',
        exercises: [
          { name: 'Barbell Back Squats', sets: 4, reps: '8-10 reps', restSec: 120, rpe: 'RPE 8.5', notes: 'Depth below parallel, chest proud' },
          { name: 'Romanian Deadlifts (Barbell or DB)', sets: 3, reps: '10-12 reps', restSec: 90, rpe: 'RPE 8', notes: 'Push hips backward, load hamstrings' },
          { name: 'Bulgarian Split Squats', sets: 3, reps: '10 reps/leg', restSec: 60, rpe: 'RPE 8.5', notes: 'Unilateral leg balance' },
          { name: 'Seated Leg Extensions', sets: 3, reps: '12-15 reps', restSec: 60, rpe: 'RPE 9', notes: 'Quadriceps pump finisher' },
          { name: 'Standing Calf Raises', sets: 4, reps: '15 reps', restSec: 45, rpe: 'RPE 8', notes: 'Hold 2 seconds at full stretch' },
        ],
      },
      {
        dayName: 'Day 4 (Upper Hypertrophy Detailing)',
        focusTitle: 'Chest Flys, Deltoid Capping & Arm Specialization',
        durationMin: 45,
        targetIntensity: 'RPE 8',
        exercises: [
          { name: 'Incline Dumbbell Hex Press', sets: 3, reps: '10-12 reps', restSec: 60, rpe: 'RPE 8', notes: 'Continuous pectoral tension' },
          { name: 'Cable Chest Flys', sets: 3, reps: '15 reps', restSec: 60, rpe: 'RPE 9', notes: 'Deep stretch across pectorals' },
          { name: 'Dumbbell Hammer Curls', sets: 3, reps: '12 reps', restSec: 60, rpe: 'RPE 8.5', notes: 'Builds brachialis for arm thickness' },
          { name: 'EZ-Bar Skull Crushers', sets: 3, reps: '10-12 reps', restSec: 60, rpe: 'RPE 8.5', notes: 'Long head of triceps' },
          { name: 'Hanging Leg / Knee Raises', sets: 3, reps: '15 reps', restSec: 45, rpe: 'RPE 8', notes: 'Decompresses spine and strengthens abs' },
        ],
      },
    ];
  } else {
    // Athletic conditioning & Longevity (Balanced strength, mobility & VO2 max)
    workoutSplitName = 'Athletic Functional Performance & Longevity Protocol';
    recommendedSessionsPerWeek = 4;
    routines = [
      {
        dayName: 'Day 1 (Strength & Kinetic Power)',
        focusTitle: 'Multi-Joint Compound Power',
        durationMin: 45,
        targetIntensity: 'RPE 8',
        exercises: [
          { name: 'Trap-Bar Deadlift (High Handles)', sets: 4, reps: '6-8 reps', restSec: 90, rpe: 'RPE 8', notes: 'Maximum force generation with minimal spinal shear' },
          { name: 'Standing Barbell Overhead Military Press', sets: 3, reps: '8-10 reps', restSec: 75, rpe: 'RPE 8', notes: 'Shoulder stability and core bracing' },
          { name: 'Neutral-Grip Weighted / Bodyweight Pull-ups', sets: 3, reps: '8-10 reps', restSec: 75, rpe: 'RPE 8', notes: 'Unmatched lat and grip power' },
          { name: 'Kettlebell Swings (Hip Explosiveness)', sets: 3, reps: '15 reps', restSec: 60, rpe: 'RPE 8', notes: 'Posterior chain speed' },
        ],
      },
      {
        dayName: 'Day 2 (Aerobic Engine & Zone 2 VO2 Max)',
        focusTitle: 'Mitochondrial Density & Cardiovascular Longevity',
        durationMin: 40,
        targetIntensity: 'Zone 2 (130-145 BPM)',
        exercises: [
          { name: 'Rowing Machine or Air-Bike Steady Pace', sets: 1, reps: '30 mins continuous', restSec: 0, rpe: 'RPE 6', notes: 'Maintains steady aerobic output' },
          { name: 'Thoracic & Hip Mobility Flow', sets: 1, reps: '10 mins', restSec: 0, rpe: 'RPE 4', notes: 'Restores joint range of motion' },
        ],
      },
      {
        dayName: 'Day 3 (Hypertrophy & Structural Balance)',
        focusTitle: 'Functional Upper & Lower Stability',
        durationMin: 45,
        targetIntensity: 'RPE 7.5',
        exercises: [
          { name: 'Front Squats (or Safety Bar Squat)', sets: 3, reps: '8-10 reps', restSec: 90, rpe: 'RPE 8', notes: 'Upright quad strength' },
          { name: 'One-Arm Dumbbell Rows', sets: 3, reps: '10-12 reps/side', restSec: 60, rpe: 'RPE 8', notes: 'Anti-rotational core stability' },
          { name: 'Dumbbell Walking Lunges', sets: 3, reps: '12 steps/leg', restSec: 60, rpe: 'RPE 8', notes: 'Hip flexor mobility' },
          { name: 'Face Pulls & External Rotations', sets: 3, reps: '15 reps', restSec: 45, rpe: 'RPE 7', notes: 'Counteracts desk posture' },
        ],
      },
      {
        dayName: 'Day 4 (High-Intensity Interval Sprints)',
        focusTitle: 'Anaerobic Threshold & VO2 Max Spikes',
        durationMin: 30,
        targetIntensity: 'High Intensity Intervals (90% Max HR)',
        exercises: [
          { name: 'Sled Pushes or Assault Bike Sprints', sets: 8, reps: '30s sprint / 60s recovery', restSec: 60, rpe: 'RPE 9.5', notes: 'Powerful anaerobic capacity' },
          { name: 'Dead Hang from Pull-up Bar', sets: 3, reps: '60 seconds', restSec: 45, rpe: 'RPE 7', notes: 'Decompresses vertebrae and strengthens grip' },
        ],
      },
    ];
  }

  // 8. Dynamic Meal Plan Tailored to Calories, Macros, and Dietary Preference
  const dailyMealPlan: MealItem[] = generateDynamicMealPlan(targetCalories, macros, dietaryPreference);

  // 9. Adaptive Financial Asset Allocation Model
  // Based on age, risk tolerance, and economic resilience guidelines
  let equityPercent = Math.max(30, Math.min(80, 110 - age));
  let debtPercent = 20;
  let goldPercent = 10;
  let cashPercent = 10;
  let emergencyMonths = 6;

  if (riskProfile === 'AGGRESSIVE') {
    equityPercent = Math.min(85, equityPercent + 15);
    debtPercent = 10;
    goldPercent = 5;
    cashPercent = 5;
    emergencyMonths = 6;
  } else if (riskProfile === 'CONSERVATIVE') {
    equityPercent = Math.max(30, equityPercent - 20);
    debtPercent = 45;
    goldPercent = 15;
    cashPercent = 10;
    emergencyMonths = 12;
  }

  const financialAllocation = {
    equityPercent,
    debtFixedIncomePercent: debtPercent,
    goldHedgingPercent: goldPercent,
    liquidCashPercent: cashPercent,
    recommendedEmergencyMonths: emergencyMonths,
    rationale: `Calibrated for ${age} yr old with ${riskProfile.toLowerCase()} profile. ${equityPercent}% growth equities outpace inflation, while ${debtPercent}% debt and ${goldPercent}% sovereign gold buffer volatility with a ${emergencyMonths}-month emergency vault.`,
  };

  // 10. Productivity Agenda Adapted to Work Hours & Energy Curves
  const productivityAgenda = generateAdaptiveAgenda(workHoursPerDay, intensityLevel);

  return {
    bmi,
    bmiCategory,
    bmr,
    tdee,
    targetCalories,
    calorieDelta,
    macros: {
      proteinGrams,
      carbsGrams,
      fatGrams,
      proteinCalPercent,
      carbsCalPercent,
      fatCalPercent,
    },
    dailyWaterTargetLiters,
    workoutSplitName,
    recommendedSessionsPerWeek,
    routines,
    dailyMealPlan,
    financialAllocation,
    productivityAgenda,
    scientificPrinciples: [
      'Mifflin-St Jeor Clinical BMR Calculation for baseline energy floor.',
      `Macronutrient protein density set to ${proteinPerKg}g/kg body weight to preserve lean structural tissue.`,
      `Progressive Overload training split structured for 2x/week frequency per muscle group.`,
      `Optimal hydration formula calibrated at 35ml/kg plus workout compensation.`,
      `110 - Age asset allocation formula adapted to ${riskProfile.toLowerCase()} risk profile.`,
    ],
  };
}

function generateDynamicMealPlan(
  totalCalories: number,
  macros: { proteinGrams: number; carbsGrams: number; fatGrams: number },
  pref: UserAdaptiveInputs['dietaryPreference']
): MealItem[] {
  // Breakfast 25%, Lunch 35%, Dinner 30%, Snack 10%
  const bCals = Math.round(totalCalories * 0.25);
  const lCals = Math.round(totalCalories * 0.35);
  const dCals = Math.round(totalCalories * 0.3);
  const sCals = Math.round(totalCalories * 0.1);

  if (pref === 'VEGETARIAN') {
    return [
      {
        mealType: 'BREAKFAST',
        time: '8:00 AM',
        title: 'High-Protein Sprouted Moong & Paneer Bowl',
        calories: bCals,
        proteinG: Math.round(macros.proteinGrams * 0.25),
        carbsG: Math.round(macros.carbsGrams * 0.25),
        fatG: Math.round(macros.fatGrams * 0.25),
        ingredients: '100g low-fat paneer, 50g sprouted moong, rolled oats, chia seeds, black coffee',
      },
      {
        mealType: 'LUNCH',
        time: '1:00 PM',
        title: 'Soya Chunks & Dal Quinoa Power Thali',
        calories: lCals,
        proteinG: Math.round(macros.proteinGrams * 0.35),
        carbsG: Math.round(macros.carbsGrams * 0.35),
        fatG: Math.round(macros.fatGrams * 0.35),
        ingredients: '60g textured soya chunks curry, 1 bowl yellow dal, 150g cooked quinoa, mixed cucumber & tomato salad',
      },
      {
        mealType: 'SNACK',
        time: '4:30 PM',
        title: 'Greek Yogurt & Roasted Almond Energy Crunch',
        calories: sCals,
        proteinG: Math.round(macros.proteinGrams * 0.1),
        carbsG: Math.round(macros.carbsGrams * 0.1),
        fatG: Math.round(macros.fatGrams * 0.1),
        ingredients: '150g unflavored Greek yogurt, 15g raw almonds, 1 tsp honey, green tea',
      },
      {
        mealType: 'DINNER',
        time: '8:00 PM',
        title: 'Tofu Palak & Vegetable Stir-Fry with Multigrain Roti',
        calories: dCals,
        proteinG: Math.round(macros.proteinGrams * 0.3),
        carbsG: Math.round(macros.carbsGrams * 0.3),
        fatG: Math.round(macros.fatGrams * 0.3),
        ingredients: '150g firm tofu cubes in spinach gravy, 2 multigrain rotis, fresh olive oil drizzle',
      },
    ];
  } else if (pref === 'VEGAN') {
    return [
      {
        mealType: 'BREAKFAST',
        time: '8:00 AM',
        title: 'Tofu Scramble & Avocado Sourdough Toast',
        calories: bCals,
        proteinG: Math.round(macros.proteinGrams * 0.25),
        carbsG: Math.round(macros.carbsGrams * 0.25),
        fatG: Math.round(macros.fatGrams * 0.25),
        ingredients: '150g crumbled turmeric tofu, 2 slices toasted sourdough, 40g fresh avocado, black coffee',
      },
      {
        mealType: 'LUNCH',
        time: '1:00 PM',
        title: 'Spiced Chickpea & Tempeh Mediterranean Bowl',
        calories: lCals,
        proteinG: Math.round(macros.proteinGrams * 0.35),
        carbsG: Math.round(macros.carbsGrams * 0.35),
        fatG: Math.round(macros.fatGrams * 0.35),
        ingredients: '100g organic tempeh strips, 100g boiled chickpeas, 150g brown rice, tahini lemon dressing',
      },
      {
        mealType: 'SNACK',
        time: '4:30 PM',
        title: 'Pea Protein Shake with Walnuts & Blueberries',
        calories: sCals,
        proteinG: Math.round(macros.proteinGrams * 0.15),
        carbsG: Math.round(macros.carbsGrams * 0.1),
        fatG: Math.round(macros.fatGrams * 0.1),
        ingredients: '1 scoop plant pea/rice protein isolate, 200ml almond milk, 20g walnuts, berries',
      },
      {
        mealType: 'DINNER',
        time: '8:00 PM',
        title: 'Hearty Lentil Soup with Steamed Broccoli & Sweet Potato',
        calories: dCals,
        proteinG: Math.round(macros.proteinGrams * 0.25),
        carbsG: Math.round(macros.carbsGrams * 0.3),
        fatG: Math.round(macros.fatGrams * 0.3),
        ingredients: '200g brown lentil soup, 150g roasted sweet potatoes, 100g steamed broccoli with garlic',
      },
    ];
  } else if (pref === 'EGGETARIAN') {
    return [
      {
        mealType: 'BREAKFAST',
        time: '8:00 AM',
        title: '4-Egg Herb Omelette with Steel-Cut Oats',
        calories: bCals,
        proteinG: Math.round(macros.proteinGrams * 0.3),
        carbsG: Math.round(macros.carbsGrams * 0.2),
        fatG: Math.round(macros.fatGrams * 0.25),
        ingredients: '3 whole eggs + 1 egg white omelette with bell peppers, 40g steel-cut oats with cinnamon',
      },
      {
        mealType: 'LUNCH',
        time: '1:00 PM',
        title: 'Egg Bhurji Curry with Jeera Brown Rice & Dal',
        calories: lCals,
        proteinG: Math.round(macros.proteinGrams * 0.35),
        carbsG: Math.round(macros.carbsGrams * 0.35),
        fatG: Math.round(macros.fatGrams * 0.35),
        ingredients: '4 spiced scrambled eggs, 1 cup yellow moong dal, 150g brown rice, green salad',
      },
      {
        mealType: 'SNACK',
        time: '4:30 PM',
        title: 'Whey Protein Shake with Roasted Almonds',
        calories: sCals,
        proteinG: Math.round(macros.proteinGrams * 0.1),
        carbsG: Math.round(macros.carbsGrams * 0.1),
        fatG: Math.round(macros.fatGrams * 0.1),
        ingredients: '1 scoop whey protein, 15g California almonds, green tea',
      },
      {
        mealType: 'DINNER',
        time: '8:00 PM',
        title: 'Grilled Paneer & Egg Salad Bowl with Olive Oil',
        calories: dCals,
        proteinG: Math.round(macros.proteinGrams * 0.25),
        carbsG: Math.round(macros.carbsGrams * 0.35),
        fatG: Math.round(macros.fatGrams * 0.3),
        ingredients: '100g grilled paneer, 2 boiled eggs sliced, large romaine & cherry tomato salad, light vinaigrette',
      },
    ];
  } else if (pref === 'KETO') {
    return [
      {
        mealType: 'BREAKFAST',
        time: '8:00 AM',
        title: 'Scrambled Eggs in Butter with Sliced Avocado',
        calories: bCals,
        proteinG: Math.round(macros.proteinGrams * 0.25),
        carbsG: 6,
        fatG: Math.round(macros.fatGrams * 0.35),
        ingredients: '3 whole pasture-raised eggs scrambled in grass-fed butter, half sliced avocado, black coffee',
      },
      {
        mealType: 'LUNCH',
        time: '1:00 PM',
        title: 'Grilled Herb Chicken with Garlic Sauteed Spinach',
        calories: lCals,
        proteinG: Math.round(macros.proteinGrams * 0.4),
        carbsG: 8,
        fatG: Math.round(macros.fatGrams * 0.35),
        ingredients: '200g grilled skinless chicken breast, 150g spinach sauteed in extra virgin olive oil, parmesan shavings',
      },
      {
        mealType: 'SNACK',
        time: '4:30 PM',
        title: 'Macadamia & Walnut Ketogenic Trail Mix',
        calories: sCals,
        proteinG: 6,
        carbsG: 4,
        fatG: Math.round(macros.fatGrams * 0.15),
        ingredients: '25g macadamia nuts, 15g walnuts, green tea',
      },
      {
        mealType: 'DINNER',
        time: '8:00 PM',
        title: 'Wild Salmon Fillet with Asparagus in Herb Butter',
        calories: dCals,
        proteinG: Math.round(macros.proteinGrams * 0.35),
        carbsG: 6,
        fatG: Math.round(macros.fatGrams * 0.35),
        ingredients: '180g pan-seared wild salmon, 100g grilled asparagus spears, lemon herb butter glaze',
      },
    ];
  } else {
    // BALANCED_NON_VEG (Default)
    return [
      {
        mealType: 'BREAKFAST',
        time: '8:00 AM',
        title: 'Golden Scrambled Eggs, Oatmeal & Berries',
        calories: bCals,
        proteinG: Math.round(macros.proteinGrams * 0.25),
        carbsG: Math.round(macros.carbsGrams * 0.25),
        fatG: Math.round(macros.fatGrams * 0.25),
        ingredients: '3 whole eggs scrambled, 50g rolled oats with almond milk, fresh blueberries, black coffee',
      },
      {
        mealType: 'LUNCH',
        time: '1:00 PM',
        title: 'Grilled Lemon Herb Chicken & Brown Rice Bowl',
        calories: lCals,
        proteinG: Math.round(macros.proteinGrams * 0.35),
        carbsG: Math.round(macros.carbsGrams * 0.35),
        fatG: Math.round(macros.fatGrams * 0.35),
        ingredients: '180g grilled chicken breast, 150g steamed brown rice, steamed broccoli & carrots with virgin olive oil',
      },
      {
        mealType: 'SNACK',
        time: '4:30 PM',
        title: 'Greek Yogurt with Whey & Raw Walnuts',
        calories: sCals,
        proteinG: Math.round(macros.proteinGrams * 0.15),
        carbsG: Math.round(macros.carbsGrams * 0.1),
        fatG: Math.round(macros.fatGrams * 0.1),
        ingredients: '150g unflavored Greek yogurt, 1 scoop whey isolate, 15g California walnuts, green tea',
      },
      {
        mealType: 'DINNER',
        time: '8:00 PM',
        title: 'Pan-Seared Salmon (or Lean Steak) with Roasted Sweet Potato',
        calories: dCals,
        proteinG: Math.round(macros.proteinGrams * 0.25),
        carbsG: Math.round(macros.carbsGrams * 0.3),
        fatG: Math.round(macros.fatGrams * 0.3),
        ingredients: '160g wild salmon fillet, 150g roasted sweet potatoes, mixed green salad with lemon vinaigrette',
      },
    ];
  }
}

function generateAdaptiveAgenda(
  workHours: number,
  intensity: UserAdaptiveInputs['intensityLevel']
): AdaptiveLifeBlueprint['productivityAgenda'] {
  const isHighIntensity = intensity === 'HIGH_INTENSITY' || intensity === 'MAX_BEAST';

  return [
    {
      time: '6:30 AM',
      title: 'Morning Sunlight, Hydration & Mobility Priming',
      category: 'WELLNESS',
      priority: 'HIGH',
      badge: 'Habit',
      icon: '☼',
      notes: '500ml water with electrolytes + 10 mins mobility stretches to calibrate circadian rhythm',
    },
    {
      time: '7:15 AM',
      title: isHighIntensity ? 'High-Intensity Training Session' : 'Progressive Resistance Workout',
      category: 'WELLNESS',
      priority: 'HIGH',
      badge: 'Planned',
      icon: '♡',
      notes: 'Execute target workout routine with prescribed RPE and rest periods',
    },
    {
      time: '8:30 AM',
      title: 'Nutrient-Dense Breakfast & Hydration Refuel',
      category: 'WELLNESS',
      priority: 'MEDIUM',
      badge: 'Nutrition',
      icon: '♧',
      notes: 'Protein synthesis window + log breakfast calories',
    },
    {
      time: '9:15 AM',
      title: `Deep Work Block 1 (${Math.round(workHours * 0.45)}h Core Focus)`,
      category: 'PRODUCTIVITY',
      priority: 'HIGH',
      badge: 'Deep Work',
      icon: '◎',
      notes: 'Zero-distraction flow state on top priority project deliverable',
    },
    {
      time: '1:00 PM',
      title: 'Mindful Lunch & Financial Pulse Check',
      category: 'FINANCE',
      priority: 'MEDIUM',
      badge: 'Review',
      icon: '₹',
      notes: 'Review daily cash flows, upcoming bills, and portfolio benchmark',
    },
    {
      time: '2:15 PM',
      title: `Deep Work Block 2 (${Math.round(workHours * 0.35)}h Execution)`,
      category: 'PRODUCTIVITY',
      priority: 'MEDIUM',
      badge: 'Deep Work',
      icon: '⌘',
      notes: 'Secondary tasks, communications, code reviews, and meetings',
    },
    {
      time: '5:30 PM',
      title: 'Skill & Learning Acceleration Session',
      category: 'LEARNING',
      priority: 'MEDIUM',
      badge: 'Study',
      icon: '▧',
      notes: '45 mins focused on system design / quantitative finance curriculum',
    },
    {
      time: '8:30 PM',
      title: 'Evening Life Administration & Circadian Shutdown',
      category: 'LIFEADMIN',
      priority: 'LOW',
      badge: 'Shutdown',
      icon: '☾',
      notes: 'Check document reminders, log daily water/macros, prepare tomorrow agenda',
    },
  ];
}
