# SIMPLY HER — NATIVE MOBILE FOUNDATION
## iOS-First Setup Guide & Platform Audit

---

## 1. EXISTING PLATFORM AUDIT

| # | Item | Status |
|---|------|--------|
| 1 | Framework | React 18 + Vite (ESM) |
| 2 | Build system | Vite (outputs to `dist/`) |
| 3 | Package manager | npm (package.json) |
| 4 | Backend/platform | Base44 BaaS (auth, entities, integrations, hosting) |
| 5 | Authentication | Base44 AuthProvider (email/password, Google OAuth, OTP, reset) |
| 6 | Routing | React Router v6 (BrowserRouter) |
| 7 | Environment variables | Base44 platform-managed (no .env files in source) |
| 8 | File upload/media | Base44 Core.UploadFile / UploadPrivateFile |
| 9 | Notifications | None currently (future: Capacitor local/push) |
| 10 | PWA | manifest.json exists; no service worker |
| 11 | Source control/Git | Base44 workspace; 2-way GitHub sync available |
| 12 | Builder can create native folders | **NO** — builder file access is limited to `src/`, `base44/`, and root config files |
| 13 | Shell/native code committable | **NO** — cannot create `.swift`, `.xcodeproj`, `Info.plist` from builder |
| 14 | Custom Swift in project | **NO** — not from builder; must be done locally in Xcode |
| 15 | Custom Kotlin/Java in project | **NO** — not from builder; must be done locally in Android Studio |
| 16 | Capacitor technically compatible | **YES** — Vite + React is fully compatible with Capacitor 6 |
| 17 | Builder limitations affecting native | Cannot run `npx cap add ios` — no shell access. Cannot create/compile native code. |

### Key Finding
The Base44 builder is a **web application development environment**. It does not provide shell/CLI access, macOS/Xcode, or the ability to create native project files. Capacitor npm packages are installed and configured, but **native project generation and compilation must happen on the owner's Mac using Xcode.**

---

## 2. SOURCE OWNERSHIP / PORTABILITY

- The complete application source (React/Vite code, entities, functions, workflows) lives in the Base44 workspace.
- **2-way GitHub sync** is available in the Base44 builder (Settings → GitHub). This exports the full source to a Git repository.
- The owner can clone, back up, and build the web app independently using standard `npm install && npm run build`.
- The `capacitor.config.ts` file is in the project root and will sync to Git.
- Native iOS/Android project folders (`ios/`, `android/`) will be generated locally and should be committed to Git for portability.

### What the owner should do for source portability:
1. Enable GitHub sync in Base44 builder (if not already done).
2. Clone the repo locally.
3. After running `npx cap add ios` locally, commit the `ios/` folder to Git.

---

## 3. CAPACITOR INSTALLATION STATUS

**INSTALLED (10 packages):**
- `@capacitor/core` ^6.1.0 — core runtime
- `@capacitor/cli` ^6.1.0 — CLI tool
- `@capacitor/ios` ^6.1.0 — iOS platform
- `@capacitor/android` ^6.1.0 — Android platform (architecture-ready)
- `@capacitor/status-bar` ^6.0.0 — status bar control
- `@capacitor/splash-screen` ^6.0.0 — splash screen
- `@capacitor/app` ^6.0.0 — lifecycle events
- `@capacitor/keyboard` ^6.0.0 — keyboard behavior
- `@capacitor/haptics` ^6.0.0 — haptic feedback
- `@capacitor/preferences` ^6.0.0 — native storage

**CONFIGURED:**
- `capacitor.config.ts` created at project root with:
  - appId: `com.simplyher.app` (PROPOSED)
  - appName: `Simply Her`
  - webDir: `dist`
  - StatusBar, SplashScreen, Keyboard plugin configurations
  - iOS contentInset: `always`

