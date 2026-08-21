import React from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, CalendarDays, ShoppingCart, Box, Refrigerator, Snowflake, ChefHat, Utensils, Soup, Settings as SettingsIcon, ArrowRight } from 'lucide-react';
import { useMealPlan, useMealPrepSessions, useGroceryItems } from '@/hooks/useKitchen';
import { todayStr, startOfWeek, weekDates, fmtDate } from '@/components/kitchen/kitchenConstants';

const QUICK_ACCESS = [
  { view: 'mealplan', label: 'Meal Plan', icon: CalendarDays, feat: 'kit.mealplan' },
  { view: 'recipes', label: 'Recipes', icon: BookOpen, feat: 'kit.recipes' },
  { view: 'groceries', label: 'Groceries', icon: ShoppingCart, feat: 'kit.grocery' },
  { view: 'pantry', label: 'Pantry', icon: Box, feat: 'kit.pantry' },
  { view: 'fridge', label: 'Fridge', icon: Refrigerator, feat: 'kit.fridge' },
  { view: 'freezer', label: 'Freezer', icon: Snowflake, feat: 'kit.freezer' },
  { view: 'mealprep', label: 'Meal Prep', icon: ChefHat, feat: 'kit.mealprep' },
  { view: 'leftovers', label: 'Leftovers', icon: Utensils, feat: 'kit.leftovers' },
  { view: 'equipment', label: 'Equipment', icon: Soup, feat: 'kit.equipment' },
];

export default function KitchenHome({ onNavigate, onQuickAdd }) {
  const { isFeatureEnabled } = useAppSettings();
  const { items: meals } = useMealPlan();
  const { items: preps } = useMealPrepSessions();
  const { items: groceries } = useGroceryItems('Weekly Groceries');

  const today = todayStr();
  const week = weekDates(startOfWeek());
  const todayMeals = meals.filter((m) => m.date === today);
  const weekMeals = meals.filter((m) => week.includes(m.date));
  const upcomingPrep = preps.filter((p) => p.status !== 'completed').sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0];
  const groceryLeft = groceries.filter((g) => !g.checked).length;

  const quickCards = QUICK_ACCESS.filter((q) => isFeatureEnabled(q.feat));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{fmtDate(today)}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => onNavigate('preferences')}><SettingsIcon className="w-4 h-4 mr-1" /> Preferences</Button>
          <Button size="sm" className="rounded-full" onClick={onQuickAdd}><Plus className="w-4 h-4 mr-1" /> Quick Add</Button>
        </div>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="p-4 space-y-2">
          <p className="font-heading text-base">Today</p>
          {todayMeals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing planned for today yet. <button onClick={() => onNavigate('mealplan')} className="text-primary">Plan a meal</button></p>
          ) : (
            <div className="space-y-1.5">
              {todayMeals.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize w-20">{m.custom_slot || m.meal_slot}</span>
                  <span className="flex-1 font-medium">{m.custom_name || 'Planned meal'}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="p-4 space-y-2">
          <p className="font-heading text-base">Up next</p>
          {upcomingPrep ? (
            <button onClick={() => onNavigate('mealprep')} className="flex items-center justify-between w-full text-sm">
              <span>Meal prep: <span className="font-medium">{upcomingPrep.name}</span></span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : groceryLeft > 0 ? (
            <button onClick={() => onNavigate('groceries')} className="flex items-center justify-between w-full text-sm">
              <span>{groceryLeft} item{groceryLeft !== 1 ? 's' : ''} on your grocery list</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">All caught up.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="p-4">
          <p className="font-heading text-base mb-2">This week</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-xl font-semibold">{weekMeals.length}</p><p className="text-xs text-muted-foreground">meals planned</p></div>
            <div><p className="text-xl font-semibold">{groceryLeft}</p><p className="text-xs text-muted-foreground">groceries left</p></div>
            <div><p className="text-xl font-semibold">{preps.filter(p => p.status !== 'completed').length}</p><p className="text-xs text-muted-foreground">prep sessions</p></div>
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="font-heading text-base mb-2">Quick access</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {quickCards.map((q) => (
            <button key={q.view} onClick={() => onNavigate(q.view)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 active:scale-95 transition">
              <q.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <span className="text-xs">{q.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}