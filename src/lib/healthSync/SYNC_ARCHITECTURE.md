# Simply Her — Connected Health Sync Architecture

## INTERNAL SYNC DOCUMENTATION

This document describes the Connected Health synchronization architecture
for the Fitness & Movement Studio. It is intended for developers maintaining
or extending health provider integrations.

---

## 1. PLATFORM CAPABILITY AUDIT

**Current Runtime:** Web Application (Vite + React)

Simply Her is currently a **web application**. This has critical implications:

### Health Connect
- **Status:** UNAVAILABLE on current platform
- **Reason:** Health Connect is an Android-native on-device health interoperability
  layer. A pure web application cannot call Health Connect APIs directly.
- **Requirement:** A native Android layer (Capacitor plugin or native wrapper)
  with Health Connect SDK permissions and Android 14+ manifest declarations.
- **Future:** When Simply Her ships as a native Android app, the
  `HealthConnectProvider` adapter will be activated. The architecture is in place.

### Google Health API
- **Status:** REQUIRES CONFIGURATION
- **Reason:** Google Health API (successor to Fitbit Web API) requires server-side
  OAuth 2.0 token exchange and storage. No Google Health API connector is
  registered in this workspace.
- **Requirement:** Backend function with Google OAuth client credentials,
  webhook endpoint registration, and secure token storage via platform secrets.
- **Legacy:** Google Fit APIs (History API, Sessions API, Goals API, REST API)
  are deprecated/retiring. They are NOT used. Legacy Fitbit Web API is NOT used.

### Infrastructure
- **Webhook support:** Not deployed (requires backend endpoint)
- **Background sync:** Not available (requires native Android)
- **Secure token storage:** Available (backend functions support secrets)

---

## 2. PROVIDER ABSTRACTION

Two providers behind a common interface defined in `providerRegistry.js`:

### Health Connect Provider
- **Type:** `native_android`
- **Purpose:** Android on-device health data, interoperable mobile records
- **Platform capability key:** `healthConnect`
- **Data types:** Steps, Active Minutes, Distance, Floors, Elevation,
  Wheelchair Pushes, Active Energy, Exercise Sessions, Planned Exercise,
  Heart Rate, Resting HR, HRV, Sleep, Sleep Stages, Weight, Body Fat,
  Lean Body Mass, VO₂ Max, Speed, Cadence, Power, Hydration, Nutrition

### Google Health Provider
- **Type:** `oauth_api`
- **Purpose:** Fitbit data, Pixel Watch data, Google/Fitbit cloud account fitness
- **Platform capability key:** `googleHealth`
- **Data types:** All Health Connect types plus Heart Rate Zones

### Future Providers (architecture supports)
- Apple Health (iOS native)
- Garmin Connect
- Others

The rest of Fitness does NOT contain provider-specific `if` checks. It uses
the provider interface through `isProviderAvailable()`, `getConnectionState()`,
and the data type catalog.

---

## 3. DATA MODEL

### HealthConnection Entity
Stores per-provider connection state:
- `provider` — health_connect | google_health
- `status` — not_connected | connecting | connected | permission_needed |
  syncing | sync_failed | disconnected | unavailable
- `read_permissions` — array of data type IDs authorized for reading
- `write_permissions` — array of data type IDs authorized for writing
- `last_sync_at`, `last_successful_sync_at`, `last_error`
- `sync_cursor` — provider-specific incremental sync token
- `webhook_status` — not_configured | active | failed | unsupported
- `backfill_range` — today | 7d | 30d | 90d | 1y | all
- `auto_sync` — boolean

**OAuth tokens are NOT stored in this entity.** They use platform secrets
in backend functions (when configured).

### ExternalHealthMapping Entity
Maps Simply Her records to external provider records:
- `provider`, `data_type`, `external_id` — provider's record identity
- `simply_her_entity`, `simply_her_record_id` — Simply Her's record
- `sync_hash` — deterministic deduplication key
- `sync_direction` — imported | exported (prevents sync loops)
- `is_reconciled`, `reconciled_with` — deduplication state

### HealthSyncLog Entity
Technical audit log (not shown in normal UI):
- `provider`, `sync_type` (incremental | backfill | webhook | manual | write_back)
- `records_created`, `records_updated`, `records_skipped`, `records_deduped`
- `error_message`, `error_details`

