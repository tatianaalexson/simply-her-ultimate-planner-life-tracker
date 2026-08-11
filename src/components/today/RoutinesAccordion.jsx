import React from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';

const ROUTINES = {
  morning: ['Hydrate', 'Skincare', 'Reflection', 'Gentle Movement'],
  evening: ['Space Tidy', 'PM Skincare', 'Gratitude Log']
};

export default function RoutinesAccordion() {
  const [morning, setMorning] = useLocalStorage('routine-morning', {});
  const [evening, setEvening] = useLocalStorage('routine-evening', {});
  const toggle = (set, k) => set((s) => ({ ...s, [k]: !s[k] }));

  return (
    <Accordion type="single" collapsible className="rounded-3xl border bg-card px-4 shadow-sm">
      <AccordionItem value="morning" className="border-b-0">
        <AccordionTrigger className="font-heading">Morning Rituals</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {ROUTINES.morning.map((t) => (
            <div key={t} className="flex items-center gap-2">
              <Checkbox checked={!!morning[t]} onCheckedChange={() => toggle(setMorning, t)} id={`m-${t}`} />
              <label htmlFor={`m-${t}`} className={`text-sm ${morning[t] ? 'line-through text-muted-foreground' : ''}`}>
                {t}
              </label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="evening" className="border-b-0">
        <AccordionTrigger className="font-heading">Evening Unwind</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {ROUTINES.evening.map((t) => (
            <div key={t} className="flex items-center gap-2">
              <Checkbox checked={!!evening[t]} onCheckedChange={() => toggle(setEvening, t)} id={`e-${t}`} />
              <label htmlFor={`e-${t}`} className={`text-sm ${evening[t] ? 'line-through text-muted-foreground' : ''}`}>
                {t}
              </label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}