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
  // Fitness
  { id: 'fit.steps', group: 'fitness', label: 'Steps', vis: v(true) },
  { id: 'fit.water', group: 'fitness', label: 'Water', vis: v(true) },
  { id: 'fit.active', group: 'fitness', label: 'Active Minutes' },
  { id: 'fit.sleep', group: 'fitness', label: 'Sleep', vis: v(true) },
  { id: 'fit.workouts', group: 'fitness', label: 'Workouts' },
  { id: 'fit.calories', group: 'fitness', label: 'Calories' },
  { id: 'fit.macros', group: 'fitness', label: 'Macros' },
  { id: 'fit.goals', group: 'fitness', label: 'Goals & Targets' },
  { id: 'fit.recovery', group: 'fitness', label: 'Recovery' },
  { id: 'fit.wearable', group: 'fitness', label: 'Wearable Sync' },

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