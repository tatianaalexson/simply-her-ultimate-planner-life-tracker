import React from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Home, CalendarDays, BookOpen, ShoppingCart, ChefHat,
  Box, Refrigerator, Snowflake, Utensils, LayoutTemplate,
  PartyPopper, Soup, Settings as SettingsIcon, MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Responsive hierarchical Kitchen navigation.
// Primary destinations render as a compact, scrollable segmented bar (works on
// mobile and desktop). Secondary destinations live in a "More" dropdown so the
// bar never crams 8–12 tiny labels across the screen.
const PRIMARY = [
  { view: 'home', label: 'Home', icon: Home, on: true },
  { view: 'mealplan', label: 'Meals', icon: CalendarDays, feat: 'kit.mealplan' },
  { view: 'recipes', label: 'Recipes', icon: BookOpen, feat: 'kit.recipes' },
  { view: 'groceries', label: 'Groceries', icon: ShoppingCart, feat: 'kit.grocery' },
  { view: 'mealprep', label: 'Meal Prep', icon: ChefHat, feat: 'kit.mealprep' },
];

const SECONDARY = [
  { view: 'pantry', label: 'Pantry', icon: Box, feat: 'kit.pantry' },
  { view: 'fridge', label: 'Fridge', icon: Refrigerator, feat: 'kit.fridge' },
  { view: 'freezer', label: 'Freezer', icon: Snowflake, feat: 'kit.freezer' },
  { view: 'leftovers', label: 'Leftovers', icon: Utensils, feat: 'kit.leftovers' },
  { view: 'occasions', label: 'Occasions', icon: PartyPopper, feat: 'kit.occasionPlan' },
  {
    view: 'templates',
    label: 'Templates',
    icon: LayoutTemplate,
    anyOf: ['kit.mealTemplates', 'kit.groceryTemplates', 'kit.prepTemplates'],
  },
  { view: 'equipment', label: 'Equipment', icon: Soup, feat: 'kit.equipment' },
];

export default function KitchenNav({ view, onNavigate }) {
  const { isFeatureEnabled } = useAppSettings();

  const primary = PRIMARY.filter((p) =>
    p.on ? true : isFeatureEnabled(p.feat)
  );

  const secondary = SECONDARY.filter((s) =>
    s.anyOf ? s.anyOf.some((f) => isFeatureEnabled(f)) : isFeatureEnabled(s.feat)
  ).concat([{ view: 'preferences', label: 'Preferences', icon: SettingsIcon, on: true }]);

  const activeSecondary = secondary.find((s) => s.view === view);

  return (
    <nav className="sticky top-14 z-20 -mx-4 px-4 py-2 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 overflow-x-auto flex-1 min-w-0">
          {primary.map((p) => {
            const active = view === p.view;
            const Icon = p.icon;
            return (
              <button
                key={p.view}
                onClick={() => onNavigate(p.view)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.75} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {secondary.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={activeSecondary ? 'default' : 'outline'}
                size="sm"
                className="rounded-full shrink-0 h-8 px-3"
              >
                {activeSecondary ? (
                  <activeSecondary.icon className="w-4 h-4" />
                ) : (
                  <MoreHorizontal className="w-4 h-4" />
                )}
                <span className="hidden sm:inline ml-1">
                  {activeSecondary ? activeSecondary.label : 'More'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Kitchen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {secondary.map((s) => {
                const Icon = s.icon;
                return (
                  <DropdownMenuItem
                    key={s.view}
                    onClick={() => onNavigate(s.view)}
                    className={cn(view === s.view && 'bg-secondary')}
                  >
                    <Icon className="w-4 h-4 mr-2" strokeWidth={1.75} />
                    {s.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}