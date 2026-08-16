import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { FEATURE_GROUPS, featuresByGroup } from '@/lib/featureRegistry';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, Sparkles } from 'lucide-react';
import VisibilityChips from './VisibilityChips';

export default function FeatureGroupCard({ groupId, recommended }) {
  const { isGroupEnabled, setGroupEnabled, isFeatureEnabled, setFeatureEnabled } = useAppSettings();
  const [open, setOpen] = useState(false);
  const group = FEATURE_GROUPS.find((g) => g.id === groupId);
  const feats = featuresByGroup(groupId);
  const on = isGroupEnabled(groupId);

  return (
    <div className={`rounded-3xl border bg-card shadow-sm transition ${on ? '' : 'opacity-70'}`}>
      <div className="flex items-center gap-2 p-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium">{group.label}</p>
            {recommended && <Sparkles className="w-3.5 h-3.5 text-primary" />}
          </div>
          {group.sensitive && <p className="text-[10px] text-muted-foreground">Private section</p>}
        </div>
        <Switch checked={on} onCheckedChange={(v) => setGroupEnabled(groupId, v)} />
        <button onClick={() => setOpen((o) => !o)} className="text-muted-foreground ml-1">
          <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-border/60 pt-2">
          {feats.map((f) => (
            <div key={f.id} className="rounded-2xl bg-background/50 p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">{f.label}</span>
                <Switch checked={isFeatureEnabled(f.id)} onCheckedChange={(v) => setFeatureEnabled(f.id, v)} />
              </div>
              {isFeatureEnabled(f.id) && <VisibilityChips featureId={f.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}