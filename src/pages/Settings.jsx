import React from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { THEMES } from '@/lib/themes';
import { TRADITIONS } from '@/lib/faithData';
import { FEATURE_GROUPS, featuresByGroup } from '@/lib/featureRegistry';
import { LIFE_MODES } from '@/lib/lifeModes';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { LogOut } from 'lucide-react';
import SettingsSection from '@/components/settings/SettingsSection';
import LifeModePicker from '@/components/settings/LifeModePicker';
import FeatureGroupCard from '@/components/settings/FeatureGroupCard';

const FITNESS = [
  { id: 'pilates', label: 'Pilates & Barre' },
  { id: 'strength', label: 'Heavy Lifting & Strength' },
  { id: 'running', label: 'Running & Cardio' },
  { id: 'yoga', label: 'Yoga & Mobility' },
  { id: 'walking', label: 'Gentle Walking & Home' }
];

const SENSITIVE_GROUPS = ['health', 'ttc', 'faith', 'budget'];

export default function SettingsPage() {
  const { settings, update, getVisibility, setVisibility } = useAppSettings();
  const tradition = TRADITIONS.find((t) => t.id === settings.tradition) || TRADITIONS[0];

  const groupAlertsOn = (gid) => featuresByGroup(gid).some((f) => getVisibility(f.id).notifications);
  const setGroupAlerts = (gid, bool) => featuresByGroup(gid).forEach((f) => setVisibility(f.id, 'notifications', bool));

  const groupHiddenToday = (gid) => featuresByGroup(gid).every((f) => !getVisibility(f.id).today);
  const setGroupHiddenToday = (gid, hide) => featuresByGroup(gid).forEach((f) => setVisibility(f.id, 'today', !hide));

  return (
    <div className="py-4 space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Settings</h1>

      <Tabs defaultValue="life">
        <TabsList className="flex flex-wrap h-auto bg-accent rounded-full p-1 gap-1 mb-4">
          <TabsTrigger value="life" className="rounded-full text-xs">My Life</TabsTrigger>
          <TabsTrigger value="features" className="rounded-full text-xs">My Features</TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-full text-xs">Appearance</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-full text-xs">Alerts</TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-full text-xs">Privacy</TabsTrigger>
          <TabsTrigger value="account" className="rounded-full text-xs">Account</TabsTrigger>
        </TabsList>

        {/* MY LIFE */}
        <TabsContent value="life" className="space-y-4 mt-0">
          <SettingsSection title="Life Modes" description="Gentle presets that recommend modules — they never hide or delete your data.">
            <LifeModePicker />
          </SettingsSection>
        </TabsContent>

        {/* MY FEATURES */}
        <TabsContent value="features" className="space-y-4 mt-0">
          <SettingsSection title="Fitness Focus">
            <Select value={settings.fitnessFocus} onValueChange={(v) => update('fitnessFocus', v)}>
              <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>{FITNESS.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}</SelectContent>
            </Select>
          </SettingsSection>

          <SettingsSection title="Faith & Reflection">
            <div className="space-y-1">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm font-medium">Enable Faith Module</span>
                <Switch checked={settings.faithEnabled} onCheckedChange={(v) => update('faithEnabled', v)} />
              </div>
              {settings.faithEnabled && (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-border gap-3">
                    <span className="text-sm font-medium">Tradition</span>
                    <Select value={settings.tradition} onValueChange={(v) => { update('tradition', v); update('denomination', TRADITIONS.find((t) => t.id === v)?.dens[0] || ''); }}>
                      <SelectTrigger className="rounded-full w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>{TRADITIONS.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between py-2 gap-3">
                    <span className="text-sm font-medium">Denomination</span>
                    <Select value={settings.denomination} onValueChange={(v) => update('denomination', v)}>
                      <SelectTrigger className="rounded-full w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>{tradition.dens.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </SettingsSection>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1">Activate any studio and its tools — even outside your Life Modes. Expand a studio to toggle individual features and where each appears.</p>
            {FEATURE_GROUPS.map((g) => (
              <FeatureGroupCard key={g.id} groupId={g.id} recommended={settings.lifeModes.length > 0 && recommendedIncludes(g.id, settings.lifeModes, settings.customModes)} />
            ))}
          </div>
        </TabsContent>

        {/* APPEARANCE */}
        <TabsContent value="appearance" className="space-y-4 mt-0">
          <SettingsSection title="Theme & Aesthetic">
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => update('themeId', t.id)} className={`rounded-2xl p-3 border-2 text-left transition ${settings.themeId === t.id ? 'border-primary' : 'border-border'}`}>
                  <div className="flex gap-1 mb-2">
                    <span className="w-5 h-5 rounded-full border border-black/5" style={{ background: `hsl(${t.light.background})` }} />
                    <span className="w-5 h-5 rounded-full" style={{ background: `hsl(${t.light.accent})` }} />
                    <span className="w-5 h-5 rounded-full" style={{ background: `hsl(${t.light.primary})` }} />
                  </div>
                  <span className="text-xs font-medium">{t.name}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border mt-2">
              <span className="text-sm font-medium">Dark Mode</span>
              <Switch checked={settings.darkMode} onCheckedChange={(v) => update('darkMode', v)} />
            </div>
          </SettingsSection>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-4 mt-0">
          <SettingsSection title="Reminders" description="A gentle master switch. Per-feature alerts live in My Features.">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium">All reminders</span>
              <Switch checked={settings.notifications} onCheckedChange={(v) => update('notifications', v)} />
            </div>
          </SettingsSection>
          <SettingsSection title="Per-module alerts" description="Turn alerts on for whole studios.">
            <div className="space-y-1">
              {FEATURE_GROUPS.map((g) => (
                <div key={g.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm font-medium">{g.label}</span>
                  <Switch checked={groupAlertsOn(g.id)} onCheckedChange={(v) => setGroupAlerts(g.id, v)} />
                </div>
              ))}
            </div>
          </SettingsSection>
        </TabsContent>

        {/* PRIVACY */}
        <TabsContent value="privacy" className="space-y-4 mt-0">
          <SettingsSection title="Sensitive Sections" description="Keep personal areas out of Today and search without losing any data.">
            <div className="space-y-2">
              {SENSITIVE_GROUPS.map((gid) => {
                const g = FEATURE_GROUPS.find((x) => x.id === gid);
                const hidden = groupHiddenToday(gid);
                return (
                  <div key={gid} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{g.label}</p>
                      <p className="text-[10px] text-muted-foreground">{hidden ? 'Hidden from Today' : 'Visible on Today when relevant'}</p>
                    </div>
                    <Switch checked={hidden} onCheckedChange={(v) => setGroupHiddenToday(gid, v)} />
                  </div>
                );
              })}
            </div>
          </SettingsSection>
        </TabsContent>

        {/* ACCOUNT */}
        <TabsContent value="account" className="space-y-4 mt-0">
          <SettingsSection title="Account">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium">Sign out</span>
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => base44.auth.logout('/')}>
                <LogOut className="w-4 h-4 mr-1" /> Sign out
              </Button>
            </div>
          </SettingsSection>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground text-center pt-2">Simply Her · Ultimate Planner & Life Tracker</p>
    </div>
  );
}

function recommendedIncludes(groupId, selectedIds, customModes) {
  const all = [...LIFE_MODES, ...customModes];
  return all.some((m) => selectedIds.includes(m.id) && m.recommends.includes(groupId));
}