**NOT YET DONE (requires local Mac + Xcode):**
- `npx cap init` — can be run locally (config already exists, but this verifies)
- `npx cap add ios` — generates the native iOS Xcode project
- Building the web bundle: `npm run build` then `npx cap sync ios`
- Opening in Xcode: `npx cap open ios`

---

## 4. NATIVE COMPATIBILITY CHANGES MADE

### Safe Areas (Part IX)
- `index.html`: viewport updated to `viewport-fit=cover` (enables safe-area env() values)
- `src/index.css`: Added CSS safe-area variables (`--safe-area-top`, `--safe-area-bottom`, etc.) and utility classes
- `src/components/Layout.jsx`: Header now has `pt-[env(safe-area-inset-top)]` — content sits below the status bar/notch/Dynamic Island
- `src/components/BottomNav.jsx`: Already had `pb-[env(safe-area-inset-bottom)]` — sits above the Home indicator

### Status Bar (Part XI)
- `useNativeLifecycle` hook configures StatusBar style (Light/Dark) based on current theme
- Background color set to match app background
- Responds to light/dark mode

### Splash / Launch (Part XII)
- SplashScreen plugin configured in `capacitor.config.ts`
- Launch duration: 1500ms
- Background: white (dark mode splash will need native theme configuration later)
- `useNativeLifecycle` hook hides splash after React mounts

### App Lifecycle (Part XIV)
- `useNativeLifecycle` hook listens for `appStateChange` events
- Dispatches `simplyher:app-resumed` and `simplyher:app-backgrounded` custom events
- Other components can listen for these to refresh data, preserve state, etc.
- Active workouts, timers, and drafts survive backgrounding (React state persists)

### App Identity (Part V)
- Display name: `Simply Her`
- Product name: `Simply Her: Ultimate Planner & Life Tracker`
- **PROPOSED Bundle ID: `com.simplyher.app`** — owner must confirm domain ownership

### Keyboard (Part X)
- Capacitor Keyboard plugin configured with `resize: 'native'`
- `resizeOnFullScreen: true` — keyboard doesn't permanently break layout
- Input types should use `type="email"`, `type="number"`, `type="tel"` where appropriate (audit existing forms)

---

## 5. APPLE HEALTH / HEALTHKIT ARCHITECTURE

### AppleHealthProvider Added to Connected Health
- `apple_health` provider added to `providerRegistry.js`
- Provider type: `native_ios`
- Platform capability key: `appleHealth`
- Icon: Apple (lucide-react)
- Full read/write support declared
- Apple Health card now appears in Connected Health UI automatically

### HealthKit Native Bridge (Part XXIII)
- `src/lib/healthSync/healthKitBridge.js` created
- Uses Capacitor `registerPlugin('SimplyHerHealthKit')` — standard plugin pattern
- Clean JS API: `isAvailable()`, `requestAuthorization()`, `readSteps()`, `readWorkouts()`, `readSleep()`, `readHeartRate()`, `readBodyMetrics()`, `writeWorkout()`, `writeHydration()`, `writeBodyMetric()`
- Web fallback: all methods return "not available" gracefully
- **NATIVE SWIFT IMPLEMENTATION MUST BE CREATED IN XCODE** (see owner instructions below)

### HealthKit Type Mappings (Part XXVI)
- `src/lib/healthSync/appleHealthTypes.js` created
- Maps all Simply Her data types to HealthKit identifiers (HKQuantityTypeIdentifier, HKCategoryTypeIdentifier, HKWorkoutActivityType)
- Includes canonical units, sleep analysis values, write types

### Granular Permissions (Part XXVI)
HealthKit permissions follow user-enabled features:
- **ACTIVITY**: Steps, Distance, Flights Climbed, Wheelchair Pushes, Active Energy, Exercise Time
- **WORKOUTS**: Workouts (routes only with explicit permission)
- **CARDIOVASCULAR**: Heart Rate, Resting HR, HRV, VO₂ Max
- **RECOVERY**: Sleep, Sleep Stages
- **BODY**: Weight, Body Fat, Lean Body Mass
- **HYDRATION**: Water
- **NUTRITION**: Only if explicitly enabled

