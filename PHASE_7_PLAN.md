# Phase 7: Sticky Action Bar + Scroll Choreography

## Objective

Add the always-available finishing action for the production entry screen.

After this phase, the worker should always see:

```text
Total CNC
14.83 hrs                  [ Preview Summary ]
```

at the bottom of the screen while scrolling through the form.

This phase also locks the CTA states before the Summary Modal exists:

```text
empty form      -> disabled-looking CTA, tap shows "Add an entry first."
valid data      -> enabled Preview Summary CTA
incomplete CNC  -> enabled Preview Summary CTA with warning glyph
scrolled page   -> sticky bar and Live Totals gain shadow-md
```

Phase 7 is the handoff from "data entry form" to "finish and preview flow".

## Prerequisite

Phases 1, 2, 3, 4, 5, and 6 must be implemented before this phase is executed.

This plan assumes the app already has:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/state/StateContext.tsx
src/components/LiveTotalsStrip.tsx
src/components/cnc/CncSection.tsx
src/components/BurmaCard.tsx
src/components/RepairCard.tsx
src/components/NotesCard.tsx
src/components/primitives/Toast.tsx
```

If the implementation lives under `app/`, apply every source path in this plan under `app/src/...`.

The current workspace has an `app/` implementation with Phase 2/3-era files and planning docs through Phase 6. Do not execute Phase 7 against `app/src` until Phases 4, 5, and 6 have actually landed there.

## Planning Basis

This plan follows `05_phase_plan_template.md`, which requires each executable phase plan to define:

- objective
- estimated output
- inputs
- what the phase adds
- what the phase does not do
- implementation steps
- acceptance criteria
- notes / rationale

It also follows `03_phase_roadmap_standard.md`, which says every phase should be additive, visible, scoped, and based on source documents rather than invented behavior.

For this phase, the source documents and older phase files were reviewed in detail:

- `requirements.md` sections 4 and 5
- `frontend_ui_spec.md` sections 28 and 29
- `detailed_ui_ux_design.md` sections 3.3, 3.5, 4.4, 5.1.5, 5.2, 6.6, 6.7, 7.1, 7.2, 7.3, 8.4, 8.5, 12.2, 12.3, 13, and 15.5
- `PHASE_ROADMAP.md` Phase 7
- `PHASE_1_PLAN.md` shell, token, safe-area, and scroll boundaries
- `PHASE_2_PLAN.md` Live Totals Strip and `ui.incompleteHighlights` state setup
- `PHASE_3_PLAN.md` CNC card incomplete state and identity fields
- `PHASE_4_PLAN.md` CNC production validation and live totals cross-fade
- `PHASE_5_PLAN.md` CNC add/remove/duplicate, blank detection, empty CNC state, and Toast primitive
- `PHASE_6_PLAN.md` all-input surface and Phase 7 handoff notes
- `production_entry.html` sticky bar / toast reference, as reference only

## Estimated Output

Approximate size: 250-350 LOC.

Expected files created:

```text
src/components/StickyActionBar.tsx
```

Optional files created, depending on existing patterns:

```text
src/hooks/useIntersectionShadow.ts
src/hooks/useToastState.ts
```

Expected files modified:

```text
src/state/selectors.ts
src/components/LiveTotalsStrip.tsx
src/components/primitives/Toast.tsx
src/components/cnc/CncSection.tsx
src/App.tsx
src/styles/base.css
```

`src/components/cnc/CncSection.tsx` only needs modification if Phase 5 kept its remove-undo toast local and Phase 7 needs to promote to one app-level toast host.

Do not modify `production_entry.html` except as a read-only behavior reference. Do not remove or rewrite existing planning documents.

## Seamless Continuity Review

Phase 7 must preserve the work already planned in Phases 1-6.

### From Phase 1

Keep the mobile app shell intact:

- max-width stays the same
- page padding stays token-based
- no layout redesign
- no route changes
- no landing page
- no PWA/offline work

The sticky bar should use the existing tokens:

```text
bg-card
border-soft
shadow-md
accent-600
text-inverse
radius 14
safe-area inset
```

### From Phase 2

Phase 2 established:

```text
Header
DateShiftCard
LiveTotalsStrip
state context
selectors
ui.incompleteHighlights
```

Phase 7 should keep `LiveTotalsStrip` in normal document flow. It may gain an elevated shadow prop, but it must not become sticky.

Do not use `ui.incompleteHighlights` yet for card warning banners. Phase 11 owns the final validation/highlight pass.

### From Phase 3

Phase 3 made CNC cards visibly incomplete until required identity fields are present.

Phase 7 should use selector-level completeness, not visual card text, to determine CTA warning state.

Do not alter CNC card layout or field placement.

### From Phase 4

Phase 4 made CNC production hours real.

Phase 7 should reuse:

```text
entryProductionHours
totalCncHours
time validation helpers if they exist
number cross-fade if it exists
```

Do not rewrite the production-hours formula.

Soft cycle-time warnings do not make an entry incomplete. Hard validation does.

### From Phase 5

Phase 5 made CNC entries repeatable and allowed all entries to be removed.

Phase 7 must not use raw `cncEntryCount` to decide whether the CTA is disabled, because these states are different:

```text
one blank default CNC card
zero CNC cards after remove-all
one incomplete but non-blank CNC card
one valid CNC card
Burma-only production
```

Use a real completeness report and Burma total.

Phase 5 also introduced the reusable Toast primitive. Reuse it. Do not redesign it.

### From Phase 6

Phase 6 completed the input surface:

```text
CNC
Burma
Repair
Notes
```

Phase 7 should treat Burma as previewable production data.

Repair and Notes are optional context. Repair/Notes alone should not enable the Preview CTA if there is no CNC data and no Burma count.

## Inputs

Read in this order before implementing:

1. `PHASE_6_PLAN.md` handoff notes
   - Confirms all V1 input cards are on screen.
   - Confirms real CNC hours, CNC entry count, and Burma total exist.
   - Confirms Toast exists from Phase 5.
2. `PHASE_ROADMAP.md` Phase 7
   - Defines the exact component, selector, CTA states, scroll shadows, and acceptance criteria.
3. `requirements.md` section 4
   - Confirms the app needs a sticky submit/preview button at bottom to reduce scrolling confusion.
4. `requirements.md` section 5
   - Confirms the high-level flow: user enters production, then taps Preview Summary.
5. `frontend_ui_spec.md` section 28
   - Defines Sticky Bottom Action Bar content and behavior.
   - Recommends allowing preview while warning about incomplete required fields.
6. `frontend_ui_spec.md` section 29
   - Defines required CNC fields and validation philosophy.
7. `detailed_ui_ux_design.md` section 3.3
   - Defines bottom scroll reserve so the action bar does not overlap the last card.
8. `detailed_ui_ux_design.md` section 3.5
   - Defines `shadow-md` assignment and IntersectionObserver requirement.
9. `detailed_ui_ux_design.md` section 4.4
   - Confirms only the action bar is sticky at bottom.
   - Confirms Live Totals is not sticky in V1.
10. `detailed_ui_ux_design.md` section 5.1.5
    - Defines Live Totals Strip visual states and cross-fade behavior.
11. `detailed_ui_ux_design.md` section 5.2
    - Defines Sticky Action Bar anatomy, CTA states, and narrow-screen fallback.
12. `detailed_ui_ux_design.md` section 6.6
    - Defines Toast slot positioning and one-toast-at-a-time behavior.
13. `detailed_ui_ux_design.md` section 6.7
    - Defines primary button styling and focus/press states.
14. `detailed_ui_ux_design.md` section 7.1
    - Defines CNC entry card states.
15. `detailed_ui_ux_design.md` section 7.2
    - Defines Sticky Action Bar states.
16. `detailed_ui_ux_design.md` section 12.3
    - Defines hard validation vs soft warning.
17. `detailed_ui_ux_design.md` section 13
    - Defines workflow choreography: sticky CTA disabled at open, enabled after production data.
18. `detailed_ui_ux_design.md` section 15.5
    - Confirms deeper validation timing belongs to later validation work.

## What This Phase Adds

- Sticky bottom action bar.
- Running CNC total in the sticky bar.
- Preview Summary CTA.
- Disabled-looking CTA state for empty production.
- Disabled CTA tap toast: `Add an entry first.`
- Warning CTA state when incomplete CNC entries exist.
- `cncEntryCompletenessReport(state)` selector.
- `hasPreviewableProductionData(state)` selector or equivalent helper.
- App-level scroll shadow state using IntersectionObserver.
- `shadow-md` choreography for Sticky Action Bar.
- `shadow-md` choreography for Live Totals Strip without making it sticky.
- Page bottom padding reserve so the sticky bar never covers the Notes card.
- Toast positioning updated to sit above the sticky action bar.

## What This Phase Does NOT Do

- No Summary Modal.
- No Summary Card DOM.
- No PNG generation.
- No WhatsApp sharing.
- No localStorage persistence.
- No day-rollover prompt.
- No Add Person modal.
- No card warning banners.
- No missing-field red borders on Preview tap.
- No filtering incomplete entries for summary.
- No changes to CNC add/remove/duplicate behavior.
- No changes to Burma, Repair, or Notes fields.
- No new routing.

## State And Selector Plan

## `cncEntryCompletenessReport`

Add to:

```text
src/state/selectors.ts
```

Required roadmap shape:

```ts
export function cncEntryCompletenessReport(
  state: ProductionEntryState
): { valid: number; incomplete: number }
```

It may return additional fields if useful:

```ts
type CncEntryCompletenessReport = {
  valid: number;
  incomplete: number;
  blank: number;
  total: number;
};
```

But all callers should be able to rely on at least:

```text
valid
incomplete
```

### Complete CNC Entry Definition

A CNC entry is valid/complete when all hard-required fields are valid:

```text
operator is not blank
machine is M1-M8
hex is a number between 0 and 100
size is not blank
side is 1 or 2
cycle time is greater than 0 seconds
cycle seconds are between 0 and 59
timeIn is present
timeOut is present
timeOut is after timeIn
partsCount is greater than 0
entryProductionHours(entry) is not null
```

Soft warnings do not make an entry incomplete:

```text
cycle time below 20 seconds
cycle time above 600 seconds
hours greater than shift window
parts count above 1000
```

Those remain soft warnings from Phase 4 / future validation work.

### Blank CNC Entry Definition

Do not count blank/default CNC cards as incomplete.

Reuse the Phase 5 helper if it exists:

```ts
isCncEntryBlankForRemoval(entry, state)
```

If that helper is too removal-specific, create a selector-level helper:

```ts
export function isCncEntryBlank(entry: CncEntry, state: ProductionEntryState): boolean
```

The definition should match Phase 5 blank/default behavior:

```text
identity fields empty
production fields empty
times are untouched shift defaults
side is only default value
```

This prevents the initial blank card from creating a warning CTA at app open.

### Incomplete CNC Entry Definition

An entry is incomplete when:

```text
not blank
not valid
```

Examples:

```text
operator selected but no machine        -> incomplete
cycle time filled but no parts count    -> incomplete
parts count filled but identity missing -> incomplete
touched time with otherwise blank card  -> incomplete
```

## Previewable Data Selector

Add:

```ts
export function hasPreviewableProductionData(state: ProductionEntryState): boolean
```

Recommended behavior:

```ts
const report = cncEntryCompletenessReport(state);

