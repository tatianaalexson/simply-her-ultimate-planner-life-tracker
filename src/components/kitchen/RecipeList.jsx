import React, { useState, useMemo } from 'react';
import { useRecipes } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Heart, ArrowLeft, Clock, Sparkles, Folder } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import RecipeForm from '@/components/kitchen/RecipeForm';
import RecipeDetail from '@/components/kitchen/RecipeDetail';
import UseWhatIHave from '@/components/kitchen/UseWhatIHave';
import { RECIPE_CATEGORIES, EMPTY } from '@/components/kitchen/kitchenConstants';

export default function RecipeList({ onBack, onOpenGroceryReview }) {
  const { isFeatureEnabled } = useAppSettings();
  const { items: recipes, add, update, remove } = useRecipes();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filter, setFilter] = useState('all'); // all | favourites | recent | cooked
  const [collection, setCollection] = useState('all');
  const [mode, setMode] = useState('list'); // list | form | detail | use-what-i-have
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
    return <RecipeDetail recipe={selected} onBack={() => setMode('list')} onEdit={() => editRecipe(selected)} onOpenGroceryReview={onOpenGroceryReview} onDuplicate={duplicate} />;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Recipes</h2>
        <Button size="sm" className="rounded-full" onClick={newRecipe}><Plus className="w-4 h-4 mr-1" /> New</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipes, ingredients, tags" className="rounded-2xl pl-9" />
        </div>
        <Button variant={filter === 'favourites' ? 'default' : 'outline'} size="icon" className="rounded-2xl shrink-0" onClick={() => setFilter(filter === 'favourites' ? 'all' : 'favourites')}><Heart className={`w-4 h-4 ${filter === 'favourites' ? 'fill-current' : ''}`} /></Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{f.label}</button>
        ))}
      </div>

      {collections.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button onClick={() => setCollection('all')} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1 ${collection === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}><Folder className="w-3 h-3" /> All</button>
          {collections.map((c) => (
            <button key={c} onClick={() => setCollection(c)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${collection === c ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{c}</button>
          ))}
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setCat('all')} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${cat === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>All</button>
        {RECIPE_CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCat(c.value)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap capitalize ${cat === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{c.label}</button>
        ))}
      </div>

      {(isFeatureEnabled('kit.pantry') || isFeatureEnabled('kit.fridge') || isFeatureEnabled('kit.freezer')) && (
        <Button variant="outline" className="rounded-full w-full" onClick={() => setMode('use-what-i-have')}><Sparkles className="w-4 h-4 mr-1" /> Use What I Have</Button>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={Plus} title={EMPTY.recipes.title} subtitle={EMPTY.recipes.subtitle} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((r) => (
            <Card key={r.id} className="rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition" onClick={() => openRecipe(r)}>
              {r.photo_url && <img src={r.photo_url} alt={r.name} className="w-full h-32 object-cover" />}
              <CardContent className="p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{r.name}</p>
                  {r.favourite && <Heart className="w-3.5 h-3.5 fill-current text-primary shrink-0" />}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="capitalize text-[10px]">{r.category}</Badge>
                  {(r.total_time || r.cook_time) > 0 && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-3 h-3" /> {r.total_time || r.cook_time}m</span>
                  )}
                  {r.cooked_count > 0 && <span className="text-[10px] text-muted-foreground">cooked {r.cooked_count}×</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}