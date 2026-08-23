// Reference data for the Fitness & Movement Studio.
// All labels are user-friendly and non-judgmental per the Simply Her language guide.

export const MOVEMENT_CATEGORIES = [
  { id: 'general', label: 'General Movement', icon: 'Activity' },
  { id: 'strength', label: 'Strength', icon: 'Dumbbell' },
  { id: 'bodybuilding', label: 'Bodybuilding', icon: 'Dumbbell' },
  { id: 'powerlifting', label: 'Powerlifting', icon: 'Dumbbell' },
  { id: 'calisthenics', label: 'Calisthenics', icon: 'Dumbbell' },
  { id: 'cardio', label: 'Cardio', icon: 'Heart' },
  { id: 'walking', label: 'Walking', icon: 'Footprints' },
  { id: 'running', label: 'Running', icon: 'Footprints' },
  { id: 'cycling', label: 'Cycling', icon: 'Bike' },
  { id: 'swimming', label: 'Swimming', icon: 'Waves' },
  { id: 'rowing', label: 'Rowing', icon: 'Waves' },
  { id: 'hiking', label: 'Hiking', icon: 'Mountain' },
  { id: 'stair', label: 'Stair / Step', icon: 'ArrowUp' },
  { id: 'elliptical', label: 'Elliptical', icon: 'Circle' },
  { id: 'pilates', label: 'Pilates', icon: 'Sparkles' },
  { id: 'barre', label: 'Barre', icon: 'Sparkles' },
  { id: 'yoga', label: 'Yoga', icon: 'Flower' },
  { id: 'mobility', label: 'Mobility', icon: 'Wind' },
  { id: 'stretching', label: 'Stretching', icon: 'Wind' },
  { id: 'dance', label: 'Dance', icon: 'Music' },
  { id: 'hiit', label: 'HIIT', icon: 'Flame' },
  { id: 'circuit', label: 'Circuit Training', icon: 'Repeat' },
  { id: 'sport', label: 'Recreational Sport', icon: 'Trophy' },
  { id: 'wheelchair', label: 'Wheelchair Movement', icon: 'Accessibility' },
  { id: 'rehab', label: 'Rehab / PT Routine', icon: 'HeartPulse' },
  { id: 'daily', label: 'Daily Movement', icon: 'Activity' },
  { id: 'custom', label: 'Custom', icon: 'Plus' }
];

export const MOVEMENT_PATTERNS = [
  'Squat', 'Hinge', 'Push', 'Pull', 'Carry', 'Rotation',
  'Locomotion', 'Core', 'Isolation', 'Mobility', 'Balance', 'Custom'
];

export const EQUIPMENT_OPTIONS = [
  'None', 'Mat', 'Chair', 'Wall', 'Resistance Band', 'Loop Band',
  'Dumbbells', 'Kettlebell', 'Barbell', 'Plates', 'Bench', 'Cable',
  'Machine', 'Pull-up Bar', 'Treadmill', 'Bike', 'Rowing Machine',
  'Elliptical', 'Step', 'Wheelchair', 'Pool', 'Stability Ball',
  'Pilates Ring', 'Pilates Reformer', 'Ankle Weights', 'Custom'
];

export const POSITION_OPTIONS = [
  'Standing', 'Seated', 'Floor', 'Supine', 'Prone', 'Side-lying',
  'Kneeling', 'Supported', 'Bed-based', 'Water', 'Custom'
];

export const ADAPTATION_TYPES = [
  'Standard', 'Seated', 'Supported', 'Low-impact', 'No-jump',
  'No-floor', 'Reduced range', 'Bed-based', 'One-sided', 'Custom'
];

export const MEASUREMENT_MODES = [
  { id: 'reps', label: 'Reps', fields: ['reps'] },
  { id: 'sets_reps', label: 'Sets + Reps', fields: ['sets', 'reps'] },
  { id: 'weight_reps', label: 'Weight + Reps', fields: ['weight', 'reps'] },
  { id: 'resistance_reps', label: 'Resistance + Reps', fields: ['resistance', 'reps'] },
  { id: 'duration', label: 'Duration', fields: ['duration'] },
  { id: 'hold', label: 'Hold', fields: ['duration'] },
  { id: 'distance', label: 'Distance', fields: ['distance'] },
  { id: 'distance_duration', label: 'Distance + Duration', fields: ['distance', 'duration'] },
  { id: 'pace', label: 'Pace', fields: ['distance', 'duration'] },
  { id: 'speed', label: 'Speed', fields: ['distance', 'duration'] },
  { id: 'laps', label: 'Laps', fields: ['laps'] },
  { id: 'steps', label: 'Steps', fields: ['steps'] },
  { id: 'pushes', label: 'Wheelchair Pushes', fields: ['pushes'] },
  { id: 'reps_per_side', label: 'Reps per Side', fields: ['reps', 'side'] },
  { id: 'time_per_side', label: 'Time per Side', fields: ['duration', 'side'] },
  { id: 'custom', label: 'Custom', fields: [] }
];

export const SET_TYPES = [
  'Warm-up', 'Working', 'Back-off', 'Drop', 'AMRAP', 'Failure', 'Assisted', 'Custom'
];

