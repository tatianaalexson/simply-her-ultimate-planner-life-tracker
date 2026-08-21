import { useEntityList } from '@/hooks/useEntityList';
import { useSingleton } from '@/hooks/useSingleton';

export const useRecipes = (query = {}) => useEntityList('Recipe', query, '-created_date');
export const useMealPlan = (query = {}) => useEntityList('MealPlanEntry', query, '-date');
export const useGroceryItems = (listName) =>
  useEntityList('GroceryItem', listName ? { list_name: listName } : {}, '-created_date');
export const useInventory = (zone) =>
  useEntityList('FoodInventoryItem', zone ? { zone } : {}, 'name');
export const useMealPrepSessions = () => useEntityList('MealPrepSession', {}, '-date');
export const useLeftovers = (query = {}) => useEntityList('Leftover', query, '-date_made');
export const useKitchenItems = (query = {}) => useEntityList('KitchenItem', query, '-created_date');
export const useKitchenSettings = () =>
  useSingleton('KitchenSetting', { kind: 'kitchen' }, {});