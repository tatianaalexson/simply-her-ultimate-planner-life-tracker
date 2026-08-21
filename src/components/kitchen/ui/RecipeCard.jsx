import React from 'react';
import { Card } from '@/components/ui/card';
import { Heart, Clock } from 'lucide-react';
import RecipePhoto from './RecipePhoto';
import StatusChip from './StatusChip';
import { cn } from '@/lib/utils';

// Image-forward recipe card. Prioritises the photo, name and a couple of quiet
// meta chips — deliberately hides notes/ingredients/full metadata.
export default function RecipeCard({ recipe, onClick, className }) {
  const time = recipe.total_time || recipe.cook_time || 0;
  return (
    <Card
      onClick={onClick}
      className={cn(
        'rounded-3xl overflow-hidden cursor-pointer border-border/60 shadow-sm',
        'hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition',
        className
      )}
    >
      <RecipePhoto recipe={recipe} height="h-32 sm:h-36" />
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-heading text-sm font-medium leading-snug line-clamp-2">
            {recipe.name}
          </p>
          {recipe.favourite && (
            <Heart className="w-4 h-4 fill-current text-primary shrink-0 mt-0.5" />
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusChip variant="neutral">{recipe.category}</StatusChip>
          {time > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" /> {time}m
            </span>
          )}
          {recipe.source_type === 'family' && <StatusChip variant="warm">Family</StatusChip>}
          {(recipe.cooked_count || 0) > 0 && (
            <span className="text-[10px] text-muted-foreground">· cooked {recipe.cooked_count}×</span>
          )}
        </div>
      </div>
    </Card>
  );
}