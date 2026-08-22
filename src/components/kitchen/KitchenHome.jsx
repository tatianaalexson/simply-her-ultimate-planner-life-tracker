import React from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { Button } from '@/components/ui/button';
import {
  Plus, Settings as SettingsIcon, ArrowRight, CalendarDays, BookOpen,
  ShoppingCart, Box, Refrigerator, Snowflake, ChefHat, Flame,
} from 'lucide-react';
import {
  useMealPlan, useMealPrepSessions, useGroceryItems, useRecipes,
} from '@/hooks/useKitchen';
import {
  todayStr, startOfWeek, weekDates, fmtDate, useEnabledMealSlots,
} from '@/components/kitchen/kitchenConstants';
import KitchenSection from '@/components/kitchen/ui/KitchenSection';
import RecipePhoto from '@/components/kitchen/ui/RecipePhoto';
import StatusChip from '@/components/kitchen/ui/StatusChip';
import FortnightSummary from '@/components/kitchen/ui/FortnightSummary';

const QUICK_ACCESS = [
  { view: 'mealplan', label: 'Meals', icon: CalendarDays, feat: 'kit.mealplan' },
  { view: 'recipes', label: 'Recipes', icon: BookOpen, feat: 'kit.recipes' },
  { view: 'groceries', label: 'Groceries', icon: ShoppingCart, feat: 'kit.grocery' },
  { view: 'pantry', label: 'Pantry', icon: Box, feat: 'kit.pantry' },
  { view: 'fridge', label: 'Fridge', icon: Refrigerator, feat: 'kit.fridge' },
  { view: 'freezer', label: 'Freezer', icon: Snowflake, feat: 'kit.freezer' },
  { view: 'mealprep', label: 'Meal Prep', icon: ChefHat, feat: 'kit.mealprep' },
];

function mealLabel(m) {
  if (m.custom_name) return m.custom_name;
  if (m.meal_type === 'leftover') return 'Leftovers';
  if (m.meal_type === 'restaurant') return 'Takeout';
  if (m.meal_type === 'mealprep') return 'Meal prep';
  if (m.meal_type === 'open') return 'Open';
  return 'Planned meal';
}

function mealVariant(m) {
  switch (m.meal_type) {
    case 'leftover': return 'warm';
    case 'restaurant': return 'accent';
    case 'mealprep': return 'primary';
    case 'open': return 'outline';
    default: return 'neutral';
  }
}

function mealTypeLabel(m) {
  if (m.meal_type === 'recipe') return 'Recipe';
  return m.meal_type;
}

