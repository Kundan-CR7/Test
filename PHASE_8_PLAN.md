# Phase 8: Summary Preview Modal + Summary Card DOM

## Objective

Build the real Summary Preview surface without image generation.

After this phase, tapping:

```text
Preview Summary
```

opens a modal that shows the exact production summary the owner will later receive as a PNG.

The target interaction:

```text
1. Worker fills CNC and/or Burma data.
2. Worker taps Preview Summary in the Sticky Action Bar.
3. Full-screen mobile modal opens.
4. Modal shows a locked Summary Card populated from current state.
5. Modal shows Generate Image and Edit Entry actions.
6. Worker taps Edit Entry or Close.
7. Modal closes and all form state is preserved.
```

No PNG is generated in this phase. Phase 8 locks the preview and artifact DOM first so Phase 9 can focus only on bitmap generation and sharing.

## Prerequisite

Phases 1, 2, 3, 4, 5, 6, and 7 must be implemented before this phase is executed.

This plan assumes the app already has:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/state/StateContext.tsx
src/components/StickyActionBar.tsx
src/components/LiveTotalsStrip.tsx
src/components/cnc/CncSection.tsx
src/components/BurmaCard.tsx
src/components/RepairCard.tsx
src/components/NotesCard.tsx
src/components/primitives/Toast.tsx
```

If the implementation lives under `app/`, apply every source path in this plan under `app/src/...`.

The current workspace has an `app/` implementation with earlier-phase source files and planning docs through Phase 7. Do not execute Phase 8 against `app/src` until Phases 4, 5, 6, and 7 have actually landed there.

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

- `requirements.md` sections 15, 16, 17, 18, and 19
- `frontend_ui_spec.md` sections 29 and 30
- `detailed_ui_ux_design.md` sections 5.3, 6.4, 6.6, 6.7, 7.4, 8.1, 8.3, 8.4, 12.2, 12.3, 13, 14, and 15.5
- `PHASE_ROADMAP.md` Phase 8 and Phase 11 boundary notes
- `PHASE_1_PLAN.md` shell, token, and future `format.ts` handoff
- `PHASE_2_PLAN.md` state shape and `ui.incompleteHighlights`
- `PHASE_3_PLAN.md` CNC identity shape and subtitle field order
- `PHASE_4_PLAN.md` production-hours selector contract
- `PHASE_5_PLAN.md` multi-entry CNC behavior and empty CNC state
- `PHASE_6_PLAN.md` Burma, Repair, Notes state and optional section behavior
- `PHASE_7_PLAN.md` Sticky Action Bar, preview CTA, completeness report, and Phase 8 handoff
- `production_entry.html` modal and summary rendering behavior, as reference only

## Estimated Output

Approximate size: 450-600 LOC.

Expected files created:

```text
src/components/primitives/Sheet.tsx
src/components/summary/SummaryModal.tsx
src/components/summary/SummaryCard.tsx
src/utils/format.ts
```

Expected files modified:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/components/StickyActionBar.tsx
src/App.tsx
src/styles/base.css
```

Optional if the codebase already has a validation utility folder by the time this is implemented:

```text
src/state/validation.ts
```

Do not modify `production_entry.html` except as a read-only reference. Do not remove or rewrite existing planning documents.

## Seamless Continuity Review

Phase 8 must plug into the earlier phases without reopening their decisions.

### From Phase 1

Keep the shell and token system intact:

- mobile-first 480px app column
- no router
- no page redesign
- no new color palette
- no new typography ramp
- no PWA/offline work

The modal can visually escape the 480px page column because it is an overlay, but the centered desktop modal should still be capped and quiet.

### From Phase 2

Phase 2 introduced:

```text
ui.incompleteHighlights
```

Phase 8 should add the reducer action that can set this flag:

```text
UI_INCOMPLETE_HIGHLIGHTS_SET
```

But Phase 8 should not wire all per-card red borders and warning banners. Phase 11 owns the complete validation pass.

### From Phase 3

Phase 3 established the CNC identity fields:

```text
operator
machine
hex
size
side
```

Summary Card should render CNC identity in the same order:

```text
operator, machine, hex, size, side
```

Do not change CNC entry form components.

### From Phase 4

Phase 4 established:

```text
entryProductionHours(entry)
totalCncHours(state)
cycle time fields
parts count
time in / time out
```

