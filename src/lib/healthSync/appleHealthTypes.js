/**
 * Apple HealthKit Type Identifier Mappings
 *
 * Maps Simply Her data type IDs to HealthKit type identifiers.
 * Used by the native Swift plugin implementation to know which
 * HKObjectType to request/query for each data type.
 *
 * This file is REFERENCE DOCUMENTATION for the native implementation.
 * It is imported by the bridge but the actual HealthKit calls happen
 * in Swift code that must be created in Xcode.
 */

// ── Quantity Types (for reading sample-based metrics) ──
export const HEALTHKIT_READ_TYPES = {
  steps: 'HKQuantityTypeIdentifierStepCount',
  active_minutes: 'HKQuantityTypeIdentifierAppleExerciseTime',
  distance: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
  distance_cycling: 'HKQuantityTypeIdentifierDistanceCycling',
  floors: 'HKQuantityTypeIdentifierFlightsClimbed',
  wheelchair_pushes: 'HKQuantityTypeIdentifierPushCount',
  active_energy: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  heart_rate: 'HKQuantityTypeIdentifierHeartRate',
  resting_hr: 'HKQuantityTypeIdentifierRestingHeartRate',
  hrv: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
  vo2_max: 'HKQuantityTypeIdentifierVO2Max',
  speed: 'HKQuantityTypeIdentifierRunningSpeed',
  cadence_running: 'HKQuantityTypeIdentifierRunningCadence',
  cadence_cycling: 'HKQuantityTypeIdentifierCyclingCadence',
  power: 'HKQuantityTypeIdentifierCyclingPower',
  weight: 'HKQuantityTypeIdentifierBodyMass',
  body_fat: 'HKQuantityTypeIdentifierBodyFatPercentage',
  lean_body_mass: 'HKQuantityTypeIdentifierLeanBodyMass',
  hydration: 'HKQuantityTypeIdentifierDietaryWater',
};

// ── Category / Correlation Types ────────────────────────
export const HEALTHKIT_CATEGORY_TYPES = {
  sleep: 'HKCategoryTypeIdentifierSleepAnalysis',
  nutrition: 'HKCorrelationTypeIdentifierFood',
};

// ── Workout Type ────────────────────────────────────────
export const HEALTHKIT_WORKOUT_TYPE = 'HKWorkoutType';

// ── Simply Her Movement → HKWorkoutActivityType ─────────
export const HEALTHKIT_WORKOUT_ACTIVITY_TYPES = {
  walking: 'HKWorkoutActivityTypeWalking',
  running: 'HKWorkoutActivityTypeRunning',
  cycling: 'HKWorkoutActivityTypeCycling',
  swimming: 'HKWorkoutActivityTypeSwimming',
  strength: 'HKWorkoutActivityTypeTraditionalStrengthTraining',
  yoga: 'HKWorkoutActivityTypeYoga',
  pilates: 'HKWorkoutActivityTypePilates',
  hiking: 'HKWorkoutActivityTypeHiking',
  rowing: 'HKWorkoutActivityTypeRowing',
  dancing: 'HKWorkoutActivityTypeDance',
  hiit: 'HKWorkoutActivityTypeHighIntensityIntervalTraining',
  wheelchair: 'HKWorkoutActivityTypeWheelchairRunPace',
  stretching: 'HKWorkoutActivityTypeFlexibility',
  mobility: 'HKWorkoutActivityTypeFlexibility',
  custom: 'HKWorkoutActivityTypeOther',
};

// ── Types Simply Her can WRITE to HealthKit ─────────────
export const HEALTHKIT_WRITE_TYPES = {
  exercise_sessions: 'HKWorkoutType',
  hydration: 'HKQuantityTypeIdentifierDietaryWater',
  weight: 'HKQuantityTypeIdentifierBodyMass',
};

// ── Canonical Units (HealthKit stores in these) ─────────
export const HEALTHKIT_UNITS = {
  steps: 'count',
  active_minutes: 'min',
  distance: 'm',
  floors: 'count',
  wheelchair_pushes: 'count',
  active_energy: 'kcal',
  heart_rate: 'count/min',
  resting_hr: 'count/min',
  hrv: 'ms',
  vo2_max: 'mL/kg·min',
  speed: 'm/s',
  cadence: 'count/min',
  power: 'W',
  weight: 'kg',
  body_fat: '%',
  lean_body_mass: 'kg',
  hydration: 'L',
};

// ── Sleep Analysis Values ───────────────────────────────
export const HEALTHKIT_SLEEP_VALUES = {
  inBed: 'HKCategoryValueSleepAnalysisInBed',
  asleep: 'HKCategoryValueSleepAnalysisAsleep',
  awake: 'HKCategoryValueSleepAnalysisAwake',
  asleepCore: 'HKCategoryValueSleepAnalysisAsleepCore',
  asleepDeep: 'HKCategoryValueSleepAnalysisAsleepDeep',
  asleepREM: 'HKCategoryValueSleepAnalysisAsleepREM',
};