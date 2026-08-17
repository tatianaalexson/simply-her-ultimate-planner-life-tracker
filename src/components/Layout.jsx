import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Settings, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function Layout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="font-heading text-sm font-semibold tracking-[0.2em]">SIMPLY HER</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate('/search')} className="text-muted-foreground active:scale-95 transition">
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button onClick={() => navigate('/settings')} className="text-muted-foreground active:scale-95 transition">
              <Settings className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}