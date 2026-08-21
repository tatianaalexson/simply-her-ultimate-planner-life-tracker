import React from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BookOpen, CalendarDays, ShoppingCart, Box, Refrigerator, Snowflake, ChefHat, Utensils, Soup } from 'lucide-react';

export default function KitchenQuickAdd({ open, onOpenChange, onNavigate }) {
  const { isFeatureEnabled } = useAppSettings();
  const actions = [
    { id: 'recipes', label: 'Add Recipe', icon: BookOpen, view: 'recipes', enabled: isFeatureEnabled('kit.recipes') },
    { id: 'mealplan', label: 'Plan a Meal', icon: CalendarDays, view: 'mealplan', enabled: isFeatureEnabled('kit.mealplan') },
    { id: 'grocery', label: 'Add Grocery Item', icon: ShoppingCart, view: 'groceries', enabled: isFeatureEnabled('kit.grocery') },
    { id: 'pantry', label: 'Add Pantry Item', icon: Box, view: 'pantry', enabled: isFeatureEnabled('kit.pantry') },
    { id: 'fridge', label: 'Add Fridge Item', icon: Refrigerator, view: 'fridge', enabled: isFeatureEnabled('kit.fridge') },
    { id: 'freezer', label: 'Add Freezer Item', icon: Snowflake, view: 'freezer', enabled: isFeatureEnabled('kit.freezer') },
    { id: 'mealprep', label: 'Start Meal Prep', icon: ChefHat, view: 'mealprep', enabled: isFeatureEnabled('kit.mealprep') },
    { id: 'leftovers', label: 'Add Leftover', icon: Utensils, view: 'leftovers', enabled: isFeatureEnabled('kit.leftovers') },
    { id: 'equipment', label: 'Add Kitchen Item', icon: Soup, view: 'equipment', enabled: isFeatureEnabled('kit.equipment') },
  ].filter((a) => a.enabled);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pt-4 pb-8">
        <SheetHeader className="text-center">
          <SheetTitle className="font-heading">Quick Add</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {actions.map((a) => (
            <button key={a.id} onClick={() => onNavigate(a.view)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 active:scale-95 transition">
              <a.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <span className="text-xs text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}