Summary Card should reuse `entryProductionHours(entry)` or a selector derived from it. Do not recompute production hours with a second formula inside the component.

### From Phase 5

Phase 5 made CNC entries repeatable and allowed zero CNC entries.

Summary Card must handle:

```text
zero valid CNC entries
one valid CNC entry
many valid CNC entries
13+ valid CNC entries
```

If there are zero valid CNC entries, show the documented small muted CNC empty line. Do not omit the CNC section entirely.

### From Phase 6

Phase 6 added:

```text
Burma
Repair
Notes
```

Summary Card must always show Burma, even when all counts are zero.

Repair and Notes are optional:

- omit Repair entirely if all repair fields are blank
- omit Notes entirely if notes are blank

### From Phase 7

Phase 7 added:

```text
StickyActionBar
onPreview callback path
cncEntryCompletenessReport(state)
previewCtaState(state)
app-level Toast slot
```

Phase 8 should wire `StickyActionBar` `onPreview` to open the modal.

Do not change CTA state logic except to attach the real modal destination.

Use the Phase 7 completeness report for the incomplete-entry strip.

## Inputs

Read in this order before implementing:

1. `PHASE_7_PLAN.md` handoff notes
   - Confirms Sticky Action Bar exists.
   - Confirms Preview CTA has an `onPreview` path.
   - Confirms completeness report exists.
2. `PHASE_ROADMAP.md` Phase 8
   - Defines `Sheet`, `SummaryModal`, `SummaryCard`, `format.ts`, CTA wiring, action stack, incomplete strip, and `UI_INCOMPLETE_HIGHLIGHTS_SET`.
3. `requirements.md` section 15
   - Defines Preview Summary as the clean review screen before image generation.
4. `requirements.md` section 16
   - Defines summary content.
5. `requirements.md` section 17
   - Defines CNC summary format.
6. `requirements.md` section 18
   - Defines Burma summary format.
7. `requirements.md` section 19
   - Defines the final PNG summary example.
8. `frontend_ui_spec.md` section 29
   - Defines complete CNC entry requirements.
9. `frontend_ui_spec.md` section 30
   - Defines Summary Preview modal structure and summary actions.
10. `detailed_ui_ux_design.md` section 5.3
    - Defines Summary Preview modal behavior, top bar, action stack, incomplete strip, and image-ready states.
11. `detailed_ui_ux_design.md` section 6.4
    - Defines the locked Summary Card artifact structure and styling rules.
12. `detailed_ui_ux_design.md` section 7.4
    - Defines Summary Preview states.
13. `detailed_ui_ux_design.md` sections 8.1, 8.3, and 8.4
    - Defines copy for modal title, Generate Image, Edit Entry, and incomplete warning.
14. `detailed_ui_ux_design.md` section 12.2
    - Defines single-source calculations.
15. `detailed_ui_ux_design.md` section 12.3
    - Defines hard validation versus soft warnings.
16. `detailed_ui_ux_design.md` section 15.5
    - Defines Preview timing and future validation pass.
17. `production_entry.html`
    - Reference only for modal flow and summary composition. Do not copy its DOM mutation approach.

## What This Phase Adds

- `Sheet` primitive.
- Summary Preview modal.
- Internal sticky modal top bar.
- Close button.
- Edit Entry button.
- Generate Image button as a Phase 9 placeholder.
- Summary Card DOM.
- Summary formatting utilities.
- Incomplete CNC warning strip in the modal.
- `UI_INCOMPLETE_HIGHLIGHTS_SET` reducer action.
- Sticky Action Bar `onPreview` wired to open the modal.
- Focus trap inside modal.
- Escape-to-close.
- Backdrop-click close.
- Body scroll lock while modal is open.
- Focus restoration to the Preview Summary button after close.

## What This Phase Does NOT Do

- No PNG generation.
- No `html2canvas`.
- No Web Share API.
- No Download Image button.
- No Share on WhatsApp button.
- No image thumbnail.
- No "Image ready" state.
- No Generate Image spinner.
- No real Generate Image behavior.
- No localStorage persistence.
- No day-rollover prompt.
- No Add Person modal.
- No per-card warning banners.
- No red missing-field borders on Preview tap.
- No final validation sweep.
- No backend.
- No routing.

## State Changes

## `UI_INCOMPLETE_HIGHLIGHTS_SET`

Add this action:

```ts
type ProductionEntryAction =
  | { type: 'UI_INCOMPLETE_HIGHLIGHTS_SET'; value: boolean };
```

Reducer behavior:

```ts
case 'UI_INCOMPLETE_HIGHLIGHTS_SET': {
  if (state.ui.incompleteHighlights === action.value) return state;

  return {
    ...state,
    ui: {
      ...state.ui,
      incompleteHighlights: action.value,
    },
  };
}
```

On Preview tap:

```text
dispatch UI_INCOMPLETE_HIGHLIGHTS_SET true
open Summary Modal
```

Important:

- The flag is introduced now because the roadmap asks for it in Phase 8.
- The full visual effect of this flag on CNC cards is Phase 11.
- Do not retrofit all field-level validation UI in Phase 8.

## Selector Additions

Phase 7 should already have:

```ts
cncEntryCompletenessReport(state)
previewCtaState(state)
```

Phase 8 may need more summary-specific selectors:

```ts
export function validCncEntries(state: ProductionEntryState): CncEntry[]
export function incompleteCncEntryCount(state: ProductionEntryState): number
export function totalSummaryCncHours(state: ProductionEntryState): number
export function hasRepairData(state: ProductionEntryState): boolean
export function hasNotes(state: ProductionEntryState): boolean
```

### Valid CNC Entries

Use the same complete-entry definition as Phase 7.

Do not include:

```text
blank CNC entries
incomplete CNC entries
soft-warning-only invalid-looking but hard-valid entries
```

Soft warnings still allow inclusion.

### Summary CNC Total

The summary should total the entries shown in the summary.

Do not blindly use `totalCncHours(state)` if that selector includes calculable but incomplete entries.

Preferred:

```ts
export function totalSummaryCncHours(state: ProductionEntryState): number {
  return validCncEntries(state).reduce((sum, entry) => {
    return sum + (entryProductionHours(entry) ?? 0);
  }, 0);
}
```

If `totalCncHours(state)` is already defined as valid-only by implementation time, reuse it. Otherwise keep this summary-specific selector.

### Optional Sections

Repair:

```ts
hasRepairData =
  repair.person.trim() !== '' ||
  repair.count !== null ||
  repair.count > 0 ||
  repair.note.trim() !== ''
```

Adapt this to the actual count type from Phase 6.

Notes:

```ts
hasNotes = state.notes.trim() !== ''
```

Do not trim state while typing. Trim only for display decisions.

## Formatting Utilities

Create:

```text
src/utils/format.ts
```

Required exports:

```ts
export function formatDateLong(dateInputValue: string): string
export function formatShift(shift: Shift): string
export function formatCycleTime(entry: CncEntry): string
export function formatCount(count: number | null | undefined): string
```

Recommended additional exports:

```ts
export function formatHours(hours: number | null | undefined): string
export function formatGeneratedAt(dateInputValue: string, generatedAt: Date): string
```

### `formatDateLong`

Input:

```text
2026-05-05
```

Output:

```text
05 May 2026
```

Use stable formatting that does not shift because of UTC parsing.

Avoid:

```ts
new Date('2026-05-05')
```

because date-only strings can shift across time zones.

Preferred:

```ts
const [year, month, day] = value.split('-').map(Number);
const date = new Date(year, month - 1, day);
```

### `formatShift`

Output:

```text
Morning Shift
Evening Shift
```

### `formatCycleTime`

Examples:

```text
2m 26s
0m 45s
3m 0s
```

Use `0` for missing minutes/seconds only when the entry is already valid enough to render. Invalid entries should not be rendered in the CNC list.

### `formatCount`

Use:

```ts
Intl.NumberFormat('en-IN')
```

Examples:

```text
0
500
1,550
12,34,567
```

### Shared Use

After creating `format.ts`, consider moving any duplicate header or CNC subtitle date/count/cycle formatting into it only if it is low-risk.

Do not refactor unrelated formatting across the app during Phase 8.

## Component Plan

## `Sheet`

Create:

```text
src/components/primitives/Sheet.tsx
```

Purpose:

```text
Reusable modal/sheet primitive for Summary Preview now and Add Person later.
```

Recommended props:

```ts
type SheetProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  initialFocusRef?: React.RefObject<HTMLElement>;
  labelledBy?: string;
  className?: string;
};
```

### Behavior

When open:

- render backdrop
- render panel
- set `role="dialog"`
- set `aria-modal="true"`
- close on Escape
- close on backdrop click
- trap focus inside the panel
- lock body scroll
- restore focus to the element that opened the sheet after close

When closed:

- unmount content, or keep hidden if animation needs it
- body scroll is restored
- observers/listeners are cleaned up

### Focus Trap

Use a small local focus trap. Do not install a dependency just for this phase.

Focusable selector:

```text
a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])
```

Tab behavior:

- Tab on last focusable wraps to first
- Shift+Tab on first focusable wraps to last

Initial focus:

- focus the first meaningful button in the modal top bar, or
- focus a provided `initialFocusRef`

Do not auto-focus Generate Image.

### Scroll Lock

While open:

```text
document.body.style.overflow = 'hidden'
```

Restore the previous value on close/unmount.

The modal panel itself should scroll internally.

### Responsive Shape

Mobile:

```text
full-screen modal
top 0
bottom 0
left 0
right 0
```

Desktop / >=640px:

```text
centered modal
max-width 520px
max-height calc(100dvh - 48px)
rounded 16px
shadow-lg
```

### Motion

Normal motion:

- scrim fade: 160ms
- panel slide-up: 260ms

Reduced motion:

- fade-only or instant
- no slide

Use existing motion tokens where possible.

## `SummaryModal`

Create:

```text
src/components/summary/SummaryModal.tsx
```

Recommended props:

```ts
type SummaryModalProps = {
  open: boolean;
  state: ProductionEntryState;
  generatedAt: Date;
  incompleteCount: number;
  onClose: () => void;
};
```

Alternative:

- It may read state from context.
- Keep `open`, `generatedAt`, and `onClose` as props.

### Layout

Inside `Sheet`:

```text
sticky top bar
warning strip if incompleteCount > 0
scrolling body
SummaryCard
sticky/internal action stack
```

Top app bar:

```text
[ Edit/back ]   Production Summary   [ Close ]
```

Rules:

- height 56px
- sticky inside modal
- title `Production Summary`
- Edit/back closes modal and returns to entry screen
- Close also closes modal
- state remains preserved

Use accessible labels:

```text
Edit Entry
Close summary
```

The visual can be icon-only if existing button patterns support it, but accessible text must exist.

### Incomplete Strip

If `incompleteCount > 0`, render a warning strip above the Summary Card:

Singular:

```text
1 CNC entry is incomplete and won't be included.
```

Plural:

```text
2 CNC entries are incomplete and won't be included.
```

Style:

- background `warning-50`
- text `warning-600`
- radius 8 or 12
- body-sm/body-md
- no modal blocking

Do not include incomplete entries in the Summary Card CNC list.

Do not render per-card warnings in the entry screen in Phase 8.

### Action Stack

At bottom of modal:

```text
[ Generate Image ]
[ Edit Entry     ]
```

Phase 8 visible actions:

- Generate Image
- Edit Entry

Phase 8 hidden/deferred actions:

- Share on WhatsApp
- Download Image

Generate Image behavior:

- primary button
- visual only / no-op placeholder
- no spinner
- no thumbnail
- no success caption
- no toast

Edit Entry behavior:

- closes modal
- preserves all state
- focus returns to Preview Summary CTA

Keep the action stack visually ready for Phase 9, but do not fake image generation.

## `SummaryCard`

Create:

```text
src/components/summary/SummaryCard.tsx
```

Recommended props:

```ts
type SummaryCardProps = {
  state: ProductionEntryState;
  generatedAt: Date;
};
```

`SummaryCard` should be pure:

- no dispatch
- no local state
- no DOM queries
- no canvas logic
- no image generation
- no side effects

It should render from props and selectors only.

### Artifact Role

This is the same component Phase 9 will capture for PNG generation.

Do not create separate "preview" and "capture" summary renderers. That creates drift.

If Phase 9 needs a hidden capture container, it should render the same `SummaryCard` component.

### Visual Requirements

Summary Card:

- white background always
- high contrast text
- document-like layout
- width suitable for 540px source capture
- responsive down inside modal preview
- no icons inside the card
- no app-card background
- no decorative shadows inside the card artifact
- tabular numerals
- section dividers

Recommended visible preview style:

```text
width: min(540px, 100%)
background white
padding 32px at 540px source width
border 1px border-soft for modal preview only
```

