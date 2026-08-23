// Data-driven registry of every toggleable feature/group in Simply Her.
// Groups map to Studios (and Reflection). Each group has a studio enable flag
// (a legacy settings key where one exists, to preserve existing pages) plus a
// list of sub-features. Sub-features optionally map to a legacy settings key.
// Visibility (Today / Planner / Quick Add / Search / Alerts) is stored per
// feature in settings.featureVisibility and defaults are declared here.

export const VISIBILITY_CHANNELS = [
  { id: 'today', label: 'Today' },
  { id: 'planner', label: 'Planner' },
  { id: 'quickAdd', label: 'Quick Add' },
  { id: 'search', label: 'Search' },
  { id: 'notifications', label: 'Alerts' }
];

export const FEATURE_GROUPS = [
  { id: 'fitness', label: 'Fitness & Movement', studioKey: 'fitnessEnabled', route: '/life/fitness', defaultOn: true },
  { id: 'kitchen', label: 'Kitchen', studioKey: 'kitchenEnabled', route: '/life/kitchen', defaultOn: true },
  { id: 'home', label: 'Home', studioKey: 'homeEnabled', route: '/life/home', defaultOn: true },
  { id: 'beauty', label: 'Beauty', studioKey: 'beautyEnabled', route: '/life/beauty', defaultOn: true },
  { id: 'health', label: 'Health', studioKey: 'healthEnabled', route: '/life/health', defaultOn: false },
  { id: 'creator', label: 'Creator', studioKey: 'creatorEnabled', route: '/life/creator', defaultOn: false },
  { id: 'budget', label: 'Budget', studioKey: 'budgetEnabled', route: '/life/budget', defaultOn: false },
  { id: 'ttc', label: 'TTC', studioKey: 'ttcEnabled', route: '/life/ttc', defaultOn: false, sensitive: true },
  { id: 'creative', label: 'Creative Nook', studioKey: 'creativeEnabled', route: '/life/creative', defaultOn: true },
  { id: 'faith', label: 'Faith & Reflection', studioKey: 'faithEnabled', route: '/reflection', defaultOn: true, sensitive: true }
];

// visibility defaults: studio + search default true; others false unless set
const v = (today = false, planner = false, quickAdd = false, notifications = false, search = true) => ({
  studio: true, today, planner, quickAdd, search, notifications
});

