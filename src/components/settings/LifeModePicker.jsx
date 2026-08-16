import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { LIFE_MODES, recommendedGroups } from '@/lib/lifeModes';
import { FEATURE_GROUPS, getGroup } from '@/lib/featureRegistry';
import { Plus, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function LifeModePicker() {
  const { settings, toggleLifeMode, addCustomMode, removeCustomMode, isGroupEnabled, setGroupEnabled } = useAppSettings();
  const [newName, setNewName] = useState('');
  const recs = recommendedGroups(settings.lifeModes, settings.customModes);

  const createMode = () => {
    const name = newName.trim();
    if (!name) return;
    addCustomMode(name, recs);
    setNewName('');
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          Life Modes are gentle presets — they recommend modules to surface. Pick as many as you like. They never hide or delete your data.
        </p>
        <div className="flex flex-wrap gap-2">
          {LIFE_MODES.map((m) => {
            const on = settings.lifeModes.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleLifeMode(m.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                  on ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'
                }`}
              >
                <span>{m.emoji}</span> {m.label}
              </button>
            );
          })}
          {settings.customModes.map((m) => {
            const on = settings.lifeModes.includes(m.id);
            return (
              <span key={m.id} className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${on ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>
                <span>⭐</span> {m.label}
                <button onClick={() => removeCustomMode(m.id)} className="opacity-70 hover:opacity-100"><X className="w-3 h-3" /></button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Create a custom Life Mode…" className="rounded-full" />
        <Button size="sm" variant="outline" className="rounded-full" onClick={createMode}><Plus className="w-4 h-4" /></Button>
      </div>

      {recs.length > 0 && (
        <div className="rounded-2xl border bg-background/50 p-3">
          <p className="text-xs font-medium flex items-center gap-1.5 mb-2"><Sparkles className="w-3.5 h-3.5 text-primary" /> Suggested for your era{recs.length > 1 ? 's' : ''}</p>
          <div className="space-y-1.5">
            {recs.map((gid) => {
              const g = getGroup(gid);
              if (!g) return null;
              return (
                <div key={gid} className="flex items-center justify-between gap-2">
                  <span className="text-xs">{g.label}</span>
                  {isGroupEnabled(gid) ? (
                    <span className="text-[10px] text-muted-foreground">Active</span>
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => setGroupEnabled(gid, true)}>Enable</Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}