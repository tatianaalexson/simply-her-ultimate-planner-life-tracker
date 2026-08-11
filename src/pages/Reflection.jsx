import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAppSettings } from '@/lib/AppSettings';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { TRADITIONS, WISDOM, STUDY_TEMPLATES } from '@/lib/faithData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Bookmark, Plus, Check, Heart } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

export default function Reflection() {
  const { settings, update } = useAppSettings();
  const [prayers, setPrayers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'prayer', title: '', notes: '' });
  const [study, setStudy] = useLocalStorage(`study-${settings.tradition}`, {});
  const [bookmarks, setBookmarks] = useLocalStorage('wisdom-bookmarks', []);

  const load = async () => {
    const list = await base44.entities.PrayerLog.filter({ log_date: today() });
    setPrayers(list);
  };
  useEffect(() => {
    load();
  }, []);

  if (!settings.faithEnabled) {
    return (
      <div className="py-20 text-center px-6">
        <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          The Reflection & Faith module is off. Enable it in Settings to begin your practice.
        </p>
      </div>
    );
  }

  const tradition = TRADITIONS.find((t) => t.id === settings.tradition) || TRADITIONS[0];
  const template = STUDY_TEMPLATES[settings.tradition] || STUDY_TEMPLATES.universalist;
  const wisdom = WISDOM[settings.tradition] || WISDOM.universalist;

  const addPrayer = async () => {
    if (!form.title.trim()) return;
    await base44.entities.PrayerLog.create({ ...form, log_date: today(), status: 'active' });
    setForm({ category: 'prayer', title: '', notes: '' });
    setShowAdd(false);
    load();
  };
  const markAnswered = async (p) => {
    await base44.entities.PrayerLog.update(p.id, { status: 'answered' });
    load();
  };
  const bookmarkWisdom = () =>
    setBookmarks((b) => (b.includes(wisdom) ? b : [wisdom, ...b]));

  return (
    <div className="py-4 space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Reflection & Faith</h1>

      <Card className="rounded-3xl shadow-sm">
        <CardContent className="pt-4 space-y-2">
          <div className="flex gap-2">
            <Select
              value={settings.tradition}
              onValueChange={(v) => {
                update('tradition', v);
                update('denomination', TRADITIONS.find((t) => t.id === v)?.dens[0] || '');
              }}
            >
              <SelectTrigger className="rounded-full flex-1">
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
            <Select value={settings.denomination} onValueChange={(v) => update('denomination', v)}>
              <SelectTrigger className="rounded-full flex-1">
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
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="wisdom">
        <TabsList className="rounded-full w-full flex">
          <TabsTrigger value="wisdom" className="rounded-full flex-1 text-xs">Daily Wisdom</TabsTrigger>
          <TabsTrigger value="study" className="rounded-full flex-1 text-xs">Study</TabsTrigger>
          <TabsTrigger value="prayer" className="rounded-full flex-1 text-xs">Prayer & Logs</TabsTrigger>
          <TabsTrigger value="gratitude" className="rounded-full flex-1 text-xs">Gratitude</TabsTrigger>
        </TabsList>

        <TabsContent value="wisdom" className="mt-4">
          <Card className="rounded-3xl bg-gradient-to-br from-accent/60 to-secondary/40 border-none shadow-sm">
            <CardContent className="pt-6">
              <p className="font-heading text-lg italic leading-relaxed">{wisdom}</p>
              <Button variant="ghost" size="sm" onClick={bookmarkWisdom} className="mt-3 rounded-full">
                <Bookmark className="w-4 h-4 mr-1" /> Bookmark
              </Button>
            </CardContent>
          </Card>
          {bookmarks.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">Bookmarked</p>
              {bookmarks.map((b, i) => (
                <p key={i} className="text-sm italic">
                  {b}
                </p>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="study" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {tradition.label} · {settings.denomination}
          </p>
          {template.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium">{f.label}</label>
              <Textarea
                value={study[f.key] || ''}
                onChange={(e) => setStudy((s) => ({ ...s, [f.key]: e.target.value }))}
                rows={2}
                className="rounded-2xl resize-none mt-1"
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="prayer" className="mt-4 space-y-2">
          <Button size="sm" onClick={() => setShowAdd(true)} className="rounded-full">
            <Plus className="w-4 h-4 mr-1" /> New Entry
          </Button>
          {prayers
            .filter((p) => p.category !== 'gratitude' && p.category !== 'answered')
            .map((p) => (
              <Card key={p.id} className="rounded-2xl shadow-sm">
                <CardContent className="pt-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.category}</p>
                      {p.notes && <p className="text-xs mt-1">{p.notes}</p>}
                    </div>
                    {p.status !== 'answered' && (
                      <Button size="sm" variant="ghost" onClick={() => markAnswered(p)}>
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="gratitude" className="mt-4 space-y-2">
          <Button
            size="sm"
            onClick={() => {
              setForm({ category: 'gratitude', title: '', notes: '' });
              setShowAdd(true);
            }}
            className="rounded-full"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Gratitude
          </Button>
          {prayers
            .filter((p) => p.category === 'gratitude' || p.status === 'answered')
            .map((p) => (
              <Card key={p.id} className="rounded-2xl shadow-sm">
                <CardContent className="pt-3">
                  <p className="text-sm">{p.title}</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setShowAdd(false)}>
          <Card className="rounded-t-3xl w-full p-4 space-y-3 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              className="rounded-full"
            />
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Notes"
              rows={3}
              className="rounded-2xl resize-none"
            />
            <Button onClick={addPrayer} className="rounded-full w-full">
              Save
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}