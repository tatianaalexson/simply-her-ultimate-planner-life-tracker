import React from 'react';
import { Calendar, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoogleCalendarPanel({ connected, events, loading, onConnect, onDisconnect, onRefresh }) {
  if (loading) {
    return (
      <div className="mb-2 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
        <p className="text-xs text-muted-foreground">Checking Google Calendar…</p>
      </div>
    );
  }
  if (!connected) {
    return (
      <div className="mb-2 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Google Calendar
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Connect to sync your events</p>
          </div>
          <Button size="sm" className="rounded-full" onClick={onConnect}>Connect</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="mb-2 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Google Calendar
        </p>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-3 h-3" />
          </button>
          <button onClick={onDisconnect} className="text-muted-foreground">
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </div>
      {events.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No events today.</p>
      ) : (
        events.map((e) => (
          <div key={e.id} className="flex items-center justify-between text-xs py-0.5">
            <span className="truncate pr-2">{e.title}</span>
            <span className="text-muted-foreground shrink-0">
              {e.start ? new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        ))
      )}
    </div>
  );
}