import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const AM = ['Cleanse', 'Vitamin C', 'Moisturizer', 'SPF'];
const PM = ['Cleanse', 'Treatment', 'Moisturizer', 'Lip balm'];
const SHOWER = ['Hair mask', 'Body scrub', 'Shave', 'Lotion', 'Self-tan'];

export default function BeautyStudio() {
  const [checks, setChecks] = useLocalStorage('beauty-checks', {});
  const [products, setProducts] = useLocalStorage('beauty-products', []);
  const [p, setP] = useState('');
  const toggle = (k) => setChecks((s) => ({ ...s, [k]: !s[k] }));
  const add = () => {
    if (p.trim()) {
      setProducts([...products, { id: Date.now(), name: p.trim(), restock: false }]);
      setP('');
    }
  };

  const List = ({ title, items }) => (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((t) => (
          <div key={t} className="flex items-center gap-2">
            <Checkbox checked={!!checks[t]} onCheckedChange={() => toggle(t)} id={`b-${title}-${t}`} />
            <label htmlFor={`b-${title}-${t}`} className={`text-sm ${checks[t] ? 'line-through text-muted-foreground' : ''}`}>
              {t}
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <StudioShell title="Beauty, Routines & Wardrobe">
      <List title="AM Skincare" items={AM} />
      <List title="PM Skincare" items={PM} />
      <List title="Everything Shower" items={SHOWER} />
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Product Restock Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={p}
              onChange={(e) => setP(e.target.value)}
              placeholder="Product name"
              className="rounded-full"
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <Button size="icon" onClick={add} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {products.map((pr) => (
            <div key={pr.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pr.restock}
                onChange={() => setProducts((ps) => ps.map((x) => (x.id === pr.id ? { ...x, restock: !x.restock } : x)))}
              />
              <span className={pr.restock ? 'line-through text-muted-foreground flex-1' : 'flex-1'}>{pr.name}</span>
              {pr.restock && <span className="text-xs text-amber-500">restock</span>}
              <button onClick={() => setProducts((ps) => ps.filter((x) => x.id !== pr.id))}>
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </StudioShell>
  );
}