For Phase 9 capture, the source width should be 540px and html2canvas scale 2. Do not install or invoke html2canvas in Phase 8.

### Header

Render:

```text
Daily Production Summary
05 May 2026 [middle dot] Morning Shift
```

Use documented middle-dot separator in the UI if the project already uses it. This markdown plan stays ASCII, but the implementation may use the product-standard separator.

Typography:

- title `display/xl`, weight 700
- date/shift `body/lg`, muted

### CNC Section

Render heading:

```text
CNC Production
```

Render valid CNC entries only.

For each normal entry:

```text
1. Avinash - M1 - Hex 41
   Size 1/2 - Side 1
   Cycle 2m 26s - Count 193 - 7.83 hrs
```

The implementation may use the documented middle-dot separators visually. The content order is what matters:

```text
index
operator
machine
hex
size
side
cycle time
parts count
hours
```

If there are zero valid CNC entries, render:

```text
No CNC entries
```

as muted body text.

Do not omit the CNC section.

### Compact CNC Mode

Trigger compact mode when:

```text
validCncEntries.length > 12
```

This means 13 or more valid entries.

Compact row content:

```text
1. Avinash - M1 - Hex 41 - 1/2 - S1 - 2m 26s - 193 - 7.83 hrs
```

Do not virtualize. The design says virtualization is not needed at this scale.

### Total CNC Hours

Render:

```text
Total CNC Hours              14.83 hrs
```

Rules:

- use `totalSummaryCncHours(state)`
- two decimals
- right-aligned number
- display/lg or equivalent
- tabular nums

If zero valid CNC entries:

```text
0.00 hrs
```

### Burma Section

Always render:

```text
Burma Production
Burma 1                          120
Burma 2                          150
Burma 3                           90
Total Burma                      360
```

Rules:

- use state values, treating blank/null as zero
- counts formatted with `Intl.NumberFormat('en-IN')`
- right-align numbers
- total row stronger than individual rows

### Repair Section

Render only if `hasRepairData(state)` is true.

Heading:

```text
Repair
```

Render present parts only:

```text
Avinash - 20 pcs - Thread repair
```

If only some fields are filled:

- person only: show person
- count only: show `20 pcs`
- note only: show note
- person + note: show both

Do not render placeholder text like:

```text
Unknown
-
N/A
```

### Notes Section

Render only if `hasNotes(state)` is true.

Heading:

```text
Notes
```

Render notes with line breaks preserved:

```css
white-space: pre-wrap;
```

Do not trim or mutate `state.notes`; only trim for the decision to render the section.

### Footer

Render:

```text
Generated 05 May 2026 [middle dot] 18:42
```

Use:

- `state.date` for date
- `generatedAt` for time
- 24-hour `HH:mm`
- muted caption
- right-aligned

Set `generatedAt` when the modal opens so the timestamp does not change every re-render while the modal is open.

## Modal Opening Flow

Update:

```text
src/App.tsx
```

Phase 7 had:

```text
StickyActionBar onPreview placeholder
```

Phase 8 should replace it with:

```ts
const [isSummaryOpen, setIsSummaryOpen] = useState(false);
const [summaryGeneratedAt, setSummaryGeneratedAt] = useState<Date | null>(null);

function handlePreview() {
  dispatch({ type: 'UI_INCOMPLETE_HIGHLIGHTS_SET', value: true });
  setSummaryGeneratedAt(new Date());
  setIsSummaryOpen(true);
}
```

Then:

```tsx
<StickyActionBar onPreview={handlePreview} ... />

<SummaryModal
  open={isSummaryOpen}
  state={state}
  generatedAt={summaryGeneratedAt ?? new Date()}
  incompleteCount={cncEntryCompletenessReport(state).incomplete}
  onClose={() => setIsSummaryOpen(false)}
/>
```

Do not create a route for the modal.

Do not clear form state when the modal closes.

## Focus Management

Acceptance requires:

```text
focus restores to Preview Summary button
```

Recommended:

- `Sheet` stores `document.activeElement` when it opens.
- On close, restore focus to that element if it is still in the document.
- `StickyActionBar` Preview button should remain mounted behind the modal.

If implementation uses a forwarded ref from `StickyActionBar`, restore focus to that ref explicitly.

Do not rely on browser default focus behavior.

## Styling And CSS

Add modal/sheet classes in:

```text
src/styles/base.css
```

or component-local class names if that is the established pattern.

Need styles for:

- backdrop
- sheet panel
- mobile full-screen layout
- desktop centered layout
- open/close animation
- reduced motion
- modal scroll region
- action stack
- summary card
- section divider
- right-aligned summary rows

Prefer Tailwind utility classes if the app has been using them consistently. Use CSS only where utility classes become unreadable, especially for:

- reduced-motion keyframes
- focus trap container support
- summary artifact print-like layout

Do not add a CSS framework or modal library.

## Implementation Steps

## Step 1 - Confirm Phase 7 Baseline

Verify these exist:

```text
src/components/StickyActionBar.tsx
src/components/primitives/Toast.tsx
```

Verify selectors exist:

```text
cncEntryCompletenessReport
previewCtaState or equivalent
```

Verify Sticky Action Bar has:

```text
onPreview
```

If any are missing, finish Phase 7 first.

## Step 2 - Add UI Reducer Action

Update:

```text
src/state/types.ts
src/state/reducer.ts
```

Add:

```text
UI_INCOMPLETE_HIGHLIGHTS_SET
```

Do not add validation rendering yet.

## Step 3 - Add Summary Selectors

Update:

```text
src/state/selectors.ts
```

Add:

```text
validCncEntries
incompleteCncEntryCount
totalSummaryCncHours
hasRepairData
hasNotes
```

Use Phase 7 completeness rules.

Do not duplicate production-hours math.

## Step 4 - Create Format Utilities

Create:

```text
src/utils/format.ts
```

Add:

```text
formatDateLong
formatShift
formatCycleTime
formatCount
formatHours
formatGeneratedAt
```

Keep functions pure.

Add lightweight unit tests if the project has a test setup by then.

## Step 5 - Create Sheet Primitive

Create:

```text
src/components/primitives/Sheet.tsx
```

Implement:

- modal/backdrop render
- mobile full-screen panel
- desktop centered panel
- Escape close
- backdrop close
- focus trap
- focus restore
- body scroll lock
- reduced-motion behavior
- cleanup on unmount

Manual check this primitive before building Summary Modal content.

## Step 6 - Create Summary Card

Create:

```text
src/components/summary/SummaryCard.tsx
```

Implement sections:

```text
header
CNC Production
Total CNC Hours
Burma Production
Repair optional
Notes optional
footer timestamp
```

Use valid CNC entries only.

Use compact mode when valid entries are 13 or more.

## Step 7 - Create Summary Modal

Create:

```text
src/components/summary/SummaryModal.tsx
```

Compose:

```text
Sheet
top app bar
incomplete warning strip
SummaryCard
Generate Image button
Edit Entry button
```

Both Edit Entry and Close should call `onClose`.

Generate Image should be visible but not wired to image generation.

## Step 8 - Wire Sticky Action Bar Preview

Update:

```text
src/App.tsx
```

Replace Phase 7 placeholder preview handler with real modal open.

On preview:

- set incomplete highlights flag true
- set modal generated timestamp
- open modal

Do not alter disabled CTA behavior. If Phase 7 prevents `onPreview` when empty, keep that behavior.

## Step 9 - Verify Incomplete Preview Behavior

Manual state:

```text
one valid CNC entry
one incomplete CNC entry
Burma count present
```

Expected:

- Sticky CTA warning state from Phase 7
- tapping Preview opens modal
- modal warning strip says incomplete entries will not be included
- Summary Card lists only valid CNC entries
- Burma still renders
- closing modal preserves form state

Do not require card-level red banners yet.

## Step 10 - Verify Summary Optional Sections

Manual states:

1. Blank Repair and blank Notes.
2. Repair person only.
3. Repair count only.
4. Repair note only.
5. Notes with multiple lines.

Expected:

- blank Repair omitted
- blank Notes omitted
- partial Repair renders present fields only
- Notes preserve line breaks

## Step 11 - Verify Modal Accessibility

Manual checks:

- Tab cycles inside modal.
- Shift+Tab cycles inside modal.
- Escape closes modal.
- Backdrop click closes modal.
- Close button closes modal.
- Edit Entry closes modal.
- Focus returns to Preview Summary.
- Body behind modal does not scroll.
- Modal content scrolls internally.

## Step 12 - Run Checks

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

