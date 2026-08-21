import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChefHat, AlertCircle } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useRecipes, useInventory } from '@/hooks/useKitchen';
import { normalizeName } from '@/lib/kitchenGrocery';
import { todayStr } from '@/components/kitchen/kitchenConstants';

// "Use What I Have" — browse recipes by how many of their ingredients are
// currently in enabled Pantry/Fridge/Freezer inventory. Pure logic, no AI.
export default function UseWhatIHave({ onBack, onOpenRecipe }) {
  const { items: recipes } = useRecipes();
  const { items: pantry } = useInventory('pantry');
  const { items: fridge } = useInventory('fridge');
  const { items: freezer } = useInventory('freezer');
  const today = todayStr();

  const onHand = useMemo(() => {
    const map = new Set();
    const useSoon = new Set();
    const all = [...pantry, ...fridge, ...freezer].filter((i) => i.status !== 'used_up' && i.status !== 'discarded' && i.status !== 'expired');
    for (const i of all) {
      const n = i.normalized_name || normalizeName(i.name);
      map.add(n);
      const d = i.best_before || i.expiration;
      if (d) { const diff = (new Date(d) - new Date()) / 86400000; if (diff >= 0 && diff <= 4) useSoon.add(n); }
    }
    return { map, useSoon };
  }, [pantry, fridge, freezer]);

  const scored = useMemo(() => {
    return recipes.map((r) => {
      const ings = (r.ingredients || []).filter((i) => i.name);
      if (ings.length === 0) return { recipe: r, total: 0, have: 0, missing: [], useSoonHits: 0, scored: false };
      const missing = [];
      let have = 0; let useSoonHits = 0;
      for (const ing of ings) {
        const n = normalizeName(ing.name);
        if (onHand.map.has(n)) { have++; if (onHand.useSoon.has(n)) useSoonHits++; }
        else missing.push(ing.name);
      }
      return { recipe: r, total: ings.length, have, missing, useSoonHits, scored: true };
    }).filter((s) => s.scored).sort((a, b) => (b.have / b.total) - (a.have / a.total));
  }, [recipes, onHand]);

  const full = scored.filter((s) => s.missing.length === 0 && s.total > 0);
  const close = scored.filter((s) => s.missing.length > 0 && s.missing.length <= 2);
  const useSoonRecipes = scored.filter((s) => s.useSoonHits > 0);

  const hasInventory = onHand.map.size > 0;

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Use What I Have</h2>
      </div>

      {!hasInventory ? (
        <EmptyState icon={ChefHat} title="No inventory tracked yet" subtitle="Add pantry, fridge, or freezer items to find recipes you can make." />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">Based on your current pantry, fridge, and freezer.</p>

          {full.length > 0 && (
            <Section title="You have everything" subtitle="Looks like you have what you need.">
              {full.map((s) => <RecipeRow key={s.recipe.id} s={s} onOpen={() => onOpenRecipe(s.recipe)} />)}
            </Section>
          )}

          {close.length > 0 && (
            <Section title="Almost there" subtitle="Missing just 1–2 things.">
              {close.map((s) => <RecipeRow key={s.recipe.id} s={s} onOpen={() => onOpenRecipe(s.recipe)} />)}
            </Section>
          )}

          {useSoonRecipes.length > 0 && (
            <Section title="Uses items to use soon" subtitle="Good way to use up what's expiring.">
              {useSoonRecipes.slice(0, 6).map((s) => <RecipeRow key={s.recipe.id} s={s} onOpen={() => onOpenRecipe(s.recipe)} useSoon />)}
            </Section>
          )}

          {full.length === 0 && close.length === 0 && (
            <EmptyState icon={AlertCircle} title="No close matches" subtitle="Try adding more recipes with ingredients, or update your inventory." />
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div>
      <p className="font-heading text-sm font-medium">{title}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground mb-2">{subtitle}</p>}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function RecipeRow({ s, onOpen, useSoon }) {
  return (
    <Card className="rounded-3xl cursor-pointer active:scale-[0.98] transition" onClick={onOpen}>
      <CardContent className="p-3 flex items-center gap-3">
        {s.recipe.photo_url ? <img src={s.recipe.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover" /> : <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center"><ChefHat className="w-5 h-5 text-muted-foreground" /></div>}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{s.recipe.name}</p>
          <p className="text-[11px] text-muted-foreground">{s.have} of {s.total} ingredients{s.missing.length > 0 ? ` · need ${s.missing.slice(0, 2).join(', ')}${s.missing.length > 2 ? '…' : ''}` : ''}</p>
        </div>
        {useSoon && <Badge variant="secondary" className="text-[10px]">use soon</Badge>}
      </CardContent>
    </Card>
  );
}