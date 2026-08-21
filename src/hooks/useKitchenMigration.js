import { useEffect, useRef, useState } from 'react';
import { runKitchenMigration } from '@/lib/kitchenMigration';

// Runs the legacy Kitchen -> entity migration once per browser session,
// idempotently. The migration itself is safe to re-run any number of times.
let _sessionRan = false;

export function useKitchenMigration() {
  const [report, setReport] = useState(null);
  const [running, setRunning] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || _sessionRan) return;
    ran.current = true;
    _sessionRan = true;
    setRunning(true);
    runKitchenMigration()
      .then((r) => { setReport(r); setRunning(false); })
      .catch((e) => { setReport({ error: String(e?.message || e) }); setRunning(false); });
  }, []);

  return { report, running };
}