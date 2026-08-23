import React from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Award, Scale, Ruler, Camera, Smile } from 'lucide-react';

export default function ProgressView() {
  const { isFeatureEnabled } = useAppSettings();

  const showWeight = isFeatureEnabled('fit.weight');
  const showMeasurements = isFeatureEnabled('fit.measurements');
  const showPhotos = isFeatureEnabled('fit.progressPhotos');
  const showMilestones = isFeatureEnabled('fit.milestones');
  const showPRs = isFeatureEnabled('fit.personalRecords');

  const nothingEnabled = !showWeight && !showMeasurements && !showPhotos && !showMilestones && !showPRs;

  if (nothingEnabled) {
    return (
      <Card className="rounded-3xl"><CardContent className="py-10 text-center">
        <TrendingUp className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Progress tracking is optional. Enable Weight, Measurements, or Milestones in Fitness Settings when you're ready.</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-3">
      {showMilestones && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Smile className="w-4 h-4 text-primary" />
              <p className="font-heading text-sm">Qualitative Milestones</p>
            </div>
            <p className="text-xs text-muted-foreground">Celebrate how movement feels — no numbers required.</p>
            <div className="space-y-2 mt-3">
              <div className="rounded-2xl bg-accent/40 p-3">
                <p className="text-sm">"Stairs felt easier today."</p>
                <p className="text-xs text-muted-foreground mt-1">Aug 20</p>
              </div>
              <div className="rounded-2xl bg-accent/40 p-3">
                <p className="text-sm">"My shoulder movement felt smoother."</p>
                <p className="text-xs text-muted-foreground mt-1">Aug 18</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showPRs && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-primary" />
              <p className="font-heading text-sm">Personal Records</p>
            </div>
            <p className="text-xs text-muted-foreground">PRs will appear here as you log workouts with strength or cardio metrics.</p>
          </CardContent>
        </Card>
      )}

      {showWeight && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-primary" />
              <p className="font-heading text-sm">Weight</p>
            </div>
            <p className="text-xs text-muted-foreground">Weight tracking is private and optional. Log when you choose to.</p>
          </CardContent>
        </Card>
      )}

      {showMeasurements && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-primary" />
              <p className="font-heading text-sm">Body Measurements</p>
            </div>
            <p className="text-xs text-muted-foreground">Choose which measurements to track. All private by default.</p>
          </CardContent>
        </Card>
      )}

      {showPhotos && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-primary" />
              <p className="font-heading text-sm">Progress Photos</p>
            </div>
            <p className="text-xs text-muted-foreground">Photos are private. They will not appear in Today or Search.</p>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl">
        <CardContent className="py-6 text-center">
          <p className="text-xs text-muted-foreground">Progress in Fitness isn't just numbers. Every walk, stretch, and rest day counts.</p>
        </CardContent>
      </Card>
    </div>
  );
}