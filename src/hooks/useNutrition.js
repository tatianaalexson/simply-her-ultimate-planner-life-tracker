import { useEntityList } from '@/hooks/useEntityList';
import { useSingleton } from '@/hooks/useSingleton';
import { todayStr } from '@/components/kitchen/kitchenConstants';

// Shared nutrition hooks — Kitchen and Fitness both read/write NutritionEntry.
export const useNutritionDay = (date = todayStr()) =>
  useEntityList('NutritionEntry', { log_date: date }, '-created_date');

export const useNutritionRange = (start, end) =>
  useEntityList('NutritionEntry', { log_date: { $gte: start, $lte: end } }, '-log_date');

export const useSavedFoods = (query = {}) =>
  useEntityList('SavedFood', query, '-created_date');

export const useNutritionGoals = () =>
  useSingleton('FitnessSetting', { kind: 'fitness' }, {
    calorie_goal: 2000,
    protein_goal: 120,
    carbs_goal: 200,
    fat_goal: 65,
  });

// Recent foods: all entries newest-first; callers slice/dedupe as needed.
export const useRecentFoods = () =>
  useEntityList('NutritionEntry', {}, '-created_date');