return (
  report.valid > 0 ||
  report.incomplete > 0 ||
  totalBurma(state) > 0
);
```

Do not treat Repair or Notes alone as previewable production data.

Reason:

- Repair and Notes are optional context.
- The summary exists to report production.
- Phase 6 explicitly prepared Burma-only production as valid preview data.

## CTA State Selector

Optional but recommended:

```ts
export type PreviewCtaState = 'disabled' | 'warning' | 'ready';

export function previewCtaState(state: ProductionEntryState): PreviewCtaState {
  const report = cncEntryCompletenessReport(state);
  const hasData = hasPreviewableProductionData(state);

  if (!hasData) return 'disabled';
  if (report.incomplete > 0) return 'warning';
  return 'ready';
}
```

This keeps `StickyActionBar` simple and prevents duplicated CTA state logic.

## Component Plan

## `StickyActionBar`

Create:

```text
src/components/StickyActionBar.tsx
```

Recommended props:

```ts
type StickyActionBarProps = {
  totalCncHours: number;
  ctaState: 'disabled' | 'warning' | 'ready';
  elevated: boolean;
  onPreview: () => void;
  onEmptyTap: () => void;
};
```

Alternative:

- The component may read state directly from context.
- Still keep `onPreview` and `onEmptyTap` as props so Phase 8 can wire the modal cleanly.

### Layout

Visual anatomy:

```text
Total CNC
14.83 hrs                  [ Preview Summary ]
```

Rules from design:

- fixed bottom
- height 72px plus safe-area inset
- background `bg-card`
- top border `border-soft`
- `shadow-md` only when elevated
- full viewport width background
- inner content max-width matches app column
- content padded `space-4` left/right
- left block:
  - label `Total CNC`
  - value `14.83 hrs`
- right CTA:
  - label `Preview Summary`
  - height 48
  - padding `0 20px`
  - radius 14
  - weight 600
  - accent fill
  - inverse text

Recommended structure:

```tsx
<div className="fixed inset-x-0 bottom-0 z-40 ...">
  <div className="mx-auto flex max-w-[480px] items-center justify-between px-4 ...">
    <div>...</div>
    <button type="button">Preview Summary</button>
  </div>
