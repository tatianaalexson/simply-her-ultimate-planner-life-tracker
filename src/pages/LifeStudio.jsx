import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '@/lib/AppSettings';
import { Dumbbell, Utensils, Home, Flower2, Activity, Camera, DollarSign, Baby, BookOpen, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';

const STUDIOS = [
  { id: 'kitchen', label: 'Kitchen & Meals', icon: Utensils, path: '/life/kitchen', always: true },
  { id: 'home', label: 'Home & Pet', icon: Home, path: '/life/home', always: true },
  { id: 'fitness', label: 'Fitness & Movement', icon: Dumbbell, path: '/life/fitness', always: true },
  { id: 'beauty', label: 'Beauty & Wardrobe', icon: Flower2, path: '/life/beauty', always: true },
  { id: 'health', label: 'Health & Vitals', icon: Activity, path: '/life/health', flag: 'healthEnabled' },
  { id: 'creator', label: 'Creator Studio', icon: Camera, path: '/life/creator', flag: 'creatorEnabled' },
  { id: 'budget', label: 'Budget & Finances', icon: DollarSign, path: '/life/budget', flag: 'budgetEnabled' },
  { id: 'ttc', label: 'TTC & Pathways', icon: Baby, path: '/life/ttc', flag: 'ttcEnabled' },
  { id: 'creative', label: 'Creative Nook & Library', icon: BookOpen, path: '/life/creative', always: true }
];

export default function LifeStudio() {
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  return (
    <div className="py-4">
      <h1 className="font-heading text-2xl font-semibold mb-1">Life & Studio</h1>
      <p className="text-sm text-muted-foreground mb-4">Your hubs for home, self-care & hobbies.</p>
      <div className="grid grid-cols-2 gap-3">
        {STUDIOS.map((s) => {
          const enabled = s.always || settings[s.flag];
          return (
            <Card
              key={s.id}
              className={`rounded-3xl shadow-sm transition ${enabled ? 'active:scale-95' : 'opacity-60'}`}
            >
              <button
                onClick={() => enabled && navigate(s.path)}
                disabled={!enabled}
                className="w-full p-4 flex flex-col items-start gap-2 text-left h-full"
              >
                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium leading-tight">{s.label}</span>
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