export const FEATURES = [
  // Fitness — Home
  { id: 'fit.home', group: 'fitness', label: 'Fitness Home', defaultEnabled: true, vis: v(true) },

  // Fitness — Workouts
  { id: 'fit.workouts', group: 'fitness', label: 'Workouts', defaultEnabled: true, vis: v(false, false, true, false, true) },
  { id: 'fit.exerciseLibrary', group: 'fitness', label: 'Exercise Library', vis: v(false, false, true, false, true) },
  { id: 'fit.workoutBuilder', group: 'fitness', label: 'Workout Builder' },
  { id: 'fit.templates', group: 'fitness', label: 'Workout Templates', vis: v(false, false, true, false, true) },
  { id: 'fit.programs', group: 'fitness', label: 'Programs' },
  { id: 'fit.history', group: 'fitness', label: 'Workout History', vis: v(false, false, true, false, true) },
  { id: 'fit.activeWorkout', group: 'fitness', label: 'Active Workout Mode' },
  { id: 'fit.timers', group: 'fitness', label: 'Timers' },

  // Fitness — Advanced Training
  { id: 'fit.advancedMetrics', group: 'fitness', label: 'Advanced Training Metrics', defaultEnabled: false },
  { id: 'fit.rpe', group: 'fitness', label: 'RPE', defaultEnabled: false },
  { id: 'fit.rir', group: 'fitness', label: 'RIR', defaultEnabled: false },
  { id: 'fit.tempo', group: 'fitness', label: 'Tempo', defaultEnabled: false },
  { id: 'fit.volume', group: 'fitness', label: 'Training Volume', defaultEnabled: false },
  { id: 'fit.personalRecords', group: 'fitness', label: 'Personal Records', defaultEnabled: false },

  // Fitness — Movement Types
  { id: 'fit.strength', group: 'fitness', label: 'Strength Training', defaultEnabled: true },
  { id: 'fit.walking', group: 'fitness', label: 'Walking', defaultEnabled: true },
  { id: 'fit.running', group: 'fitness', label: 'Running' },
  { id: 'fit.cycling', group: 'fitness', label: 'Cycling' },
  { id: 'fit.swimming', group: 'fitness', label: 'Swimming' },
  { id: 'fit.hiking', group: 'fitness', label: 'Hiking' },
  { id: 'fit.rowing', group: 'fitness', label: 'Rowing' },
  { id: 'fit.pilates', group: 'fitness', label: 'Pilates', defaultEnabled: true },
  { id: 'fit.barre', group: 'fitness', label: 'Barre' },
  { id: 'fit.yoga', group: 'fitness', label: 'Yoga' },
  { id: 'fit.mobility', group: 'fitness', label: 'Mobility' },
  { id: 'fit.stretching', group: 'fitness', label: 'Stretching' },
  { id: 'fit.dance', group: 'fitness', label: 'Dance' },
  { id: 'fit.hiit', group: 'fitness', label: 'HIIT' },
  { id: 'fit.rehab', group: 'fitness', label: 'Rehab / PT Routines' },
  { id: 'fit.wheelchair', group: 'fitness', label: 'Wheelchair Movement' },
  { id: 'fit.customMovement', group: 'fitness', label: 'Custom Movement' },

  // Fitness — Activity
  { id: 'fit.steps', group: 'fitness', label: 'Steps', defaultEnabled: true, vis: v(true) },
  { id: 'fit.activeMinutes', group: 'fitness', label: 'Active Minutes', legacyKey: 'fit.active' },
  { id: 'fit.active', group: 'fitness', label: 'Active Minutes (legacy)', defaultEnabled: true },
  { id: 'fit.distance', group: 'fitness', label: 'Distance' },
  { id: 'fit.activityCalories', group: 'fitness', label: 'Activity Calories' },
  { id: 'fit.water', group: 'fitness', label: 'Water', defaultEnabled: true, vis: v(true) },

  // Fitness — Recovery
  { id: 'fit.recovery', group: 'fitness', label: 'Recovery', defaultEnabled: true, vis: v(true) },
  { id: 'fit.sleep', group: 'fitness', label: 'Sleep', defaultEnabled: true, vis: v(true) },
  { id: 'fit.energy', group: 'fitness', label: 'Energy' },
  { id: 'fit.soreness', group: 'fitness', label: 'Soreness' },
  { id: 'fit.restDays', group: 'fitness', label: 'Rest Days', vis: v(true) },
  { id: 'fit.capacity', group: 'fitness', label: 'Capacity / Pacing' },
  { id: 'fit.pacing', group: 'fitness', label: 'Pacing' },

  // Fitness — Progress
  { id: 'fit.progress', group: 'fitness', label: 'Progress', vis: v(false, false, true, false, true) },
  { id: 'fit.weight', group: 'fitness', label: 'Weight', defaultEnabled: false, sensitive: true },
  { id: 'fit.measurements', group: 'fitness', label: 'Body Measurements', defaultEnabled: false, sensitive: true },
  { id: 'fit.progressPhotos', group: 'fitness', label: 'Progress Photos', defaultEnabled: false, sensitive: true },
  { id: 'fit.milestones', group: 'fitness', label: 'Qualitative Milestones' },

  // Fitness — Nutrition (shared)
  { id: 'fit.nutrition', group: 'fitness', label: 'Nutrition (Fitness View)', defaultEnabled: false },
  { id: 'fit.calories', group: 'fitness', label: 'Calories', defaultEnabled: false },
  { id: 'fit.protein', group: 'fitness', label: 'Protein', defaultEnabled: false },
  { id: 'fit.macros', group: 'fitness', label: 'Macros', defaultEnabled: false },

  // Fitness — Accessibility
  { id: 'fit.adaptations', group: 'fitness', label: 'Adaptations & Accessibility' },
  { id: 'fit.simplifiedWorkout', group: 'fitness', label: 'Simplified Workout Mode' },
  { id: 'fit.fluctuatingCapacity', group: 'fitness', label: 'Fluctuating Capacity' },

  // Fitness — Other
  { id: 'fit.classes', group: 'fitness', label: 'Fitness Classes' },
  { id: 'fit.gear', group: 'fitness', label: 'Fitness Gear' },
  { id: 'fit.goals', group: 'fitness', label: 'Goals & Targets' },
  // Fitness — Connected Health (replaces legacy 'fit.wearable' fake toggle)
  { id: 'fit.connectedHealth', group: 'fitness', label: 'Connected Health', defaultEnabled: true, vis: v(false, false, false, false, false) },
  { id: 'fit.autoSync', group: 'fitness', label: 'Automatic Health Sync', defaultEnabled: false },
  { id: 'fit.syncOnAppOpen', group: 'fitness', label: 'Sync on App Open', defaultEnabled: false },
  { id: 'fit.autoWriteWorkouts', group: 'fitness', label: 'Auto-Share Workouts', defaultEnabled: false },

  // Kitchen
  { id: 'kit.home', group: 'kitchen', label: 'Kitchen Home', vis: v(true) },
  { id: 'kit.mealplan', group: 'kitchen', label: 'Meal Planning', vis: v(true, true, true, false, true) },
  { id: 'kit.breakfast', group: 'kitchen', label: 'Breakfast Slot', defaultEnabled: true },
  { id: 'kit.lunch', group: 'kitchen', label: 'Lunch Slot', defaultEnabled: true },
  { id: 'kit.dinner', group: 'kitchen', label: 'Dinner Slot', defaultEnabled: true },
  { id: 'kit.snacks', group: 'kitchen', label: 'Snack Slot', defaultEnabled: false },
  { id: 'kit.customSlots', group: 'kitchen', label: 'Custom Meal Slots', defaultEnabled: false },
  { id: 'kit.recipes', group: 'kitchen', label: 'Recipes', vis: v(false, false, true, false, true) },
  { id: 'kit.collections', group: 'kitchen', label: 'Recipe Collections' },
  { id: 'kit.cookingMode', group: 'kitchen', label: 'Cooking Mode' },
  { id: 'kit.timers', group: 'kitchen', label: 'Recipe Timers' },
  { id: 'kit.grocery', group: 'kitchen', label: 'Grocery Lists', vis: v(false, false, true, false, true) },
  { id: 'kit.groceryGen', group: 'kitchen', label: 'Grocery Generation' },
  { id: 'kit.frequent', group: 'kitchen', label: 'Frequent / Staple Groceries', defaultEnabled: false },
  { id: 'kit.prices', group: 'kitchen', label: 'Grocery Prices & Totals', defaultEnabled: false },
  { id: 'kit.pantry', group: 'kitchen', label: 'Pantry', defaultEnabled: false },
  { id: 'kit.fridge', group: 'kitchen', label: 'Fridge', defaultEnabled: false },
  { id: 'kit.freezer', group: 'kitchen', label: 'Freezer', defaultEnabled: false },
  { id: 'kit.useSoon', group: 'kitchen', label: 'Use Soon', defaultEnabled: true, vis: v(true, false, false, true, true) },
  { id: 'kit.foodHistory', group: 'kitchen', label: 'Food History', defaultEnabled: false },
  { id: 'kit.mealprep', group: 'kitchen', label: 'Meal Prep', vis: v(false, true, true, false, true) },
  { id: 'kit.prepTasks', group: 'kitchen', label: 'Prep Task Generation' },
  { id: 'kit.prepGen', group: 'kitchen', label: 'Prep Grocery Generation' },
  { id: 'kit.prepStorage', group: 'kitchen', label: 'Prep Portion Storage' },
  { id: 'kit.leftovers', group: 'kitchen', label: 'Leftovers', defaultEnabled: true, vis: v(false, false, true, false, true) },
  { id: 'kit.equipment', group: 'kitchen', label: 'Kitchen Equipment', defaultEnabled: false, vis: v(false, false, true, false, true) },
  { id: 'kit.mealTemplates', group: 'kitchen', label: 'Meal Plan Templates', defaultEnabled: false },
  { id: 'kit.recurringMeals', group: 'kitchen', label: 'Recurring Meals', defaultEnabled: false },
  { id: 'kit.occasionPlan', group: 'kitchen', label: 'Occasion Planning', defaultEnabled: false, vis: v(false, false, true, false, true) },
  { id: 'kit.groceryTemplates', group: 'kitchen', label: 'Grocery Templates', defaultEnabled: false },
  { id: 'kit.prepTemplates', group: 'kitchen', label: 'Meal Prep Templates', defaultEnabled: false },
  { id: 'kit.substitutions', group: 'kitchen', label: 'Recipe Substitutions', defaultEnabled: false },
  { id: 'kit.cookingNotes', group: 'kitchen', label: 'Cooking Notes', defaultEnabled: false },

  // Kitchen — Nutrition (shared with Fitness via NutritionEntry + FitnessSetting)
  { id: 'kit.nutrition', group: 'kitchen', label: 'Nutrition', defaultEnabled: false, vis: v(false, false, true, false, true) },
  { id: 'kit.foodDiary', group: 'kitchen', label: 'Food Diary', defaultEnabled: false, vis: v(false, false, true, false, true) },
  { id: 'kit.savedFoods', group: 'kitchen', label: 'Saved Foods', defaultEnabled: false },
  { id: 'kit.calories', group: 'kitchen', label: 'Calorie Tracking', defaultEnabled: false },
  { id: 'kit.macros', group: 'kitchen', label: 'Macro Tracking', defaultEnabled: false },
  { id: 'kit.moreNutrients', group: 'kitchen', label: 'Additional Nutrients', defaultEnabled: false },
  { id: 'kit.nutrientGoals', group: 'kitchen', label: 'Nutrition Goals', defaultEnabled: false },
  { id: 'kit.nutritionHistory', group: 'kitchen', label: 'Nutrition History', defaultEnabled: false },
  { id: 'kit.recipeNutrition', group: 'kitchen', label: 'Recipe Nutrition', defaultEnabled: false },
  { id: 'kit.plannedNutrition', group: 'kitchen', label: 'Planned Nutrition', defaultEnabled: false },

  // Home
  { id: 'home.cleaning', group: 'home', label: 'Cleaning', vis: v(true) },
  { id: 'home.laundry', group: 'home', label: 'Laundry' },
  { id: 'home.rooms', group: 'home', label: 'Rooms' },
  { id: 'home.projects', group: 'home', label: 'Home Projects' },
  { id: 'home.inventory', group: 'home', label: 'Household Inventory', defaultEnabled: false },
  { id: 'home.maintenance', group: 'home', label: 'Maintenance' },

  // Beauty
  { id: 'beauty.skincare', group: 'beauty', label: 'Skincare', vis: v(true) },
  { id: 'beauty.hair', group: 'beauty', label: 'Hair' },
  { id: 'beauty.nails', group: 'beauty', label: 'Nails' },
  { id: 'beauty.grooming', group: 'beauty', label: 'Grooming' },
  { id: 'beauty.inventory', group: 'beauty', label: 'Product Inventory', defaultEnabled: false },
  { id: 'beauty.routines', group: 'beauty', label: 'Beauty Schedule' },

  // Health (legacy sub-toggles keep existing HealthStudio working)
  { id: 'health.mental', group: 'health', label: 'Mental Wellness', legacyKey: 'healthMental', vis: v(true) },
  { id: 'health.physical', group: 'health', label: 'Physical Health', legacyKey: 'healthPhysical' },
  { id: 'health.medication', group: 'health', label: 'Medication Cabinet', legacyKey: 'healthMedication', vis: v(false, false, false, true) },
  { id: 'health.appointments', group: 'health', label: 'Appointment Hub', legacyKey: 'healthAppointments', vis: v(false, false, false, true) },
  { id: 'health.conditions', group: 'health', label: 'Chronic Conditions', legacyKey: 'healthConditions' },
  { id: 'health.symptoms', group: 'health', label: 'Symptoms' },
  { id: 'health.diagnoses', group: 'health', label: 'Diagnoses' },
  { id: 'health.allergies', group: 'health', label: 'Allergies / Intolerances' },
  { id: 'health.history', group: 'health', label: 'Medical History' },
  { id: 'health.supplements', group: 'health', label: 'Supplements' },
  { id: 'health.injections', group: 'health', label: 'Injections / Treatments' },
  { id: 'health.vitals', group: 'health', label: 'Vitals' },
  { id: 'health.providers', group: 'health', label: 'Care Team' },
  { id: 'health.tests', group: 'health', label: 'Tests / Results' },
  { id: 'health.documents', group: 'health', label: 'Health Documents', defaultEnabled: false },
  { id: 'health.timeline', group: 'health', label: 'Health Timeline', defaultEnabled: false },

  // Creator
  { id: 'cre.ideas', group: 'creator', label: 'Ideas' },
  { id: 'cre.pipeline', group: 'creator', label: 'Content Pipeline', vis: v(true) },
  { id: 'cre.calendar', group: 'creator', label: 'Content Calendar' },
  { id: 'cre.production', group: 'creator', label: 'Production' },
  { id: 'cre.library', group: 'creator', label: 'Content Library' },
  { id: 'cre.analytics', group: 'creator', label: 'Analytics', defaultEnabled: false },

  // Budget
  { id: 'bud.overview', group: 'budget', label: 'Overview', vis: v(true) },
  { id: 'bud.transactions', group: 'budget', label: 'Transactions' },
  { id: 'bud.bills', group: 'budget', label: 'Bills', vis: v(false, false, false, true) },
  { id: 'bud.budget', group: 'budget', label: 'Budget Categories' },
  { id: 'bud.savings', group: 'budget', label: 'Savings Goals' },
  { id: 'bud.subscriptions', group: 'budget', label: 'Subscriptions', defaultEnabled: false },
  { id: 'bud.wishlist', group: 'budget', label: 'Wishlist', defaultEnabled: false },

  // TTC
  { id: 'ttc.cycle', group: 'ttc', label: 'Cycle', vis: v(true) },
  { id: 'ttc.bbt', group: 'ttc', label: 'BBT', defaultEnabled: false },
  { id: 'ttc.mucus', group: 'ttc', label: 'Cervical Mucus', defaultEnabled: false },
  { id: 'ttc.opks', group: 'ttc', label: 'Ovulation Tests', defaultEnabled: false },
  { id: 'ttc.appointments', group: 'ttc', label: 'Appointments' },
  { id: 'ttc.tests', group: 'ttc', label: 'Tests / Treatments' },
  { id: 'ttc.journal', group: 'ttc', label: 'TTC Journal' },

  // Creative
  { id: 'cre8.projects', group: 'creative', label: 'Projects', vis: v(true) },
  { id: 'cre8.ideas', group: 'creative', label: 'Ideas & Brainstorming' },
  { id: 'cre8.moodboards', group: 'creative', label: 'Moodboards' },
  { id: 'cre8.journal', group: 'creative', label: 'Creative Journal' },

  // Faith
  { id: 'faith.scripture', group: 'faith', label: 'Daily Scripture & Wisdom', vis: v(true) },
  { id: 'faith.study', group: 'faith', label: 'Study Sessions' },
  { id: 'faith.examen', group: 'faith', label: 'Examen' },
  { id: 'faith.gratitude', group: 'faith', label: 'Gratitude', vis: v(true) },
  { id: 'faith.prayer', group: 'faith', label: 'Prayer Log', vis: v(true) },
  { id: 'faith.seasons', group: 'faith', label: 'Liturgical Seasons' },
  { id: 'faith.sacraments', group: 'faith', label: 'Sacramental Records' }
];

export const getGroup = (id) => FEATURE_GROUPS.find((g) => g.id === id);
export const getFeature = (id) => FEATURES.find((f) => f.id === id);
export const featuresByGroup = (groupId) => FEATURES.filter((f) => f.group === groupId);

export const defaultVisibility = (featureId) => {
  const f = getFeature(featureId);
  return { today: false, planner: false, studio: true, quickAdd: false, search: true, notifications: false, ...(f?.vis || {}) };
};