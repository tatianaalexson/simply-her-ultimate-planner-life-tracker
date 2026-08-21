import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'kitchen-recipe-timers';

// Live recipe timers with localStorage persistence so state survives
// leaving/re-entering Cooking Mode within a session. Multiple concurrent
// timers supported. No background push — accurate only while a tab is open.
function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

export function useRecipeTimers() {
  const [timers, setTimers] = useState(load);
  const tickRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(timers)); } catch { /* ignore */ }
  }, [timers]);

  // 1s tick — only counts down running, non-finished timers
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTimers((prev) => {
        let changed = false;
        const next = prev.map((t) => {
          if (!t.running || t.finished) return t;
          const rem = t.remainingSec - 1;
          if (rem <= 0) { changed = true; return { ...t, remainingSec: 0, running: false, finished: true }; }
          changed = true;
          return { ...t, remainingSec: rem };
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  const start = useCallback((key, { label, minutes, recipeId, recipeName }) => {
    const totalSec = Math.max(1, Math.round((minutes || 1) * 60));
    setTimers((prev) => {
      const existing = prev.find((t) => t.key === key);
      if (existing) {
        return prev.map((t) => (t.key === key ? { ...t, running: true, finished: false, remainingSec: t.remainingSec > 0 ? t.remainingSec : totalSec } : t));
      }
      return [...prev, { key, label, recipeId, recipeName, totalSec, remainingSec: totalSec, running: true, finished: false }];
    });
  }, []);

  const pause = useCallback((key) => setTimers((p) => p.map((t) => (t.key === key ? { ...t, running: false } : t))), []);
  const resume = useCallback((key) => setTimers((p) => p.map((t) => (t.key === key ? { ...t, running: !t.finished } : t))), []);
  const reset = useCallback((key) => setTimers((p) => p.map((t) => (t.key === key ? { ...t, remainingSec: t.totalSec, running: false, finished: false } : t))), []);
  const finish = useCallback((key) => setTimers((p) => p.map((t) => (t.key === key ? { ...t, remainingSec: 0, running: false, finished: true } : t))), []);
  const remove = useCallback((key) => setTimers((p) => p.filter((t) => t.key !== key)), []);

  return { timers, start, pause, resume, reset, finish, remove };
}

export function formatTimer(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}