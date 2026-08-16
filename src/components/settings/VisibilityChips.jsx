import React from 'react';
import { useAppSettings } from '@/lib/AppSettings';

// Compact toggle chips for the most meaningful visibility channels.
export default function VisibilityChips({ featureId }) {
  const { getVisibility, setVisibility } = useAppSettings();
  const vis = getVisibility(featureId);
  const channels = [
    { id: 'today', label: 'Today' },
    { id: 'planner', label: 'Planner' },
    { id: 'quickAdd', label: 'Quick Add' },
    { id: 'notifications', label: 'Alerts' }
  ];
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {channels.map((c) => {
        const on = !!vis[c.id];
        return (
          <button
            key={c.id}
            onClick={(e) => {
              e.stopPropagation();
              setVisibility(featureId, c.id, !on);
            }}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
              on ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-border'
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}