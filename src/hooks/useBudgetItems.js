import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Loads BudgetItem records filtered by `kind`, with optimistic add/update/remove.
export function useBudgetItems(kind) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setItems(await base44.entities.BudgetItem.filter({ kind }, '-created_date')); } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [kind]);

  const add = async (data) => {
    const rec = await base44.entities.BudgetItem.create({ kind, ...data });
    setItems((p) => [rec, ...p]);
    return rec;
  };

  const update = async (id, data) => {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, ...data } : x)));
    try { await base44.entities.BudgetItem.update(id, data); } catch { load(); }
  };

  const remove = async (id) => {
    setItems((p) => p.filter((x) => x.id !== id));
    try { await base44.entities.BudgetItem.delete(id); } catch { load(); }
  };

  return { items, loading, add, update, remove, reload: load };
}