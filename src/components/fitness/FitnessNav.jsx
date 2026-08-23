import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

export default function FitnessNav({ activeView, setActiveView, navItems }) {
  const { isFeatureEnabled } = useAppSettings();
  const [moreOpen, setMoreOpen] = useState(false);

  const visible = navItems.filter((n) => !n.feature || isFeatureEnabled(n.feature));
  const primary = visible.filter((n) => !n.secondary);
  const secondary = visible.filter((n) => n.secondary);

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm -mx-4 px-4 pb-2">
      <div className="flex gap-1 items-center">
        <div className="flex gap-1 flex-1 overflow-x-auto no-scrollbar">
          {primary.map((n) => (
            <button
              key={n.id}
              onClick={() => { setActiveView(n.id); setMoreOpen(false); }}
              className={`flex-1 shrink-0 rounded-full px-3 py-2 text-xs font-medium transition whitespace-nowrap ${
                activeView === n.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-accent/80'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
        {secondary.length > 0 && (
          <div className="relative shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full"
              onClick={() => setMoreOpen((v) => !v)}
              aria-label="More fitness views"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMoreOpen(false)} />
                <div className="absolute right-0 top-11 z-40 w-48 rounded-2xl border border-border bg-popover p-1.5 shadow-lg">
                  {secondary.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { setActiveView(n.id); setMoreOpen(false); }}
                      className={`w-full text-left rounded-xl px-3 py-2 text-sm transition ${
                        activeView === n.id ? 'bg-accent font-medium' : 'hover:bg-accent/60'
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}