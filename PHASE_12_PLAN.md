# Phase 12: PWA + Offline + Polish + Final QA

## Objective

Finish the app as a factory-floor-ready production tool.

After this phase, the worker should be able to:

```text
open the deployed HTTPS app
add it to the Android home screen
open it again like a standalone app
use it after the first load even without signal
fill the daily production entry
preview the summary
generate the PNG
share it to WhatsApp when connectivity is available
```

This is the conclusion phase. It does not invent a new product surface. It closes the remaining operational gaps: installability, offline shell caching, accessibility, copy drift, edge-case QA, Lighthouse targets, README deployment instructions, and final real-phone verification.

## Prerequisite

Phases 1 through 11 must be implemented before this phase is executed.

This plan assumes the app already has:

```text
src/state/validation.ts
src/state/persistence.ts
src/components/summary/SummaryModal.tsx
src/components/summary/SummaryCard.tsx
src/utils/png.ts
src/utils/share.ts
src/components/AddPersonModal.tsx
src/components/DraftRolloverBanner.tsx
public/manifest.webmanifest
```

If the implementation lives under `app/`, apply every source path in this plan under `app/...`.

The current workspace has an `app/` implementation with earlier-phase source files and planning docs through Phase 11. Do not execute Phase 12 against `app/src` until Phases 4 through 11 have actually landed there.

## Planning Basis

This plan follows `05_phase_plan_template.md` and the project phase discipline:

- each phase is additive
- every deferred concern has a later owner
- product behavior comes from the source specs, not invention during implementation
- the final phase verifies the whole product, not only the files it edits

For this phase, these files were reviewed:

- `PHASE_ROADMAP.md` Phase 12 and Final Build Summary
- `PHASE_1_PLAN.md` through `PHASE_11_PLAN.md`
- `requirements.md` sections 24, 25, and 28
- `frontend_ui_spec.md` sections 40 through 47
- `detailed_ui_ux_design.md` sections 14, 15.6, and 15.8
- `README.md`
- current `app/package.json`, `app/vite.config.ts`, and `app/public/manifest.webmanifest`

## Estimated Output

Approximate size: 250-400 LOC plus generated icon assets and thorough QA.

Expected files created:

```text
public/icons/icon-192.png
public/icons/icon-512.png
public/icons/maskable-192.png
public/icons/maskable-512.png
src/components/UpdateAvailableToast.tsx
```

Expected files modified:

```text
package.json
package-lock.json
vite.config.ts
public/manifest.webmanifest
src/App.tsx
src/components/primitives/Toast.tsx
src/components/primitives/Sheet.tsx
src/components/summary/SummaryModal.tsx
src/styles/base.css
README.md
```

Optional files if the implementation needs explicit test coverage:

```text
src/state/validation.test.ts
src/state/selectors.test.ts
src/state/reducer.test.ts
src/state/persistence.test.ts
src/utils/png.test.ts
```

Optional dependency:

```text
vite-plugin-pwa
```

Do not modify `production_entry.html` except as a read-only reference.

## Phase Plan Integrity Audit

All phase plans from 1 through 11 are present and align with the roadmap.

The planned sequence is coherent:

```text
1  foundation and tokens
2  state scaffolding, date, shift, totals strip
3  CNC identity fields
4  CNC production fields and calculations
5  CNC add, remove, duplicate, undo
6  Burma, Repair, Notes
7  sticky action bar and preview CTA state
8  Summary Preview modal and SummaryCard DOM
9  PNG generation, download, Web Share
10 Add Person and custom people persistence
11 draft persistence, day rollover, validation pass
12 PWA, offline, polish, final QA
```

There are no unassigned V1-critical product requirements after Phase 12.

### Phase 1 Closure

Phase 1 introduced the app shell, token system, README basics, and manifest stub.

Deferred items:

```text
real PWA icons
service worker
offline caching
installability
```

Phase 12 owns all of these.

### Phase 2 Closure

Phase 2 introduced reducer state, date/shift, placeholder selectors, and live totals shell.

Deferred items:

```text
localStorage
validation UI
service worker/offline
tests
```

