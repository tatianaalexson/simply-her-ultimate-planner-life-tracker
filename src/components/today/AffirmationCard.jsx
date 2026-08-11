import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';

const AFFIRMATIONS = [
  'You are soft, strong, and enough — exactly as you are today.',
  'Breathe. You are tending to a life you love.',
  'Small, gentle steps still move mountains.',
  'Your presence is the magic the room needs.',
  'Today, choose tenderness — with yourself first.',
  'You are allowed to bloom slowly.',
  'Rest is productive, too.'
];

export default function AffirmationCard() {
  const [i, setI] = useState(() => new Date().getDate() % AFFIRMATIONS.length);
  return (
    <Card className="rounded-3xl p-5 bg-gradient-to-br from-accent/60 to-secondary/40 border-none shadow-sm">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <p className="font-heading text-base italic leading-relaxed">{AFFIRMATIONS[i]}</p>
      </div>
      <button
        onClick={() => setI((p) => (p + 1) % AFFIRMATIONS.length)}
        className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground active:scale-95 transition"
      >
        <RefreshCw className="w-3 h-3" /> New affirmation
      </button>
    </Card>
  );
}