import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const CONNECTOR_ID = '6a7e1fcd17fed60ea3da0119';

function dayRange(dateStr) {
  const start = new Date(dateStr + 'T00:00:00');
  const end = new Date(dateStr + 'T23:59:59');
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

export function useGoogleCalendar(dateStr) {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const { timeMin, timeMax } = dayRange(dateStr);
      const res = await base44.functions.invoke('listCalendarEvents', { timeMin, timeMax });
      setEvents(res.data.events || []);
      setConnected(true);
    } catch {
      setConnected(false);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        await fetchEvents();
      } else {
        setLoading(false);
      }
    });
  }, [fetchEvents]);

  const connect = useCallback(async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        fetchEvents();
      }
    }, 500);
  }, [fetchEvents]);

  const disconnect = useCallback(async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setEvents([]);
  }, []);

  const pushEvent = useCallback(async ({ title, start, end }) => {
    const res = await base44.functions.invoke('createCalendarEvent', { title, start, end });
    return res.data;
  }, []);

  return { user, events, connected, loading, connect, disconnect, pushEvent, refresh: fetchEvents };
}