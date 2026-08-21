import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { useKitchenSettings } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';

export default function KitchenPreferences({ onBack }) {
  const { record, save, loading } = useKitchenSettings();
  const { settings, update } = useAppSettings();
  const [tagInputs, setTagInputs] = useState({});

  if (loading || !record) return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>;

  const arr = (k) => Array.isArray(record[k]) ? record[k].join(', ') : (record[k] || '');
  const setArr = (k, v) => save({ [k]: v.split(',').map((s) => s.trim()).filter(Boolean) });

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Kitchen Preferences</h2>
      </div>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium">Meal planning</p>
        <label className="flex items-center justify-between text-sm"><span>Default servings</span>
          <Input type="number" value={record.default_servings || 4} onChange={(e) => save({ default_servings: parseInt(e.target.value) || 4 })} className="rounded-2xl w-20" />
        </label>
        <label className="flex items-center justify-between text-sm"><span>Week starts on</span>
          <select value={record.week_start || 'monday'} onChange={(e) => save({ week_start: e.target.value })} className="rounded-2xl border bg-card px-3 py-2 text-sm">
            <option value="monday">Monday</option><option value="sunday">Sunday</option><option value="saturday">Saturday</option>
          </select>
        </label>
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium">Grocery generation</p>
        <label className="flex items-center justify-between text-sm"><span>Use pantry inventory</span><Switch checked={record.pantry_aware !== false} onCheckedChange={(v) => save({ pantry_aware: v })} /></label>
        <label className="flex items-center justify-between text-sm"><span>Use fridge inventory</span><Switch checked={record.fridge_aware !== false} onCheckedChange={(v) => save({ fridge_aware: v })} /></label>
        <label className="flex items-center justify-between text-sm"><span>Use freezer inventory</span><Switch checked={record.freezer_aware !== false} onCheckedChange={(v) => save({ freezer_aware: v })} /></label>
        <label className="flex items-center justify-between text-sm"><span>Group by</span>
          <select value={record.grocery_grouping || 'category'} onChange={(e) => save({ grocery_grouping: e.target.value })} className="rounded-2xl border bg-card px-3 py-2 text-sm">
            <option value="category">Category</option><option value="store">Store</option><option value="none">None</option>
          </select>
        </label>
        <Input value={arr('common_stores')} onChange={(e) => setTagInputs({ ...tagInputs, common_stores: e.target.value })} onBlur={(e) => setArr('common_stores', e.target.value)} placeholder="Common stores (comma separated)" className="rounded-2xl" />
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium">Inventory</p>
        <label className="flex items-center justify-between text-sm"><span>Use-soon window (days)</span>
          <Input type="number" value={settings.kitchenUseSoonDays ?? 4} onChange={(e) => update('kitchenUseSoonDays', parseInt(e.target.value) || 4)} className="rounded-2xl w-20" />
        </label>
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium">Food preferences</p>
        <Input value={arr('favourite_cuisines')} onChange={(e) => setTagInputs({ ...tagInputs, favourite_cuisines: e.target.value })} onBlur={(e) => setArr('favourite_cuisines', e.target.value)} placeholder="Favourite cuisines" className="rounded-2xl" />
        <Input value={arr('favourite_meals')} onChange={(e) => setTagInputs({ ...tagInputs, favourite_meals: e.target.value })} onBlur={(e) => setArr('favourite_meals', e.target.value)} placeholder="Favourite foods" className="rounded-2xl" />
        <Input value={arr('avoided_foods')} onChange={(e) => setTagInputs({ ...tagInputs, avoided_foods: e.target.value })} onBlur={(e) => setArr('avoided_foods', e.target.value)} placeholder="Foods to avoid" className="rounded-2xl" />
        <Input value={arr('dietary_preferences')} onChange={(e) => setTagInputs({ ...tagInputs, dietary_preferences: e.target.value })} onBlur={(e) => setArr('dietary_preferences', e.target.value)} placeholder="Dietary preferences" className="rounded-2xl" />
        <Input value={arr('allergies')} onChange={(e) => setTagInputs({ ...tagInputs, allergies: e.target.value })} onBlur={(e) => setArr('allergies', e.target.value)} placeholder="Allergies (kept in Kitchen only)" className="rounded-2xl" />
      </CardContent></Card>
    </div>
  );
}