import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, Clock, Users, ShoppingCart, CalendarDays, ChefHat, Copy, Pencil, Check } from 'lucide-react';
import { useAppSettings } from '@/lib/AppSettings';
import { todayStr } from '@/components/kitchen/kitchenConstants';

const parseQty = (q) => { if (typeof q === 'number') return q; if (!q) return 0; const s = String(q).trim(); const f = s.match(/^(\d+)\s*\/\s*(\d+)$/); if (f) return parseInt(f[1]) / parseInt(f[2]); const m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/); if (m) return parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]); const n = parseFloat(s.replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };
const fmtQty = (n) => { if (!n) return '0'; if (Number.isInteger(n)) return String(n); const ds = [2, 3, 4, 8, 16]; for (const d of ds) { const w = Math.floor(n); const r = n - w; const num = Math.round(r * d); if (Math.abs(num / d - r) < 0.01 && num > 0) return w > 0 ? `${w} ${num}/${d}` : `${num}/${d}`; } return String(Math.round(n * 100) / 100); };

const SCALES = [{ k: 0.5, label: '½×' }, { k: 1, label: '1×' }, { k: 1.5, label: '1.5×' }, { k: 2, label: '2×' }];

export default function RecipeDetail({ recipe, onBack, onEdit, onOpenGroceryReview, onDuplicate }) {
  const { isFeatureEnabled } = useAppSettings();
  const [scale, setScale] = useState(1);
  const [customServings, setCustomServings] = useState('');
  const [cooking, setCooking] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [showLeftover, setShowLeftover] = useState(false);
  const [leftoverParts, setLeftoverParts] = useState(1);
  const [leftoverLoc, setLeftoverLoc] = useState('Fridge');

  const defaultServ = recipe.default_servings || 1;
  const targetServ = customServings ? parseInt(customServings) : Math.round(defaultServ * scale);
  const factor = targetServ / defaultServ;

  const sections = {};
  (recipe.ingredients || []).forEach((ing) => {
    const sec = ing.section || 'Ingredients';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(ing);
  });

  const markCooked = async () => {
    try {
      await base44.entities.Recipe.update(recipe.id, { last_cooked: todayStr(), cooked_count: (recipe.cooked_count || 0) + 1 });
    } catch { /* ignore */ }
    setShowLeftover(true);
  };

  const saveLeftover = async () => {
    try {
      await base44.entities.Leftover.create({
        name: recipe.name, source_recipe_id: recipe.id, date_made: todayStr(),
        portions: leftoverParts, storage_location: leftoverLoc, use_by: '', notes: '', status: 'available',
      });
    } catch { /* ignore */ }
    setShowLeftover(false);
  };

  const addToMealPlan = async () => {
    try {
      await base44.entities.MealPlanEntry.create({
        date: todayStr(), meal_slot: 'dinner', meal_type: 'recipe',
        recipe_id: recipe.id, custom_name: recipe.name, servings: targetServ,
      });
    } catch { /* ignore */ }
  };

  if (cooking) {
    const steps = (recipe.instructions || []).filter((s) => s.text);
    const cur = steps[stepIdx];
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col p-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" className="rounded-full" onClick={() => setCooking(false)}><ArrowLeft className="w-4 h-4 mr-1" /> Exit</Button>
          <p className="font-heading text-sm">{recipe.name}</p>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <p className="text-xs text-muted-foreground mb-2">Step {stepIdx + 1} of {steps.length}</p>
          {cur?.title && <p className="font-heading text-lg mb-2">{cur.title}</p>}
          <p className="text-lg leading-relaxed">{cur?.text}</p>
          {cur?.duration > 0 && <p className="text-sm text-muted-foreground mt-3">⏱ {cur.duration} min{cur.timer_label ? ` · ${cur.timer_label}` : ''}</p>}
        </div>
        <div className="flex gap-2 max-w-md mx-auto w-full">
          <Button variant="outline" className="rounded-full flex-1" disabled={stepIdx === 0} onClick={() => setStepIdx((i) => Math.max(0, i - 1))}>Previous</Button>
          {stepIdx < steps.length - 1 ? (
            <Button className="rounded-full flex-1" onClick={() => setStepIdx((i) => i + 1)}>Next step</Button>
          ) : (
            <Button className="rounded-full flex-1" onClick={() => setCooking(false)}>Done</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onEdit}><Pencil className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onDuplicate(recipe)}><Copy className="w-4 h-4" /></Button>
      </div>

      {recipe.photo_url && <img src={recipe.photo_url} alt={recipe.name} className="w-full h-48 object-cover rounded-3xl" />}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold flex-1">{recipe.name}</h1>
          {recipe.favourite && <Heart className="w-5 h-5 fill-current text-primary" />}
        </div>
        {recipe.description && <p className="text-sm text-muted-foreground">{recipe.description}</p>}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <Badge variant="secondary" className="capitalize">{recipe.category}</Badge>
          {(recipe.total_time || recipe.cook_time) > 0 && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.total_time || recipe.cook_time}m</span>}
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {defaultServ} servings</span>
          {recipe.difficulty && <span className="text-xs text-muted-foreground capitalize">{recipe.difficulty}</span>}
        </div>
      </div>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-2">
        <p className="text-sm font-medium">Servings</p>
        <div className="flex gap-1.5 flex-wrap">
          {SCALES.map((s) => (
            <Button key={s.k} size="sm" variant={scale === s.k && !customServings ? 'default' : 'outline'} className="rounded-full" onClick={() => { setScale(s.k); setCustomServings(''); }}>{s.label}</Button>
          ))}
          <Input type="number" value={customServings} onChange={(e) => setCustomServings(e.target.value)} placeholder="Custom" className="rounded-2xl w-24 h-8 text-sm" />
        </div>
        <p className="text-xs text-muted-foreground">Cooking for {targetServ}</p>
      </CardContent></Card>

      {Object.entries(sections).map(([sec, ings]) => (
        <Card key={sec} className="rounded-3xl"><CardContent className="p-4 space-y-1.5">
          <p className="font-heading text-sm font-medium">{sec}</p>
          {ings.map((ing, i) => {
            const scaled = parseQty(ing.qty) * factor;
            return (
              <div key={i} className="flex items-baseline gap-2 text-sm">
                <span className="text-muted-foreground w-20 shrink-0">{fmtQty(scaled)} {ing.unit}</span>
                <span className="flex-1">{ing.name}{ing.prep ? `, ${ing.prep}` : ''}</span>
                {ing.optional && <span className="text-[10px] text-muted-foreground">optional</span>}
              </div>
            );
          })}
        </CardContent></Card>
      ))}

      {(recipe.instructions || []).filter((s) => s.text).length > 0 && (
        <Card className="rounded-3xl"><CardContent className="p-4 space-y-3">
          <p className="font-heading text-sm font-medium">Instructions</p>
          {(recipe.instructions || []).filter((s) => s.text).map((st, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-xs font-medium w-5 shrink-0 mt-0.5">{i + 1}.</span>
              <div className="flex-1">
                {st.title && <p className="text-sm font-medium">{st.title}</p>}
                <p className="text-sm text-muted-foreground">{st.text}</p>
                {st.duration > 0 && <p className="text-xs text-muted-foreground mt-0.5">⏱ {st.duration} min</p>}
              </div>
            </div>
          ))}
        </CardContent></Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        {isFeatureEnabled('kit.groceryGen') && (
          <Button className="rounded-full col-span-2" onClick={() => onOpenGroceryReview([{ recipe, plannedServings: targetServ }])}>
            <ShoppingCart className="w-4 h-4 mr-1" /> Add ingredients to groceries
          </Button>
        )}
        {isFeatureEnabled('kit.mealplan') && (
          <Button variant="outline" className="rounded-full" onClick={addToMealPlan}><CalendarDays className="w-4 h-4 mr-1" /> Add to meal plan</Button>
        )}
        {isFeatureEnabled('kit.mealprep') && (
          <Button variant="outline" className="rounded-full" onClick={() => onOpenGroceryReview([{ recipe, plannedServings: targetServ, prep: { id: null } }])}><ChefHat className="w-4 h-4 mr-1" /> Add to prep</Button>
        )}
        <Button variant="outline" className="rounded-full" onClick={markCooked}><Check className="w-4 h-4 mr-1" /> Mark as cooked</Button>
        {isFeatureEnabled('kit.cookingMode') && (recipe.instructions || []).some((s) => s.text) && (
          <Button variant="outline" className="rounded-full col-span-2" onClick={() => { setStepIdx(0); setCooking(true); }}>Start cooking mode</Button>
        )}
      </div>

      {showLeftover && (
        <Card className="rounded-3xl border-primary"><CardContent className="p-4 space-y-2">
          <p className="font-heading text-sm font-medium">Any leftovers?</p>
          <div className="flex gap-2 items-center">
            <Input type="number" value={leftoverParts} onChange={(e) => setLeftoverParts(parseInt(e.target.value) || 0)} className="rounded-2xl w-20" />
            <span className="text-sm">portions</span>
            <select value={leftoverLoc} onChange={(e) => setLeftoverLoc(e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm flex-1">
              <option>Fridge</option><option>Freezer</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-full flex-1" onClick={() => setShowLeftover(false)}>No leftovers</Button>
            <Button className="rounded-full flex-1" onClick={saveLeftover}>Save leftover</Button>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}