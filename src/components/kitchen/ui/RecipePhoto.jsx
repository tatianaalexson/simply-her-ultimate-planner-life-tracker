import React, { useState } from 'react';
import { Image } from '@/components/ui/image';
import {
  Coffee, Sandwich, Utensils, Cookie, CakeSlice, ChefHat,
  GlassWater, Salad, Soup, FlaskConical,
} from 'lucide-react';
import { useKitchenTheme } from '@/lib/kitchenTheme';
import { cn } from '@/lib/utils';

// Maps a recipe category to a representative icon — used for warm, theme-aware
// placeholders when a recipe has no photo so the library never shows grey boxes.
const CATEGORY_ICONS = {
  breakfast: Coffee,
  lunch: Sandwich,
  dinner: Utensils,
  snack: Cookie,
  dessert: CakeSlice,
  baking: ChefHat,
  drink: GlassWater,
  side: Salad,
  appetizer: Soup,
  sauce: FlaskConical,
  other: Utensils,
};

export default function RecipePhoto({ recipe, className, height = 'h-40' }) {
  const { motif } = useKitchenTheme();
  const cat = recipe?.category || 'other';
  const [imgError, setImgError] = useState(false);

  if (recipe?.photo_url && !imgError) {
    return (
      <img
        src={recipe.photo_url}
        alt={recipe.name || 'Recipe'}
        onError={() => setImgError(true)}
        className={cn('w-full block object-cover', height, className)}
      />
    );
  }

  const Icon = CATEGORY_ICONS[cat] || Utensils;
  return (
    <div
      className={cn(
        'w-full relative overflow-hidden bg-gradient-to-br from-secondary/60 to-accent/40 flex items-center justify-center',
        height,
        className
      )}
    >
      <Icon className="w-9 h-9 text-primary/35" strokeWidth={1.25} />
      <span className="absolute top-2 right-2.5 text-sm opacity-50 select-none" aria-hidden>
        {motif}
      </span>
    </div>
  );
}