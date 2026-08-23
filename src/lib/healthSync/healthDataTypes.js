// =====================================================
// HEALTH DATA TYPES CATALOG
// Central catalog of every health/fitness data type Simply Her
// can potentially sync with external providers.
// Provider support flags reflect what each provider's API
// is documented to support — NOT what is currently wired.
// Actual availability is determined by capabilityDetector + provider status.
// =====================================================

export const HEALTH_DATA_CATEGORIES = [
  { id: 'activity', label: 'Activity', description: 'Daily movement and activity metrics' },
  { id: 'workouts', label: 'Workouts', description: 'Exercise sessions and planned training' },
  { id: 'heart', label: 'Heart', description: 'Heart rate and cardiovascular metrics' },
  { id: 'recovery', label: 'Recovery', description: 'Sleep and recovery-related metrics' },
  { id: 'body', label: 'Body', description: 'Weight and body composition' },
  { id: 'performance', label: 'Performance', description: 'Advanced athletic metrics' },
  { id: 'hydration', label: 'Hydration', description: 'Water and hydration tracking' },
  { id: 'nutrition', label: 'Nutrition', description: 'Food and nutrition logs' },
];

// Each data type declares which providers' APIs are documented to support it,
// and whether read and/or write directions are possible.
// This is NOT a claim that the sync is currently functional — it describes
// the provider API's documented capabilities for architecture planning.
export const HEALTH_DATA_TYPES = [
  // --- Activity ---
  { id: 'steps', label: 'Steps', category: 'activity', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read', 'write'], sh_entity: 'FitnessDaily', sh_field: 'steps' },
  { id: 'active_minutes', label: 'Active Minutes', category: 'activity', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'], sh_entity: 'FitnessDaily', sh_field: 'active' },
  { id: 'distance', label: 'Distance', category: 'activity', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read', 'write'], sh_entity: 'FitnessDaily', sh_field: 'distance' },
  { id: 'floors', label: 'Floors Climbed', category: 'activity', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'] },
  { id: 'elevation', label: 'Elevation Gain', category: 'activity', providers: { health_connect: true, google_health: true, apple_health: false }, directions: ['read'] },
  { id: 'wheelchair_pushes', label: 'Wheelchair Pushes', category: 'activity', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'], sh_entity: 'FitnessDaily', accessibility_priority: true },
  { id: 'active_energy', label: 'Active Energy', category: 'activity', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'], sh_entity: 'FitnessDaily', sh_field: 'energy' },
  { id: 'total_calories', label: 'Total Calories Burned', category: 'activity', providers: { health_connect: true, google_health: true, apple_health: false }, directions: ['read'] },

  // --- Workouts ---
  { id: 'exercise_sessions', label: 'Exercise Sessions', category: 'workouts', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read', 'write'], sh_entity: 'WorkoutSession' },
  { id: 'planned_exercise', label: 'Planned Exercise', category: 'workouts', providers: { health_connect: true, google_health: false, apple_health: false }, directions: ['read', 'write'], sh_entity: 'WorkoutSession' },

  // --- Heart ---
  { id: 'heart_rate', label: 'Heart Rate', category: 'heart', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'], high_frequency: true },
  { id: 'resting_hr', label: 'Resting Heart Rate', category: 'heart', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'] },
  { id: 'hrv', label: 'Heart Rate Variability', category: 'heart', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'] },
  { id: 'hr_zones', label: 'Heart Rate Zones', category: 'heart', providers: { health_connect: false, google_health: true, apple_health: false }, directions: ['read'] },

  // --- Recovery ---
  { id: 'sleep', label: 'Sleep', category: 'recovery', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read', 'write'], sh_entity: 'FitnessDaily', sh_field: 'sleep' },
  { id: 'sleep_stages', label: 'Sleep Stages', category: 'recovery', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'] },

  // --- Body ---
  { id: 'weight', label: 'Weight', category: 'body', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read', 'write'], sensitive: true },
  { id: 'body_fat', label: 'Body Fat', category: 'body', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'], sensitive: true },
  { id: 'lean_body_mass', label: 'Lean Body Mass', category: 'body', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'], sensitive: true },

  // --- Performance ---
  { id: 'vo2_max', label: 'VO₂ Max', category: 'performance', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'] },
  { id: 'speed', label: 'Speed', category: 'performance', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'], high_frequency: true },
  { id: 'cadence', label: 'Cadence', category: 'performance', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read'], high_frequency: true },
  { id: 'power', label: 'Power', category: 'performance', providers: { health_connect: true, google_health: false, apple_health: true }, directions: ['read'], high_frequency: true },

  // --- Hydration ---
  { id: 'hydration', label: 'Water / Hydration', category: 'hydration', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read', 'write'], sh_entity: 'FitnessDaily', sh_field: 'water' },

  // --- Nutrition ---
  { id: 'nutrition', label: 'Nutrition', category: 'nutrition', providers: { health_connect: true, google_health: true, apple_health: true }, directions: ['read', 'write'], sh_entity: 'NutritionEntry' },
];

// Helper functions
export const getDataTypesByCategory = (categoryId) =>
  HEALTH_DATA_TYPES.filter((dt) => dt.category === categoryId);

export const getDataType = (id) => HEALTH_DATA_TYPES.find((dt) => dt.id === id);

export const getProviderDataTypes = (providerId) =>
  HEALTH_DATA_TYPES.filter((dt) => dt.providers[providerId]);

export const isHighFrequency = (dataTypeId) => {
  const dt = getDataType(dataTypeId);
  return dt?.high_frequency ?? false;
};

export const isSensitive = (dataTypeId) => {
  const dt = getDataType(dataTypeId);
  return dt?.sensitive ?? false;
};

// Source labels for provenance display
export const SOURCE_LABELS = {
  manual: 'Entered manually',
  simply_her: 'Simply Her',
  health_connect: 'Health Connect',
  google_health: 'Google Health',
  apple_health: 'Apple Health',
  device: 'Device',
  legacy: 'Imported (legacy)',
};

export const getSourceLabel = (sourceType, sourceApp) => {
  const label = SOURCE_LABELS[sourceType] || sourceType;
  return sourceApp ? `${label} · ${sourceApp}` : label;
};