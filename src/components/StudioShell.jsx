import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function StudioShell({ title, children }) {
  const navigate = useNavigate();
  return (
    <div className="py-4 space-y-4">
      <button
        onClick={() => navigate('/life')}
        className="flex items-center gap-1 text-sm text-muted-foreground active:scale-95 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Life & Studio
      </button>
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      {children}
    </div>
  );
}