Phase 10 and Phase 11 now own localStorage and validation. Phase 12 owns offline and final smoke tests.

### Phase 3 Closure

Phase 3 introduced CNC identity fields.

Deferred items:

```text
required validation
people persistence
draft persistence
service worker
```

Phase 10 owns people persistence. Phase 11 owns required validation and draft persistence. Phase 12 verifies these still work offline.

### Phase 4 Closure

Phase 4 introduced CNC production fields, cycle/time/parts handling, production-hours math, and soft warnings.

Deferred items:

```text
complete validation pass
summary exclusion
persistence
PWA/offline
```

Phase 11 owns validation and summary exclusion. Phase 12 owns offline verification and calculation smoke tests.

### Phase 5 Closure

Phase 5 introduced multi-entry behavior.

Deferred items:

```text
persistence of multiple cards
validation of duplicated/partial entries
PWA/offline
```

Phase 11 owns persistence and validation. Phase 12 stress-tests 10+ and 20+ CNC entries.

### Phase 6 Closure

Phase 6 introduced Burma, Repair, and Notes.

Deferred items:

```text
final summary rendering
final validation policy
persistence
PWA/offline
```

Phase 8 and Phase 9 own summary rendering and PNG. Phase 11 owns persistence and CNC validation. Phase 12 verifies Repair and Notes remain optional and survive reload/offline use.

### Phase 7 Closure

Phase 7 introduced sticky action bar, Preview CTA state, and completeness reporting.

Deferred items:

```text
Summary modal
PNG/share
persistence
validation highlights
offline
```

Phases 8, 9, and 11 own those. Phase 12 verifies the sticky bar does not overlap controls on mobile and large-text settings.

### Phase 8 Closure

Phase 8 introduced Summary Preview and SummaryCard DOM.

Deferred items:

```text
PNG generation
share/download
full validation rendering
persistence
offline
```

Phases 9 and 11 own PNG/share and validation/persistence. Phase 12 verifies SummaryCard readability after WhatsApp compression and offline use.

### Phase 9 Closure

Phase 9 delivered the core product promise: real PNG generation and Web Share/download fallback.

Deferred items:

```text
service worker
PWA install
offline shell cache
final validation pass
final device QA
```

Phase 11 owns validation. Phase 12 owns PWA/install/offline and final Android/iOS QA.

### Phase 10 Closure

Phase 10 introduced Add Person and custom people persistence.

Deferred items:

```text
full draft persistence
day rollover
final validation pass
offline
```

Phase 11 owns draft and validation. Phase 12 verifies custom people persist offline and through standalone PWA launches.

### Phase 11 Closure

Phase 11 introduced full draft persistence, day rollover, and validation.

Deferred items:

```text
manifest completion
service worker shell cache
installability
offline-first verification
icon assets
production deployment checklist
final end-to-end QA
```

Those are exactly Phase 12's scope.

## Remaining Work Inventory

Before Phase 12, all daily workflow behavior should already exist.

The only remaining V1 work should be:

- complete PWA manifest
- add proper icons and maskable icons
- add service worker app-shell caching
- add update-available handling if using a generated service worker
- verify offline after first load
- run accessibility audit and fix issues
- run copy audit against the source docs
- run edge-case QA from `detailed_ui_ux_design.md` section 14
- run QA checklist from `frontend_ui_spec.md` section 44
- verify acceptance criteria from `frontend_ui_spec.md` section 45
- verify success criteria from `requirements.md` section 28
- run Lighthouse and fix failures
- update README with production deployment and browser support
- complete real-phone dry run

If implementation discovers missing core workflow behavior, do not hide it inside Phase 12. File it as a blocker against the earlier owning phase, then fix it in the smallest possible patch.

## Inputs

Read in this order before implementing:

1. `PHASE_11_PLAN.md` handoff notes
   - Confirms draft persistence, validation, SummaryCard filtering, and storage failure handling should already exist.
2. `PHASE_ROADMAP.md` Phase 12
   - Defines PWA manifest, service worker, accessibility, copy audit, edge cases, smoke tests, Lighthouse, and README final pass.
