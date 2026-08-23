import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Smartphone, HeartPulse, RefreshCw, CheckCircle2, AlertCircle,
  Clock, Shield, XCircle
} from 'lucide-react';
import { getConnectionState } from '@/lib/healthSync/providerRegistry';

const ICONS = {
  smartphone: Smartphone,
  'heart-pulse': HeartPulse,
};

const COLOR_MAP = {
  green: 'text-green-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
  blue: 'text-blue-600',
  muted: 'text-muted-foreground',
};

export default function ProviderConnectionCard({ provider, connection, availability, onManage, onConnectionChange }) {
  const Icon = ICONS[provider.icon] || Smartphone;

  // Determine actual status: if unavailable on platform, show that
  const status = !availability.available
    ? 'unavailable'
    : connection?.status || 'not_connected';

  const stateInfo = getConnectionState(status);
  const colorClass = COLOR_MAP[stateInfo.color] || 'text-muted-foreground';

  const isConnected = status === 'connected';
  const isUnavailable = status === 'unavailable';

  const lastSynced = connection?.last_successful_sync_at
    ? formatTimeAgo(connection.last_successful_sync_at)
    : null;

  const dataTypesEnabled = [
    ...(connection?.read_permissions || []),
    ...(connection?.write_permissions || []),
  ];

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${provider.color === 'rose' ? 'bg-rose-50' : 'bg-blue-50'}`}>
            <Icon className={`w-5 h-5 ${provider.color === 'rose' ? 'text-rose-500' : 'text-blue-500'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-heading text-base font-semibold">{provider.label}</p>
              {/* Status indicator */}
              <div className={`flex items-center gap-1 ${colorClass}`}>
                {isConnected && <CheckCircle2 className="w-3.5 h-3.5" />}
                {isUnavailable && <XCircle className="w-3.5 h-3.5" />}
                {status === 'sync_failed' && <AlertCircle className="w-3.5 h-3.5" />}
                {status === 'syncing' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
          </div>
        </div>

        {/* Status detail */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-medium ${colorClass}`}>{stateInfo.label}</span>
          </div>

          {lastSynced && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last synced</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" /> {lastSynced}
              </span>
            </div>
          )}

          {isConnected && dataTypesEnabled.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Data enabled</span>
              <span className="text-muted-foreground text-xs">{dataTypesEnabled.length} categories</span>
            </div>
          )}

          {connection?.last_error && status === 'sync_failed' && (
            <p className="text-xs text-rose-600 mt-1">{connection.last_error}</p>
          )}
        </div>

        {/* Unavailable reason */}
        {isUnavailable && availability.reason && (
          <div className="mt-3 rounded-2xl bg-accent/40 p-3">
            <p className="text-xs text-muted-foreground">{availability.reason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {!isConnected && !isUnavailable && (
            <Button size="sm" className="rounded-full flex-1" disabled>
              {stateInfo.action || 'Connect'}
            </Button>
          )}

          {isUnavailable && (
            <Button size="sm" variant="outline" className="rounded-full flex-1" disabled>
              Not Available
            </Button>
          )}

          {isConnected && (
            <>
              <Button size="sm" variant="outline" className="rounded-full" onClick={onManage}>
                Manage
              </Button>
              <Button size="sm" variant="outline" className="rounded-full" disabled>
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Sync Now
              </Button>
            </>
          )}
        </div>

        {/* Permission rationale (shown before connection) */}
        {!isConnected && !isUnavailable && (
          <p className="text-xs text-muted-foreground italic mt-2">
            {provider.userFacingCopy.rationale}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(isoString) {
  if (!isoString) return null;
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}