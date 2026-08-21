import React, { useState, useCallback, useEffect } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useToast } from '@/components/ui/use-toast';
import { useKitchenMigration } from '@/hooks/useKitchenMigration';
import StudioShell from '@/components/StudioShell';
import KitchenHome from '@/components/kitchen/KitchenHome';
import KitchenQuickAdd from '@/components/kitchen/KitchenQuickAdd';
import GroceryReviewDialog from '@/components/kitchen/GroceryReviewDialog';
import RecipeList from '@/components/kitchen/RecipeList';
import MealPlanView from '@/components/kitchen/MealPlanView';
import GroceryView from '@/components/kitchen/GroceryView';
import InventoryView from '@/components/kitchen/InventoryView';
import MealPrepView from '@/components/kitchen/MealPrepView';
import LeftoversView from '@/components/kitchen/LeftoversView';
import EquipmentView from '@/components/kitchen/EquipmentView';
import TemplatesView from '@/components/kitchen/TemplatesView';
import OccasionView from '@/components/kitchen/OccasionView';
import KitchenPreferences from '@/components/kitchen/KitchenPreferences';
import KitchenNav from '@/components/kitchen/KitchenNav';
import NutritionView from '@/components/kitchen/nutrition/NutritionView';
import LogFoodSheet from '@/components/kitchen/nutrition/LogFoodSheet';
import { useStudioWidth } from '@/lib/studioLayout.jsx';

export default function KitchenStudio() {
  const { isFeatureEnabled } = useAppSettings();
  const { report: migrationReport } = useKitchenMigration();
  const { toast } = useToast();
  const [view, setView] = useState('home');
  const [quickAdd, setQuickAdd] = useState(false);
  const [review, setReview] = useState({ open: false, sources: [], listName: 'Weekly Groceries' });
  const [logFood, setLogFood] = useState({ open: false, prefill: null });

  const openGroceryReview = useCallback((sources, listName = 'Weekly Groceries') => {
    setReview({ open: true, sources, listName });
  }, []);

  const openLogFood = useCallback((prefill) => setLogFood({ open: true, prefill }), []);
  const { setWide } = useStudioWidth();
  useEffect(() => { setWide(true); return () => setWide(false); }, [setWide]);

  // Subtle, one-time acknowledgment when legacy data was actually moved.
  useEffect(() => {
    if (migrationReport && migrationReport.migratedTotal > 0) {
      toast({ title: 'Your Kitchen has been updated.', description: 'Your existing Kitchen information has been moved into the new Kitchen system.' });
    }
  }, [migrationReport]);

  const nav = (v) => setView(v);

  const home = <KitchenHome onNavigate={nav} onQuickAdd={() => setQuickAdd(true)} />;
  const renderView = () => {
    switch (view) {
      case 'recipes': return isFeatureEnabled('kit.recipes') ? <RecipeList onBack={() => nav('home')} onOpenGroceryReview={openGroceryReview} /> : home;
      case 'mealplan': return isFeatureEnabled('kit.mealplan') ? <MealPlanView onBack={() => nav('home')} onOpenGroceryReview={openGroceryReview} onLogFood={openLogFood} /> : home;
      case 'groceries': return isFeatureEnabled('kit.grocery') ? <GroceryView onBack={() => nav('home')} onOpenGroceryReview={openGroceryReview} /> : home;
      case 'pantry': return isFeatureEnabled('kit.pantry') ? <InventoryView zone="pantry" onBack={() => nav('home')} /> : home;
      case 'fridge': return isFeatureEnabled('kit.fridge') ? <InventoryView zone="fridge" onBack={() => nav('home')} /> : home;
      case 'freezer': return isFeatureEnabled('kit.freezer') ? <InventoryView zone="freezer" onBack={() => nav('home')} /> : home;
      case 'mealprep': return isFeatureEnabled('kit.mealprep') ? <MealPrepView onBack={() => nav('home')} onOpenGroceryReview={openGroceryReview} onLogFood={openLogFood} /> : home;
      case 'leftovers': return isFeatureEnabled('kit.leftovers') ? <LeftoversView onBack={() => nav('home')} onLogFood={openLogFood} /> : home;
      case 'equipment': return isFeatureEnabled('kit.equipment') ? <EquipmentView onBack={() => nav('home')} /> : home;
      case 'templates': return (isFeatureEnabled('kit.mealTemplates') || isFeatureEnabled('kit.groceryTemplates') || isFeatureEnabled('kit.prepTemplates')) ? <TemplatesView onBack={() => nav('home')} /> : home;
      case 'occasions': return isFeatureEnabled('kit.occasionPlan') ? <OccasionView onBack={() => nav('home')} onOpenGroceryReview={openGroceryReview} /> : home;
      case 'nutrition': return isFeatureEnabled('kit.nutrition') ? <NutritionView onBack={() => nav('home')} /> : home;
      case 'preferences': return <KitchenPreferences onBack={() => nav('home')} />;
      default: return home;
    }
  };

  return (
    <StudioShell title="Kitchen">
      <KitchenNav view={view} onNavigate={nav} />
      {renderView()}
      <KitchenQuickAdd open={quickAdd} onOpenChange={setQuickAdd} onNavigate={(v) => { setQuickAdd(false); nav(v); }} onLogFood={() => { setQuickAdd(false); openLogFood(null); }} />
      <LogFoodSheet open={logFood.open} onOpenChange={(o) => setLogFood((p) => ({ ...p, open: o }))} prefill={logFood.prefill} />
      <GroceryReviewDialog open={review.open} onOpenChange={(o) => setReview((p) => ({ ...p, open: o }))} sources={review.sources} listName={review.listName} />
    </StudioShell>
  );
}