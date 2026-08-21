import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, ChevronLeft, Timer, Play, Pause, RotateCcw, Check, List } from 'lucide-react';
import { useRecipeTimers, formatTimer } from '@/hooks/useRecipeTimers';

export default function CookingMode({ recipe, stepIdx, setStepIdx, onExit }) {
  const { timers, start, pause, resume, reset, finish, remove } = useRecipeTimers();
  const [showIngredients, setShowIngredients] = useState(false);

  const steps = (recipe.instructions || []).filter((s) => s.text);
  const cur = steps[stepIdx];
  const ingredients = recipe.ingredients || [];
  const activeTimers = timers.filter((t) => t.recipeId === recipe.id);

  const go = (dir) => setStepIdx((i) => Math.max(0, Math.min(steps.length - 1, i + dir)));
  const stepKey = (i) => recipe.id + ':' + i;

  const timerClass = (t) => t.finished ? 'text-primary' : t.running ? 'text-primary animate-pulse' : 'text-muted-foreground';

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" className="rounded-full" onClick={onExit}><ArrowLeft className="w-5 h-5 mr-1" /> Exit</Button>
        <p className="font-heading text-sm truncate px-2">{recipe.name}</p>
        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setShowIngredients((s) => !s)}><List className="w-4 h-4 mr-1" /> Ingredients</Button>
      </div>

      {activeTimers.length > 0 && (
        <div className="px-4 py-2 space-y-1.5 border-b border-border bg-accent/40">
          {activeTimers.map((t) => (
            <div key={t.key} className="flex items-center gap-2">
              <Timer className={'w-4 h-4 ' + timerClass(t)} />
              <span className="text-xs flex-1 truncate">{t.label}</span>
              <span className={'font-mono text-sm font-medium ' + (t.finished ? 'text-primary' : '')}>{t.finished ? 'Done' : formatTimer(t.remainingSec)}</span>
              {!t.finished && (t.running
                ? <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => pause(t.key)}><Pause className="w-4 h-4" /></Button>
                : <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => resume(t.key)}><Play className="w-4 h-4" /></Button>
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => reset(t.key)}><RotateCcw className="w-3.5 h-3.5" /></Button>
              {t.finished
                ? <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(t.key)}><Check className="w-4 h-4 text-primary" /></Button>
                : <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => finish(t.key)}><Check className="w-3.5 h-3.5" /></Button>
              }
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-center max-w-lg mx-auto w-full">
        <p className="text-sm text-muted-foreground mb-3">Step {stepIdx + 1} of {steps.length}</p>
        {cur && cur.title ? <h2 className="font-heading text-2xl font-semibold mb-3">{cur.title}</h2> : null}
        <p className="text-xl leading-relaxed">{cur ? cur.text : ''}</p>
        {cur && cur.duration > 0 ? (
          <div className="mt-5">
            <Button variant="outline" className="rounded-full" onClick={() => start(stepKey(stepIdx), { label: cur.timer_label || cur.title || ('Step ' + (stepIdx + 1)), minutes: cur.duration, recipeId: recipe.id, recipeName: recipe.name })}>
              <Timer className="w-4 h-4 mr-1.5" /> Start {cur.duration} min timer
            </Button>
          </div>
        ) : null}
      </div>

      {showIngredients && (
        <div className="border-t border-border bg-card max-h-[45vh] overflow-y-auto px-6 py-4">
          <p className="font-heading text-sm font-medium mb-2">Ingredients</p>
          {ingredients.length === 0 ? <p className="text-sm text-muted-foreground">No ingredients listed.</p> : (
            <div className="space-y-1">
              {ingredients.map((ing, i) => (
                <div key={i} className="text-sm flex gap-2"><span className="text-muted-foreground w-24 shrink-0">{ing.qty} {ing.unit}</span><span>{ing.name}{ing.prep ? (', ' + ing.prep) : ''}</span></div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 p-4 border-t border-border max-w-lg mx-auto w-full">
        <Button variant="outline" className="rounded-full flex-1 h-12" disabled={stepIdx === 0} onClick={() => go(-1)}><ChevronLeft className="w-5 h-5 mr-1" /> Prev</Button>
        {stepIdx < steps.length - 1 ? (
          <Button className="rounded-full flex-1 h-12" onClick={() => go(1)}>Next <ChevronRight className="w-5 h-5 ml-1" /></Button>
        ) : (
          <Button className="rounded-full flex-1 h-12" onClick={onExit}><Check className="w-5 h-5 mr-1" /> Finish</Button>
        )}
      </div>
    </div>
  );
}