export const BLOCK_TYPES = [
  { id: 'warmup', label: 'Warm-up' },
  { id: 'activation', label: 'Activation' },
  { id: 'main', label: 'Main' },
  { id: 'superset', label: 'Superset' },
  { id: 'circuit', label: 'Circuit' },
  { id: 'interval', label: 'Interval' },
  { id: 'amrap', label: 'AMRAP' },
  { id: 'emom', label: 'EMOM' },
  { id: 'tabata', label: 'Tabata' },
  { id: 'finisher', label: 'Finisher' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'cooldown', label: 'Cooldown' },
  { id: 'custom', label: 'Custom' }
];

export const DETAIL_LEVELS = [
  { id: 'simple', label: 'Simple', description: 'Minimal metrics, fast logging, duration and movement' },
  { id: 'balanced', label: 'Balanced', description: 'Workout builder, sets/reps, history, standard goals' },
  { id: 'advanced', label: 'Advanced', description: 'RPE, RIR, tempo, set types, volume, advanced analytics' }
];

export const EXPERIENCE_LEVELS = [
  'Beginner', 'Intermediate', 'Advanced', 'Prefer not to label'
];

export const CAPACITY_LEVELS_DEFAULT = [
  { id: 'full', label: 'Full', color: 'green' },
  { id: 'reduced', label: 'Reduced', color: 'amber' },
  { id: 'gentle', label: 'Gentle', color: 'blue' },
  { id: 'rest', label: 'Rest', color: 'slate' }
];

export const POST_ACTIVITY_RESPONSES = [
  'Felt good',
  'About right',
  'Took a lot out of me',
  'Needed more recovery',
  'Symptoms increased',
  'Custom'
];

export const SIDE_OPTIONS = [
  { id: 'both', label: 'Both' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'alternating', label: 'Alternating' }
];

export const MOBILITY_PREFERENCES = [
  'No specific mobility accommodations',
  'Mobility varies',
  'Limited standing tolerance',
  'Limited walking tolerance',
  'Primarily seated',
  'Wheelchair user',
  'Mobility aid user',
  'Limited floor transitions',
  'Limited upper-body movement',
  'Limited lower-body movement',
  'Prefer supported movement',
  'Custom'
];

export const COGNITIVE_SUPPORT = [
  'Simplified navigation',
  'Fewer visible decisions',
  'One exercise at a time',
  'Large Next button',
  'Clear step numbers',
  'Save position',
  'Resume later',
  'Repeat Last Workout',
  'Start Favourite',
  'Fewer metrics',
  'Less visual clutter',
  'Reduced motion',
  'Larger interaction targets',
  'Simplified Quick Start',
  'Custom'
];

export const ADAPTATION_PREFERENCES = [
  'Show seated alternatives',
  'Show supported alternatives',
  'Show low-impact alternatives',
  'Show no-jump alternatives',
  'Show no-floor alternatives',
  'Show shorter versions',
  'Allow longer rests',
  'Avoid kneeling',
  'Avoid prolonged standing',
  'Avoid rapid position changes',
  'Prefer simple routines',
  'One exercise at a time',
  'Reduce visible metrics',
  'Reduce animation',
  'Larger interaction targets',
  'Custom'
];

export const JUST_MOVE_OPTIONS = [
  'Walk', 'Stretch', 'Dance', 'Gentle Movement', 'Mobility',
  'Active Housework', 'Played Outside', 'Swim', 'Hike', 'Custom'
];

export const QUICK_ADD_INCREDIENTS = [
  { id: 'steps', label: 'Steps', feature: 'fit.steps' },
  { id: 'water', label: 'Water', feature: 'fit.water' },
  { id: 'workout', label: 'Start Workout', feature: 'fit.workouts' },
  { id: 'repeat_last', label: 'Repeat Last Workout', feature: 'fit.workouts' },
  { id: 'just_move', label: 'Log Movement', feature: 'fit.workouts' },
  { id: 'walk', label: 'Log Walk', feature: 'fit.walking' },
  { id: 'run', label: 'Log Run', feature: 'fit.running' },
  { id: 'recovery', label: 'Recovery Check-In', feature: 'fit.recovery' },
  { id: 'rest', label: 'Rest Day', feature: 'fit.restDays' }
];

export const ONBOARDING_OPTIONS = [
  'General Movement', 'Walking', 'Strength', 'Pilates', 'Barre', 'Yoga',
  'Mobility', 'Stretching', 'Running', 'Cycling', 'Swimming', 'Hiking',
  'Dance', 'Athletic Training', 'Recovery', 'Sleep', 'Water', 'Nutrition',
  'Body Progress', 'User-entered Rehab/PT', 'Gentle Movement', 'Something Else',
  "I don't need much from Fitness"
];

// Maps category IDs to friendly labels for the legacy fitnessFocus setting
export const LEGACY_FOCUS_MAP = {
  pilates: 'Pilates & Barre',
  strength: 'Heavy Lifting & Strength',
  running: 'Running & Cardio',
  yoga: 'Yoga & Mobility',
  walking: 'Gentle Home Movement & Walking'
};

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const categoryLabel = (cat) =>
  MOVEMENT_CATEGORIES.find((c) => c.id === cat)?.label || cat || 'Movement';

export const modeLabel = (mode) =>
  MEASUREMENT_MODES.find((m) => m.id === mode)?.label || mode || 'Custom';

export const isAdvancedField = (field, detailLevel) => {
  const advancedFields = ['rpe', 'rir', 'tempo', 'set_type'];
  if (advancedFields.includes(field)) return detailLevel === 'advanced';
  return true;
};