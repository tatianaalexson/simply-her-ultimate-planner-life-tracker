import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { History, Package } from 'lucide-react';
import { describeEvent } from '@/lib/inventoryHistory';
import { fmtDate } from '@/components/kitchen/kitchenConstants';

// Inventory history viewer — placed behind "View History" on item detail.
// Uses neutral language only. Never infers consumption.
export default function InventoryHistorySheet({ open, onOpenChange, itemId, itemName }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemId) { setEvents([]); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await base44.entities.InventoryHistoryEvent.filter(
          { inventory_item_id: itemId },
          '-event_date'
        );
        if (!cancelled) setEvents(res || []);
      } catch {
        if (!cancelled) setEvents([]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, itemId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[85vh] flex flex-col">
        <SheetHeader className="text-center shrink-0">
          <SheetTitle className="font-heading flex items-center justify-center gap-1.5">
            <History className="w-4 h-4" /> History
          </SheetTitle>
          <SheetDescription>{itemName}</SheetDescription>
        </SheetHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading history…</p>
        ) : events.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="w-8 h-8 text-muted-foreground/30 mx-auto" strokeWidth={1.25} />
            <p className="text-sm text-muted-foreground mt-2">No history yet.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-1 px-1">
            <div className="space-y-0">
              {events.map((evt, i) => (
                <div key={evt.id || i} className="flex gap-3 py-2.5 border-b border-border/30 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary/30 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{evt.description || describeEvent(evt)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {fmtDate(evt.event_date)}{evt.event_time ? ` · ${evt.event_time}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}