3. `frontend_ui_spec.md` section 44
   - Defines V1 QA checklist.
4. `frontend_ui_spec.md` section 45
   - Defines final UI acceptance criteria.
5. `frontend_ui_spec.md` section 47
   - Defines final product promise.
6. `requirements.md` section 24
   - Confirms V1 scope and what remains out of scope.
7. `requirements.md` section 28
   - Defines success criteria.
8. `detailed_ui_ux_design.md` section 14
   - Defines edge cases.
9. `detailed_ui_ux_design.md` sections 15.6 and 15.8
   - Defines what must be real and deployment requirements.
10. Current `app/package.json`, `app/vite.config.ts`, and `app/public/manifest.webmanifest`
    - Confirm current PWA scaffold and dependency state.

## What This Phase Adds

- Final PWA manifest metadata.
- 192px and 512px app icons.
- 192px and 512px maskable app icons.
- Service worker app-shell precache.
- Runtime cache for icon assets.
- `skipWaiting` and `clientsClaim` behavior if using Workbox.
- Update-available toast or equivalent low-friction refresh affordance.
- Offline-after-first-load support.
- Accessibility audit fixes.
- Reduced-motion audit fixes.
- Copy audit fixes.
- Final edge-case QA pass.
- Calculation, reducer, validation, and persistence smoke tests if a test setup exists.
- Lighthouse verification.
- README deployment and browser-support final pass.
- Real-device dry run checklist.

## What This Phase Does NOT Do

- No backend.
- No login.
- No user roles.
- No analytics.
- No history view.
- No Google Sheet sync.
- No admin person-management screen.
- No machine downtime.
- No payroll, expenses, or sales modules.
- No dark mode.
- No Hindi/Punjabi localization.
- No redesign of the workflow.
- No new router.
- No global state library.
- No second SummaryCard renderer.
- No validation rule rewrites unless Phase 11 missed a source-spec requirement.
- No changes to the PNG/share pipeline unless final QA finds a concrete bug.

## Final Product Contract

The final product promise is:

```text
A factory worker can enter the day's CNC and Burma production from a phone,
without confusion, and share a clean WhatsApp-ready production summary in
under a few minutes.
```

Phase 12 protects that promise through operational readiness:

```text
installable
offline after first load
fast enough on a mid-tier phone
accessible enough for real use
copy-clean
edge-case tested
deployable over HTTPS
```

## PWA Architecture

### Recommended Implementation

Use `vite-plugin-pwa` unless the app already has a service worker setup by the time Phase 12 is executed.

Install from the app directory:

```text
npm install -D vite-plugin-pwa
```

Then update:

```text
vite.config.ts
```

Recommended config shape:

```ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'production-entry-images',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Production Entry',
        short_name: 'Production',
        description: 'Daily CNC and Burma production entry.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#F4F5F7',
        background_color: '#F4F5F7',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
```

If using `vite-plugin-pwa` manifest generation, remove or stop linking the static manifest only if the plugin replaces it cleanly. Do not leave two conflicting manifests.

### Service Worker Registration

Add service worker registration in the app entrypoint or App shell.

Use the plugin's virtual helper if available:

```ts
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // show update available toast
  },
  onOfflineReady() {
    // optional toast: Ready offline.
  },
});
```

Do not interrupt workers with a modal update prompt.

Preferred UX:

```text
Update available. [Refresh]
```

Use the existing Toast system or a compact `UpdateAvailableToast`.

### Caching Contract

The service worker should precache:

```text
index.html
compiled JS
compiled CSS
manifest
icons
static assets
```

The app has no backend in V1. Do not add network data caching strategies for APIs that do not exist.

`localStorage` remains the source for user-entered draft data.

### Offline Behavior

After first successful load:

```text
app shell opens offline
date/shift/CNC/Burma/Repair/Notes are editable
custom people are available from localStorage
draft persistence works
summary preview opens
PNG generation works locally
download works locally
native WhatsApp share may require connectivity to complete handoff
```

If the share sheet opens while offline, do not add a custom network status system. The app can rely on the platform share outcome and existing fallback behavior.

### Icon Requirements

