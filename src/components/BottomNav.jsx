import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, CalendarHeart, Sparkles, LayoutGrid, HeartPulse } from 'lucide-react';
import { useAppSettings } from '@/lib/AppSettings';

export default function BottomNav() {
  const { settings } = useAppSettings();
  const tabs = [
    { to: '/', label: 'Today', icon: Sun, end: true },
    { to: '/planner', label: 'Planner', icon: CalendarHeart },
    ...(settings.faithEnabled ? [{ to: '/reflection', label: 'Faith', icon: Sparkles }] : []),
    ...(settings.healthEnabled ? [{ to: '/health', label: 'Health', icon: HeartPulse }] : []),
    { to: '/life', label: 'Life', icon: LayoutGrid }
  ];
  const colClass = { 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5' }[tabs.length] || 'grid-cols-4';
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className={`max-w-2xl mx-auto grid ${colClass}`}>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <t.icon className="w-5 h-5" strokeWidth={1.5} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}