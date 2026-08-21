import React, { useState, useCallback } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
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
import KitchenPreferences from '@/components/kitchen/KitchenPreferences';

export default function KitchenStudio() {
  const { isFeatureEnabled } = useAppSettings();
  const [view, setView] = useState('home');
  const [quickAdd, setQuickAdd] = useState(false);
  const [review, setReview] = useState({ open: false, sources: [], listName: 'Weekly Groceries' });

  const openGroceryReview = useCallback((sources, listName = 'Weekly Groceries') => {
    setReview({ open: true, sources, listName });
  }, []);

  const nav = (v) => setView(v);

  const home = <KitchenHome onNavigate={nav} onQuickAdd={() => setQuickAdd(true)} />;
  const renderView = () => {
    switch (view) {
      case 'recipes': return isFeatureEnabled('kit.recipes') ? <RecipeList onBack={() => nav('home')} onOpenGroceryReview={openGroceryReview} /> : home;
      case 'mealplan': return isFeatureEnabled('kit.mealplan') ? <MealPlanView onBack={() => nav('home')} onOpenGroceryReview={openGroceryReview} /> : home;
      case 'groceries': return isFeatureEnabled('kit.grocery') ? <GroceryView onBack={() => nav('home')} onOpenGroceryReview={openGroceryReview} /> : home;
      case 'pantry': return isFeatureEnabled('kit.pantry') ? <InventoryView zone="pantry" onBack={() => nav('home')} /> : home;
      case 'fridge': return isFeatureEnabled('kit.fridge') ? <InventoryView zone="fridge" onBack={() => nav('home')} /> : home;
      case 'freezer': return isFeatureEnabled('kit.freezer') ? <InventoryView zone="freezer" onBack={() => nav('home')} /> : home;
      case 'mealprep': return isFeatureEnabled('kit.mealprep') ? <MealPrepView onBack={() => nav('home')} onOpenGroceryReview={openGroceryReview} /> : home;
      case 'leftovers': return isFeatureEnabled('kit.leftovers') ? <LeftoversView onBack={() => nav('home')} /> : home;
      case 'equipment': return isFeatureEnabled('kit.equipment') ? <EquipmentView onBack={() => nav('home')} /> : home;
      case 'preferences': return <KitchenPreferences onBack={() => nav('home')} />;
      default: return home;
    }
  };

  return (
    <StudioShell title="Kitchen">
      {renderView()}
      <KitchenQuickAdd open={quickAdd} onOpenChange={setQuickAdd} onNavigate={(v) => { setQuickAdd(false); nav(v); }} />
      <GroceryReviewDialog open={review.open} onOpenChange={(o) => setReview((p) => ({ ...p, open: o }))} sources={review.sources} listName={review.listName} />
    </StudioShell>
  );
}