import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Loads records for a set of dates (one per day) and provides saveForDate,
// which updates an existing record for that date or creates one.
export function useDailyRange(entityName, dates, defaults = {}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const datesKey = JSON.stringify(dates);

  const reload = useCallback(async () => {
    if (!dates.length) { setRecords([]); setLoading(false); return; }
    try { setRecords(await base44.entities[entityName].filter({ log_date: { $in: dates } }, 'log_date')); } catch { /* ignore */ }
    setLoading(false);
  }, [entityName, datesKey]);

  useEffect(() => { reload(); }, [reload]);

  const byDate = {};
  records.forEach((r) => { if (r.log_date && !byDate[r.log_date]) byDate[r.log_date] = r; });

  const saveForDate = async (date, partial) => {
    const existing = byDate[date];
    if (existing) {
      setRecords((p) => p.map((r) => (r.id === existing.id ? { ...r, ...partial } : r)));
      byDate[date] = { ...existing, ...partial };
      try { await base44.entities[entityName].update(existing.id, partial); } catch { reload(); }
    } else {
      try {
        const rec = await base44.entities[entityName].create({ log_date: date, ...defaults, ...partial });
        setRecords((p) => [...p, rec]);
        byDate[date] = rec;
      } catch { reload(); }
    }
  };

  return { records, byDate, loading, saveForDate, reload };
}