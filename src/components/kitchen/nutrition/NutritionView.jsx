import React, { useState, useMemo } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, ChevronLeft, ChevronRight, Trash2, Utensils } from 'lucide-react';
import { useNutritionDay, useNutritionGoals } from '@/hooks/useNutrition';
import {
  sumEntries, groupBySlot, fmtNut, MACRO_FIELDS, NUTRITION_SLOTS,
} from '@/lib/nutrition';
import { todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';
import LogFoodSheet from './LogFoodSheet';
import SavedFoods from './SavedFoods';
import NutritionGoals from './NutritionGoals';
import NutritionHistory from './NutritionHistory';
import { cn } from '@/lib/utils';

const shift = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function NutritionView({ onBack }) {
  const { isFeatureEnabled } = useAppSettings();
  const [tab, setTab] = useState('today');
  const [date, setDate] = useState(todayStr());
  const [logOpen, setLogOpen] = useState(false);
  const [logPrefill, setLogPrefill] = useState(null);

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'diary', label: 'Diary' },
    { id: 'foods', label: 'Foods' },
    { id: 'goals', label: 'Goals' },
  ];
  if (isFeatureEnabled('kit.nutritionHistory')) tabs.push({ id: 'history', label: 'History' });

  const openLog = (prefill) => { setLogPrefill(prefill || null); setLogOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-xl font-semibold flex-1">Nutrition</h2>
        <Button size="sm" className="rounded-full" onClick={() => openLog(null)}>
          <Plus className="w-4 h-4 mr-1" /> Log Food
        </Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition',
              tab === t.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'today' && <TodayView date={date} onOpenLog={openLog} onSeeDiary={() => setTab('diary')} />}
      {tab === 'diary' && <DiaryView date={date} setDate={setDate} onOpenLog={openLog} />}
      {tab === 'foods' && <SavedFoods />}
      {tab === 'goals' && <NutritionGoals />}
      {tab === 'history' && <NutritionHistory />}

      <LogFoodSheet open={logOpen} onOpenChange={setLogOpen} prefill={logPrefill} />
    </div>
  );
}

function TodayView({ date, onOpenLog, onSeeDiary }) {
  const { isFeatureEnabled } = useAppSettings();
  const showMacros = isFeatureEnabled('kit.macros');
  const { items } = useNutritionDay(date);
  const { record: goals } = useNutritionGoals();
  const totals = sumEntries(items);
  const calGoal = goals?.calorie_goal || 0;
  const calPct = calGoal ? Math.min(100, (totals.calories / calGoal) * 100) : 0;
  const groups = groupBySlot(items);
  const slotsLogged = NUTRITION_SLOTS.filter((s) => (groups[s.id] || []).length > 0);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/60 bg-card p-5 space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Calories · {fmtDate(date)}</p>
        <div className="flex items-baseline justify-between">
          <p className="font-heading text-3xl font-semibold">{fmtNut(totals.calories)}</p>
          <p className="text-sm text-muted-foreground">/ {calGoal || '—'} kcal</p>
        </div>
        <Progress value={calPct} className="h-2" />
        {showMacros && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {MACRO_FIELDS.map((m) => {
              const goal = goals?.[`${m.key}_goal`] || 0;
              return (
                <div key={m.key} className="rounded-2xl bg-secondary/40 p-2.5">
                  <p className="text-[11px] text-muted-foreground">{m.label}</p>
                  <p className="text-sm font-medium">{fmtNut(totals[m.key], m.unit)}<span className="text-muted-foreground">/{goal || '—'}{m.unit}</span></p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Meals logged</p>
        {slotsLogged.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing logged yet today.</p>
        ) : (
          <div className="space-y-1.5">
            {slotsLogged.map((s) => {
              const slotTotals = sumEntries(groups[s.id]);
              return (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium">{fmtNut(slotTotals.calories)} cal</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button className="rounded-full flex-1" onClick={() => onOpenLog(null)}><Plus className="w-4 h-4 mr-1" /> Log food</Button>
        <Button variant="outline" className="rounded-full" onClick={onSeeDiary}>View diary</Button>
      </div>
    </div>
  );
}

function DiaryView({ date, setDate, onOpenLog }) {
  const { items, remove } = useNutritionDay(date);
  const groups = groupBySlot(items);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setDate(shift(date, -1))} className="p-2 rounded-full hover:bg-secondary"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => setDate(todayStr())} className="text-sm font-medium">{fmtDate(date)}{date === todayStr() ? '' : ''}</button>
        <button onClick={() => setDate(shift(date, 1))} className="p-2 rounded-full hover:bg-secondary"><ChevronRight className="w-4 h-4" /></button>
      </div>

      {NUTRITION_SLOTS.map((s) => {
        const entries = groups[s.id] || [];
        const slotTotals = sumEntries(entries);
        return (
          <div key={s.id} className="rounded-3xl border border-border/60 bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-heading text-sm font-medium">{s.label}</p>
              <span className="text-[11px] text-muted-foreground">{entries.length ? `${fmtNut(slotTotals.calories)} cal` : 'Open'}</span>
            </div>
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2 border-t border-border pt-2 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{e.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {fmtNut(e.calories)} cal{e.servings && e.servings !== 1 ? ` · ${e.servings}×` : ''}
                  </p>
                </div>
                <button onClick={() => remove(e.id)} className="text-muted-foreground shrink-0 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={() => onOpenLog({ slot: s.id, date })} className="text-xs text-primary inline-flex items-center gap-1 pt-1">
              <Plus className="w-3 h-3" /> Add to {s.label.toLowerCase()}
            </button>
          </div>
        );
      })}
    </div>
  );
}