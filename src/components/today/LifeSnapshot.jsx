import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '@/lib/AppSettings';
import { FEATURE_GROUPS } from '@/lib/featureRegistry';
import { Dumbbell, Utensils, Home as HomeIcon, Flower2, Activity, Camera, DollarSign, Baby, BookOpen } from 'lucide-react';

const ICONS = {
  fitness: Dumbbell, kitchen: Utensils, home: HomeIcon, beauty: Flower2,
  health: Activity, creator: Camera, budget: DollarSign, ttc: Baby, creative: BookOpen
};

const SUBTITLE = {
  fitness: 'Movement today',
  kitchen: "Today's meals",
  home: 'Home tasks',
  beauty: 'Self-care',
  health: 'Wellness log',
  creator: 'Content today',
  budget: 'Money check-in',
  ttc: 'Cycle & care',
  creative: 'Creative space'
};

const TASK_CATEGORY = {
  fitness: 'wellness', home: 'home', creator: 'work'
};

export default function LifeSnapshot({ tasks }) {
  const navigate = useNavigate();
  const { isGroupEnabled, visibleFeaturesFor } = useAppSettings();
  const todayFeats = visibleFeaturesFor('today');
  const hasToday = (gid) => todayFeats.some((f) => f.group === gid);

  const cards = FEATURE_GROUPS
    .filter((g) => g.id !== 'faith' && isGroupEnabled(g.id) && hasToday(g.id))
    .map((g) => {
      const cat = TASK_CATEGORY[g.id];
      const count = cat ? (tasks || []).filter((t) => t.category === cat && !t.completed).length : 0;
      return { g, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  if (cards.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-sm font-medium mb-2 text-muted-foreground">Life Snapshot</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {cards.map(({ g, count }) => {
          const Icon = ICONS[g.id] || BookOpen;
          return (
            <button
              key={g.id}
              onClick={() => navigate(g.route)}
              className="snap-start shrink-0 w-36 rounded-3xl bg-card border p-4 text-left shadow-sm active:scale-95 transition"
            >
              <div className="w-9 h-9 rounded-2xl bg-accent flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium leading-tight">{g.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {count > 0 ? `${count} task${count > 1 ? 's' : ''} today` : SUBTITLE[g.id]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}