import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Star, Heart, Save, Upload, Loader2,
} from 'lucide-react';
import { RECIPE_CATEGORIES, DIFFICULTY } from '@/components/kitchen/kitchenConstants';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

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
    substitutions: [],
    ...(recipe || {}),
    ingredients: (recipe?.ingredients?.length ? recipe.ingredients : [emptyIngredient]),
    instructions: (recipe?.instructions?.length ? recipe.instructions : [emptyStep]),
  }));

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setIng = (i, k, v) => setF((p) => ({ ...p, ingredients: p.ingredients.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const addIng = () => setF((p) => ({ ...p, ingredients: [...p.ingredients, { ...emptyIngredient }] }));
  const delIng = (i) => setF((p) => ({ ...p, ingredients: p.ingredients.length > 1 ? p.ingredients.filter((_, j) => j !== i) : p.ingredients }));
  const moveIng = (i, dir) => setF((p) => {
    const arr = [...p.ingredients]; const j = i + dir;
    if (j < 0 || j >= arr.length) return p;
    [arr[i], arr[j]] = [arr[j], arr[i]]; return { ...p, ingredients: arr };
  });
  const setStep = (i, k, v) => setF((p) => ({ ...p, instructions: p.instructions.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const addStep = () => setF((p) => ({ ...p, instructions: [...p.instructions, { ...emptyStep }] }));
  const delStep = (i) => setF((p) => ({ ...p, instructions: p.instructions.length > 1 ? p.instructions.filter((_, j) => j !== i) : p.instructions }));
  const moveStep = (i, dir) => setF((p) => {
    const arr = [...p.instructions]; const j = i + dir;
    if (j < 0 || j >= arr.length) return p;
    [arr[i], arr[j]] = [arr[j], arr[i]]; return { ...p, instructions: arr };
  });
  const subs = Array.isArray(f.substitutions) ? f.substitutions : [];
  const setSub = (i, k, v) => setF((p) => ({ ...p, substitutions: (p.substitutions || []).map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const addSub = () => setF((p) => ({ ...p, substitutions: [...(p.substitutions || []), { original: '', substitute: '', ratio: '', instructions: '', notes: '' }] }));
  const delSub = (i) => setF((p) => ({ ...p, substitutions: (p.substitutions || []).filter((_, j) => j !== i) }));

  const [uploading, setUploading] = useState(false);
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set('photo_url', file_url);
    } catch {
      /* upload failed — keep existing url */
    } finally {
      setUploading(false);
    }
  };

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

      {/* BASICS */}
      <FormSection title="Basics">
        <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Recipe name" className="rounded-2xl text-base" autoFocus />
        <div className="flex gap-2">
          <Input value={f.photo_url} onChange={(e) => set('photo_url', e.target.value)} placeholder="Photo URL" className="rounded-2xl flex-1" />
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            <span className="inline-flex items-center justify-center h-9 px-3 rounded-2xl border border-input bg-card text-sm text-muted-foreground hover:bg-accent transition">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            </span>
          </label>
        </div>
        <Textarea value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Short description" className="rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <Input value={f.source} onChange={(e) => set('source', e.target.value)} placeholder="Source (e.g. Grandma, BBC Good Food)" className="rounded-2xl" />
          <Input value={f.source_url} onChange={(e) => set('source_url', e.target.value)} placeholder="Source URL (optional)" className="rounded-2xl" />
        </div>
        <select value={f.source_type} onChange={(e) => set('source_type', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
          {['user', 'family', 'imported', 'website', 'custom'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex items-center justify-between pt-1">
          <button onClick={() => set('favourite', !f.favourite)} className="inline-flex items-center gap-1.5 text-sm">
            <Heart className={cn('w-4 h-4', f.favourite && 'fill-current text-primary')} /> Favourite
          </button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-1">Rating</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => set('rating', f.rating === i ? 0 : i)}>
                <Star className={cn('w-5 h-5', i <= f.rating ? 'fill-current text-amber-400' : 'text-muted-foreground/30')} />
              </button>
            ))}
          </div>
        </div>
      </FormSection>

      {/* INGREDIENTS */}
      <FormSection title="Ingredients">
        {f.ingredients.map((ing, i) => (
          <div key={i} className="space-y-2 border-t border-border/40 pt-3 first:border-0 first:pt-0">
            <Input value={ing.section || ''} onChange={(e) => setIng(i, 'section', e.target.value)} placeholder="Section (optional — e.g. Sauce, Pasta)" className="rounded-2xl h-7 text-xs bg-secondary/30 border-dashed" />
            <div className="flex gap-2">
              <Input value={ing.qty || ''} onChange={(e) => setIng(i, 'qty', e.target.value)} placeholder="Qty" className="rounded-2xl w-16" />
              <Input value={ing.unit || ''} onChange={(e) => setIng(i, 'unit', e.target.value)} placeholder="Unit" className="rounded-2xl w-20" />
              <Input value={ing.name || ''} onChange={(e) => setIng(i, 'name', e.target.value)} placeholder="Ingredient" className="rounded-2xl flex-1" />
            </div>
            <div className="flex gap-2 items-center">
              <Input value={ing.prep || ''} onChange={(e) => setIng(i, 'prep', e.target.value)} placeholder="Prep note (e.g. diced)" className="rounded-2xl flex-1 text-xs h-8" />
              <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <Checkbox checked={!!ing.optional} onCheckedChange={(v) => setIng(i, 'optional', v)} /> opt
              </label>
              <div className="flex gap-0.5">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveIng(i, -1)}><ChevronUp className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveIng(i, 1)}><ChevronDown className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => delIng(i)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
              </div>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="rounded-full" onClick={addIng}><Plus className="w-3.5 h-3.5 mr-1" /> Add ingredient</Button>
      </FormSection>

      {/* INSTRUCTIONS */}
      <FormSection title="Instructions">
        {f.instructions.map((st, i) => (
          <div key={i} className="space-y-2 border-t border-border/40 pt-3 first:border-0 first:pt-0">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-semibold text-primary/30 w-6 text-center">{i + 1}</span>
              <Input value={st.title || ''} onChange={(e) => setStep(i, 'title', e.target.value)} placeholder="Step title (optional)" className="rounded-2xl flex-1" />
              <div className="flex gap-0.5">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveStep(i, -1)}><ChevronUp className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveStep(i, 1)}><ChevronDown className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => delStep(i)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
              </div>
            </div>
            <Textarea value={st.text || ''} onChange={(e) => setStep(i, 'text', e.target.value)} placeholder="Instructions" className="rounded-2xl" />
            <div className="flex gap-2">
              <Input type="number" value={st.duration || 0} onChange={(e) => setStep(i, 'duration', parseInt(e.target.value) || 0)} placeholder="Timer (min)" className="rounded-2xl w-28" />
              <Input value={st.timer_label || ''} onChange={(e) => setStep(i, 'timer_label', e.target.value)} placeholder="Timer label (e.g. Simmer)" className="rounded-2xl flex-1" />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" className="rounded-full" onClick={addStep}><Plus className="w-3.5 h-3.5 mr-1" /> Add step</Button>
      </FormSection>

      {/* DETAILS */}
      <FormSection title="Details" defaultOpen={false}>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-muted-foreground">Servings</label>
            <Input type="number" value={f.default_servings} onChange={(e) => set('default_servings', parseInt(e.target.value) || 0)} className="rounded-2xl" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Yield</label>
            <Input value={f.yield} onChange={(e) => set('yield', e.target.value)} placeholder="e.g. 12 cookies" className="rounded-2xl" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Portion</label>
            <Input value={f.portion_desc} onChange={(e) => set('portion_desc', e.target.value)} placeholder="e.g. 1 cup" className="rounded-2xl" />
          </div>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground mb-1.5">Timing (minutes)</p>
          <div className="grid grid-cols-4 gap-2">
            {[['prep_time', 'Prep'], ['cook_time', 'Cook'], ['rest_time', 'Rest'], ['total_time', 'Total']].map(([k, l]) => (
              <div key={k}>
                <Input type="number" value={f[k]} onChange={(e) => set(k, parseInt(e.target.value) || 0)} className="rounded-2xl" />
                <p className="text-[10px] text-muted-foreground text-center mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
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
      </FormSection>

      {/* SUBSTITUTIONS */}
      {subs.length > 0 || true ? (
        <FormSection title="Substitutions" defaultOpen={false}>
          <p className="text-[10px] text-muted-foreground">Personal cooking notes — not nutritional or allergy advice.</p>
          {subs.map((s, i) => (
            <div key={i} className="space-y-2 border-t border-border/40 pt-3 first:border-0 first:pt-0">
              <Input value={s.original || ''} onChange={(e) => setSub(i, 'original', e.target.value)} placeholder="Original ingredient" className="rounded-2xl" />
              <Input value={s.substitute || ''} onChange={(e) => setSub(i, 'substitute', e.target.value)} placeholder="Substitute" className="rounded-2xl" />
              <div className="flex gap-2">
                <Input value={s.ratio || ''} onChange={(e) => setSub(i, 'ratio', e.target.value)} placeholder="Ratio / quantity" className="rounded-2xl flex-1" />
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => delSub(i)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
              </div>
              <Input value={s.instructions || ''} onChange={(e) => setSub(i, 'instructions', e.target.value)} placeholder="Instructions (optional)" className="rounded-2xl" />
            </div>
          ))}
          <Button size="sm" variant="outline" className="rounded-full" onClick={addSub}><Plus className="w-3.5 h-3.5 mr-1" /> Add substitution</Button>
        </FormSection>
      ) : null}

      {/* PERSONAL NOTES */}
      <FormSection title="Personal notes" defaultOpen={false}>
        <Textarea value={f.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Changes, what worked, next time…" className="rounded-2xl min-h-[100px]" />
      </FormSection>

      {/* Save bar */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="rounded-full flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="rounded-full flex-1" onClick={submit} disabled={!f.name?.trim()}><Save className="w-4 h-4 mr-1.5" /> Save recipe</Button>
      </div>
    </div>
  );
}

function FormSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left active:bg-secondary/30 transition">
        <p className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}