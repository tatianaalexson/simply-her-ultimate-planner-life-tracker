import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Settings, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useNativeLifecycle } from '@/lib/native/useNativeLifecycle';
import { StudioWidthProvider, useStudioWidth } from '@/lib/studioLayout.jsx';

function LayoutInner() {
  useNativeLifecycle();
  const navigate = useNavigate();
  const { wide } = useStudioWidth();
  const max = wide ? 'max-w-5xl' : 'max-w-2xl';
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border pt-[env(safe-area-inset-top)]">
        <div className={`${max} mx-auto flex items-center justify-between px-4 py-3 transition-all`}>
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
      <main className={`${max} mx-auto px-4 pb-24 transition-all`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default function Layout() {
  return (
    <StudioWidthProvider>
      <LayoutInner />
    </StudioWidthProvider>
  );
}