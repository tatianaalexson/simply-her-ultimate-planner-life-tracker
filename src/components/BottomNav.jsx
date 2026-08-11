import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, CalendarHeart, Sparkles, LayoutGrid } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Today', icon: Sun, end: true },
  { to: '/planner', label: 'Planner', icon: CalendarHeart },
  { to: '/reflection', label: 'Faith', icon: Sparkles },
  { to: '/life', label: 'Life', icon: LayoutGrid }
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto grid grid-cols-4">
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