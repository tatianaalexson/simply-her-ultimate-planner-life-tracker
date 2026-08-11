import React from 'react';

export default function ProgressRing({ label, value, max, color, icon: Icon, onClick }) {
  const pct = Math.min(1, max ? value / max : 0);
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {Icon ? <Icon className="w-4 h-4" style={{ color }} /> : null}
        </div>
      </div>
      <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
      <span className="text-[10px] text-muted-foreground">{value}/{max}</span>
    </button>
  );
}