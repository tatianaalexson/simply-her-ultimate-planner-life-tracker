import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAppSettings } from '@/lib/AppSettings';
import { getGroup } from '@/lib/featureRegistry';
import EmptyState from '@/components/EmptyState';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, CheckSquare, BookOpen, Target, Heart, GraduationCap, ArrowRight } from 'lucide-react';

const SOURCES = [
  { key: 'Task', label: 'Tasks', icon: CheckSquare, to: '/planner', fields: (x) => [x.title, x.notes] },
  { key: 'Intention', label: 'Intentions', icon: Target, to: '/', fields: (x) => [x.text] },
  { key: 'JournalEntry', label: 'Journal', icon: BookOpen, to: '/', fields: (x) => [x.content] },
  { key: 'PrayerLog', label: 'Prayers', icon: Heart, to: '/reflection', fields: (x) => [x.title, x.notes] },
  { key: 'StudyEntry', label: 'Studies', icon: GraduationCap, to: '/reflection', fields: (x) => [x.title, ...Object.values(x.content || {})] }
];

export default function SearchPage() {
  const navigate = useNavigate();
  const { visibleFeaturesFor, isGroupEnabled } = useAppSettings();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (query) => {
    setQ(query);
    if (query.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    const lc = query.toLowerCase();
    const out = {};
    await Promise.all(SOURCES.map(async (s) => {
      try {
        const items = await base44.entities[s.key].list('-created_date', 60);
        const hits = (items || []).filter((x) => s.fields(x).filter(Boolean).some((f) => f.toLowerCase().includes(lc)));
        if (hits.length) out[s.label] = { s, hits };
      } catch { /* ignore */ }
    }));
    setResults(out);
    setLoading(false);
  };

  const featResults = visibleFeaturesFor('search');
  const featGroups = {};
  featResults.forEach((f) => {
    const g = getGroup(f.group);
    if (!g || !isGroupEnabled(f.group)) return;
    (featGroups[g.label] = featGroups[g.label] || { route: g.route, items: [] }).items.push(f);
  });

  return (
    <div className="py-4 space-y-4">
      <div className="relative">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input autoFocus value={q} onChange={(e) => run(e.target.value)} placeholder="Search tasks, journal, prayers, studios…" className="rounded-full pl-9" />
      </div>

      {q.trim().length < 2 ? (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Jump to a studio</p>
          {Object.keys(featGroups).length === 0 ? (
            <EmptyState icon={SearchIcon} title="No studios searchable yet" subtitle="Enable features in Settings to see them here." />
          ) : (
            <div className="space-y-2">
              {Object.entries(featGroups).map(([gname, g]) => (
                <button key={gname} onClick={() => navigate(g.route)} className="w-full text-left rounded-2xl border bg-card p-3 shadow-sm active:scale-[0.98] transition">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{gname}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {g.items.map((f) => <span key={f.id} className="text-[10px] px-2 py-0.5 rounded-full bg-accent">{f.label}</span>)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <p className="text-xs text-muted-foreground text-center py-6">Searching…</p>
      ) : results && Object.keys(results).length === 0 ? (
        <EmptyState icon={SearchIcon} title="No matches found" subtitle="Try a different word, or add it from a studio." />
      ) : (
        <div className="space-y-4">
          {results && Object.entries(results).map(([label, { s, hits }]) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5"><s.icon className="w-3.5 h-3.5" /> {label} · {hits.length}</p>
              <div className="space-y-1.5">
                {hits.slice(0, 6).map((h) => {
                  const primary = h.title || h.text || h.content || Object.values(h.content || {})[0] || h.notes || 'Untitled';
                  return (
                    <button key={h.id} onClick={() => navigate(s.to)} className="w-full text-left rounded-2xl border bg-card px-3 py-2 shadow-sm active:scale-[0.98] transition">
                      <p className="text-sm truncate">{primary}</p>
                      {h.created_date && <p className="text-[10px] text-muted-foreground">{String(h.created_date).slice(0, 10)}</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}