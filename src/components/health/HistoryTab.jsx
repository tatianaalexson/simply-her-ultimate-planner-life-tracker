import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ShieldAlert, Syringe, Users, Baby } from 'lucide-react';

function LogSection({ storageKey, title, icon: Icon, fields, addLabel }) {
  const [items, setItems] = useLocalStorage(storageKey, []);
  const [form, setForm] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.type === 'select' ? f.options[0].id : ''])));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const add = () => {
    const hasName = form[fields[0].key]?.toString().trim();
    if (!hasName) return;
    setItems((x) => [{ id: Date.now(), ...form }, ...x]);
    setForm(Object.fromEntries(fields.map((f) => [f.key, f.type === 'select' ? f.options[0].id : ''])));
  };
  const labelOf = (f) => (f.options ? f.options.find((o) => o.id === form[f.key])?.label : form[f.key]);

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base flex items-center gap-2"><Icon className="w-4 h-4" /> {title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {fields.map((f) =>
            f.type === 'textarea' ? (
              <Textarea key={f.key} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} rows={2} className="rounded-2xl resize-none col-span-2" />
            ) : f.type === 'select' ? (
              <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                <Select value={form[f.key]} onValueChange={(v) => set(f.key, v)}>
                  <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{f.options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <Input key={f.key} type={f.type} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className={`rounded-2xl ${f.full ? 'col-span-2' : ''}`} />
            )
          )}
        </div>
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> {addLabel}</Button>
        {items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-2 border-t border-border pt-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {it[fields[0].key]}{fields[1] && it[fields[1].key] ? ` · ${it[fields[1].key]}` : ''}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {fields.slice(2).map((f) => (f.options ? f.options.find((o) => o.id === it[f.key])?.label : it[f.key])).filter(Boolean).join(' · ')}
              </p>
              {it.notes && <p className="text-xs text-muted-foreground/80 mt-1">{it.notes}</p>}
            </div>
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== it.id))} className="text-muted-foreground shrink-0 mt-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function HistoryTab() {
  return (
    <div className="space-y-4">
      <LogSection
        storageKey="health-allergies"
        title="Allergies & Reactions"
        icon={ShieldAlert}
        addLabel="Add allergy"
        fields={[
          { key: 'name', placeholder: 'Allergen', full: true },
          { key: 'type', type: 'select', options: [{ id: 'drug', label: 'Drug' }, { id: 'food', label: 'Food' }, { id: 'env', label: 'Environmental' }, { id: 'other', label: 'Other' }] },
          { key: 'severity', type: 'select', options: [{ id: 'mild', label: 'Mild' }, { id: 'moderate', label: 'Moderate' }, { id: 'severe', label: 'Severe' }] },
          { key: 'reaction', placeholder: 'Reaction', full: true },
          { key: 'notes', type: 'textarea', placeholder: 'Notes, management plan' }
        ]}
      />
      <LogSection
        storageKey="health-procedures"
        title="Procedures, Surgeries & Hospitalizations"
        icon={Syringe}
        addLabel="Add event"
        fields={[
          { key: 'name', placeholder: 'Procedure / surgery / hospitalization', full: true },
          { key: 'date', type: 'date' },
          { key: 'kind', type: 'select', options: [{ id: 'surgery', label: 'Surgery' }, { id: 'procedure', label: 'Procedure' }, { id: 'hospital', label: 'Hospitalization' }] },
          { key: 'provider', placeholder: 'Provider / facility', full: true },
          { key: 'notes', type: 'textarea', placeholder: 'Notes, outcome' }
        ]}
      />
      <LogSection
        storageKey="health-family-history"
        title="Family History"
        icon={Users}
        addLabel="Add entry"
        fields={[
          { key: 'name', placeholder: 'Relation (e.g. Mother)' },
          { key: 'condition', placeholder: 'Condition', full: true },
          { key: 'notes', type: 'textarea', placeholder: 'Notes' }
        ]}
      />
      <LogSection
        storageKey="health-immunizations"
        title="Immunizations"
        icon={Baby}
        addLabel="Add immunization"
        fields={[
          { key: 'name', placeholder: 'Vaccine / immunization', full: true },
          { key: 'date', type: 'date' },
          { key: 'provider', placeholder: 'Administered by', full: true },
          { key: 'notes', type: 'textarea', placeholder: 'Notes' }
        ]}
      />
    </div>
  );
}