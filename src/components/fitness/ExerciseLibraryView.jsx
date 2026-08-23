import React, { useState, useMemo } from 'react';
import { useEntityList } from '@/hooks/useEntityList';
import { useAppSettings } from '@/lib/AppSettings';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Star, Ban, Pencil } from 'lucide-react';
import { MOVEMENT_CATEGORIES, categoryLabel } from '@/lib/fitnessConstants';
import ExerciseForm from './ExerciseForm';

export default function ExerciseLibraryView() {
  const { items: exercises, update, remove } = useEntityList('Exercise', {}, 'name');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [favOnly, setFavOnly] = useState(false);
  const [hideAvoid, setHideAvoid] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (favOnly && !ex.favourite) return false;
      if (hideAvoid && ex.avoid) return false;
      if (catFilter !== 'all' && ex.category !== catFilter) return false;
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [exercises, search, catFilter, favOnly, hideAvoid]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exercises…" className="rounded-2xl pl-9" />
        </div>
        <Button size="icon" className="rounded-full shrink-0" onClick={() => { setEditing(null); setShowForm(true); }} aria-label="Add exercise">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-1.5 flex-wrap items-center">
        <button onClick={() => setCatFilter('all')} className={`rounded-full px-3 py-1 text-xs border transition ${catFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>All</button>
        {MOVEMENT_CATEGORIES.filter((c) => c.id !== 'custom').slice(0, 8).map((c) => (
          <button key={c.id} onClick={() => setCatFilter(c.id)} className={`rounded-full px-3 py-1 text-xs border transition ${catFilter === c.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>{c.label}</button>
        ))}
      </div>

      <div className="flex gap-3 text-xs">
        <button onClick={() => setFavOnly((v) => !v)} className={`flex items-center gap-1 ${favOnly ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <Star className={`w-3.5 h-3.5 ${favOnly ? 'fill-primary' : ''}`} /> Favourites
        </button>
        <button onClick={() => setHideAvoid((v) => !v)} className={`flex items-center gap-1 ${!hideAvoid ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <Ban className="w-3.5 h-3.5" /> {hideAvoid ? 'Hide' : 'Show'} Not-For-Me
        </button>
      </div>

      {filtered.length === 0 ? (
        <Card className="rounded-3xl"><CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">Your exercise library is ready.</p>
          <p className="text-xs text-muted-foreground mt-1">Add exercises whenever you'd like to build your first workout.</p>
          <Button size="sm" className="rounded-full mt-3" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-1" /> Add Exercise</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((ex) => (
            <Card key={ex.id} className="rounded-2xl">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">{categoryLabel(ex.category)}{ex.equipment?.length ? ` · ${ex.equipment.join(', ')}` : ''}</p>
                </div>
                <button onClick={() => update(ex.id, { favourite: !ex.favourite })} className="shrink-0" aria-label="Toggle favourite">
                  <Star className={`w-4 h-4 ${ex.favourite ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                </button>
                <button onClick={() => update(ex.id, { avoid: !ex.avoid })} className="shrink-0" aria-label="Toggle avoid">
                  <Ban className={`w-4 h-4 ${ex.avoid ? 'text-destructive' : 'text-muted-foreground'}`} />
                </button>
                <button onClick={() => { setEditing(ex); setShowForm(true); }} className="shrink-0" aria-label="Edit exercise">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && <ExerciseForm exercise={editing} onSave={(id, data) => update(id, data)} onClose={() => setShowForm(false)} />}
    </div>
  );
}