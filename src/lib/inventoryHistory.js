// Shared inventory-history logging — neutral language only.
// Inventory management and Nutrition logging are separate concepts.
// Never infer consumption ("Ate 2 servings") — only record what the user
// explicitly did in the inventory UI.

import { base44 } from '@/api/base44Client';
import { todayStr } from '@/components/kitchen/kitchenConstants';

const nowTime = () => new Date().toTimeString().slice(0, 5);

function fmtQtyStr(amount, unit) {
  if (!amount && amount !== 0) return '';
  const a = Number.isInteger(amount) ? String(amount) : String(Math.round(amount * 100) / 100);
  return unit ? `${a} ${unit}` : a;
}

// Build a neutral-language description from event data.
export function describeEvent(evt) {
  switch (evt.event_type) {
    case 'added':
      return `Item added${evt.to_value ? ` (${evt.to_value})` : ''}.`;
    case 'qty_increased':
      return `Quantity adjusted from ${evt.from_value || '0'} to ${evt.to_value || '0'}.`;
    case 'qty_decreased':
      return `Quantity adjusted from ${evt.from_value || '0'} to ${evt.to_value || '0'}.`;
    case 'qty_set':
      return `Quantity set to ${evt.to_value || '0'}.`;
    case 'moved':
      return `Moved from ${evt.from_zone || '?'} to ${evt.to_zone || '?'}.`;
    case 'storage_changed':
      return evt.to_value ? `Storage location changed to ${evt.to_value}.` : 'Storage location updated.';
    case 'used_up':
      return 'Marked used up.';
    case 'restored':
      return 'Restored to available.';
    case 'discarded':
      return 'Discarded.';
    case 'expired':
      return 'Marked expired.';
    default:
      return evt.details || 'Updated.';
  }
}

// Log a single history event. Non-blocking — failures are swallowed.
export async function logInventoryEvent(itemId, itemType, opts = {}) {
  if (!itemId) return;
  const { fromAmount, toAmount, unit, fromZone, toZone, storageLocation, details } = opts;
  let description = '';

  // Build description in neutral language
  if (itemType === 'added') {
    description = `Item added${toAmount !== undefined ? ` (${fmtQtyStr(toAmount, unit)})` : ''}.`;
  } else if (itemType === 'qty_increased' || itemType === 'qty_decreased' || itemType === 'qty_set') {
    const from = fromAmount !== undefined ? fmtQtyStr(fromAmount, unit) : '';
    const to = toAmount !== undefined ? fmtQtyStr(toAmount, unit) : '';
    if (itemType === 'qty_set') {
      description = `Quantity set to ${to || '0'}.`;
    } else {
      description = `Quantity adjusted from ${from || '0'} to ${to || '0'}.`;
    }
  } else if (itemType === 'moved') {
    description = `Moved from ${fromZone || '?'} to ${toZone || '?'}.`;
  } else if (itemType === 'storage_changed') {
    description = storageLocation ? `Storage location changed to ${storageLocation}.` : 'Storage location updated.';
  } else if (itemType === 'used_up') {
    description = 'Marked used up.';
  } else if (itemType === 'restored') {
    description = 'Restored to available.';
  } else if (itemType === 'discarded') {
    description = 'Discarded.';
  } else if (itemType === 'expired') {
    description = 'Marked expired.';
  }

  const payload = {
    inventory_item_id: itemId,
    item_name: opts.itemName || '',
    event_type: itemType,
    event_date: todayStr(),
    event_time: nowTime(),
    description,
    from_value: fromAmount !== undefined ? fmtQtyStr(fromAmount, unit) : (opts.fromValue || ''),
    to_value: toAmount !== undefined ? fmtQtyStr(toAmount, unit) : (opts.toValue || ''),
    from_zone: fromZone || '',
    to_zone: toZone || '',
    details: details || '',
  };

  try {
    await base44.entities.InventoryHistoryEvent.create(payload);
  } catch { /* non-blocking */ }
}

// Helper: determine the correct event type for a quantity change
export function classifyQtyChange(oldAmount, newAmount) {
  if (oldAmount === undefined || oldAmount === null) return 'qty_set';
  if (newAmount > oldAmount) return 'qty_increased';
  if (newAmount < oldAmount) return 'qty_decreased';
  return 'qty_set';
}