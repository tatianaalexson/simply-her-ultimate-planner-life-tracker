import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Loads the single record matching `query` (or null) and provides save,
// which updates it if it exists or creates it (with query + defaults merged).
export function useSingleton(entityName, query, defaults = {}) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const qKey = JSON.stringify(query);

  const reload = useCallback(async () => {
    try {
      const items = await base44.entities[entityName].filter(query, '-created_date', 1);
      setRecord(items[0] || null);
    } catch { /* ignore */ }
    setLoading(false);
  }, [entityName, qKey]);

  useEffect(() => { reload(); }, [reload]);

  const save = async (partial) => {
    if (record) {
      setRecord((p) => ({ ...p, ...partial }));
      try { await base44.entities[entityName].update(record.id, partial); } catch { reload(); }
    } else {
      try {
        const rec = await base44.entities[entityName].create({ ...query, ...defaults, ...partial });
        setRecord(rec);
      } catch { reload(); }
    }
  };

  return { record, loading, save, reload };
}