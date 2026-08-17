import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MentalHealthTab from '@/components/health/MentalHealthTab';
import PhysicalHealthTab from '@/components/health/PhysicalHealthTab';
import MedicationCabinetTab from '@/components/health/MedicationCabinetTab';
import AppointmentHubTab from '@/components/health/AppointmentHubTab';
import ChronicConditionsTab from '@/components/health/ChronicConditionsTab';
import HistoryTab from '@/components/health/HistoryTab';
import TestsTab from '@/components/health/TestsTab';
import InsightsTab from '@/components/health/InsightsTab';
import { HeartPulse } from 'lucide-react';

export default function HealthStudio() {
  const { settings } = useAppSettings();
  const tabs = [
    settings.healthMental && { value: 'mental', label: 'Mental' },
    settings.healthPhysical && { value: 'physical', label: 'Physical' },
    settings.healthMedication && { value: 'medication', label: 'Meds' },
    settings.healthAppointments && { value: 'appointments', label: 'Visits' },
    settings.healthConditions && { value: 'conditions', label: 'Conditions' },
    settings.healthHistory && { value: 'history', label: 'History' },
    settings.healthTests && { value: 'tests', label: 'Tests' },
    settings.healthInsights && { value: 'insights', label: 'Insights' }
  ].filter(Boolean);
  const [tab, setTab] = useState(tabs[0]?.value || '');

  if (!settings.healthEnabled || tabs.length === 0) {
    return (
      <div className="py-4 space-y-4">
        <h1 className="font-heading text-2xl font-semibold flex items-center gap-2">
          <HeartPulse className="w-6 h-6" /> Health & Care
        </h1>
        <p className="text-sm text-muted-foreground">Health Studio is currently turned off. Enable it or its modules in Settings.</p>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      <h1 className="font-heading text-2xl font-semibold flex items-center gap-2">
        <HeartPulse className="w-6 h-6" /> Health & Care
      </h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-full w-full flex overflow-x-auto p-1">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="rounded-full shrink-0 min-w-[68px] text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="mental" className="mt-4"><MentalHealthTab /></TabsContent>
        <TabsContent value="physical" className="mt-4"><PhysicalHealthTab /></TabsContent>
        <TabsContent value="medication" className="mt-4"><MedicationCabinetTab /></TabsContent>
        <TabsContent value="appointments" className="mt-4"><AppointmentHubTab /></TabsContent>
        <TabsContent value="conditions" className="mt-4"><ChronicConditionsTab /></TabsContent>
        <TabsContent value="history" className="mt-4"><HistoryTab /></TabsContent>
        <TabsContent value="tests" className="mt-4"><TestsTab /></TabsContent>
        <TabsContent value="insights" className="mt-4"><InsightsTab /></TabsContent>
      </Tabs>
    </div>
  );
}