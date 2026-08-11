import React from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { THEMES } from '@/lib/themes';
import { TRADITIONS } from '@/lib/faithData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const FITNESS = [
  { id: 'pilates', label: 'Pilates & Barre' },
  { id: 'strength', label: 'Heavy Lifting & Strength' },
  { id: 'running', label: 'Running & Cardio' },
  { id: 'yoga', label: 'Yoga & Mobility' },
  { id: 'walking', label: 'Gentle Walking & Home' }
];

function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, update } = useAppSettings();
  const tradition = TRADITIONS.find((t) => t.id === settings.tradition) || TRADITIONS[0];

  return (
    <div className="py-4 space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Settings</h1>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Theme & Aesthetic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => update('themeId', t.id)}
                className={`rounded-2xl p-3 border-2 text-left transition ${
                  settings.themeId === t.id ? 'border-primary' : 'border-border'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  <span className="w-5 h-5 rounded-full border border-black/5" style={{ background: `hsl(${t.light.background})` }} />
                  <span className="w-5 h-5 rounded-full" style={{ background: `hsl(${t.light.accent})` }} />
                  <span className="w-5 h-5 rounded-full" style={{ background: `hsl(${t.light.primary})` }} />
                </div>
                <span className="text-xs font-medium">{t.name}</span>
              </button>
            ))}
          </div>
          <Row label="Dark Mode" desc="Toggle light/dark palette">
            <Switch checked={settings.darkMode} onCheckedChange={(v) => update('darkMode', v)} />
          </Row>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Fitness Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={settings.fitnessFocus} onValueChange={(v) => update('fitnessFocus', v)}>
            <SelectTrigger className="rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FITNESS.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Faith & Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Row label="Enable Faith Module">
            <Switch checked={settings.faithEnabled} onCheckedChange={(v) => update('faithEnabled', v)} />
          </Row>
          {settings.faithEnabled && (
            <>
              <Row label="Tradition">
                <Select
                  value={settings.tradition}
                  onValueChange={(v) => {
                    update('tradition', v);
                    update('denomination', TRADITIONS.find((t) => t.id === v)?.dens[0] || '');
                  }}
                >
                  <SelectTrigger className="rounded-full w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADITIONS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Denomination">
                <Select value={settings.denomination} onValueChange={(v) => update('denomination', v)}>
                  <SelectTrigger className="rounded-full w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tradition.dens.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Row label="Budget & Finances" desc="Budget, bills, savings">
            <Switch checked={settings.budgetEnabled} onCheckedChange={(v) => update('budgetEnabled', v)} />
          </Row>
          <Row label="Health & Vitals" desc="GLP-1, BP, medications">
            <Switch checked={settings.healthEnabled} onCheckedChange={(v) => update('healthEnabled', v)} />
          </Row>
          <Row label="Content Creator Studio" desc="Drops, workflow, brand deals">
            <Switch checked={settings.creatorEnabled} onCheckedChange={(v) => update('creatorEnabled', v)} />
          </Row>
          <Row label="TTC & Pathways Studio" desc="Donor, insemination, IVF">
            <Switch checked={settings.ttcEnabled} onCheckedChange={(v) => update('ttcEnabled', v)} />
          </Row>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Reminders" desc="Habit, workout & injection alerts">
            <Switch checked={settings.notifications} onCheckedChange={(v) => update('notifications', v)} />
          </Row>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center pt-2">Simply Her · Ultimate Planner & Life Tracker</p>
    </div>
  );
}