export default function KitchenHome({ onNavigate, onQuickAdd }) {
  const { isFeatureEnabled } = useAppSettings();
  const { items: meals } = useMealPlan();
  const { items: preps } = useMealPrepSessions();
  const { items: groceries } = useGroceryItems('Weekly Groceries');
  const { items: recipes } = useRecipes();
  const slots = useEnabledMealSlots();

  const today = todayStr();
  const week = weekDates(startOfWeek());
  const nextWeek = weekDates(new Date(startOfWeek().getTime() + 7 * 86400000));
  const fortnight = [...week, ...nextWeek];
  const todayMeals = meals.filter((m) => m.date === today);
  const weekMeals = meals.filter((m) => week.includes(m.date));
  const dinnersPlanned = meals.filter((m) => fortnight.includes(m.date) && m.meal_slot === 'dinner').length;
  const openDinners = fortnight.filter((d) => !meals.some((m) => m.date === d && m.meal_slot === 'dinner')).length;
  const dinner = todayMeals.find((m) => m.meal_slot === 'dinner');
  const dinnerRecipe = dinner?.recipe_id ? recipes.find((r) => r.id === dinner.recipe_id) : null;
  const upcomingPrep = preps
    .filter((p) => p.status !== 'completed')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0];
  const groceryLeft = groceries.filter((g) => !g.checked).length;
  const openPrepCount = preps.filter((p) => p.status !== 'completed').length;

  const quickCards = QUICK_ACCESS.filter((q) => isFeatureEnabled(q.feat));
  const otherTodaySlots = slots.filter((s) => s.id !== 'dinner');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80 font-medium">
            {fmtDate(today)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening in your kitchen today.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="icon" variant="outline" className="rounded-full" onClick={() => onNavigate('preferences')}>
            <SettingsIcon className="w-4 h-4" />
          </Button>
          <Button size="sm" className="rounded-full" onClick={onQuickAdd}>
            <Plus className="w-4 h-4 mr-1" /> Quick Add
          </Button>
        </div>
      </div>

      {/* Tonight hero */}
      <KitchenSection eyebrow={dinner ? 'Tonight' : 'Dinner'}>
        {dinner ? (
          <button
            onClick={() => onNavigate('mealplan')}
            className="block w-full text-left rounded-3xl overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-md active:scale-[0.99] transition"
          >
            <div className="grid grid-cols-[42%_1fr] sm:grid-cols-[36%_1fr]">
              <RecipePhoto recipe={dinnerRecipe || { category: 'dinner' }} height="h-32 sm:h-36" />
              <div className="p-4 flex flex-col justify-center gap-1.5">
                <p className="font-heading text-base font-semibold leading-snug line-clamp-2">
                  {dinnerRecipe?.name || mealLabel(dinner)}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <StatusChip variant={mealVariant(dinner)}>{mealTypeLabel(dinner)}</StatusChip>
                  {dinnerRecipe && (dinnerRecipe.total_time || dinnerRecipe.cook_time) > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {dinnerRecipe.total_time || dinnerRecipe.cook_time} min
                    </span>
                  )}
                  {dinner.servings > 0 && (
                    <span className="text-[11px] text-muted-foreground">· serves {dinner.servings}</span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                  View today <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </button>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/70 bg-secondary/20 p-6 text-center">
            <Flame className="w-7 h-7 text-primary/30 mx-auto" strokeWidth={1.25} />
            <p className="font-heading text-sm font-medium mt-2">Dinner is open tonight.</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No pressure — plan something when you're ready.
            </p>
            <Button size="sm" variant="outline" className="rounded-full mt-3" onClick={() => onNavigate('mealplan')}>
              Plan dinner
            </Button>
          </div>
        )}
      </KitchenSection>

      {/* Today's meals */}
      {otherTodaySlots.length > 0 && (
        <KitchenSection eyebrow="Today's meals">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {otherTodaySlots.map((s) => {
              const m = todayMeals.find((x) => x.meal_slot === s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => onNavigate('mealplan')}
                  className="text-left rounded-2xl border border-border/60 bg-card p-3 active:scale-[0.98] hover:shadow-sm transition"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium">
                    {s.label}
                  </p>
                  <p className="text-sm font-medium mt-1 line-clamp-2">{m ? mealLabel(m) : 'Open'}</p>
                  {m && (
                    <StatusChip variant={mealVariant(m)} className="mt-1.5">
                      {mealTypeLabel(m)}
                    </StatusChip>
                  )}
                </button>
              );
            })}
          </div>
        </KitchenSection>
      )}

      {/* Up next */}
      <KitchenSection eyebrow="Up next">
        <div className="space-y-2">
          {upcomingPrep ? (
            <button
              onClick={() => onNavigate('mealprep')}
              className="w-full flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 active:scale-[0.98] hover:shadow-sm transition"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ChefHat className="w-4 h-4 text-primary" strokeWidth={1.75} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{upcomingPrep.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {upcomingPrep.date ? fmtDate(upcomingPrep.date) : 'Meal prep'}
                  {upcomingPrep.items?.length ? ` · ${upcomingPrep.items.length} items` : ''}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ) : groceryLeft > 0 ? (
            <button
              onClick={() => onNavigate('groceries')}
              className="w-full flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 active:scale-[0.98] hover:shadow-sm transition"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4 h-4 text-primary" strokeWidth={1.75} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium">
                  {groceryLeft} item{groceryLeft !== 1 ? 's' : ''} on your grocery list
                </p>
                <p className="text-[11px] text-muted-foreground">Tap to review before your next trip</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-secondary/20 p-4 text-center">
              <p className="text-sm text-muted-foreground">All caught up — enjoy your day.</p>
            </div>
          )}
        </div>
      </KitchenSection>

      {/* Next 2 weeks */}
      <FortnightSummary
        dinners={dinnersPlanned}
        preps={openPrepCount}
        groceries={groceryLeft}
        openDinners={openDinners}
        showOpenDinners
        onNavigate={onNavigate}
      />

      {/* Quick access */}
      <KitchenSection eyebrow="Quick access">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {quickCards.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.view}
                onClick={() => onNavigate(q.view)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-4 active:scale-95 hover:shadow-sm transition"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-xs">{q.label}</span>
              </button>
            );
          })}
        </div>
      </KitchenSection>
    </div>
  );
}