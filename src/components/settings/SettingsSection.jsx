import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsSection({ title, description, children, action }) {
  return (
    <Card className="rounded-3xl shadow-sm">
      {title && (
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="font-heading text-base">{title}</CardTitle>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={title ? '' : 'pt-4'}>{children}</CardContent>
    </Card>
  );
}