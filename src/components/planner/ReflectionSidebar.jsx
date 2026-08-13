import React from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Textarea } from '@/components/ui/textarea';
import { reflectionKey } from '@/lib/plannerStore';
import { NotebookPen, MoonStar, Sunrise } from 'lucide-react';

export default function ReflectionSidebar({ date }) {
  const [r, setR] = useLocalStorage(reflectionKey(date), { brainDump: '', wentWell: '', tomorrowPrep: '' });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-3xl border bg-card p-3 shadow-sm space-y-1">
        <h4 className="font-heading text-sm flex items-center gap-1.5"><NotebookPen className="w-4 h-4" /> Brain Dump</h4>
        <Textarea value={r.brainDump} onChange={(e) => setR((x) => ({ ...x, brainDump: e.target.value }))} placeholder="Scratchpad — jot anything" className="rounded-2xl min-h-[90px] text-sm" />
      </div>
      <div className="rounded-3xl border bg-card p-3 shadow-sm space-y-1">
        <h4 className="font-heading text-sm flex items-center gap-1.5"><MoonStar className="w-4 h-4" /> What went well today</h4>
        <Textarea value={r.wentWell} onChange={(e) => setR((x) => ({ ...x, wentWell: e.target.value }))} placeholder="Wins, small or big" className="rounded-2xl min-h-[90px] text-sm" />
      </div>
      <div className="rounded-3xl border bg-card p-3 shadow-sm space-y-1">
        <h4 className="font-heading text-sm flex items-center gap-1.5"><Sunrise className="w-4 h-4" /> Tomorrow's Prep</h4>
        <Textarea value={r.tomorrowPrep} onChange={(e) => setR((x) => ({ ...x, tomorrowPrep: e.target.value }))} placeholder="Set up tomorrow for success" className="rounded-2xl min-h-[90px] text-sm" />
      </div>
    </div>
  );
}