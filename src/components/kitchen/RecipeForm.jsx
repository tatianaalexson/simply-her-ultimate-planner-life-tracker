import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { RECIPE_CATEGORIES, DIFFICULTY } from '@/components/kitchen/kitchenConstants';

const emptyIngredient = { qty: '', unit: '', name: '', prep: '', optional: false, section: '' };
const emptyStep = { title: '', text: '', duration: 0, timer_label: '', notes: '' };

export default function RecipeForm({ recipe, onSave, onCancel }) {
  const [f, setF] = useState(() => ({
    name: '', photo_url: '', description: '', source: '', source_url: '', source_type: 'user',
    personal: false, favourite: false, rating: 0, notes: '',
    prep_time: 0, cook_time: 0, rest_time: 0, total_time: 0,
    default_servings: 4, yield: '', portion_desc: '',
    ingredients: [{}], instructions: [{}],
    category: 'dinner', tags: [], collections: [], difficulty: 'easy',
    ...(recipe || {}),
    ingredients: (recipe?.ingredients?.length ? recipe.ingredients : [emptyIngredient]),
    instructions: (recipe?.instructions?.length ? recipe.instructions : [emptyStep]),
  }));

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setIng = (i, k, v) => setF((p) => ({ ...p, ingredients: p.ingredients.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const addIng = () => setF((p) => ({ ...p, ingredients: [...p.ingredients, { ...emptyIngredient }] }));
  const delIng = (i) => setF((p) => ({ ...p, ingredients: p.ingredients.filter((_, j) => j !== i) }));
  const moveIng = (i, dir) => setF((p) => {
    const arr = [...p.ingredients]; const j = i + dir;
    if (j < 0 || j >= arr.length) return p;
    [arr[i], arr[j]] = [arr[j], arr[i]]; return { ...p, ingredients: arr };
  });
  const setStep = (i, k, v) => setF((p) => ({ ...p, instructions: p.instructions.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const addStep = () => setF((p) => ({ ...p, instructions: [...p.instructions, { ...emptyStep }] }));
  const delStep = (i) => setF((p) => ({ ...p, instructions: p.instructions.filter((_, j) => j !== i) }));
  const moveStep = (i, dir) => setF((p) => {
    const arr = [...p.instructions]; const j = i + dir;
    if (j < 0 || j >= arr.length) return p;
    [arr[i], arr[j]] = [arr[j], arr[i]]; return { ...p, instructions: arr };
  });
  const subs = Array.isArray(f.substitutions) ? f.substitutions : [];
  const setSub = (i, k, v) => setF((p) => ({ ...p, substitutions: (p.substitutions || []).map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const addSub = () => setF((p) => ({ ...p, substitutions: [...(p.substitutions || []), { original: '', substitute: '', ratio: '', instructions: '', notes: '' }] }));
  const delSub = (i) => setF((p) => ({ ...p, substitutions: (p.substitutions || []).filter((_, j) => j !== i) }));

  const submit = () => {
    if (!f.name?.trim()) return;
    onSave({
      ...f,
      ingredients: f.ingredients.filter((x) => x.name?.trim()),
      instructions: f.instructions.filter((x) => x.text?.trim()),
      tags: Array.isArray(f.tags) ? f.tags : String(f.tags).split(',').map((t) => t.trim()).filter(Boolean),
      collections: Array.isArray(f.collections) ? f.collections : String(f.collections).split(',').map((t) => t.trim()).filter(Boolean),
      total_time: f.total_time || (f.prep_time || 0) + (f.cook_time || 0) + (f.rest_time || 0),
    });
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">{recipe ? 'Edit recipe' : 'New recipe'}</h2>
      </div>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-3">
        <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Recipe name" className="rounded-2xl" />
        <Input value={f.photo_url} onChange={(e) => set('photo_url', e.target.value)} placeholder="Photo URL" className="rounded-2xl" />
        <Textarea value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Description" className="rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <Input value={f.source} onChange={(e) => set('source', e.target.value)} placeholder="Source" className="rounded-2xl" />
          <Input value={f.source_url} onChange={(e) => set('source_url', e.target.value)} placeholder="Source URL" className="rounded-2xl" />
        </div>
        <select value={f.source_type} onChange={(e) => set('source_type', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
          {['user','family','imported','website','custom'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!f.personal} onCheckedChange={(v) => set('personal', v)} /> Personal</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!f.favourite} onCheckedChange={(v) => set('favourite', v)} /> Favourite</label>
        </div>
        <Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Personal notes (changes, what worked, next time)" className="rounded-2xl" />
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-2">
        <p className="text-sm font-medium">Servings</p>
        <div className="grid grid-cols-3 gap-2">
          <Input type="number" value={f.default_servings} onChange={(e) => set('default_servings', parseInt(e.target.value) || 0)} placeholder="Servings" className="rounded-2xl" />
          <Input value={f.yield} onChange={(e) => set('yield', e.target.value)} placeholder="Yield" className="rounded-2xl" />
          <Input value={f.portion_desc} onChange={(e) => set('portion_desc', e.target.value)} placeholder="Portion" className="rounded-2xl" />
        </div>
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-2">
        <p className="text-sm font-medium">Timing (minutes)</p>
        <div className="grid grid-cols-4 gap-2">
          {[['prep_time','Prep'],['cook_time','Cook'],['rest_time','Rest'],['total_time','Total']].map(([k,l]) => (
            <div key={k}>
              <Input type="number" value={f[k]} onChange={(e) => set(k, parseInt(e.target.value) || 0)} className="rounded-2xl" />
              <p className="text-[10px] text-muted-foreground text-center mt-1">{l}</p>
            </div>
          ))}
        </div>
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Ingredients</p>
          <Button size="sm" variant="outline" className="rounded-full" onClick={addIng}><Plus className="w-3 h-3 mr-1" /> Add</Button>
        </div>
        {f.ingredients.map((ing, i) => (
          <div key={i} className="space-y-1.5 border-t border-border pt-2 first:border-0 first:pt-0">
            <Input value={ing.section || ''} onChange={(e) => setIng(i, 'section', e.target.value)} placeholder="Section (e.g. Cake, Frosting) — optional" className="rounded-2xl h-8 text-xs" />
            <div className="grid grid-cols-12 gap-1.5">
              <Input value={ing.qty || ''} onChange={(e) => setIng(i, 'qty', e.target.value)} placeholder="Qty" className="rounded-2xl col-span-2 h-8 text-xs" />
              <Input value={ing.unit || ''} onChange={(e) => setIng(i, 'unit', e.target.value)} placeholder="Unit" className="rounded-2xl col-span-3 h-8 text-xs" />
              <Input value={ing.name || ''} onChange={(e) => setIng(i, 'name', e.target.value)} placeholder="Ingredient" className="rounded-2xl col-span-4 h-8 text-xs" />
              <Input value={ing.prep || ''} onChange={(e) => setIng(i, 'prep', e.target.value)} placeholder="Prep" className="rounded-2xl col-span-3 h-8 text-xs" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs"><Checkbox checked={!!ing.optional} onCheckedChange={(v) => setIng(i, 'optional', v)} /> Optional</label>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveIng(i, -1)}><ChevronUp className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveIng(i, 1)}><ChevronDown className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => delIng(i)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Instructions</p>
          <Button size="sm" variant="outline" className="rounded-full" onClick={addStep}><Plus className="w-3 h-3 mr-1" /> Step</Button>
        </div>
        {f.instructions.map((st, i) => (
          <div key={i} className="space-y-1.5 border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium w-5">{i + 1}.</span>
              <Input value={st.title || ''} onChange={(e) => setStep(i, 'title', e.target.value)} placeholder="Step title (optional)" className="rounded-2xl h-8 text-xs flex-1" />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveStep(i, -1)}><ChevronUp className="w-3 h-3" /></Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveStep(i, 1)}><ChevronDown className="w-3 h-3" /></Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => delStep(i)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
            </div>
            <Textarea value={st.text || ''} onChange={(e) => setStep(i, 'text', e.target.value)} placeholder="Instructions" className="rounded-2xl text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" value={st.duration || 0} onChange={(e) => setStep(i, 'duration', parseInt(e.target.value) || 0)} placeholder="Duration (min)" className="rounded-2xl h-8 text-xs" />
              <Input value={st.timer_label || ''} onChange={(e) => setStep(i, 'timer_label', e.target.value)} placeholder="Timer label" className="rounded-2xl h-8 text-xs" />
            </div>
          </div>
        ))}
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Substitutions</p>
          <Button size="sm" variant="outline" className="rounded-full" onClick={addSub}><Plus className="w-3 h-3 mr-1" /> Add</Button>
        </div>
        <p className="text-[10px] text-muted-foreground">Personal cooking notes — not nutritional or allergy advice.</p>
        {subs.map((s, i) => (
          <div key={i} className="space-y-1.5 border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="grid grid-cols-2 gap-1.5">
              <Input value={s.original || ''} onChange={(e) => setSub(i, 'original', e.target.value)} placeholder="Original ingredient" className="rounded-2xl h-8 text-xs" />
              <Input value={s.substitute || ''} onChange={(e) => setSub(i, 'substitute', e.target.value)} placeholder="Substitute" className="rounded-2xl h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Input value={s.ratio || ''} onChange={(e) => setSub(i, 'ratio', e.target.value)} placeholder="Ratio / quantity" className="rounded-2xl h-8 text-xs" />
              <Input value={s.instructions || ''} onChange={(e) => setSub(i, 'instructions', e.target.value)} placeholder="Instructions" className="rounded-2xl h-8 text-xs" />
            </div>
            <div className="flex justify-end">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => delSub(i)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
            </div>
          </div>
        ))}
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-2">
        <p className="text-sm font-medium">Classification</p>
        <div className="grid grid-cols-2 gap-2">
          <select value={f.category} onChange={(e) => set('category', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm">
            {RECIPE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={f.difficulty} onChange={(e) => set('difficulty', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm capitalize">
            {DIFFICULTY.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <Input value={Array.isArray(f.tags) ? f.tags.join(', ') : f.tags} onChange={(e) => set('tags', e.target.value)} placeholder="Tags (comma separated)" className="rounded-2xl" />
        <Input value={Array.isArray(f.collections) ? f.collections.join(', ') : f.collections} onChange={(e) => set('collections', e.target.value)} placeholder="Collections (comma separated)" className="rounded-2xl" />
      </CardContent></Card>

      <div className="flex gap-2">
        <Button variant="outline" className="rounded-full flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="rounded-full flex-1" onClick={submit}>Save recipe</Button>
      </div>
    </div>
  );
}