### Wheelchair Accessibility (Part XXVII)
- `wheelchair_pushes` is first-class in the data catalog with `accessibility_priority: true`
- Maps to `HKQuantityTypeIdentifierPushCount`
- Wheelchair users can configure Fitness around pushes without Steps being required
- Workout type: `HKWorkoutActivityTypeWheelchairRunPace`

### Permission Descriptions (Part XXV)
Defined in `src/lib/native/nativeConfig.js`:
- **NSHealthShareUsageDescription**: "Simply Her uses the health and fitness information you choose to share so your activity, workouts, sleep, and other enabled fitness information can appear without entering it twice."
- **NSHealthUpdateUsageDescription**: "Simply Her can add workouts, water, and other records you create to Apple Health, keeping your health information in one place."

These must be added to `Info.plist` in Xcode (see owner instructions).

### Deduplication (Part XL)
- Apple Health added to SOURCE_PRIORITY as a **peer** to Google Health
- Cloud records (workouts, sleep, heart rate, weight): `apple_health: 3, google_health: 3`
- On-device aggregates (steps, distance, hydration): `apple_health: 3, health_connect: 3`
- An iPhone Fitbit user with both Apple Health AND Google Health will not double-count

### Sync Loop Prevention (Part XXX)
- `ExternalHealthMapping.sync_direction` field prevents loops
- `isReexportedRecord()` checks if a record was originally exported from Simply Her
- Imported data is NEVER automatically re-exported

### Provenance (Part XXXIX)
- `apple_health` added to all source enums (FitnessDaily, ExternalHealthMapping)
- `source_app` and `source_device` fields on ExternalHealthMapping
- Technical IDs not exposed in normal UI

### FitnessDaily Architecture Decision (Part XXXVII)
**Decision: FitnessDaily remains as-is for now. It will NOT be restructured into a purely derived daily summary during this phase.**

Rationale:
- Existing manual FitnessDaily data must not be destroyed
- Actual HealthKit sync is not yet functional (requires native plugin)
- Restructuring before data flows is premature
- When HealthKit sync is implemented, FitnessDaily can become a derived summary calculated from individual ExternalHealthMapping records + manual entries
- The `last_synced_at` field already tracks when external data updated each record

### Hydration Architecture (Part XXXVIII)
**Decision: HydrationEntry entity NOT created yet.**

Rationale:
- Current FitnessDaily.water + water_source is sufficient for the foundation phase
- Apple Health represents water as individual dietary-water records
- A HydrationEntry entity will be justified when actual HealthKit sync is implemented
- Creating it now would be premature architecture

### HealthKit Background Updates (Part XLI)
- Architecture documented but NOT implemented
- HealthKit supports `HKObserverQuery` with background delivery
- This requires native Swift implementation
- **Foreground sync**: will work when plugin is implemented
- **Background delivery**: requires native `enableBackgroundDelivery` — future work
- **App launch/resume**: `simplyher:app-resumed` event dispatched — sync can trigger on resume

### High-Frequency Data (Part XXXVI)
- Strategy preserved: do NOT store enormous sensor streams in FitnessDaily/WorkoutSession
- Heart rate, speed, cadence, power samples queried on demand from HealthKit
- Fitness Home uses daily summaries only
- Workout Detail may request denser series when necessary

---

## 6. iOS VERSION SUPPORT (Part VII)

**Chosen minimum: iOS 15.0**

Rationale:
- Capacitor 6 requires iOS 13+
- HealthKit modern APIs require iOS 13+
- iOS 15 covers ~96%+ of active iPhones (as of 2026)
- Broad reasonable compatibility
- Not the newest iOS merely because development occurs in 2026
- Reasonable maintenance burden

---

