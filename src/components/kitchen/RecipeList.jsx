import React, { useState, useMemo } from 'react';
import { useRecipes } from '@/hooks/useKitchen';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Heart, ArrowLeft, Clock } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import RecipeForm from '@/components/kitchen/RecipeForm';
import RecipeDetail from '@/components/kitchen/RecipeDetail';
import { RECIPE_CATEGORIES, EMPTY } from '@/components/kitchen/kitchenConstants';

export default function RecipeList({ onBack, onOpenGroceryReview }) {
  const { items: recipes, add, update, remove } = useRecipes();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [favsOnly, setFavsOnly] = useState(false);
  const [mode, setMode] = useState('list'); // list | form | detail
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (favsOnly && !r.favourite) return false;
      if (cat !== 'all' && r.category !== cat) return false;
      if (q && !r.name?.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [recipes, q, cat, favsOnly]);

  const openRecipe = (r) => { setSelected(r); setMode('detail'); };
  const newRecipe = () => { setEditing(null); setMode('form'); };
  const editRecipe = (r) => { setEditing(r); setMode('form'); };

  const handleSave = async (data) => {
    if (editing) { await update(editing.id, data); }
    else { await add(data); }
    setMode('list');
  };

  if (mode === 'form') {
    return <RecipeForm recipe={editing} onSave={handleSave} onCancel={() => setMode('list')} />;
  }
  if (mode === 'detail' && selected) {
    return <RecipeDetail recipe={selected} onBack={() => setMode('list')} onEdit={() => editRecipe(selected)}
      onOpenGroceryReview={onOpenGroceryReview} onDuplicate={(r) => { const { id, created_date, updated_date, ...rest } = r; add({ ...rest, name: `${r.name} (copy)` }); }} />;
  }

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
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipes" className="rounded-2xl pl-9" />
        </div>
        <Button variant={favsOnly ? 'default' : 'outline'} size="icon" className="rounded-2xl shrink-0" onClick={() => setFavsOnly((f) => !f)}><Heart className={`w-4 h-4 ${favsOnly ? 'fill-current' : ''}`} /></Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setCat('all')} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${cat === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>All</button>
        {RECIPE_CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCat(c.value)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap capitalize ${cat === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{c.label}</button>
        ))}
      </div>

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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}