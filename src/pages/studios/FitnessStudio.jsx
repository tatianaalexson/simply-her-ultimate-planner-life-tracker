import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import StudioShell from '@/components/StudioShell';
import FitnessNav from '@/components/fitness/FitnessNav';
import FitnessHome from '@/components/fitness/FitnessHome';
import WorkoutsView from '@/components/fitness/WorkoutsView';
import ActivityView from '@/components/fitness/ActivityView';
import RecoveryView from '@/components/fitness/RecoveryView';
import ProgressView from '@/components/fitness/ProgressView';
import ExerciseLibraryView from '@/components/fitness/ExerciseLibraryView';
import AccessibilitySettings from '@/components/fitness/AccessibilitySettings';
import ConnectedHealth from '@/components/fitness/ConnectedHealth';
import CalorieMacroTracker from '@/components/health/CalorieMacroTracker';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', feature: 'fit.home' },
  { id: 'workouts', label: 'Workouts', feature: 'fit.workouts' },
  { id: 'activity', label: 'Activity' },
  { id: 'progress', label: 'Progress', feature: 'fit.progress' },
  { id: 'recovery', label: 'Recovery', feature: 'fit.recovery' },
  { id: 'exercises', label: 'Exercise Library', feature: 'fit.exerciseLibrary', secondary: true },
  { id: 'nutrition', label: 'Nutrition', feature: 'fit.nutrition', secondary: true },
  { id: 'accessibility', label: 'Accessibility & Capacity', secondary: true },
  { id: 'connected-health', label: 'Connected Health', secondary: true },
];

export default function FitnessStudio() {
  const { isFeatureEnabled } = useAppSettings();
  const [view, setView] = useState('home');

  // Filter nav items to only show what's enabled, with sensible fallbacks
  const visibleNav = NAV_ITEMS.filter((n) => {
    if (!n.feature) return true;
    if (n.feature === 'fit.nutrition') {
      return isFeatureEnabled('fit.calories') || isFeatureEnabled('fit.protein') || isFeatureEnabled('fit.macros') || isFeatureEnabled('fit.nutrition');
    }
    return isFeatureEnabled(n.feature);
  });

  // Ensure current view is valid; fall back to first visible
  const activeView = visibleNav.some((n) => n.id === view) ? view : (visibleNav[0]?.id || 'home');

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <FitnessHome onNavigate={setView} />;
      case 'workouts':
        return <WorkoutsView />;
      case 'activity':
        return <ActivityView />;
      case 'recovery':
        return <RecoveryView />;
      case 'progress':
        return <ProgressView />;
      case 'exercises':
        return <ExerciseLibraryView />;
      case 'nutrition':
        return <CalorieMacroTracker />;
      case 'accessibility':
        return <AccessibilitySettings />;
      case 'connected-health':
        return <ConnectedHealth />;
      default:
        return <FitnessHome onNavigate={setView} />;
    }
  };

  return (
    <StudioShell title="Fitness & Movement">
      {visibleNav.length > 1 && (
        <FitnessNav activeView={activeView} setActiveView={setView} navItems={visibleNav} />
      )}
      {renderView()}
    </StudioShell>
  );
}