## 7. CROSS-PLATFORM ARCHITECTURE (Parts XLIV-XLV, LXVII-LXVIII)

- **Apple Health**: iOS-native, implemented first
- **Google Health**: Cross-platform cloud provider (NOT Android-only) — activates later with OAuth backend
- **Health Connect**: Android-native — preserved, activates during Android phase
- Shared React components use the provider abstraction — no Apple-only assumptions
- Provider-specific differences live inside provider adapters

---

## 8. PRIVACY FOUNDATION (Parts LIV-LVI)

- Health data is NOT for advertising targeting, selling, or marketing profiling
- No third-party tracking/advertising SDKs introduced
- Health data never shared with household/partner features without separate consent
- AccessibilityProfile data NEVER sent to providers
- Health Studio conditions/diagnoses NEVER sent as part of Fitness sync
- Body metrics (weight, body fat) retain conservative privacy defaults

**Future requirements (not yet built):**
- Public Privacy Policy
- Apple Health disclosures
- App Store Privacy labels
- User consent flows
- Account deletion
- Imported-health-data removal
- Provider disconnect data removal

---

## 9. CURRENT BLOCKERS

1. **iOS native project not generated** — requires `npx cap add ios` on Mac with Xcode
2. **HealthKit native plugin not implemented** — requires Swift code in Xcode
3. **No real-device testing** — requires physical iPhone + Xcode + Apple ID
4. **Google Health API not configured** — requires backend OAuth setup (lower priority)
5. **No TestFlight** — requires Apple Developer Program ($99/year)

---

## 10. OWNER ACTION CHECKLIST

### ┌─────────────────────────────────────────────────────┐
### │  FREE / CAN DO NOW (no Apple Developer Program)     │
### └─────────────────────────────────────────────────────┘

