import React from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Input } from '@/components/ui/input';
import { focusKey } from '@/lib/plannerStore';
import { Flag, Sparkles } from 'lucide-react';

export default function FocusBanner({ date }) {
  const [focus, setFocus] = useLocalStorage(focusKey(date), { priority: '', mantra: '' });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="rounded-3xl border bg-card p-3 shadow-sm">
        <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
          <Flag className="w-3.5 h-3.5" /> Core Priority of the Day
        </label>
        <Input
          value={focus.priority}
          onChange={(e) => setFocus((f) => ({ ...f, priority: e.target.value }))}
          placeholder="One main thing to win today"
          className="rounded-full mt-2 border-0 px-0 focus-visible:ring-0 text-base"
        />
      </div>
      <div className="rounded-3xl border bg-card p-3 shadow-sm">
        <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5" /> Daily Intent / Mantra
        </label>
        <Input
          value={focus.mantra}
          onChange={(e) => setFocus((f) => ({ ...f, mantra: e.target.value }))}
          placeholder="A word or phrase to anchor you"
          className="rounded-full mt-2 border-0 px-0 focus-visible:ring-0 text-base"
        />
      </div>
    </div>
  );
}