Manual browser checks are required for focus trap, scroll lock, modal animation, and responsive modal layout.

## Data Flow

Preview open:

```text
StickyActionBar Preview tap
-> handlePreview
-> dispatch UI_INCOMPLETE_HIGHLIGHTS_SET true
-> set generatedAt
-> open SummaryModal
```

Summary render:

```text
ProductionEntryState
-> validCncEntries
-> totalSummaryCncHours
-> totalBurma
-> hasRepairData
-> hasNotes
-> SummaryCard
```

Incomplete strip:

```text
ProductionEntryState
-> cncEntryCompletenessReport
-> incomplete count
-> SummaryModal warning strip
```

Modal close:

```text
Close / Edit / Escape / backdrop
-> onClose
-> Sheet restores focus
-> form state remains unchanged
```

## Visual QA Targets

Mobile viewport:

```text
360 x 740
375 x 667
390 x 844
```

Desktop/tablet viewport:

```text
640 x 800
1024 x 768
```

Check:

- modal is full-screen on mobile
- modal is centered at >=640px
- Summary Card stays readable
- no horizontal scrolling
- action stack remains reachable
- top bar stays visible while modal body scrolls
- modal body scroll does not move page behind it

## Edge Cases

### Burma-Only Summary

State:

```text
zero valid CNC entries
Burma total > 0
```

Expected:

- Summary opens.
- CNC section shows `No CNC entries`.
- Total CNC Hours shows `0.00 hrs`.
- Burma section shows counts and total.

### Incomplete CNC Only

State:

```text
one non-blank incomplete CNC entry
Burma total 0
```

Expected:

- Summary opens from warning CTA.
- Warning strip appears.
- CNC section shows `No CNC entries`.
- Total CNC Hours shows `0.00 hrs`.

### Valid And Incomplete CNC

State:

```text
one valid CNC
one incomplete CNC
```

Expected:

- Warning strip appears.
- Summary lists only the valid CNC entry.
- Total CNC Hours sums only the valid CNC entries shown.

### 13+ Valid CNC Entries

Expected:

- Summary uses compact one-line CNC rows.
- No virtualization.
- Card grows vertically.

### Repair Blank

Expected:

- Repair section omitted entirely.

### Notes Blank

Expected:

- Notes section omitted entirely.

### Long Notes

Expected:

- line breaks preserved
- Summary Card grows vertically
- no internal scroll inside Summary Card

### Close And Reopen

Expected:

- form state remains unchanged
- generated footer time updates to the new open time

## Tests / Verification

If the project has tests by the time Phase 8 is implemented, add focused tests for selectors and format utilities.

Selector tests:

- [ ] `validCncEntries` returns only hard-valid entries.
- [ ] `validCncEntries` excludes blank entries.
- [ ] `validCncEntries` excludes incomplete entries.
- [ ] `totalSummaryCncHours` sums only valid entries.
- [ ] `hasRepairData` returns false when repair is fully blank.
- [ ] `hasRepairData` returns true for person only.
- [ ] `hasRepairData` returns true for count only.
- [ ] `hasRepairData` returns true for note only.
- [ ] `hasNotes` returns false for whitespace-only notes.
- [ ] `hasNotes` returns true for non-empty notes.

Format tests:

- [ ] `formatDateLong('2026-05-05')` returns `05 May 2026`.
- [ ] `formatShift('morning')` returns `Morning Shift`.
- [ ] `formatShift('evening')` returns `Evening Shift`.
- [ ] `formatCycleTime` returns `2m 26s` for 2 minutes and 26 seconds.
- [ ] `formatCount(1550)` returns `1,550`.
- [ ] `formatHours(7.831)` returns `7.83 hrs`.

Manual QA checklist:

- [ ] Preview Summary opens the modal.
- [ ] Modal opens with normal motion.
- [ ] Reduced motion disables slide or uses fade-only.
- [ ] Modal is full-screen on mobile.
- [ ] Modal is centered with max width on desktop.
- [ ] Backdrop click closes modal.
- [ ] Escape closes modal.
- [ ] Close button closes modal.
- [ ] Edit Entry closes modal.
- [ ] Focus is trapped while modal is open.
- [ ] Focus returns to Preview Summary after close.
- [ ] Body behind modal does not scroll.
- [ ] Modal content scrolls internally.
- [ ] Summary Card renders title.
- [ ] Summary Card renders date and shift.
- [ ] Summary Card renders CNC list.
- [ ] Summary Card renders Total CNC Hours.
- [ ] Summary Card renders Burma rows.
- [ ] Summary Card renders Total Burma.
- [ ] Repair section is omitted when blank.
- [ ] Repair section renders when any repair field exists.
- [ ] Notes section is omitted when blank.
- [ ] Notes section preserves line breaks.
- [ ] Footer timestamp renders.
- [ ] Incomplete strip renders when incomplete CNC entries exist.
- [ ] Incomplete strip does not render when all non-blank CNC entries are valid.
- [ ] Summary Card excludes incomplete CNC entries.
- [ ] 13+ valid CNC entries use compact mode.
- [ ] Generate Image button is visible.
- [ ] Generate Image button does not start PNG generation in Phase 8.
- [ ] Share and Download buttons are not visible in Phase 8.
- [ ] No console errors opening, scrolling, tabbing, closing, and reopening modal.

## Acceptance Criteria

- [ ] Phase 1 shell and tokens remain intact.
- [ ] Phase 2 state/context architecture remains intact.
- [ ] Phase 3 CNC identity behavior remains intact.
- [ ] Phase 4 CNC production calculations remain intact.
- [ ] Phase 5 CNC add/remove/duplicate/undo remains intact.
- [ ] Phase 6 Burma/Repair/Notes behavior remains intact.
- [ ] Phase 7 Sticky Action Bar remains intact.
- [ ] `Sheet` primitive exists.
- [ ] Modal opens from Preview Summary CTA.
- [ ] Modal uses full-screen layout on mobile.
- [ ] Modal uses centered layout at >=640px.
- [ ] Modal opens with 260ms slide-up and 160ms scrim fade, or fade-only under reduced motion.
- [ ] Modal traps focus.
- [ ] Escape closes modal.
- [ ] Backdrop click closes modal.
- [ ] Close dismisses modal.
- [ ] Edit Entry dismisses modal.
- [ ] Focus restores to Preview Summary button.
- [ ] Body scroll is locked while modal is open.
- [ ] Summary Card renders date and shift header.
- [ ] Summary Card renders valid CNC list.
- [ ] Summary Card renders Total CNC Hours.
- [ ] Summary Card renders Burma section.
- [ ] Summary Card renders Total Burma.
- [ ] Summary Card omits Repair when all repair fields are blank.
- [ ] Summary Card omits Notes when notes are blank.
- [ ] Summary Card renders footer timestamp.
- [ ] Zero valid CNC entries render muted `No CNC entries` copy.
- [ ] 13+ valid CNC entries switch to compact one-line rows.
- [ ] Numbers use tabular numerals where specified.
- [ ] Summary numeric columns right-align where specified.
- [ ] Incomplete-entry warning strip renders when incomplete count is greater than zero.
- [ ] `UI_INCOMPLETE_HIGHLIGHTS_SET(true)` fires on Preview tap.
- [ ] Generate Image button is visible but does not generate an image yet.
- [ ] No PNG generation, html2canvas, Web Share, Download, persistence, or Add Person modal behavior is introduced.

## Handoff Notes For Phase 9

Phase 9 should be able to start from:

- reusable `Sheet` primitive
- Summary Modal open/close behavior
- accessible focus trap
- body scroll lock
- Summary Card component
- Summary Card layout locked against design spec
- Summary Card rendering valid CNC entries only
- Summary Card optional Repair/Notes behavior
- Generate Image button present in the modal action stack
- app-level Toast slot still available
- no image generation installed yet

Expected Phase 9 changes:

- install and wire `html2canvas`
- capture the existing `SummaryCard` DOM
- produce PNG file
- show thumbnail after generation
- replace Generate Image with Share/Download actions after image is ready
- implement Web Share API path
- implement download fallback
- add image-generation success/failure toasts

## Rationale

Phase 8 separates visual truth from export mechanics.

The Summary Card is the artifact the owner will read in WhatsApp. If its layout, hierarchy, section rules, and data filtering are not right before PNG work starts, Phase 9 becomes much harder to debug because rendering problems and canvas problems get mixed together.

The modal is also a reusable foundation. Phase 10's Add Person modal can reuse `Sheet`, and Phase 9 can reuse `SummaryCard` directly for capture. That keeps the app from developing separate preview, capture, and modal systems that drift apart.