### FitnessDaily — Source Provenance
Each daily metric now tracks its source:
- `steps_source`, `water_source`, `active_source`, `sleep_source`,
  `energy_source`, `distance_source`
- Values: `manual` | `health_connect` | `google_health` | `device` | `simply_her`
- `last_synced_at` — when external data last updated this record

---

## 4. DEDUPLICATION STRATEGY

Prevents double-counting when the same physical event appears through
multiple providers (e.g. Pixel Watch → Google Health API AND Health Connect).

### Primary Dedup: External ID Matching
- Every imported record is checked against `ExternalHealthMapping.sync_hash`
- Hash = `${provider}::${data_type}::${external_id}`
- If a mapping exists → UPDATE, never duplicate

### Cross-Provider Reconciliation
When the same event appears from different providers (different external IDs):
- Match criteria: same data type + start time within ±2 min + duration within
  ±5 min + same activity type + distance within ±5%
- Match confidence: `match` | `possible_match` | `no_match`
- Uncertain matches: flagged for user review, never silently destroyed

### Source Priority (per data type)
Different metrics have different authoritative sources:
- **Cloud account records** (workouts, sleep, heart rate, weight):
  Google Health API is authoritative (priority 3)
- **On-device aggregated daily metrics** (steps, distance, hydration):
  Health Connect is authoritative (priority 3)
- **Manual entries:** user is authoritative (priority 1, but preserved)

### Safe Daily Totals
`computeSafeDailyTotal()` does NOT sum overlapping streams blindly.
It picks the authoritative provider's value — preventing 8,000 + 8,000 = 16,000.

---

## 5. SYNC LOOP PREVENTION

A record written Simply Her → Google Health must not return via webhook
and create another Simply Her record.

- `ExternalHealthMapping.sync_direction = 'exported'` marks Simply Her-originated records
- `isReexportedRecord()` checks before importing
- Write-back only applies to Simply Her-created/manual records
- Imported data is NEVER automatically re-exported

---

## 6. PERMISSION MODEL

### Granular Permissions
User selects per-data-type Read and/or Write independently:
- READ from provider ≠ WRITE to provider
- Can read Steps without allowing Steps write-back
- Contextual requests: only request permissions when the user enables
  the corresponding feature

### Permission Categories
- Activity: Steps, Active Minutes, Distance, Floors, Elevation,
  Wheelchair Pushes, Active Energy, Total Calories
- Workouts: Exercise Sessions, Planned Exercise
- Heart: Heart Rate, Resting HR, HRV, HR Zones
- Recovery: Sleep, Sleep Stages
- Body: Weight, Body Fat, Lean Body Mass
- Performance: VO₂ Max, Speed, Cadence, Power
- Hydration: Water/Hydration
- Nutrition: Nutrition logs

### Revocation Handling
If permission is revoked externally:
- Simply Her detects the loss of access
- Stops reading/writing that data type
- Shows calm message: "Heart Rate access is no longer available."
- Does not crash, does not repeatedly nag

---

## 7. DATA TYPE AUTHORITY POLICIES

| Data Type | Authoritative Source | Notes |
|-----------|---------------------|-------|
| Steps | Health Connect | On-device aggregate |
| Active Minutes | Health Connect | On-device aggregate |
| Distance | Health Connect | On-device aggregate |
| Wheelchair Pushes | Health Connect | First-class, not buried |
| Hydration | Health Connect | Event-based |
| Exercise Sessions | Google Health | Cloud account record |
| Sleep | Google Health | Cloud account record |
| Heart Rate | Google Health | Cloud account record |
| Resting HR | Google Health | Cloud account record |
| HRV | Google Health | Cloud account record |
| Weight | Google Health | Cloud account record |
| Body Fat | Google Health | Cloud account record |

---

## 8. HIGH-FREQUENCY DATA STRATEGY

Heart rate, speed, cadence, power samples can be enormous.

- **Do NOT** naively copy millions of samples into WorkoutSession JSON arrays
- **Strategy:** Provider query on demand + summarized records + dedicated
  telemetry storage (when implemented)
- **Fitness Home:** only needs daily summary (no raw samples)
- **Workout Detail:** may query detailed HR samples for chart

---

## 9. ACCESSIBILITY INTERACTION

- Wheelchair Pushes are first-class, not buried behind Steps
- If `fit.wheelchair` is enabled and permission granted:
  wheelchair push data syncs directly
