import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Generic optimistic CRUD hook for a Base44 entity, filtered by `query`.
export function useEntityList(entityName, query = {}, sort = '-created_date') {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const queryKey = JSON.stringify(query);

  const reload = useCallback(async () => {
    try { setItems(await base44.entities[entityName].filter(query, sort)); } catch { /* ignore */ }
    setLoading(false);
  }, [entityName, queryKey, sort]);

  useEffect(() => { reload(); }, [reload]);

  const add = async (data) => {
    const rec = await base44.entities[entityName].create(data);
    setItems((p) => [rec, ...p]);
    return rec;
  };

  const update = async (id, data) => {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, ...data } : x)));
    try { await base44.entities[entityName].update(id, data); } catch { reload(); }
  };

  const remove = async (id) => {
    setItems((p) => p.filter((x) => x.id !== id));
    try { await base44.entities[entityName].delete(id); } catch { reload(); }
  };

  return { items, loading, add, update, remove, reload };
}