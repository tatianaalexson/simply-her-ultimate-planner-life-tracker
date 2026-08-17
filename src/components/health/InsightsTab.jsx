import React, { useMemo } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Flame, HeartPulse, Smile, FlaskConical, Syringe, Stethoscope, Sparkles } from 'lucide-react';

const tsOf = (v) => {
  if (!v) return 0;
  const d = new Date(v);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};
const pretty = (v) => {
  const t = tsOf(v);
  return t ? new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
};

function Insight({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-accent/50 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-heading text-lg font-semibold mt-0.5">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function InsightsTab() {
  const [symptoms] = useLocalStorage('health-symptoms', []);
  const [flares] = useLocalStorage('health-symptom-log', []);
  const [vitals] = useLocalStorage('health-vitals', []);
  const [moods] = useLocalStorage('health-mood-logs', []);
  const [tests] = useLocalStorage('health-tests', []);
  const [injections] = useLocalStorage('health-injections', []);
  const [appts] = useLocalStorage('health-appointments', []);
  const [meds] = useLocalStorage('health-medications', []);
  const [conditions] = useLocalStorage('health-conditions', { confirmed: [], suspected: [] });

  const entries = useMemo(() => {
    const e = [];
    symptoms.forEach((s) => e.push({ ts: tsOf(s.time), label: `${s.name} · ${s.severity}/10`, sub: s.notes, Icon: Activity, color: 'text-rose-500' }));
    flares.forEach((s) => e.push({ ts: tsOf(s.date), label: `${s.symptom} · ${s.severity}/10`, sub: [s.related, s.triggers && `trigger: ${s.triggers}`].filter(Boolean).join(' · '), Icon: Flame, color: 'text-amber-500' }));
    vitals.forEach((v) => e.push({ ts: tsOf(v.time), label: `BP ${v.sys}/${v.dia}`, sub: [v.hr && `HR ${v.hr}`, v.weight && `${v.weight}`].filter(Boolean).join(' · '), Icon: HeartPulse, color: 'text-red-500' }));
    moods.forEach((m) => e.push({ ts: tsOf(m.time), label: `${m.mood} · energy ${m.energy}/10`, sub: m.note || m.trigger, Icon: Smile, color: 'text-violet-500' }));
    tests.forEach((t) => e.push({ ts: tsOf(t.date), label: `${t.name}: ${t.result}${t.unit ? ` ${t.unit}` : ''}`, sub: t.flag, Icon: FlaskConical, color: 'text-sky-500' }));
    injections.forEach((i) => e.push({ ts: tsOf(i.time), label: `Injection · ${i.site}`, sub: i.dose, Icon: Syringe, color: 'text-emerald-500' }));
    appts.forEach((a) => e.push({ ts: tsOf(a.date), label: `Visit · ${a.doctor || 'provider'}`, sub: a.instructions, Icon: Stethoscope, color: 'text-indigo-500' }));
    return e.sort((a, b) => b.ts - a.ts).slice(0, 40);
  }, [symptoms, flares, vitals, moods, tests, injections, appts]);

  const bp = vitals.filter((v) => +v.sys && +v.dia).slice(0, 5);
  const avgSys = bp.length ? Math.round(bp.reduce((s, v) => s + +v.sys, 0) / bp.length) : '—';
  const avgDia = bp.length ? Math.round(bp.reduce((s, v) => s + +v.dia, 0) / bp.length) : '—';
  const latestWeight = vitals.find((v) => v.weight)?.weight || '—';

  const now = new Date();
  const monthMoods = moods.filter((m) => { const d = new Date(m.time); return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const moodCount = (arr) => arr.reduce((a, m) => { a[m.mood] = (a[m.mood] || 0) + 1; return a; }, {});
  const topMood = monthMoods.length ? Object.entries(moodCount(monthMoods)).sort((a, b) => b[1] - a[1])[0][0] : '—';

  const activeConditions = conditions.confirmed?.length || 0;
  const lowRefills = meds.filter((m) => m.remaining !== '' && Number(m.remaining) <= 5).length;

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base flex items-center gap-2"><Sparkles className="w-4 h-4" /> Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Insight label="Avg BP" value={bp.length ? `${avgSys}/${avgDia}` : '—'} hint={bp.length ? `last ${bp.length} readings` : 'no vitals yet'} />
            <Insight label="Latest weight" value={latestWeight} hint="most recent entry" />
            <Insight label="Mood this month" value={monthMoods.length} hint={topMood !== '—' ? `mostly ${topMood}` : 'log a mood'} />
            <Insight label="Active conditions" value={activeConditions} hint={activeConditions ? 'confirmed' : 'none tracked'} />
            {lowRefills > 0 && <Insight label="Refills needed" value={lowRefills} hint="medication running low" />}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Health Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {entries.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Your activity will appear here as you log it.</p>}
          {entries.map((e, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
              <div className={`w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 ${e.color}`}>
                <e.Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{e.label}</p>
                {e.sub && <p className="text-xs text-muted-foreground truncate">{e.sub}</p>}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 mt-1">{pretty(e.ts)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}