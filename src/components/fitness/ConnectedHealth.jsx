import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Smartphone, HeartPulse, Shield, RefreshCw, AlertCircle,
  CheckCircle2, Info, Wifi, WifiOff, Clock
} from 'lucide-react';
import { getCapabilities, getCapabilitySummary } from '@/lib/healthSync/capabilityDetector';
import { PROVIDERS, FUTURE_PROVIDERS, isProviderAvailable, getConnectionState } from '@/lib/healthSync/providerRegistry';
import { HEALTH_DATA_CATEGORIES, getDataTypesByCategory, getSourceLabel } from '@/lib/healthSync/healthDataTypes';
import { useEntityList } from '@/hooks/useEntityList';
import { useSingleton } from '@/hooks/useSingleton';
import ProviderConnectionCard from '@/components/fitness/ProviderConnectionCard';

export default function ConnectedHealth() {
  const capabilities = getCapabilities();
  const audit = getCapabilitySummary();
  const { items: connections, reload } = useEntityList('HealthConnection', {}, '-connection_updated_at');
  const { record: fitSettings, save: saveSettings } = useSingleton('FitnessSetting', { kind: 'fitness' }, {});

  const [showAudit, setShowAudit] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const getConnection = (providerId) => connections.find((c) => c.provider === providerId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">Fitness Settings</p>
        <h2 className="font-heading text-xl font-semibold">Connected Health</h2>
        <p className="text-sm text-muted-foreground mt-1">Keep your fitness data together. Bring in activity tracked by your connected apps and devices — choose exactly what Simply Her can access.</p>
      </div>

      {/* Platform Capability Audit (collapsible) */}
      <Card className="rounded-3xl shadow-sm">
        <CardContent className="p-4">
          <button
            onClick={() => setShowAudit(!showAudit)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Platform Capability</span>
            </div>
            <span className="text-xs text-muted-foreground">{showAudit ? 'Hide' : 'View'}</span>
          </button>
          {showAudit && (
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Current runtime</span>
                <span className="font-medium text-foreground">{audit.runtime}</span>
              </div>
              <div className="flex justify-between">
                <span>Health Connect</span>
                <span className="font-medium text-foreground">{audit.healthConnectStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Google Health API</span>
                <span className="font-medium text-foreground">{audit.googleHealthStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Webhook sync</span>
                <span className="font-medium text-foreground">{audit.webhookStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Background sync</span>
                <span className="font-medium text-foreground">{audit.backgroundSyncStatus}</span>
              </div>
              <p className="text-xs italic pt-2 border-t">{audit.honestAssessment}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Cards */}
      {Object.values(PROVIDERS).map((provider) => {
        const connection = getConnection(provider.id);
        const availability = isProviderAvailable(provider.id);
        return (
          <ProviderConnectionCard
            key={provider.id}
            provider={provider}
            connection={connection}
            availability={availability}
            onManage={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
            onConnectionChange={reload}
          />
        );
      })}

      {/* Permission Detail Panel */}
      {selectedProvider && (
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base">
              {PROVIDERS[selectedProvider]?.label} — Data Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getConnection(selectedProvider) ? (
              <PermissionMatrix providerId={selectedProvider} connection={getConnection(selectedProvider)} />
            ) : (
              <p className="text-sm text-muted-foreground">Connect {PROVIDERS[selectedProvider]?.label} to manage data access.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Auto-Sync Settings */}
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Sync Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Automatic Sync</p>
              <p className="text-xs text-muted-foreground">Sync connected providers automatically when supported</p>
            </div>
            <Switch
              checked={fitSettings?.auto_sync ?? false}
              onCheckedChange={(v) => saveSettings({ auto_sync: v })}
              disabled={connections.filter(c => c.status === 'connected').length === 0}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Refresh on App Open</p>
              <p className="text-xs text-muted-foreground">Check for new health data when Simply Her opens</p>
            </div>
            <Switch
              checked={fitSettings?.sync_on_app_open ?? false}
              onCheckedChange={(v) => saveSettings({ sync_on_app_open: v })}
              disabled={connections.filter(c => c.status === 'connected').length === 0}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-Share Completed Workouts</p>
              <p className="text-xs text-muted-foreground">Write Simply Her workouts to connected providers</p>
            </div>
            <Switch
              checked={fitSettings?.auto_write_workouts ?? false}
              onCheckedChange={(v) => saveSettings({ auto_write_workouts: v })}
              disabled={connections.filter(c => c.status === 'connected').length === 0}
            />
          </div>
          {connections.filter(c => c.status === 'connected').length === 0 && (
            <p className="text-xs text-muted-foreground italic pt-1">Connect a provider to enable sync settings.</p>
          )}
        </CardContent>
      </Card>

      {/* Privacy Note */}
      <Card className="rounded-3xl bg-accent/30">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• You choose exactly which categories Simply Her can read and write.</p>
              <p>• Manual logging always remains available — connecting is optional.</p>
              <p>• Disconnecting stops sync but preserves your existing Simply Her data.</p>
              <p>• Health data is never shared with household or partner features without separate explicit consent.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Providers */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium px-1 mb-2">Coming in the Future</p>
        <div className="space-y-2">
          {FUTURE_PROVIDERS.map((fp) => (
            <Card key={fp.id} className="rounded-3xl opacity-60">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{fp.label}</p>
                  <p className="text-xs text-muted-foreground">{fp.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">Future</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Permission Matrix — shows read/write toggles per data category
function PermissionMatrix({ providerId, connection }) {
  const readPerms = connection?.read_permissions || [];
  const writePerms = connection?.write_permissions || [];

  return (
    <div className="space-y-3">
      {HEALTH_DATA_CATEGORIES.map((cat) => {
        const types = getDataTypesByCategory(cat.id).filter((dt) => dt.providers[providerId]);
        if (types.length === 0) return null;
        return (
          <div key={cat.id}>
            <p className="text-xs font-medium text-muted-foreground mb-1">{cat.label}</p>
            <div className="space-y-1">
              {types.map((dt) => {
                const canRead = readPerms.includes(dt.id);
                const canWrite = writePerms.includes(dt.id);
                const hasWrite = dt.directions.includes('write');
                return (
                  <div key={dt.id} className="flex items-center justify-between py-1 text-sm">
                    <span>{dt.label}</span>
                    <div className="flex gap-3 text-xs">
                      <span className={canRead ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                        {canRead ? '✓ Read' : 'Read off'}
                      </span>
                      {hasWrite && (
                        <span className={canWrite ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                          {canWrite ? '✓ Write' : 'Write off'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}