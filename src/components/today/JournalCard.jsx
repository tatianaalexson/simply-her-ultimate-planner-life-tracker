import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Leaf, Zap, Heart, Moon, Camera, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MOODS = [
  { id: 'peaceful', label: 'Peaceful', icon: Leaf, color: 'text-green-500' },
  { id: 'productive', label: 'Productive', icon: Zap, color: 'text-amber-500' },
  { id: 'grateful', label: 'Grateful', icon: Heart, color: 'text-rose-500' },
  { id: 'restful', label: 'Restful', icon: Moon, color: 'text-indigo-500' }
];

export default function JournalCard() {
  const { toast } = useToast();
  const [mood, setMood] = useState('peaceful');
  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhoto(file_url);
  };

  const save = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await base44.entities.JournalEntry.create({
        mood,
        content,
        photo_url: photo,
        entry_date: new Date().toISOString().slice(0, 10)
      });
      setContent('');
      setPhoto('');
      toast({ title: 'Entry saved 💛' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">Daily Journal Studio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl border transition ${
                mood === m.id ? 'border-primary bg-accent' : 'border-border'
              }`}
            >
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <span className="text-[10px]">{m.label}</span>
            </button>
          ))}
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How is your heart today, beautiful?"
          rows={4}
          className="rounded-2xl resize-none"
        />
        {photo && <img src={photo} alt="memory" className="w-full h-32 object-cover rounded-2xl" />}
        <div className="flex items-center justify-between">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Camera className="w-4 h-4" /> Photo memory
            </span>
          </label>
          <Button onClick={save} disabled={saving || !content.trim()} size="sm" className="rounded-full">
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}