Create icons at:

```text
public/icons/icon-192.png
public/icons/icon-512.png
public/icons/maskable-192.png
public/icons/maskable-512.png
```

Icon direction:

```text
simple production log / factory form mark
high contrast
legible at small size
safe padding for maskable variants
uses app accent and neutral colors
no tiny text
```

The icon does not need branding beyond recognizability on a phone home screen.

## Accessibility Pass

Run a real pass across the completed app, not just static linting.

### Keyboard

Verify:

- all buttons are reachable by Tab
- chip groups are reachable and operable
- segmented controls can be changed by keyboard
- Summary modal traps focus
- Add Person modal traps focus
- Escape closes modals where appropriate
- focus returns to the trigger after modal close
- sticky action bar controls are reachable
- update toast action is reachable

### Labels

Verify every input has a proper label:

- Date
- Operator
- Machine
- Hex
- Size
- Side
- Cycle minutes
- Cycle seconds
- Time In
- Time Out
- Parts Count
- Burma 1
- Burma 2
- Burma 3
- Repair Person
- Repair Count
- Repair Note
- General Notes
- Add Person name

Use `aria-label` only where visible labels are impractical.

### Errors

Verify Phase 11 error states:

- `aria-invalid` on invalid inputs
- `aria-describedby` links to error captions
- chip/radio groups expose invalid state where practical
- toast uses `role="status"`
- blocking errors do not rely only on color

### Visual

Verify:

- contrast passes Lighthouse/axe
- focus rings are visible on every interactive element
- tap targets are at least 44px where practical
- text can grow with OS large-text settings
- no sticky footer overlap at 375px wide
- no horizontal scrolling at 320px wide
- summary image remains readable after capture

### Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Disable or reduce:

- card insertion/removal transitions
- modal transitions
- sticky bar motion
- count cross-fades
- toast motion

Do not remove all feedback for normal users. Only reduce motion when requested.

## Copy Audit

Compare visible strings against `detailed_ui_ux_design.md` section 8 and `frontend_ui_spec.md` section 41.

Keep operational copy:

```text
Operator
Machine
Hex
Size
Side
Cycle Time
Parts Count
Production Hours
Preview Summary
Generate Image
Share on WhatsApp
Download Image
Add New Person
Required
Please complete this entry.
Image ready.
Shared to WhatsApp.
```

Avoid drift into admin/dashboard language:

```text
Resource
Asset
Instance
Operational metadata
Submit payload
```

Also verify final error copy:

```text
Hex must be between 0 and 100.
Seconds should be 0 to 59.
Cycle time can't be zero.
Time Out should be after Time In.
Couldn't save draft. Finish and share before closing.
```

Use one spelling and punctuation style across the app.

## Edge Case Audit

Run the `detailed_ui_ux_design.md` section 14 edge cases.

Required checks:

- app opened at 23:55 does not auto-change date at midnight
- same-day draft restores silently
- previous-day draft prompts Resume / Start fresh
- 10+ CNC entries render normally
- 20+ CNC entries use compact SummaryCard mode if implemented by Phase 8/9
- pasted non-numeric text in number fields is stripped or safely ignored
- parts count `999999` soft-warns but allows entry
- old browser time input fallback still accepts `HH:MM` if implemented
- Web Share API absent triggers download + WhatsApp text fallback
- html2canvas failure keeps Summary modal open and offers fallback
- offline app remains functional after first load
- storage-full banner appears and editing continues
- landscape remains capped at 480px
- OS large text does not break layout

If an edge case was intentionally scoped out earlier, document it in final notes. Do not silently skip it.

## Smoke Test Plan

If a test framework exists by Phase 12, add smoke tests.

If not, do not install a full test framework only for this phase unless the implementation owner wants automated tests. In that case, use Vitest because the project is Vite-based.

Recommended install if needed:

