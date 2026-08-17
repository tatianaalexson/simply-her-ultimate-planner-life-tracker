import { base44 } from '@/api/base44Client';

const shouldOccurOn = (base, forDateISO) => {
  if (!base.task_date || base.task_date > forDateISO) return false;
  const baseD = new Date(base.task_date + 'T00:00:00');
  const forD = new Date(forDateISO + 'T00:00:00');
  const rule = base.recurrence;
  if (rule === 'daily') return true;
  if (rule === 'weekly') return baseD.getDay() === forD.getDay();
  if (rule === 'weekdays') { const d = forD.getDay(); return d >= 1 && d <= 5; }
  return false;
};

// Materializes recurring-task instances for a given date (dedup by parent id).
export async function generateRecurringInstances(forDateISO) {
  let all = [];
  try {
    all = await base44.entities.Task.list('-created_date', 300);
  } catch {
    return;
  }
  const bases = all.filter((t) => t.recurrence && t.recurrence !== 'none' && !t.recurring_parent);
  if (bases.length === 0) return;
  const existing = new Set(
    all.filter((t) => t.recurring_parent && t.task_date === forDateISO).map((t) => t.recurring_parent)
  );
  const due = bases.filter((b) => shouldOccurOn(b, forDateISO) && !existing.has(b.id));
  if (due.length === 0) return;
  await base44.entities.Task.bulkCreate(
    due.map((b) => ({
      title: b.title,
      category: b.category,
      priority: b.priority,
      completed: false,
      task_date: forDateISO,
      start_time: b.start_time || '',
      end_time: b.end_time || '',
      notes: b.notes || '',
      location: b.location || '',
      recurrence: 'none',
      recurring_parent: b.id,
      subtasks: (b.subtasks || []).map((s) => ({ ...s, done: false }))
    }))
  );
}