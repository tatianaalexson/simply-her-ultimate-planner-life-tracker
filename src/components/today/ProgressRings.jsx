import React from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import ProgressRing from '@/components/ProgressRing';
import { Sunrise, Sunset, Droplet, Footprints } from 'lucide-react';

export default function ProgressRings() {
  const [morning, setMorning] = useLocalStorage('ring-morning', 0);
  const [evening, setEvening] = useLocalStorage('ring-evening', 0);
  const [water, setWater] = useLocalStorage('ring-water', 0);
  const [steps, setSteps] = useLocalStorage('ring-steps', 0);

  const inc = (v, set, max) => set(v >= max ? 0 : v + 1);

  return (
    <div className="flex justify-between gap-2">
      <ProgressRing label="Morning" value={morning} max={4} color="hsl(var(--primary))" icon={Sunrise} onClick={() => inc(morning, setMorning, 4)} />
      <ProgressRing label="Evening" value={evening} max={4} color="hsl(290 47% 60%)" icon={Sunset} onClick={() => inc(evening, setEvening, 4)} />
      <ProgressRing label="Water" value={water} max={8} color="hsl(199 52% 55%)" icon={Droplet} onClick={() => inc(water, setWater, 8)} />
      <ProgressRing label="Steps" value={steps} max={10} color="hsl(140 30% 45%)" icon={Footprints} onClick={() => inc(steps, setSteps, 10)} />
    </div>
  );
}