</div>
```

### Safe Area

Use:

```css
padding-bottom: env(safe-area-inset-bottom);
min-height: calc(72px + env(safe-area-inset-bottom));
```

Do not rely only on `bottom: 0` without safe-area padding.

### Narrow Screens

For screens below 340px:

1. First reduce CTA horizontal padding.
2. If still cramped, stack the total block under the CTA.

Do not let text overflow or overlap.

Use responsive classes or a tiny CSS media query.

## CTA Behavior

### Disabled-Looking State

Trigger:

```text
hasPreviewableProductionData(state) === false
```

Visual:

```text
accent button at 30% opacity
no shadow
```

Behavior:

```text
tap -> toast "Add an entry first."
```

Important implementation detail:

Do not use the native `disabled` attribute if the button must show a toast on tap.

Use:

```tsx
aria-disabled={ctaState === 'disabled'}
```

and branch inside `onClick`.

Keyboard activation should show the same toast.

### Ready State

Trigger:

```text
hasPreviewableProductionData(state) === true
cncEntryCompletenessReport(state).incomplete === 0
```

Visual:

```text
Preview Summary
```

Behavior in Phase 7:

```text
call onPreview()
```

Since Phase 8 owns the Summary Modal, `onPreview` may be a placeholder callback in Phase 7.

Do not show a modal in Phase 7.

Do not show a fake summary.

Do not log to console.

### Warning State

Trigger:

```text
hasPreviewableProductionData(state) === true
cncEntryCompletenessReport(state).incomplete > 0
```

Visual:

```text
[warning glyph] Preview Summary
```

Use the warning glyph/icon pattern already used by the project. If the codebase has no icon system, use simple text/glyph styling from the design source.

Behavior in Phase 7:

```text
call onPreview()
```

Do not turn on card warning banners yet.

Do not set `state.ui.incompleteHighlights` yet unless the implementation already introduced that as part of Preview behavior in an earlier phase. The roadmap defers the full validation/highlight pass to Phase 11.

Phase 8 will wire this same `onPreview` path to open the Summary Modal.

## Toast Plan

Phase 5 introduced:

```text
src/components/primitives/Toast.tsx
```

Phase 7 needs a toast for:

```text
Add an entry first.
```

### One Toast Slot

The design requires:

```text
at most one toast at a time
new toast replaces existing
role="status"
```

If Phase 5 already promoted toast handling to `App`, reuse it.

If Phase 5 kept undo toast local inside `CncSection`, promote toast state to the nearest shared owner now:

```text
App
```

Recommended app-level shape:

```ts
type ToastState = {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs: number;
};
```

App owns:

```ts
showToast(toast: Omit<ToastState, 'id'>): void
dismissToast(): void
```

Then:

- `StickyActionBar` uses it for disabled CTA.
- `CncSection` can use it for remove undo if Phase 5's local toast needs consolidation.

Do not redesign `Toast`. Only change ownership if needed to preserve a single slot.

### Disabled CTA Toast

Payload:

```ts
showToast({
  message: 'Add an entry first.',
  durationMs: 3000,
});
```

No action button.

If an undo toast is visible and the disabled CTA toast fires, the new toast replaces the old one. This matches the design rule.

### Toast Position With Sticky Bar

Phase 5 placed toast above the bottom safe area.

Phase 7 must move it above the sticky action bar:

```css
bottom: calc(72px + env(safe-area-inset-bottom) + 12px);
```

Use the real bar height if the implementation uses a token or CSS variable.

The toast must never overlap the CTA.

## Scroll Shadow Plan

The design asks for IntersectionObserver rather than scroll-event guessing.

Create a small hook or component-local logic:

```ts
function useIntersectionShadow(): {
  topSentinelRef: RefObject<HTMLDivElement>;
  elevated: boolean;
}
```

or:

```ts
function useSentinelPassed(): [RefObject<HTMLDivElement>, boolean]
```

Keep it small. Do not add a library.

### Sticky Bar Shadow

The sticky bar gets `shadow-md` only after the page has scrolled.

Recommended:

```text
place a 1px sentinel near the top of the scroll content
observe it
when it is no longer intersecting, elevated = true
```

Acceptance wording:

```text
Shadow appears on bar only when scrollY > 0.
```

The sentinel should approximate this:

- at page top: no shadow
- after small scroll: shadow appears
- back at top: shadow disappears

### Live Totals Shadow

The Live Totals Strip remains in normal document flow.

It may gain `shadow-md` when the page has scrolled enough for content to pass under its top edge, but it must not become sticky.

Implementation options:

1. Pass the same `pageScrolled` boolean to `LiveTotalsStrip`.
2. Add a separate sentinel immediately before Live Totals and pass `totalsElevated`.

Preferred for accuracy:

```text
separate sentinel before LiveTotalsStrip
```

Acceptable for simplicity:

```text
same pageScrolled boolean
```

Do not use this as an excuse to make Live Totals fixed or sticky.

## Page Bottom Padding

The sticky action bar must never cover the Notes card or last focusable field.

Update the main scroll container bottom padding.

Recommended:

```css
padding-bottom: calc(72px + env(safe-area-inset-bottom) + 56px);
```

Where:

```text
72px = action bar height
56px = design space-14 bottom reserve
```

If the app already has bottom padding for future sticky bar, verify it is enough after the real bar is rendered.

Manual test:

- scroll to bottom
- Notes textarea bottom edge is visible above the sticky bar
- focused Notes textarea is not hidden by the sticky bar

## Live Totals Strip Update

Update:

```text
src/components/LiveTotalsStrip.tsx
```

Add prop:

```ts
type LiveTotalsStripProps = {
  elevated?: boolean;
};
```

Behavior:

- default `elevated = false`
- when true, apply `shadow-md`
- keep existing values and cross-fade behavior
- keep normal flow
- do not make it sticky

If `LiveTotalsStrip` currently reads state directly from context, keep that pattern. Only add the visual prop.

## App Composition

Update:

```text
src/App.tsx
```

Responsibilities after Phase 7:

- own or coordinate the single toast slot
- own scroll shadow sentinels, or call the hook that owns them
- render `StickyActionBar`
- pass `elevated` to `LiveTotalsStrip`
- pass `showToast` to `StickyActionBar`
- preserve all Phase 6 cards

Expected layout:

```tsx
<ProductionEntryProvider>
  <ProductionEntryApp />
