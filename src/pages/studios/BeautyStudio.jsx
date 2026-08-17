import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Trash2, Sparkles, Scissors, Hand, Droplet, Calendar } from 'lucide-react';

const AM = ['Cleanse', 'Vitamin C', 'Moisturizer', 'SPF'];
const PM = ['Cleanse', 'Treatment', 'Moisturizer', 'Lip balm'];
const SHOWER = ['Hair mask', 'Body scrub', 'Shave', 'Lotion', 'Self-tan'];

function CheckList({ storageKey, title, items }) {
  const [checks, setChecks] = useLocalStorage(storageKey, {});
  const toggle = (k) => setChecks((s) => ({ ...s, [k]: !s[k] }));
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map((t) => (
          <div key={t} className="flex items-center gap-2">
            <Checkbox checked={!!checks[t]} onCheckedChange={() => toggle(t)} id={`${storageKey}-${t}`} />
            <label htmlFor={`${storageKey}-${t}`} className={`text-sm ${checks[t] ? 'line-through text-muted-foreground' : ''}`}>{t}</label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LogCard({ storageKey, title, icon: Icon, fields, addLabel }) {
  const [items, setItems] = useLocalStorage(storageKey, []);
  const [form, setForm] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.type === 'select' ? f.options[0].id : ''])));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const add = () => {
    if (!form[fields[0].key]?.toString().trim()) return;
    setItems((x) => [{ id: Date.now(), ...form }, ...x]);
    setForm(Object.fromEntries(fields.map((f) => [f.key, f.type === 'select' ? f.options[0].id : ''])));
  };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Icon className="w-4 h-4" /> {title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {fields.map((f) =>
            f.type === 'select' ? (
              <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                <select value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} className="rounded-2xl border bg-card px-3 text-sm w-full h-9">
                  {f.options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
            ) : (
              <Input key={f.key} type={f.type} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className={`rounded-2xl ${f.full ? 'col-span-2' : ''}`} />
            )
          )}
        </div>
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> {addLabel}</Button>
        {items.map((it) => (
          <div key={it.id} className="flex items-start gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="flex-1 min-w-0">
              <p className="font-medium">{it[fields[0].key]}</p>
              <p className="text-xs text-muted-foreground">{fields.slice(1).map((f) => it[f.key]).filter(Boolean).join(' · ')}</p>
            </div>
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== it.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function InventoryTab() {
  const [products, setProducts] = useLocalStorage('beauty-products', []);
  const [p, setP] = useState('');
  const add = () => { if (p.trim()) { setProducts([...products, { id: Date.now(), name: p.trim(), restock: false }]); setP(''); } };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Product Inventory</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={p} onChange={(e) => setP(e.target.value)} placeholder="Product name" className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && add()} />
          <Button size="icon" onClick={add} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {products.map((pr) => (
          <div key={pr.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pr.restock} onChange={() => setProducts((ps) => ps.map((x) => (x.id === pr.id ? { ...x, restock: !x.restock } : x)))} />
            <span className={pr.restock ? 'line-through text-muted-foreground flex-1' : 'flex-1'}>{pr.name}</span>
            {pr.restock && <span className="text-xs text-amber-500">restock</span>}
            <button onClick={() => setProducts((ps) => ps.filter((x) => x.id !== pr.id))}><X className="w-3 h-3 text-muted-foreground" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function BeautyStudio() {
  const { isFeatureEnabled } = useAppSettings();
  const tabs = [
    isFeatureEnabled('beauty.skincare') && { value: 'skincare', label: 'Skincare', node: <div className="space-y-4"><CheckList storageKey="beauty-am" title="AM Skincare" items={AM} /><CheckList storageKey="beauty-pm" title="PM Skincare" items={PM} /><CheckList storageKey="beauty-shower" title="Everything Shower" items={SHOWER} /></div> },
    isFeatureEnabled('beauty.hair') && { value: 'hair', label: 'Hair', node: <LogCard storageKey="beauty-hair" title="Hair Care Log" icon={Scissors} addLabel="Log" fields={[{ key: 'name', placeholder: 'Treatment / wash day', full: true }, { key: 'date', type: 'date' }, { key: 'notes', placeholder: 'Notes', full: true }]} /> },
    isFeatureEnabled('beauty.nails') && { value: 'nails', label: 'Nails', node: <LogCard storageKey="beauty-nails" title="Nail Care Log" icon={Hand} addLabel="Log" fields={[{ key: 'name', placeholder: 'Mani / pedi / care', full: true }, { key: 'date', type: 'date' }, { key: 'notes', placeholder: 'Notes', full: true }]} /> },
    isFeatureEnabled('beauty.grooming') && { value: 'grooming', label: 'Grooming', node: <LogCard storageKey="beauty-grooming" title="Grooming Log" icon={Droplet} addLabel="Log" fields={[{ key: 'name', placeholder: 'Service', full: true }, { key: 'date', type: 'date' }, { key: 'notes', placeholder: 'Notes', full: true }]} /> },
    isFeatureEnabled('beauty.inventory') && { value: 'inventory', label: 'Inventory', node: <InventoryTab /> },
    isFeatureEnabled('beauty.routines') && { value: 'routines', label: 'Schedule', node: <LogCard storageKey="beauty-schedule" title="Beauty Schedule" icon={Calendar} addLabel="Add" fields={[{ key: 'name', placeholder: 'Appointment / routine', full: true }, { key: 'date', type: 'date' }, { key: 'notes', placeholder: 'Notes', full: true }]} /> }
  ].filter(Boolean);
  return (
    <StudioShell title="Beauty, Routines & Wardrobe">
      {tabs.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Enable a Beauty feature in Settings to begin.</p> : (
        <Tabs defaultValue={tabs[0].value}>
          <TabsList className="flex w-full bg-accent rounded-full p-1 gap-1 mb-4 overflow-x-auto">
            {tabs.map((t) => <TabsTrigger key={t.value} value={t.value} className="rounded-full text-xs flex-1">{t.label}</TabsTrigger>)}
          </TabsList>
          {tabs.map((t) => <TabsContent key={t.value} value={t.value} className="mt-0 space-y-4">{t.node}</TabsContent>)}
        </Tabs>
      )}
    </StudioShell>
  );
}