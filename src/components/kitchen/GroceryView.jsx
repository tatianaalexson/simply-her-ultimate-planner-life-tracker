import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Plus, ShoppingCart, Package, Save, Search, Trash2, ChevronDown, ChevronUp, MoreHorizontal, ListPlus,
} from 'lucide-react';
import KitchenEmptyState from '@/components/kitchen/ui/KitchenEmptyState';
import ShoppingMode from '@/components/kitchen/ShoppingMode';
import GenerateGrocerySheet from '@/components/kitchen/GenerateGrocerySheet';
import StaplePicker from '@/components/kitchen/StaplePicker';
import { useGroceryItems, useMealPlan, useRecipes, useKitchenSettings } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { GROCERY_CATEGORIES } from '@/components/kitchen/kitchenConstants';
import { cn } from '@/lib/utils';

const fmtMoney = (n) => (n ? `$${n.toFixed(2)}` : '$0.00');

export default function GroceryView({ onBack, onOpenGroceryReview, onNavigate }) {
  const { isFeatureEnabled } = useAppSettings();
  const showPrices = isFeatureEnabled('kit.prices');
  const [listName, setListName] = useState('Weekly Groceries');
  const { items: allItems, add, update, remove, reload } = useGroceryItems();
  const { items: meals } = useMealPlan();
  const { items: recipes } = useRecipes();
  const { record: kitchenSettings } = useKitchenSettings();
  const grouping = kitchenSettings?.grocery_grouping || 'category';

  const [shopMode, setShopMode] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showStaples, setShowStaples] = useState(false);
  const [showSaveTpl, setShowSaveTpl] = useState(false);
  const [showNewList, setShowNewList] = useState(false);
  const [q, setQ] = useState('');
  const [hideChecked, setHideChecked] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const listNames = useMemo(() => {
    const names = new Set(['Weekly Groceries']);
    allItems.forEach((i) => { if (i.list_name) names.add(i.list_name); });
    return Array.from(names);
  }, [allItems]);

  const items = useMemo(
    () => allItems.filter((i) => (i.list_name || 'Weekly Groceries') === listName),
    [allItems, listName]
  );

  const filtered = useMemo(() => items.filter((i) => {
    if (hideChecked && i.checked) return false;
    if (q && !i.name?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, q, hideChecked]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((i) => {
      const key = grouping === 'store' ? (i.store || 'No store') : (i.category || 'Other');
      (g[key] = g[key] || []).push(i);
    });
    return g;
  }, [filtered, grouping]);

  const totals = useMemo(() => {
    let est = 0, act = 0, estUnchecked = 0;
    for (const i of items) {
      est += Number(i.est_price) || 0;
      act += Number(i.actual_price) || 0;
      if (!i.checked) estUnchecked += Number(i.est_price) || 0;
    }
    return { est, act, estUnchecked };
  }, [items]);

  const remaining = items.filter((i) => !i.checked).length;

  const sourceLabel = (item) => {
    const names = [];
    if (item.source_recipe_ids?.length) names.push(...recipes.filter((r) => item.source_recipe_ids.includes(r.id)).map((r) => r.name));
    return names.length ? names : null;
  };

  if (shopMode) {
    return (
      <ShoppingMode
        items={items} listName={listName} showPrices={showPrices} grouping={grouping}
        onToggle={(id, checked) => update(id, { checked })}
        onExit={() => setShopMode(false)}
      />
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-semibold truncate">{listName}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {remaining} remaining{showPrices && totals.est > 0 ? ` · ${fmtMoney(totals.est)} est` : ''}
          </p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full shrink-0" onClick={() => setShopMode(true)}>
          <ShoppingCart className="w-4 h-4 mr-1" /> Shop
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
        {isFeatureEnabled('kit.groceryGen') && (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowGenerate(true)}>
            <ShoppingCart className="w-4 h-4 mr-1" /> Generate
          </Button>
        )}
        {isFeatureEnabled('kit.frequent') && (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowStaples(true)}>
            <Package className="w-4 h-4 mr-1" /> Staples
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="rounded-full"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {listNames.length > 1 && <DropdownMenuLabel>Lists</DropdownMenuLabel>}
            {listNames.map((l) => (
              <DropdownMenuItem key={l} onClick={() => setListName(l)} className={cn(l === listName && 'bg-secondary')}>
                {l}
              </DropdownMenuItem>
            ))}
            {listNames.length > 1 && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => setShowNewList(true)}><ListPlus className="w-4 h-4 mr-2" /> New list</DropdownMenuItem>
            {isFeatureEnabled('kit.groceryTemplates') && items.length > 0 && (
              <DropdownMenuItem onClick={() => setShowSaveTpl(true)}><Save className="w-4 h-4 mr-2" /> Save as template</DropdownMenuItem>
            )}
            {onNavigate && isFeatureEnabled('kit.groceryTemplates') && (
              <DropdownMenuItem onClick={() => onNavigate('templates')}>Templates</DropdownMenuItem>
            )}
            {onNavigate && (
              <DropdownMenuItem onClick={() => onNavigate('preferences')}>List settings</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items" className="rounded-2xl pl-9" />
        </div>
        <Button variant={hideChecked ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => setHideChecked((h) => !h)}>
          Hide checked
        </Button>
      </div>

      {/* Grocery list */}
      {filtered.length === 0 ? (
        <KitchenEmptyState
          icon={ShoppingCart}
          title="Your list is clear."
          subtitle="Add items or generate from your meal plan."
          actionLabel="Add Item"
          onAction={() => setShowAdd(true)}
          secondary={isFeatureEnabled('kit.groceryGen') ? (
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowGenerate(true)}>Generate from meals</Button>
          ) : null}
        />
      ) : (
        <div className={cn('space-y-4', showPrices && 'lg:grid lg:grid-cols-[1fr_240px] lg:gap-6 lg:items-start')}>
          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat}>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1 px-1">{cat}</p>
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                  {list.map((i) => (
                    <GroceryRow key={i.id} item={i} showPrices={showPrices} expanded={expanded} setExpanded={setExpanded}
                      sourceLabel={sourceLabel} onToggle={(v) => update(i.id, { checked: v })}
                      onPrice={(v) => update(i.id, { est_price: v })} onRemove={() => remove(i.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop sidebar */}
          {showPrices && items.length > 0 && (
            <div className="lg:sticky lg:top-20">
              <div className="rounded-3xl bg-accent/40 p-4 space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium mb-1">Totals</p>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estimated</span><span className="font-medium">{fmtMoney(totals.est)}</span></div>
                {totals.act > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Actual</span><span className="font-medium">{fmtMoney(totals.act)}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Remaining</span><span className="font-medium">{fmtMoney(totals.estUnchecked)} est</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile price totals */}
      {showPrices && items.length > 0 && (
        <div className="rounded-3xl bg-accent/40 p-4 space-y-1.5 lg:hidden">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estimated</span><span className="font-medium">{fmtMoney(totals.est)}</span></div>
          {totals.act > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Actual</span><span className="font-medium">{fmtMoney(totals.act)}</span></div>}
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Remaining</span><span className="font-medium">{fmtMoney(totals.estUnchecked)} est</span></div>
        </div>
      )}

      <AddItemSheet open={showAdd} onOpenChange={setShowAdd} listName={listName} showPrices={showPrices} onAdd={add} />
      <GenerateGrocerySheet open={showGenerate} onOpenChange={setShowGenerate} meals={meals} recipes={recipes} onGenerate={(sources) => onOpenGroceryReview(sources, listName)} />
      <StaplePicker open={showStaples} onOpenChange={setShowStaples} listName={listName} existingItems={items} onAdded={reload} />
      <SaveGroceryTemplateSheet open={showSaveTpl} onOpenChange={setShowSaveTpl} items={items} listName={listName} />
      <NewListSheet open={showNewList} onOpenChange={setShowNewList} onCreate={(name) => { setListName(name); setShowNewList(false); }} />
    </div>
  );
}

function GroceryRow({ item, showPrices, expanded, setExpanded, sourceLabel, onToggle, onPrice, onRemove }) {
  const srcs = sourceLabel(item);
  return (
    <div className={cn('flex items-center gap-3 px-3 py-2.5 border-b border-border/30 last:border-0', item.checked && 'opacity-60')}>
      <Checkbox checked={item.checked} onCheckedChange={onToggle} id={`g-${item.id}`} aria-label={`Mark ${item.name} as ${item.checked ? 'not bought' : 'bought'}`} />
      <div className="flex-1 min-w-0">
        <label htmlFor={`g-${item.id}`} className={cn('text-sm cursor-pointer', item.checked && 'line-through text-muted-foreground')}>{item.name}</label>
        {srcs && (
          <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="text-[10px] text-primary flex items-center gap-0.5 mt-0.5">
            Needed for {srcs.length} meal{srcs.length !== 1 ? 's' : ''}
            {expanded === item.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
        {expanded === item.id && srcs && (
          <div className="mt-1 space-y-0.5">
            {srcs.map((n, k) => <p key={k} className="text-[11px] text-muted-foreground">• {n}</p>)}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm">{item.qty}{item.unit ? ` ${item.unit}` : ''}</p>
        {item.store && <p className="text-[10px] text-muted-foreground">{item.store}</p>}
      </div>
      {showPrices && (
        <Input value={item.est_price || ''} onChange={(e) => onPrice(parseFloat(e.target.value) || 0)} placeholder="$" className="rounded-2xl w-16 h-7 text-xs" type="number" aria-label={`Estimated price for ${item.name}`} />
      )}
      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={onRemove} aria-label={`Remove ${item.name}`}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
    </div>
  );
}

function AddItemSheet({ open, onOpenChange, listName, showPrices, onAdd }) {
  const [form, setForm] = useState({ name: '', qty: '1', unit: '', category: 'Other', store: '', est_price: 0, priority: false });
  const save = () => {
    if (!form.name.trim()) return;
    onAdd({ ...form, list_name: listName, checked: false, amount: parseFloat(form.qty) || 0, normalized_name: form.name.toLowerCase().trim() });
    setForm({ name: '', qty: '1', unit: '', category: 'Other', store: '', est_price: 0, priority: false });
    onOpenChange(false);
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Add item</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Item name" className="rounded-2xl" autoFocus onKeyDown={(e) => e.key === 'Enter' && save()} />
          <div className="grid grid-cols-3 gap-2">
            <Input value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))} placeholder="Qty" className="rounded-2xl" />
            <Input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="Unit" className="rounded-2xl" />
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="rounded-2xl border bg-card px-3 py-2 text-sm">
              {GROCERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Input value={form.store} onChange={(e) => setForm((p) => ({ ...p, store: e.target.value }))} placeholder="Store (optional)" className="rounded-2xl" />
          {showPrices && (
            <Input type="number" value={form.est_price || ''} onChange={(e) => setForm((p) => ({ ...p, est_price: parseFloat(e.target.value) || 0 }))} placeholder="Est. price" className="rounded-2xl" />
          )}
          <Button className="rounded-full w-full" onClick={save} disabled={!form.name.trim()}>Add to {listName}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SaveGroceryTemplateSheet({ open, onOpenChange, items, listName }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await base44.entities.KitchenTemplate.create({
        kind: 'grocery', name: name || listName, description: '',
        items: items.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit || '', category: i.category || 'Other', store: i.store || '', est_price: i.est_price || 0, notes: '' })),
        meals: [], prep_items: [], prep_tasks: [], notes: '',
      });
    } catch { /* ignore */ }
    setBusy(false); setName(''); onOpenChange(false);
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Save grocery template</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`Template name (default: ${listName})`} className="rounded-2xl" autoFocus />
          <p className="text-[11px] text-muted-foreground">{items.length} item(s) will be saved. Shopping state (checked, prices) is not included.</p>
          <Button className="rounded-full w-full" onClick={save} disabled={busy}>Save template</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NewListSheet({ open, onOpenChange, onCreate }) {
  const [name, setName] = useState('');
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">New list</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="List name" className="rounded-2xl" autoFocus onKeyDown={(e) => e.key === 'Enter' && name.trim() && onCreate(name.trim())} />
          <Button className="rounded-full w-full" onClick={() => name.trim() && onCreate(name.trim())} disabled={!name.trim()}>Create list</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}