- Steps goals can be disabled while still showing external step history
- External data respects feature configuration (fit.steps disabled →
  no Step card on Home even if data is imported)
- Simple users: advanced telemetry (HRV, VO₂ max, cadence, power) is
  imported but NOT surfaced unless detail_level = advanced
- Chronically ill / low-capacity users: never shamed by imported low activity
- Rest Day: remains Rest Day even if external data shows incidental activity

---

## 10. PRIVACY

- Health data is sensitive — treated conservatively
- Imported health data is NEVER household/partner shared without separate consent
- AccessibilityProfile data is NEVER sent to providers
- Health Studio conditions/diagnoses are NEVER sent as part of Fitness sync
- Body metrics (weight, body fat) retain conservative privacy defaults:
  never on Today, never in Search
- Exercise routes are sensitive — requested only if user explicitly enables

---

## 11. DISCONNECT BEHAVIOR

- Disconnecting stops future sync
- Does NOT automatically delete historical Simply Her records
- User may choose "Remove Imported [Provider] Data" for intentional cleanup
- Manual Simply Her data is never deleted by disconnect

---

## 12. CROSS-STUDIO BOUNDARY

Fitness asks: "How does this relate to training/activity/recovery?"
Health asks: "What are my personal health records/trends?"

Shared metrics (heart rate, resting HR, SpO₂, sleep, weight) are imported
ONCE and surfaced appropriately in each Studio. No duplicate imports per Studio.

---

## 13. UNIT NORMALIZATION

- Distance: m, km, miles (display per FitnessSetting.distance_unit)
- Weight: kg, lb (display per FitnessSetting.weight_unit)
- Hydration: mL, L, oz, cups
- Original provider values are preserved; display uses FitnessSetting units

---

## 14. TIME ZONE BEHAVIOR

- External health data preserves timestamps, time zones, offsets
- Daily summaries follow local-day strategy
- Travel/time-zone changes handled carefully — no midnight UTC conversion
  moving an 11:30 PM workout to the next day

---

## 15. OFFLINE BEHAVIOR

- Simply Her remains usable offline: log workouts, water, manual activity
- Queued write-back: eligible workouts completed offline are queued
- Bounded retry/backoff when connection resumes
- No repeated duplicate external records

---

## 16. EXTERNAL DEVELOPER SETUP REQUIRED

The following is needed before actual sync can function:

### Google Health API
1. Google Cloud project with Health API enabled
2. OAuth consent screen configured
3. OAuth client IDs (web + Android)
4. Redirect URIs registered
5. Server secrets configured via `set_secrets`
6. Backend function for OAuth token exchange
7. Webhook endpoint registration (when available)
8. Privacy policy requirements met

### Health Connect (future native build)
1. Android package name registered
2. Signing certificate information
3. Health Connect manifest permissions
4. Google Play data-safety declarations
5. Native Capacitor plugin or native wrapper

### General
- Google Play data-safety declarations
- Privacy policy updates
- Testing/review requirements

---

## 16. CURRENT IMPLEMENTATION STATUS

### BUILT (Architecture complete)
- Provider abstraction (providerRegistry.js)
- Platform capability detector (capabilityDetector.js)
- Health data type catalog (28 data types, 8 categories)
- Deduplication/reconciliation logic (deduplication.js)
- HealthConnection entity (connection state model)
- ExternalHealthMapping entity (record mapping)
- HealthSyncLog entity (audit log)
- Connected Health UI (connection center with honest status)
- Provider connection cards with real status display
- Permission matrix (granular read/write per category)
- Auto-sync settings (auto_sync, sync_on_app_open, auto_write_workouts)
- Source provenance on FitnessDaily
- Feature registry integration (fit.connectedHealth replaces fit.wearable)
- Fitness Studio nav integration
- Exercise type mapping (Simply Her ↔ provider types)
- Sync loop prevention architecture
- Future provider extensibility (Apple Health, Garmin)

### NEEDS DEVELOPER CONFIGURATION
- Google Health API OAuth backend function
- Google Cloud project setup
- OAuth consent screen + client IDs
- Server secrets for token storage
- Webhook endpoint deployment

### BLOCKED BY CURRENT PLATFORM
- Health Connect SDK (requires native Android layer)
- Background sync (requires native Android)
- Actual data synchronization (requires both above)
- Webhook-driven sync (requires backend endpoint)