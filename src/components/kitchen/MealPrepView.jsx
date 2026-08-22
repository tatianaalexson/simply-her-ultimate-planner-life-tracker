import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChefHat, ChevronRight, Clock, Utensils } from 'lucide-react';
import KitchenEmptyState from '@/components/kitchen/ui/KitchenEmptyState';
import KitchenSection from '@/components/kitchen/ui/KitchenSection';
import FortnightSummary from '@/components/kitchen/ui/FortnightSummary';
import MealPrepSessionDetail from '@/components/kitchen/MealPrepSessionDetail';
import RecipePhoto from '@/components/kitchen/ui/RecipePhoto';
import { useMealPrepSessions, useMealPlan, useGroceryItems, useRecipes } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { todayStr, startOfWeek, weekDates, fmtDate } from '@/components/kitchen/kitchenConstants';
import { cn } from '@/lib/utils';

const STATUS_LABELS = { planned: 'Planned', in_progress: 'In progress', completed: 'Completed' };

export default function MealPrepView({ onBack, onOpenGroceryReview, onLogFood }) {
  const { isFeatureEnabled } = useAppSettings();
  const { items: sessions, add, update, remove } = useMealPrepSessions();
  const { items: meals } = useMealPlan();
  const { items: groceries } = useGroceryItems();
  const { items: recipes } = useRecipes();
  const [openId, setOpenId] = useState(null);

  const open = sessions.find((s) => s.id === openId);

  if (open) {
    return (
      <MealPrepSessionDetail
        session={open} recipes={recipes} onBack={() => setOpenId(null)}
        onUpdate={(data) => update(open.id, data)}
        onOpenGroceryReview={onOpenGroceryReview} onLogFood={onLogFood}
        canLog={isFeatureEnabled('kit.foodDiary')} canGen={isFeatureEnabled('kit.prepGen')}
        canTasks={isFeatureEnabled('kit.prepTasks')} canStorage={isFeatureEnabled('kit.prepStorage')}
        canTemplates={isFeatureEnabled('kit.prepTemplates')}
      />
    );
  }

  // 14-day range
  const fortStart = startOfWeek();
  const fortStartStr = fortStart.toISOString().slice(0, 10);
  const fortEndStr = new Date(fortStart.getTime() + 13 * 86400000).toISOString().slice(0, 10);
  const w1 = weekDates(fortStart);
  const w2 = weekDates(new Date(fortStart.getTime() + 7 * 86400000));

  const today = todayStr();
  const fortSessions = sessions.filter((s) => s.date && s.date >= fortStartStr && s.date <= fortEndStr);
  const w1Sessions = fortSessions.filter((s) => w1.includes(s.date));
  const w2Sessions = fortSessions.filter((s) => w2.includes(s.date));

  const upcoming = sessions
    .filter((s) => s.status !== 'completed' && (!s.date || s.date >= today))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const past = sessions
    .filter((s) => s.status === 'completed' || (s.date && s.date < today))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const dinnersPlanned = meals.filter((m) => {
    const fn = [...w1, ...w2];
    return fn.includes(m.date) && m.meal_slot === 'dinner';
  }).length;
  const groceryLeft = groceries.filter((g) => !g.checked).length;
  const openPrepCount = sessions.filter((s) => s.status !== 'completed').length;

  const handleNew = async () => {
    const s = await add({ name: 'New prep session', date: todayStr(), status: 'planned', items: [], tasks: [], outputs: [] });
    setOpenId(s.id);
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-lg font-semibold flex-1">Meal Prep</h2>
        <Button size="sm" className="rounded-full" onClick={handleNew}><Plus className="w-4 h-4 mr-1" /> New Prep Session</Button>
      </div>

      <FortnightSummary dinners={dinnersPlanned} preps={openPrepCount} groceries={groceryLeft} onNavigate={null} />

      {/* 14-day overview */}
      <KitchenSection eyebrow="Current 2 weeks" title={`${fmtDate(fortStartStr)} – ${fmtDate(fortEndStr)}`}>
        {fortSessions.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1">No prep sessions in the next 2 weeks.</p>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Week 1', sessions: w1Sessions, dates: w1 },
              { label: 'Week 2', sessions: w2Sessions, dates: w2 },
            ].filter((sec) => sec.sessions.length > 0).map((sec) => (
              <div key={sec.label}>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1 px-1">{sec.label}</p>
                <div className="space-y-1.5">
                  {sec.sessions.map((s) => (
                    <PrepOverviewCard key={s.id} session={s} recipes={recipes} onOpen={() => setOpenId(s.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </KitchenSection>

      {/* Upcoming */}
      <KitchenSection eyebrow="Upcoming">
        {upcoming.length === 0 ? (
          <KitchenEmptyState icon={ChefHat} title="No prep sessions planned." subtitle="Start one when you're ready." actionLabel="Plan a Prep Session" onAction={handleNew} />
        ) : (
          <div className="space-y-2">
            {upcoming.map((s) => (
              <SessionCard key={s.id} session={s} recipes={recipes} onOpen={() => setOpenId(s.id)} />
            ))}
          </div>
        )}
      </KitchenSection>

      {/* Past */}
      {past.length > 0 && (
        <KitchenSection eyebrow="Past">
          <div className="space-y-2">
            {past.map((s) => (
              <SessionCard key={s.id} session={s} recipes={recipes} onOpen={() => setOpenId(s.id)} past />
            ))}
          </div>
        </KitchenSection>
      )}
    </div>
  );
}

function PrepOverviewCard({ session, recipes, onOpen }) {
  const items = session.items || [];
  const recipeCount = items.filter((it) => it.recipe_id).length;
  const portions = items.reduce((s, it) => s + (it.portions || 0), 0);
  const tasks = session.tasks || [];
  const taskCount = tasks.length;
  return (
    <button onClick={onOpen} className="w-full flex items-center gap-2 rounded-2xl border border-border/60 bg-card p-2.5 text-left active:scale-[0.98] transition">
      <ChefHat className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{session.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {session.date ? fmtDate(session.date) : ''}
          {recipeCount > 0 ? ` · ${recipeCount} recipe${recipeCount !== 1 ? 's' : ''}` : ''}
          {portions > 0 ? ` · ${portions} portions` : ''}
          {taskCount > 0 ? ` · ${taskCount} tasks` : ''}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function SessionCard({ session, recipes, onOpen, past }) {
  const items = session.items || [];
  const tasks = session.tasks || [];
  const totalDuration = tasks.reduce((s, t) => s + (t.duration || 0), 0);
  const completedTasks = tasks.filter((t) => t.done).length;
  const totalPortions = items.reduce((s, it) => s + (it.portions || 0), 0);

  return (
    <button onClick={onOpen} className={cn('block w-full text-left rounded-3xl border border-border/60 bg-card p-3 active:scale-[0.99] hover:shadow-sm transition', past && 'opacity-70')}>
      <div className="flex items-start gap-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <ChefHat className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-semibold truncate">{session.name}</p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            {session.date && <span className="text-[11px] text-muted-foreground">{fmtDate(session.date)}</span>}
            {totalDuration > 0 && <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5"><Clock className="w-3 h-3" />~{totalDuration} min</span>}
            {tasks.length > 0 && <span className="text-[11px] text-muted-foreground">{completedTasks} / {tasks.length} tasks</span>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
      {items.length > 0 && (
        <div className="mt-2 space-y-0.5 pl-12">
          {items.slice(0, 3).map((it, i) => (
            <p key={i} className="text-[11px] text-muted-foreground truncate">{it.custom_name} ×{it.portions || 1}</p>
          ))}
          {items.length > 3 && <p className="text-[10px] text-muted-foreground">+{items.length - 3} more</p>}
        </div>
      )}
      {!past && (
        <div className="mt-2 pl-12">
          <span className="text-xs text-primary font-medium">Continue Prep</span>
        </div>
      )}
    </button>
  );
}