</ProductionEntryProvider>
```

Inside `ProductionEntryApp`:

```tsx
<main ...>
  <Header />
  <div ref={pageTopSentinelRef} aria-hidden />
  <DateShiftCard />
  <div ref={liveTotalsSentinelRef} aria-hidden />
  <LiveTotalsStrip elevated={liveTotalsElevated} />
  <CncSection ... />
  <BurmaCard />
  <RepairCard />
  <NotesCard />
</main>

<StickyActionBar
  totalCncHours={totalCncHours(state)}
  ctaState={previewCtaState(state)}
  elevated={pageScrolled}
  onPreview={handlePreview}
  onEmptyTap={handleEmptyPreviewTap}
/>

{toast && <Toast ... />}
```

If `Toast` must be inside the provider to access context, keep it there. It only needs app-level ownership, not global window state.

## Implementation Steps

## Step 1 - Confirm Phase 6 Baseline

Verify these files exist:

```text
src/components/BurmaCard.tsx
src/components/RepairCard.tsx
src/components/NotesCard.tsx
src/components/primitives/Toast.tsx
```

Verify:

- CNC section supports add/remove/duplicate/undo.
- Burma total updates in Live Totals.
- Repair and Notes are optional and editable.
- Toast primitive supports message-only toast.

If these are missing, implement earlier phases first.

## Step 2 - Add Completeness Helpers

Update:

```text
src/state/selectors.ts
```

Add helpers:

```ts
isCncEntryComplete(entry, state)
isCncEntryBlank(entry, state)
cncEntryCompletenessReport(state)
hasPreviewableProductionData(state)
previewCtaState(state)
```

Only export the helpers that components need.

Keep selectors pure.

Do not set UI state inside selectors.

## Step 3 - Verify Empty State Semantics

Test these selector cases before building UI:

```text
initial blank CNC card, Burma 0        -> disabled
zero CNC entries, Burma 0              -> disabled
zero CNC entries, Burma 500            -> ready
one valid CNC entry, Burma 0           -> ready
one incomplete non-blank CNC, Burma 0  -> warning
one valid + one incomplete CNC         -> warning
one blank CNC + Burma 500              -> ready
Repair only                            -> disabled
Notes only                             -> disabled
```

This is the most important logic in the phase.

## Step 4 - Create `StickyActionBar`

Create:

```text
src/components/StickyActionBar.tsx
```

Implement:

- fixed bottom layout
- safe-area support
- running CNC total
- Preview Summary button
- disabled-looking state
- warning state
- elevated shadow state
- narrow-screen fallback
- accessible button behavior

Do not wire modal behavior.

## Step 5 - Promote Toast Ownership If Needed

If Phase 5 already has one app-level toast host:

- reuse it

If Phase 5 has a local `CncSection` undo toast:

1. Move toast state to `App`.
2. Pass `showToast` into `CncSection`.
3. Keep undo restore callback behavior intact.
4. Pass `showToast` or `onEmptyTap` into `StickyActionBar`.
5. Render one `Toast` component from `App`.

Do not change toast visuals except its bottom offset above the sticky bar.

## Step 6 - Add Scroll Sentinel Logic

Implement IntersectionObserver logic.

Recommended:

```text
pageTopSentinel -> StickyActionBar elevated
liveTotalsSentinel -> LiveTotalsStrip elevated
```

Rules:

- no shadow at top of page
- shadow appears after scrolling down
- shadow disappears when returning to top
- cleanup observer on unmount
- guard against `IntersectionObserver` being unavailable

Fallback if unavailable:

```text
elevated = false
```

Do not add a window scroll listener unless absolutely necessary.

## Step 7 - Update `LiveTotalsStrip`

Add `elevated` prop.

When elevated:

```text
shadow-md
```

When not elevated:

```text
existing shadow/resting style
```

Do not change:

- labels
- values
- formatting
- cross-fade
- grid layout

## Step 8 - Update App Layout

Update:

```text
src/App.tsx
```

Add:

```text
StickyActionBar
toast host
sentinels
bottom padding reserve
```

Keep card order from Phase 6:

```text
CNC
Burma
Repair
Notes
```

Do not move Live Totals below CNC.

## Step 9 - Wire CTA Clicks

Disabled state:

```text
tap -> showToast("Add an entry first.", 3000)
```

Ready state:

```text
tap -> onPreview()
```

Warning state:

```text
tap -> onPreview()
```

For Phase 7, `onPreview` can be a placeholder callback that does nothing visible. Phase 8 will replace it with:

```text
open SummaryModal
```

Do not show a temporary alert or fake modal.

## Step 10 - Verify No Phase 8 Leakage

Before finishing, confirm this phase did not add:

- `SummaryModal`
- `SummaryCard`
- `Sheet`
- `html2canvas`
- Generate Image button
- Share buttons
- modal focus trap

Those belong to Phases 8 and 9.

## Step 11 - Run Checks

Run from the app directory:

```bash
npm run lint
npm run build
npm run dev
```

If the app lives under `app/`, run:

```bash
cd app
npm run lint
npm run build
npm run dev
```

Manual browser checks are required for fixed positioning, safe-area spacing, and scroll shadows.

## Data Flow

Sticky bar total:

```text
state.cncEntries
-> totalCncHours(state)
-> StickyActionBar total
```

CTA disabled:

```text
state
-> cncEntryCompletenessReport(state)
-> totalBurma(state)
-> hasPreviewableProductionData(state)
-> previewCtaState(state) === "disabled"
-> tap shows toast
```

CTA warning:

```text
state
-> cncEntryCompletenessReport(state).incomplete > 0
-> previewCtaState(state) === "warning"
-> button renders warning glyph
-> tap calls onPreview
```

Scroll shadow:

```text
sentinel leaves viewport
-> elevated = true
-> StickyActionBar shadow-md
-> LiveTotalsStrip shadow-md
```

## Visual Details

Sticky action bar:

```text
position fixed
bottom 0
left 0
right 0
z-index above form content
bg-card
border-top border-soft
height 72px + safe area
shadow-md only when elevated
```

Inner row:

```text
max-width 480px
margin auto
padding x space-4
display flex
align center
justify between
gap space-3
```

Total block:

```text
caption label
heading/md numeric value
tabular nums
nowrap
```

CTA:

```text
height 48px
border radius 14px
accent fill
inverse text
font weight 600
focus-visible ring
pressed accent-700 / 96% scale
```

Disabled-looking CTA:

```text
opacity 30%
still receives click
aria-disabled true
```

Warning CTA:

```text
same as primary
warning glyph before label
glyph 16px
```

## Accessibility Notes

- Sticky CTA must be a real `<button>`.
- Use `aria-disabled="true"` instead of `disabled` so tapping can show the toast.
- Disabled-looking CTA should still be reachable by keyboard.
- Toast uses `role="status"`.
- Toast should not steal focus.
- Sticky bar should not trap focus.
- Focus outline must be visible above the sticky bar.
- On narrow screens, CTA text must not overflow its button.
- Do not rely on color alone for warning state; include warning glyph/text.

## Edge Cases

### Initial App Open

State:

```text
one blank default CNC card
Burma total 0
```

Expected:

```text
CTA disabled-looking
tap shows Add an entry first.
no warning glyph
no card warnings
```

### All CNC Entries Removed

State:

```text
cncEntries = []
Burma total 0
```

Expected:

```text
CTA disabled-looking
tap shows Add an entry first.
```

### Burma-Only Production

State:

```text
cncEntries = []
Burma total > 0
```

Expected:

```text
CTA ready
Total CNC still shows 0.00 hrs
Live Totals Burma shows count
```

### Incomplete CNC Only

State:

```text
one non-blank incomplete CNC card
Burma total 0
```

Expected:

```text
CTA enabled with warning glyph
tap calls onPreview
no card warning banner yet
```

### Valid CNC Plus Incomplete CNC

Expected:

```text
CTA enabled with warning glyph
Total CNC includes only calculable/valid production hours per existing selector
```

### Repair Or Notes Only

State:

```text
no non-blank CNC
Burma total 0
Repair or Notes filled
```

Expected:

```text
CTA disabled-looking
tap shows Add an entry first.
```

### Toast Replacement

If an undo toast is visible and the worker taps the disabled Preview CTA:

```text
new Add an entry first. toast replaces undo toast
```

This matches the one-toast-slot design.

### Scroll To Bottom

Expected:

```text
Notes card remains fully reachable
last focusable field is not covered by sticky bar
bar has shadow-md
```

## Tests / Verification

If the project has tests by the time Phase 7 is implemented, add focused selector tests.

Selector tests:

- [ ] `cncEntryCompletenessReport` returns `0 valid / 0 incomplete` for blank initial entry.
- [ ] `cncEntryCompletenessReport` counts a complete CNC entry as valid.
- [ ] `cncEntryCompletenessReport` counts a non-blank incomplete CNC entry as incomplete.
- [ ] `cncEntryCompletenessReport` does not count soft warnings as incomplete.
- [ ] `hasPreviewableProductionData` returns false for blank CNC and Burma zero.
- [ ] `hasPreviewableProductionData` returns true for valid CNC.
- [ ] `hasPreviewableProductionData` returns true for incomplete non-blank CNC.
- [ ] `hasPreviewableProductionData` returns true for Burma-only data.
- [ ] `hasPreviewableProductionData` returns false for Repair-only data.
- [ ] `previewCtaState` returns `disabled`, `warning`, and `ready` in the expected scenarios.

Manual QA checklist:

- [ ] Sticky action bar is visible at bottom on initial load.
- [ ] Sticky action bar respects safe-area bottom.
- [ ] Sticky action bar does not cover the Notes card at bottom scroll.
- [ ] Initial blank form shows disabled-looking Preview CTA.
- [ ] Tapping disabled-looking Preview CTA shows `Add an entry first.`
- [ ] Disabled toast auto-dismisses after 3 seconds.
- [ ] Second toast replaces first toast.
- [ ] Entering a valid CNC entry enables the CTA.
- [ ] Sticky bar total CNC updates when CNC Hours update.
- [ ] Entering only Burma count enables the CTA.
- [ ] Entering only Repair or Notes does not enable the CTA.
- [ ] A non-blank incomplete CNC entry shows warning CTA.
- [ ] A valid CNC entry plus an incomplete CNC entry shows warning CTA.
- [ ] Warning CTA remains tappable.
- [ ] Warning CTA does not show card warning banners in Phase 7.
- [ ] At top of page, sticky bar has no `shadow-md`.
- [ ] After scrolling down, sticky bar gains `shadow-md`.
- [ ] Returning to top removes sticky bar `shadow-md`.
- [ ] Live Totals Strip can gain `shadow-md` on scroll but remains in normal flow.
- [ ] No horizontal scroll at 320px width.
- [ ] CTA text does not overlap the total block on narrow screens.
- [ ] Keyboard focus ring is visible on Preview Summary.
- [ ] No Summary Modal appears.
- [ ] No console errors during scroll, CTA tap, and toast replacement.

## Acceptance Criteria

- [ ] Phase 1 shell and token system remain intact.
- [ ] Phase 2 state/context architecture remains intact.
- [ ] Phase 3 CNC card structure remains intact.
- [ ] Phase 4 CNC calculation remains intact.
- [ ] Phase 5 CNC add/remove/duplicate/undo remains intact.
- [ ] Phase 6 Burma/Repair/Notes cards remain intact.
- [ ] `StickyActionBar` renders fixed at the bottom.
- [ ] Bar is visible on all screen heights.
- [ ] Bar never overlaps the final card or final focusable field.
- [ ] Sticky bar shows `Total CNC`.
- [ ] Sticky bar CNC total reads from `totalCncHours(state)`.
- [ ] Preview Summary CTA renders as primary action.
- [ ] CTA disabled-looking state appears when there is no previewable production data.
- [ ] Disabled-looking CTA remains tappable/clickable.
- [ ] Tapping disabled-looking CTA shows toast `Add an entry first.`
- [ ] Toast auto-dismisses after 3 seconds.
- [ ] Second toast replaces the first.
- [ ] CTA ready state appears when there is at least one valid CNC entry or Burma total is greater than zero.
- [ ] CTA warning state appears when at least one non-blank incomplete CNC entry exists.
- [ ] Initial blank CNC card does not trigger warning CTA.
- [ ] `cncEntryCompletenessReport(state)` returns valid/incomplete counts.
- [ ] Sticky bar gains `shadow-md` only after scrolling.
- [ ] Sticky bar shadow is absent at scroll top.
- [ ] Live Totals Strip can gain scroll shadow but does not become sticky.
- [ ] IntersectionObserver is used for scroll shadow behavior.
- [ ] No Summary Modal, Summary Card, PNG, sharing, persistence, or validation highlight behavior is introduced.

## Handoff Notes For Phase 8

Phase 8 should be able to start from:

- all V1 inputs on screen
- Sticky Action Bar always visible
- Preview Summary CTA rendered and stateful
- `onPreview` callback path in `StickyActionBar`
- `cncEntryCompletenessReport(state)` available
- `previewCtaState(state)` or equivalent available
- app-level Toast slot available
- scroll shadows working
- bottom padding reserve working

Expected Phase 8 changes:

- create `Sheet` primitive
- create `SummaryModal`
- create `SummaryCard`
- wire `StickyActionBar` `onPreview` to open the Summary Modal
- show incomplete-entry strip inside the modal using the Phase 7 completeness report
- keep Sticky Action Bar behavior unchanged except for the real modal destination

## Rationale

Phase 7 is deliberately about the finishing control, not the summary destination.

The user needs the Preview Summary action to be constantly available, and the app needs to honestly communicate whether the current data can produce a useful summary. By implementing the sticky bar and CTA state before the modal, Phase 8 can focus entirely on the summary surface instead of also solving layout, safe-area, toast ownership, and validation state at the same time.

The most important correctness point is the CTA state. A raw CNC entry count is not enough because the app can have blank default cards, removed-all empty state, incomplete partial entries, valid entries, and Burma-only production. The selector layer should encode those distinctions once so the sticky bar, summary modal, and final validation phase all agree.
