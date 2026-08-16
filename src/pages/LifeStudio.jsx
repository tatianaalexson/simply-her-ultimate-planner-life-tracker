import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '@/lib/AppSettings';
import { FEATURE_GROUPS } from '@/lib/featureRegistry';
import { Dumbbell, Utensils, Home, Flower2, Activity, Camera, DollarSign, Baby, BookOpen, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ICONS = {
  fitness: Dumbbell,
  kitchen: Utensils,
  home: Home,
  beauty: Flower2,
  health: Activity,
  creator: Camera,
  budget: DollarSign,
  ttc: Baby,
  creative: BookOpen,
  faith: BookOpen
};

const LABELS = {
  fitness: 'Fitness & Movement',
  kitchen: 'Kitchen & Meals',
  home: 'Home',
  beauty: 'Beauty',
  health: 'Health & Care',
  creator: 'Creator Studio',
  budget: 'Budget & Finances',
  ttc: 'TTC',
  creative: 'Creative Nook',
  faith: 'Faith & Reflection'
};

export default function LifeStudio() {
  const navigate = useNavigate();
  const { isGroupEnabled } = useAppSettings();
  // Faith lives in the main nav (Reflection), not the studio grid.
  const studios = FEATURE_GROUPS.filter((g) => g.id !== 'faith');

  return (
    <div className="py-4">
      <h1 className="font-heading text-2xl font-semibold mb-1">Life & Studio</h1>
      <p className="text-sm text-muted-foreground mb-4">Your hubs for home, self-care & hobbies.</p>
      <div className="grid grid-cols-2 gap-3">
        {studios.map((s) => {
          const enabled = isGroupEnabled(s.id);
          const Icon = ICONS[s.id] || BookOpen;
          return (
            <Card key={s.id} className={`rounded-3xl shadow-sm transition ${enabled ? 'active:scale-95' : 'opacity-60'}`}>
              <button
                onClick={() => enabled && navigate(s.route)}
                disabled={!enabled}
                className="w-full p-4 flex flex-col items-start gap-2 text-left h-full"
              >
                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium leading-tight">{LABELS[s.id] || s.label}</span>
                {!enabled && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Lock className="w-3 h-3" /> Enable in Settings
                  </span>
                )}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}