import React, { useState, useMemo } from 'react';
import { useRecipes } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Plus, Search, ArrowLeft, Sparkles, BookOpen,
} from 'lucide-react';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import RecipeCard from '@/components/kitchen/ui/RecipeCard';
import KitchenEmptyState from '@/components/kitchen/ui/KitchenEmptyState';
import RecipeForm from '@/components/kitchen/RecipeForm';
import RecipeDetail from '@/components/kitchen/RecipeDetail';
import UseWhatIHave from '@/components/kitchen/UseWhatIHave';
import { RECIPE_CATEGORIES } from '@/components/kitchen/kitchenConstants';
import { cn } from '@/lib/utils';

// Recipe Library — browse-first, image-forward. Creation forms only appear via
// the "New Recipe" action; filters are collapsed into chips + dropdowns.
export default function RecipeList({ onBack, onOpenGroceryReview }) {
  const { isFeatureEnabled } = useAppSettings();
  const { items: recipes, add, update, remove } = useRecipes();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filter, setFilter] = useState('all');
  const [collection, setCollection] = useState('all');
  const [mode, setMode] = useState('list');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);

  const collections = useMemo(() => {
    const set = new Set();
    recipes.forEach((r) => (r.collections || []).forEach((c) => c && set.add(c)));
    return Array.from(set).sort();
  }, [recipes]);

  const hasCookedData = recipes.filter((r) => (r.cooked_count || 0) > 0).length >= 3;

  const filtered = useMemo(() => {
    let list = recipes.filter((r) => {
      if (filter === 'favourites' && !r.favourite) return false;
      if (filter === 'recent' && !r.last_cooked) return false;
      if (filter === 'cooked' && !(r.cooked_count > 0)) return false;
      if (cat !== 'all' && r.category !== cat) return false;
      if (collection !== 'all' && !(r.collections || []).includes(collection)) return false;
      if (q) {
        const hay = (r.name + ' ' + (r.tags || []).join(' ') + ' ' + (r.notes || '')).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    if (filter === 'recent') list = list.slice().sort((a, b) => (b.last_cooked || '').localeCompare(a.last_cooked || ''));
    if (filter === 'cooked') list = list.slice().sort((a, b) => (b.cooked_count || 0) - (a.cooked_count || 0));
    return list;
  }, [recipes, q, cat, filter, collection]);

  const openRecipe = (r) => { setSelected(r); setMode('detail'); };
  const newRecipe = () => { setEditing(null); setMode('form'); };
  const editRecipe = (r) => { setEditing(r); setMode('form'); };

  const handleSave = async (data) => {
    if (editing) { await update(editing.id, data); }
    else { await add(data); }
    setMode('list');
  };

  const duplicate = (r) => {
    const { id, created_date, updated_date, cooked_count, last_cooked, ...rest } = r;
    add({ ...rest, name: `${r.name} (variation)`, cooked_count: 0, last_cooked: '' });
  };

  if (mode === 'form') {
    return <RecipeForm recipe={editing} onSave={handleSave} onCancel={() => setMode('list')} />;
  }
  if (mode === 'detail' && selected) {
    return (
      <RecipeDetail
        recipe={selected}
        onBack={() => setMode('list')}
        onEdit={() => editRecipe(selected)}
        onOpenGroceryReview={onOpenGroceryReview}
        onDuplicate={duplicate}
        onUpdate={(data) => update(selected.id, data)}
      />
    );
  }
  if (mode === 'use-what-i-have') {
    return <UseWhatIHave onBack={() => setMode('list')} onOpenRecipe={openRecipe} />;
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'favourites', label: 'Favourites' },
    { id: 'recent', label: 'Recently Cooked' },
    ...(hasCookedData ? [{ id: 'cooked', label: 'Most Cooked' }] : []),
  ];

  const hasInventory =
    isFeatureEnabled('kit.pantry') || isFeatureEnabled('kit.fridge') || isFeatureEnabled('kit.freezer');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-heading text-xl font-semibold flex-1">Recipes</h2>
        {hasInventory && (
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setMode('use-what-i-have')}>
            <Sparkles className="w-4 h-4 mr-1" /> Use What I Have
          </Button>
        )}
        <Button size="sm" className="rounded-full" onClick={newRecipe}>
          <Plus className="w-4 h-4 mr-1" /> New Recipe
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search recipes, ingredients, tags"
          className="rounded-2xl pl-9"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1 min-w-0">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition',
                filter === f.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-[130px] rounded-full h-8 text-xs shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {RECIPE_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {collections.length > 0 && (
          <Select value={collection} onValueChange={setCollection}>
            <SelectTrigger className="w-[130px] rounded-full h-8 text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All collections</SelectItem>
              {collections.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <KitchenEmptyState
          icon={BookOpen}
          title="Your recipe box is waiting."
          subtitle="Save family favourites and new finds — they'll appear here as a beautiful library."
          actionLabel="Add your first recipe"
          onAction={newRecipe}
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} onClick={() => openRecipe(r)} />
          ))}
        </div>
      )}
    </div>
  );
}