#### Step 1: Install Xcode
1. Open the **App Store** on your Mac
2. Search for **Xcode**
3. Click **Install** (it's free, ~12GB download)
4. Wait for installation to complete

#### Step 2: Install Node.js (if not already installed)
1. Go to https://nodejs.org
2. Download the **LTS version**
3. Run the installer
4. Verify by opening Terminal and typing: `node --version` (should print v20+)

#### Step 3: Get the Simply Her source code
1. In the Base44 builder, go to **Settings → GitHub** (or use the export/download option)
2. If GitHub sync is available: connect your GitHub account and sync
3. Clone the repository to your Mac:
   ```
   git clone <your-repo-url> simply-her
   cd simply-her
   ```
4. If GitHub sync is NOT available: download the source as a ZIP from the builder

#### Step 4: Install dependencies
1. Open **Terminal**
2. Navigate to the project folder: `cd /path/to/simply-her`
3. Run: `npm install`

#### Step 5: Generate the iOS native project
1. In Terminal, from the project folder, run:
   ```
   npx cap add ios
   ```
2. This creates an `ios/` folder with an Xcode project
3. Then sync the web build:
   ```
   npm run build
   npx cap sync ios
   ```

#### Step 6: Open in Xcode
1. Run: `npx cap open ios`
2. Xcode opens with the Simply Her project

#### Step 7: Configure signing (FREE Apple ID)
1. In Xcode, click the project name in the left sidebar
2. Go to the **Signing & Capabilities** tab
3. Check **Automatically manage signing**
4. Under **Team**, select your **Personal Team** (your Apple ID)
   - If you don't see it: Xcode → Settings → Accounts → Add your Apple ID
5. Xcode may show a warning about the bundle ID — this is OK for development

#### Step 8: Set the iOS deployment target
1. In Xcode, click the project name
2. Go to **Build Settings**
3. Search for **iOS Deployment Target**
4. Set it to **iOS 15.0**

#### Step 9: Connect your iPhone
1. Connect your iPhone to your Mac with a USB cable
2. On your iPhone: Settings → Privacy & Security → Developer Mode → Enable
3. Trust the computer when prompted

#### Step 10: Run on your iPhone
1. In Xcode, select your iPhone from the device dropdown (top center)
2. Click the **Play** button (or press Cmd+R)
3. The app builds and installs on your iPhone
4. On your iPhone: Settings → General → VPN & Device Management → Trust your developer certificate
5. The Simply Her app should now open on your iPhone

### ┌─────────────────────────────────────────────────────┐
### │  HEALTHKIT SETUP (after app runs on iPhone)         │
### └─────────────────────────────────────────────────────┘

#### Step 11: Add HealthKit capability in Xcode
1. In Xcode, select the project → **Signing & Capabilities**
2. Click **+ Capability**
3. Search for **HealthKit** and add it
4. (Optional) Also add **HealthKit Background Delivery** if you want background updates

#### Step 12: Add HealthKit permission descriptions to Info.plist
1. In Xcode, open `ios/App/App/Info.plist`
2. Right-click → Add Row
3. Add key: `NSHealthShareUsageDescription`
   - Value: `Simply Her uses the health and fitness information you choose to share so your activity, workouts, sleep, and other enabled fitness information can appear without entering it twice.`
4. Add another row: `NSHealthUpdateUsageDescription`
   - Value: `Simply Her can add workouts, water, and other records you create to Apple Health, keeping your health information in one place.`

#### Step 13: Implement the SimplyHerHealthKit native plugin
This requires Swift code in the iOS project. The JS interface is already created in `src/lib/healthSync/healthKitBridge.js`. The native Swift implementation needs to:
1. Create a Capacitor plugin class `SimplyHerHealthKitPlugin` in Swift
2. Implement methods: `isAvailable()`, `requestAuthorization()`, `readSteps()`, `readWorkouts()`, `readSleep()`, `readHeartRate()`, `writeWorkout()`, etc.
3. Register the plugin in the Capacitor configuration
4. Reference: `src/lib/healthSync/appleHealthTypes.js` for HealthKit type identifiers
5. See Capacitor Plugin Guide: https://capacitorjs.com/docs/plugins

### ┌─────────────────────────────────────────────────────┐
### │  REQUIRES APPLE DEVELOPER PROGRAM ($99/year)       │
### └─────────────────────────────────────────────────────┘

#### For TestFlight & App Store distribution:
1. Join the Apple Developer Program at https://developer.apple.com/programs/
2. Pay the $99/year fee
3. In Xcode, change Team from Personal Team to your Developer Program team
4. Register the Bundle ID (`com.simplyher.app`) in App Store Connect
5. Archive the app: Xcode → Product → Archive
6. Upload to App Store Connect
7. Invite yourself to TestFlight
8. Install the TestFlight app on your iPhone
9. Install Simply Her beta from TestFlight

### ┌─────────────────────────────────────────────────────┐
### │  ONLY NEEDED LATER                                  │
### └─────────────────────────────────────────────────────┘

- Google Cloud project for Google Health API
- Google Health API OAuth backend function
- Android Studio + Android Capacitor setup
- Health Connect native plugin (Android)
- Google Play Console
- Production App Store submission
- Sign in with Apple (required if third-party login used at App Store)
- Associated Domains for universal links
- Push notification certificates
- Privacy Policy URL
- App Store Privacy labels

---

## 11. WHAT CAN WAIT UNTIL LATER

- Google Health API activation (after iOS is tested)
- Android native shell (after iOS is stable)
- Health Connect implementation (Android phase)
- Sign in with Apple (needed before App Store submission if third-party login exists)
- TestFlight workflow (needs Apple Developer Program)
- Deep link / universal link implementation
- Push notifications
- Background health sync delivery
- HydrationEntry entity (when actual HealthKit sync works)
- FitnessDaily restructuring to derived summary
- Privacy Policy publication
- App Store Privacy labels
- Crash/error diagnostics (no invasive analytics now)