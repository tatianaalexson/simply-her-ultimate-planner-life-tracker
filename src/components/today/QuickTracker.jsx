import React from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Droplet, Footprints, Flame } from 'lucide-react';

function Counter({ icon: Icon, label, value, set, color }) {
  return (
    <button
      onClick={() => set(value + 1)}
      onContextMenu={(e) => {
        e.preventDefault();
        set(0);
      }}
      className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-card border shadow-sm active:scale-95 transition"
    >
      <Icon className="w-5 h-5" style={{ color }} />
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </button>
  );
}

export default function QuickTracker() {
  const [water, setWater] = useLocalStorage('qt-water', 0);
  const [walk, setWalk] = useLocalStorage('qt-walk', 0);
  const [streak, setStreak] = useLocalStorage('qt-streak', 0);

  return (
    <div className="flex gap-2">
      <Counter icon={Droplet} label="Water" value={water} set={setWater} color="hsl(199 52% 55%)" />
      <Counter icon={Footprints} label="Pet Walk" value={walk} set={setWalk} color="hsl(140 30% 45%)" />
      <Counter icon={Flame} label="Habit Streak" value={streak} set={setStreak} color="hsl(12 76% 61%)" />
    </div>
  );
}