```text
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Recommended tests:

### Calculations

- cycle 1m 0s, 60 parts -> 1.00 hour
- cycle 0m 30s, 120 parts -> 1.00 hour
- cycle 2m 15s, 80 parts -> 3.00 hours
- null cycle -> null/zero display as designed
- null parts -> null/zero display as designed
- Burma total sums all three counters

### Reducer

- `DATE_SET`
- `SHIFT_SET`
- `CNC_FIELD_SET`
- add entry
- duplicate entry
- remove entry
- undo remove
- Burma field update
- Repair field update
- Notes update
- Add Person
- state replace / reset fresh from Phase 11

Reducer tests should assert purity:

```text
same input state + same action -> same output
no localStorage calls from reducer
```

### Validation

Use the Phase 11 validation cases:

- blank default card does not count as incomplete
- partial non-blank card counts as incomplete
- complete card has no hard errors
- hex out of range
- seconds over 59
- cycle zero
- time out before time in
- parts count over 1000 soft warning
- cycle below 20 soft warning
- cycle over 600 soft warning

### Persistence

- corrupt draft JSON does not crash
- same-day draft boot restores
- previous-day draft boot creates rollover prompt state
- localStorage write failure returns failed save result
- custom people still hydrate

## Lighthouse And Browser QA

### Local Build

From `app/`:

```text
npm run lint
npm run build
npm run preview
```

The final build must have:

```text
no TypeScript errors
no ESLint errors
no production build warnings that affect behavior
```

### Lighthouse Targets

Run Lighthouse against the preview or deployed HTTPS URL.

Targets:

```text
PWA: installable
Performance: >= 85 on mid-tier Android emulation
Accessibility: >= 95
Best Practices: >= 95
```

If Performance misses due to PNG generation code in the initial bundle, consider lazy-loading the PNG utility in Summary actions. Do not prematurely refactor unless Lighthouse or real-device testing shows a problem.

### Browser Matrix

Minimum manual check:

- Android Chrome over HTTPS
- iOS Safari over HTTPS
- desktop Chrome for fallback behavior

Android Chrome is the primary target because Add to Home Screen, Web Share with files, and factory phone usage are centered there.

### Real Phone Dry Run

On an Android phone:

```text
1. open deployed HTTPS URL
2. add to home screen
3. close browser
4. open from home screen
5. turn on airplane mode
6. open app again
7. fill one complete CNC entry
8. add one incomplete CNC entry
9. add Burma counts
10. add Repair and Notes
11. refresh or kill app
12. reopen and confirm draft restore
13. preview summary
14. confirm incomplete entry is excluded
15. generate image
16. turn signal back on
17. share to WhatsApp
```

Target:

```text
non-technical worker can complete a realistic daily entry and share in under 3 minutes
```

## README Final Pass

Update `README.md` with:

- local install command
- local dev command
- typecheck/lint/build commands
- preview command
- HTTPS deployment requirement
- supported browsers
- Android Chrome primary support statement
- iOS Safari support caveats
- offline behavior statement
- Web Share API behavior
- download fallback behavior
- localStorage persistence caveat
- no-backend V1 note

Recommended browser support wording:

```text
Primary: Android Chrome 90+
Supported: iOS Safari 15+
Desktop browsers: supported for entry and download fallback; native WhatsApp/file share depends on platform support.
```

Recommended deployment wording:

```text
Deploy the static `dist/` output to an HTTPS host. HTTPS is required for service workers and native file sharing.
```

## Implementation Steps

### Step 1 - Confirm Earlier Phase Completion

Before editing Phase 12 files, verify:

```text
Summary Preview opens
PNG generation works
download fallback works
custom people persist
full draft persists
previous-day rollover prompt works
validation excludes incomplete CNC entries
```

If any item fails, fix the owning earlier-phase behavior first.

### Step 2 - Add PWA Plugin

Install and configure `vite-plugin-pwa` if no service worker system exists.

Update:

```text
package.json
package-lock.json
vite.config.ts
```

Keep the config small and explicit. Do not add a complex custom service worker unless the plugin cannot satisfy the requirements.

### Step 3 - Finalize Manifest

Update manifest metadata:

```text
name
short_name
description
start_url
scope
display
orientation
theme_color
background_color
icons
```

Make sure the manifest source is not duplicated between `public/manifest.webmanifest` and `vite.config.ts`.

### Step 4 - Add Icons

Create icon assets in `public/icons/`.

Verify:

```text
192 icon loads
512 icon loads
maskable icon passes Lighthouse
home screen icon has safe padding
```

### Step 5 - Register Service Worker

Register the generated service worker.

Add:

```text
offline ready handling
update available handling
refresh action
```

Use existing toast conventions.

### Step 6 - Verify Offline Shell

Build and preview the app.

Open it once online, then simulate offline:

```text
Chrome DevTools Application tab
Service Workers offline mode
or real phone airplane mode
```

Verify the app shell loads from cache.

### Step 7 - Accessibility Fix Pass

Audit the completed UI:

```text
keyboard
labels
aria-invalid
aria-describedby
focus traps
toast role
contrast
reduced motion
tap targets
```

Apply small targeted fixes. Do not redesign.

### Step 8 - Copy And State Audit

Compare visible strings to the source docs.

Exercise every state:

```text
empty
partial
valid
warned
errored
loading/generating
image ready
share success
share fallback
share failure
storage failure
previous-day draft
```

Fix drift.

### Step 9 - Add Or Run Smoke Tests

If test tooling exists, add tests listed above.

If no test tooling exists, run manual smoke checks and document them in completion notes.

### Step 10 - Run Build Checks

Run:

```text
npm run lint
npm run build
```

Fix all errors.

### Step 11 - Run Lighthouse

Run Lighthouse against either:

```text
local preview with service worker enabled
or deployed HTTPS preview
```

Record scores:

```text
PWA installable
Performance
Accessibility
Best Practices
```

Fix failures required by acceptance criteria.

### Step 12 - Deploy Preview And Real-Device QA

Deploy to an HTTPS static host.

Run Android Chrome and iOS Safari checks.

Do the real-phone dry run.

Keep notes of:

```text
device
browser
deployment URL
date/time tested
share behavior
offline behavior
Lighthouse scores
open issues
```

### Step 13 - README Final Pass

Update README after the actual implementation choices are known.

Do not document commands that do not exist.

### Step 14 - Final Acceptance Trace

Create a final short completion note in the implementation response mapping:

```text
requirements.md section 28
frontend_ui_spec.md section 44
frontend_ui_spec.md section 45
PHASE_ROADMAP.md Phase 12 acceptance
```

The final answer should state any remaining manual checks that could not be performed.

## Manual QA Checklist

### Basic Flow

- [ ] Open app on Android phone.
- [ ] Date auto-fills correctly.
- [ ] Morning shift selected by default.
- [ ] Add one CNC entry.
- [ ] CNC hours calculate correctly.
- [ ] Add Burma counts.
- [ ] Preview summary.
- [ ] Generate image.
- [ ] Share image.
- [ ] Download fallback works.

### Multi Entry

- [ ] Add 10 CNC entries.
- [ ] Remove one entry.
- [ ] Duplicate one entry.
- [ ] Undo remove.
- [ ] Total CNC hours updates correctly.
- [ ] Sticky action bar remains usable.
- [ ] Summary remains readable.

### Add Person

- [ ] Add a new person.
- [ ] Person appears in CNC dropdown.
- [ ] Person appears in Repair dropdown.
- [ ] Person is auto-selected in originating field.
- [ ] Blank name is blocked.
- [ ] Duplicate name is blocked.
- [ ] Name persists after reload.
- [ ] Name is available offline after first load.

### Draft Persistence

- [ ] Fill a realistic draft.
- [ ] Wait 400ms.
- [ ] Refresh page.
- [ ] Draft restores.
- [ ] Kill standalone app.
- [ ] Reopen app.
- [ ] Draft restores.
- [ ] Same-day draft restores silently.
- [ ] Previous-day draft shows Resume / Start fresh.
- [ ] Start fresh preserves custom people.

### Validation

- [ ] Missing operator shows error after Preview.
- [ ] Missing machine shows error after Preview.
- [ ] Missing size shows error after Preview.
- [ ] Seconds above 59 shows error immediately.
- [ ] Zero cycle time shows error.
- [ ] Blank count is handled.
- [ ] Time Out before Time In shows error.
- [ ] Incomplete CNC entry is excluded from SummaryCard.
- [ ] Soft warnings do not exclude complete entries.

### Summary Image

- [ ] Summary is readable after image generation.
- [ ] Long notes do not break the image.
- [ ] 10 CNC entries still fit reasonably.
- [ ] 20+ CNC entries use compact mode if implemented.
- [ ] Downloaded PNG opens on the phone.
- [ ] WhatsApp-compressed image remains readable.

### WhatsApp

- [ ] Android Chrome over HTTPS opens native share sheet with PNG attached.
- [ ] Worker can select WhatsApp group.
- [ ] iOS Safari behavior is documented.
- [ ] Download fallback works if sharing fails or is unsupported.
- [ ] Text fallback is readable.

### PWA

- [ ] Manifest loads with no browser errors.
- [ ] Icons load.
- [ ] Maskable icon passes Lighthouse.
- [ ] Add to Home Screen works on Android Chrome.
- [ ] Standalone launch uses app display mode.
- [ ] Theme/background colors match the app shell.
- [ ] App opens offline after first load.
- [ ] App remains usable offline.
- [ ] Update-available prompt works after a new deploy.

### Accessibility

- [ ] Keyboard navigation reaches every control.
- [ ] Focus ring visible on every interactive element.
- [ ] Summary modal traps focus.
- [ ] Add Person modal traps focus.
- [ ] Focus returns after modal close.
- [ ] Inputs have labels.
- [ ] Errors are associated with inputs.
- [ ] Toasts use status semantics.
- [ ] Reduced-motion mode works.
- [ ] Lighthouse Accessibility score is at least 95.

### Edge Cases

- [ ] App opened before midnight does not auto-change date at midnight.
- [ ] Non-numeric pasted values are safely handled.
- [ ] Parts count `999999` soft-warns.
- [ ] Web Share API absent falls back.
- [ ] html2canvas failure keeps modal open and offers fallback.
- [ ] localStorage failure shows draft-save banner.
- [ ] Landscape layout remains capped at 480px.
- [ ] OS large text does not break layout.
- [ ] No console errors during happy path.

## Acceptance Criteria

- [ ] PWA manifest has name, short name, description, start URL, scope, display, orientation, colors, and icons.
- [ ] 192px and 512px icons exist.
- [ ] 192px and 512px maskable icons exist.
- [ ] Service worker precaches the app shell.
- [ ] App opens offline after first load.
- [ ] App is fully usable offline except for platform-dependent WhatsApp handoff.
- [ ] Add to Home Screen works on Android Chrome.
- [ ] Standalone launch works from Android home screen.
- [ ] Existing draft persistence works in standalone mode.
- [ ] Existing custom people persistence works in standalone mode.
- [ ] Existing validation behavior still works.
- [ ] Existing PNG generation still works.
- [ ] Existing Web Share/download fallback still works.
- [ ] Lighthouse PWA installability passes.
- [ ] Lighthouse Performance is at least 85 on mid-tier Android emulation.
- [ ] Lighthouse Accessibility is at least 95.
- [ ] Lighthouse Best Practices is at least 95.
- [ ] Every QA case in `frontend_ui_spec.md` section 44 passes or has a documented reason.
- [ ] Every acceptance bullet in `frontend_ui_spec.md` section 45 passes.
- [ ] Every success criterion in `requirements.md` section 28 passes.
- [ ] Real-worker dry run completes daily entry and share in under 3 minutes.
- [ ] No console errors or warnings during a full happy-path session.
- [ ] README accurately documents build, deploy, browser support, offline behavior, and V1 limitations.

## Final Verification Matrix

| Source | Requirement | Phase Owner | Final Status |
|---|---|---:|---|
| `requirements.md` section 24 | Mobile-first form | 1-8 | Verify in Phase 12 |
| `requirements.md` section 24 | Auto-filled date | 2 | Verify in Phase 12 |
| `requirements.md` section 24 | Shift selection | 2 | Verify in Phase 12 |
| `requirements.md` section 24 | CNC multiple line items | 3-5 | Verify in Phase 12 |
| `requirements.md` section 24 | Burma counts | 6 | Verify in Phase 12 |
| `requirements.md` section 24 | Repair optional field | 6 | Verify in Phase 12 |
| `requirements.md` section 24 | Notes field | 6 | Verify in Phase 12 |
| `requirements.md` section 24 | Auto CNC hours | 4 | Verify in Phase 12 |
| `requirements.md` section 24 | Auto total CNC hours | 4, 7 | Verify in Phase 12 |
| `requirements.md` section 24 | Auto Burma total | 6, 7 | Verify in Phase 12 |
| `requirements.md` section 24 | Preview summary | 8 | Verify in Phase 12 |
| `requirements.md` section 24 | Generate PNG | 9 | Verify in Phase 12 |
| `requirements.md` section 24 | Share/download PNG | 9 | Verify in Phase 12 |
| `requirements.md` section 24 | Duplicate CNC line | 5 | Verify in Phase 12 |
| `requirements.md` section 24 | Smart default time copying | 4, 5 | Verify in Phase 12 |
| `requirements.md` section 24 | Basic validations | 11 | Verify in Phase 12 |
| `requirements.md` section 24 | Local browser save | 10, 11 | Verify in Phase 12 |
| `frontend_ui_spec.md` section 44 | Full QA checklist | 12 | Execute in Phase 12 |
| `frontend_ui_spec.md` section 45 | Final UI acceptance | 12 | Execute in Phase 12 |
| `detailed_ui_ux_design.md` section 15.6 | Real PNG/share/persistence/validation/offline/PWA | 9, 11, 12 | Verify in Phase 12 |
| `PHASE_ROADMAP.md` Phase 12 | Installable PWA and offline QA | 12 | Implement in Phase 12 |

## Implementation Risks

### Risk: Service Worker Caches Stale Builds

Workers may keep using an older bundle after deploy.

Mitigation:

```text
use generated revisioned assets
cleanup outdated caches
show update-available toast
avoid force-refresh modal
```

### Risk: PWA Works Locally But Not On Real HTTPS Host

Service workers and file sharing are sensitive to secure contexts.

Mitigation:

```text
test on deployed HTTPS URL
test Android Chrome on a physical phone
document host-specific base path if needed
```

### Risk: Offline Test Misses First-Load Requirement

The app cannot work offline before the service worker has installed and cached assets.

Mitigation:

```text
load app once online
wait for service worker ready
then test offline
```

### Risk: Accessibility Fixes Change Visual Rhythm

Late accessibility work can accidentally resize controls or alter layout.

Mitigation:

```text
prefer labels/aria/focus fixes first
keep visual changes small
verify mobile screenshots after changes
```

### Risk: Final QA Finds Earlier-Phase Bugs

Phase 12 is where all surfaces meet, so earlier bugs may appear.

Mitigation:

```text
map bug to owning phase
fix smallest affected surface
do not redesign the final workflow
rerun the final matrix after each fix
```

## Final Out-of-Scope Confirmation

These remain out of V1 even after Phase 12:

- backend database
- Google Sheet sync
- user login
- roles and permissions
- historical entry browser
- analytics
- machine downtime
- payroll
- expense tracking
- sales tracking
- admin settings
- localization
- dark mode

If these are desired later, they should start as a new roadmap after V1 is deployed and used.

## Completion Definition

Phase 12 is done only when:

```text
npm run lint passes
npm run build passes
PWA is installable
offline after first load works
draft persistence works offline
PNG generation works
share/download path works
Lighthouse targets pass or documented exception is accepted
real Android dry run passes
README reflects reality
no console errors appear in a happy-path session
```

At that point, the planned V1 is complete.

## Rationale

Every prior phase built a user-facing or workflow-critical layer. Phase 12 is deliberately operational. It makes the app trustworthy in the environment where it will actually be used: a phone, on a factory floor, with unreliable connectivity, by someone who should not need training.

The product is not complete merely because forms render and a PNG can be generated. It is complete when a worker can install it, use it offline, recover their draft, avoid obvious data mistakes, and send a readable summary to WhatsApp without thinking about the technology underneath.
