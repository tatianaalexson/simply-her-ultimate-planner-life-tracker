import React from 'react';
import { Sun } from 'lucide-react';

export default function WeatherPill() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium">
      <Sun className="w-3.5 h-3.5" /> 72° Sunny
    </div>
  );
}