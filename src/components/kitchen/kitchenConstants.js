import { useAppSettings } from '@/lib/AppSettings';

export const GROCERY_CATEGORIES = ['Produce', 'Meat/Protein', 'Dairy', 'Bakery', 'Pantry', 'Frozen', 'Snacks', 'Drinks', 'Household', 'Other'];

export const RECIPE_CATEGORIES = [
  { value: 'breakfast', label: 'Breakfast' }, { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' }, { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' }, { value: 'baking', label: 'Baking' },
  { value: 'drink', label: 'Drink' }, { value: 'side', label: 'Side' },
  { value: 'appetizer', label: 'Appetizer' }, { value: 'sauce', label: 'Sauce' },
  { value: 'other', label: 'Other' },
];

export const DIFFICULTY = ['easy', 'moderate', 'advanced', 'custom'];

export const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast' }, { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' }, { id: 'snack', label: 'Snack' },
];

export const PREP_TASK_TYPES = ['wash', 'chop', 'peel', 'marinate', 'mix', 'cook', 'bake', 'portion', 'assemble', 'cool', 'refrigerate', 'freeze', 'label', 'cleanup', 'custom'];

export const INVENTORY_STATUS = [
  { value: 'available', label: 'Available' }, { value: 'used_up', label: 'Used up' },
  { value: 'discarded', label: 'Discarded' }, { value: 'expired', label: 'Expired' },
];

export const KITCHEN_ITEM_CATEGORIES = [
  { value: 'appliance', label: 'Appliance' }, { value: 'cookware', label: 'Cookware' },
  { value: 'bakeware', label: 'Bakeware' }, { value: 'utensil', label: 'Utensil' },
  { value: 'tool', label: 'Tool' }, { value: 'food_storage', label: 'Food Storage' },
  { value: 'specialty', label: 'Specialty' }, { value: 'custom', label: 'Custom' },
];

export const EMPTY = {
  recipes: { title: 'Your recipes will live here 🍓', subtitle: 'Save family favourites and new finds.' },
  mealplan: { title: 'Nothing planned yet.', subtitle: "Add a meal whenever you're ready." },
  groceries: { title: 'Your list is clear.', subtitle: 'Add items or generate from your meal plan.' },
  pantry: { title: 'Add what you keep on hand', subtitle: 'Track staples if you’d like to.' },
  fridge: { title: 'Nothing tracked here yet', subtitle: 'Add fridge items as you like.' },
  freezer: { title: 'Your freezer list is ready', subtitle: 'Whenever you need it.' },
  mealprep: { title: 'No prep sessions planned.', subtitle: 'Start one when you’re ready.' },
  leftovers: { title: 'No leftovers waiting.', subtitle: 'They’ll show up here when added.' },
  equipment: { title: 'Add kitchen favourites', subtitle: 'Whenever you’d like to.' },
};

export const todayStr = () => new Date().toISOString().slice(0, 10);
export const startOfWeek = (date = new Date()) => {
  const d = new Date(date); const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day); d.setHours(0, 0, 0, 0); return d;
};
export const weekDates = (start) => Array.from({ length: 7 }, (_, i) => {
  const d = new Date(start); d.setDate(d.getDate() + i); return d.toISOString().slice(0, 10);
});
export const fmtDate = (s) => s ? new Date(s + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '';

export function useEnabledMealSlots() {
  const { isFeatureEnabled } = useAppSettings();
  const slots = MEAL_SLOTS.filter((s) => isFeatureEnabled(`kit.${s.id}`));
  if (isFeatureEnabled('kit.customSlots')) slots.push({ id: 'custom', label: 'Custom' });
  return slots;
}