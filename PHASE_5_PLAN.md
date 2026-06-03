# Phase 5: CNC Section Behavior - Add / Remove / Duplicate / Smart Copy

## Objective

Turn the CNC section from a single-entry calculator into a complete multi-entry workflow.

After this phase, the worker should be able to:

```text
Add CNC Entry
Duplicate an existing CNC entry
Remove a blank CNC entry instantly
Remove a filled CNC entry with inline confirmation
Undo a removal from the bottom toast
Keep CNC totals correct across all entries
```

The target interaction:

```text
1. Worker completes CNC Entry 1.
2. Worker taps + Add CNC Entry.
3. CNC Entry 2 appears with Time In / Time Out copied from Entry 1.
4. Worker taps Duplicate on Entry 2.
5. CNC Entry 3 appears below Entry 2 with identity + cycle + time copied, but Parts Count blank.
6. Worker removes Entry 2.
7. Toast appears: Entry removed · Undo.
8. Worker taps Undo.
9. Entry 2 returns to its original position and totals recalculate.
```

This phase is where the CNC section becomes day-scale instead of demo-scale.

## Prerequisite

Phases 1, 2, 3, and 4 must be implemented before this phase is executed.

This plan assumes the app already has:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/state/StateContext.tsx
src/components/LiveTotalsStrip.tsx
src/components/cnc/CncSection.tsx
src/components/cnc/CncEntryCard.tsx
src/components/cnc/CycleTimeInput.tsx
src/components/cnc/TimeRangeInput.tsx
src/components/cnc/PartsCountInput.tsx
src/components/cnc/ProductionHoursDisplay.tsx
```

If the implementation lives under `app/`, apply every source path in this plan under `app/src/...`. The current workspace contains an `app/` scaffold, but it appears minimal; do not execute this phase until Phases 2, 3, and 4 have actually landed in that app.

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

For this phase, the source documents were read in detail:

- `requirements.md` section 10
- `frontend_ui_spec.md` sections 12.3, 12.4, 20.4, 23, 24, and 33.1
- `detailed_ui_ux_design.md` sections 3.6, 5.1.6, 6.1.14, 6.6, 8.3, 8.4, and 8.5
- `PHASE_ROADMAP.md` Phase 5
- `PHASE_4_PLAN.md` handoff notes
- `production_entry.html` add / duplicate / remove behavior, as reference only

## Estimated Output

Approximate size: 300-400 LOC.

The roadmap estimates roughly 250 LOC, but this detailed plan includes the undo toast host and remove animation state, which are worth implementing cleanly because later phases reuse the toast slot.

Expected files created:

```text
src/components/cnc/AddCncEntryButton.tsx
src/components/primitives/Toast.tsx
```

Expected files modified:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/components/cnc/CncSection.tsx
src/components/cnc/CncEntryCard.tsx
src/App.tsx
```

Optional if the existing styling setup needs a reusable motion hook:

```text
src/hooks/usePrefersReducedMotion.ts
```

Do not modify `production_entry.html` except as a read-only behavior reference. Do not remove or rewrite existing planning documents.

## Inputs

Read in this order before implementing:

1. `PHASE_4_PLAN.md` handoff notes
   - Confirms Phase 5 starts from one fully functional CNC entry.
   - Requires `entryProductionHours`, `totalCncHours`, time touched flags, and a card shell ready to repeat.
2. `PHASE_ROADMAP.md` Phase 5
   - Defines exact action names and acceptance criteria.
   - Specifies add, remove, duplicate, smart copy, undo, animation, and empty state scope.
3. `requirements.md` section 10
   - Defines `+ Add CNC Entry`, remove, duplicate, and smart defaults.
   - Smart defaults copy Time In and Time Out from the first/previous entry once entered.
4. `frontend_ui_spec.md` section 12.3
   - Add button should be large and easy to see.
5. `frontend_ui_spec.md` section 12.4
   - App should still start with one blank CNC card by default.
   - Empty state only appears after the user removes all entries.
6. `frontend_ui_spec.md` section 20.4
   - New CNC entries copy Time In and Time Out from the previous CNC entry, not just the shift default.
7. `frontend_ui_spec.md` section 23
   - Duplicate copies operator, machine, hex, size, side, cycle time, time in, and time out.
   - Duplicate does not copy parts count in V1.
8. `frontend_ui_spec.md` section 24
   - Blank cards remove immediately.
   - Filled cards ask inline confirmation: `Remove this CNC entry? Cancel / Remove`.
   - Do not use scary language.
9. `frontend_ui_spec.md` section 33.1
   - Empty copy:
     ```text
     No CNC entries yet.
     Tap + Add CNC Entry to start.
     ```
10. `detailed_ui_ux_design.md` section 3.6
    - Card add: 220ms `cubic-bezier(0.2, 0, 0, 1)`.
    - Card remove: 180ms `ease-in`.
    - Toast in/out: 180ms.
11. `detailed_ui_ux_design.md` section 5.1.6
    - Add CNC tile style:
      - full-width
      - height 56px
      - card background
      - 1.5px dashed strong border
      - radius 16
      - centered body-lg, 600, accent text
      - 120ms accent-50 press fill
12. `detailed_ui_ux_design.md` section 6.1.14
    - Remove confirmation replaces Duplicate/Remove inline.
    - Confirm Remove is danger fill with inverse text.
    - Successful remove shows `Entry removed · Undo` for 4s.
13. `detailed_ui_ux_design.md` section 6.6
    - Toast slot rules:
      - one toast at a time
      - bottom centered
      - width `min(420px, calc(100% - 32px))`
      - dark background
      - inverse text
      - radius 12
      - shadow-lg
      - actionable timeout 4s
14. `detailed_ui_ux_design.md` sections 8.3 through 8.5
    - Button copy.
    - Toast copy.
    - Empty state copy.
15. `production_entry.html`
    - Reference only for add / duplicate / remove flow.
    - Do not copy its DOM mutation model into React.

## What This Phase Adds

- Multi-entry CNC rendering.
- `+ Add CNC Entry` tile after the last card.
- Empty CNC state when all cards have been removed.
- Smart-copy add behavior.
- Duplicate behavior.
- Remove behavior.
- Inline remove confirmation for non-blank cards.
- Bottom undo toast.
- Undo restore at the original index.
- Card add animation.
- Card remove animation.
- Reduced-motion handling for add/remove animation.
- Totals correctness across zero, one, and many CNC entries.

## What This Phase Does NOT Do

- No Burma card.
- No Repair card.
- No Notes card.
- No Sticky Action Bar.
- No Summary Card.
- No PNG generation.
- No WhatsApp sharing.
- No Add Person modal.
- No localStorage persistence.
- No backend.
- No route changes.
- No validation expansion beyond what Phase 4 already has.
- No changes to the production-hours formula.

## Current State After Phase 4

Phase 5 should begin from this shape:

```ts
type ProductionState = {
  date: string;
  shift: Shift;
  cncEntries: CncEntry[];
};
```

And each entry should already contain identity and production fields similar to:

```ts
type CncEntry = {
  id: string;
  operator: string;
  machine: string;
  hex: number | null;
  size: string;
  side: 1 | 2;
  cycleMinutes: number | null;
  cycleSeconds: number | null;
  timeIn: string;
  timeOut: string;
  partsCount: number | null;
  timeInTouched: boolean;
  timeOutTouched: boolean;
};
```

The exact field names should follow the implemented Phase 4 code. If Phase 4 uses slightly different names, keep those names and apply the behavior from this plan without a naming migration.

## State Changes

### Add Actions

Add these reducer actions:

```ts
type ProductionAction =
  | { type: 'CNC_ENTRY_ADD' }
  | { type: 'CNC_ENTRY_REMOVE'; entryId: string }
  | { type: 'CNC_ENTRY_DUPLICATE'; entryId: string }
  | { type: 'CNC_ENTRY_RESTORE'; entry: CncEntry; index: number };
```

The roadmap explicitly calls for:

```text
CNC_ENTRY_ADD
CNC_ENTRY_REMOVE(entryId)
CNC_ENTRY_DUPLICATE(entryId)
```

`CNC_ENTRY_RESTORE` is the small additional action needed to keep undo deterministic and reducer-driven.

### Why Restore Is A Reducer Action

Do not rebuild the removed entry from current form values during Undo.

Undo should restore the exact removed object:

```text
same id
same identity fields
same production fields
same touched flags
same original index
```

The component should capture the removed entry and index before dispatching remove, then pass them to `CNC_ENTRY_RESTORE` if the user taps Undo.

## Entry Factory Rules

If Phase 1 already created entry factory helpers, extend those helpers instead of creating ad hoc objects in the reducer.

Recommended helper structure:

```ts
function createBlankCncEntry(params: {
  shift: Shift;
  timeIn?: string;
  timeOut?: string;
  timeInTouched?: boolean;
  timeOutTouched?: boolean;
}): CncEntry
```

And:

```ts
function createAddedCncEntry(state: ProductionState): CncEntry
function createDuplicatedCncEntry(source: CncEntry): CncEntry
```

Keep entry creation centralized. Do not scatter default-entry object literals across components.

## Smart Copy Rules

### Add New Entry

When the worker taps `+ Add CNC Entry`, the new entry should be blank except for Time In and Time Out smart defaults.

Rules:

1. If there is a previous CNC entry:
   - copy `timeIn` from the previous entry
   - copy `timeOut` from the previous entry
2. If the previous entry's times are still untouched shift defaults:
   - use the current shift defaults
   - keep `timeInTouched = false`
   - keep `timeOutTouched = false`
3. If the previous entry has user-touched or non-shift-default times:
   - copy those times
   - set the copied touched flags to `true`
4. If there are zero CNC entries:
   - create one blank entry using current shift defaults
   - keep touched flags false

The purpose is to preserve the Phase 4 shift propagation rule:

```text
Shift change updates time fields only when the corresponding touched flag is false.
```

This means the add behavior should not accidentally freeze untouched shift defaults forever.

### Fields That Stay Blank On Add

On `CNC_ENTRY_ADD`, do not copy:

```text
operator
machine
hex
size
cycleMinutes
cycleSeconds
partsCount
```

For `side`, follow the Phase 3 implementation:

- If Phase 3 established `side: 1` as the default, use `side: 1`.
- If Phase 3 models side as blank/null before selection, keep it blank/null.

Do not copy the previous entry's side during Add. Copy side only during Duplicate.

## Duplicate Rules

When the worker taps Duplicate on an entry:

1. Find the source entry by `entryId`.
2. If not found, return state unchanged.
3. Create a new entry with a new stable id.
4. Insert it immediately after the source entry.
5. Copy these fields:

```text
operator
machine
hex
size
side
cycleMinutes
cycleSeconds
timeIn
timeOut
timeInTouched
timeOutTouched
```

6. Do not copy:

```text
partsCount
```

7. Any derived production-hours display should naturally become incomplete/zero because `partsCount` is blank.

Do not copy any UI-only flags such as:

```text
isConfirmingRemove
isEntering
isExiting
```

Those should not exist inside persistent production state.

## Remove Rules

### Blank Remove

If an entry is blank/default, tapping Remove should remove it immediately.

No inline confirmation.

Still show the undo toast after removal:

```text
Entry removed · Undo
```

The roadmap says blank remove is instant; it does not say blank remove should skip undo. Keeping the toast consistent makes accidental removal recoverable and keeps the implementation simpler.

### Filled Remove

If an entry has any non-default data, tapping Remove should replace the action row inline:

```text
Remove this CNC entry?  Cancel  Remove
```

The detailed design uses shorter copy:

```text
Remove this entry?
```

Use the `frontend_ui_spec.md` copy unless the existing card width makes it cramped:

```text
Remove this CNC entry?
```

On narrow screens, wrapping is acceptable. Do not use a modal.

### Confirmed Remove

On confirmed remove:

1. Capture the entry object and original index in the component.
2. Start the remove animation unless reduced motion is active.
3. Dispatch `CNC_ENTRY_REMOVE` after the 180ms exit animation.
4. Show the undo toast for 4s.
5. If Undo is tapped, dispatch:

```ts
{ type: 'CNC_ENTRY_RESTORE', entry: removedEntry, index: originalIndex }
```

If reduced motion is active, skip the delay and dispatch immediately.

## Blank Entry Detection

Add a selector/helper for blank detection.

Recommended:

```ts
function isCncEntryBlankForRemoval(
  entry: CncEntry,
  state: ProductionState
): boolean
```

Treat an entry as blank/default only when all user-entered production and identity fields are empty/default:

```text
operator is blank
machine is blank
hex is null/blank
size is blank
cycleMinutes is null/blank
cycleSeconds is null/blank
partsCount is null/blank
timeIn equals current shift default and timeInTouched is false
timeOut equals current shift default and timeOutTouched is false
side equals the default side, if side has a default
```

Important edge cases:

- If the worker changed only Time In, the card is not blank.
- If the worker changed only Time Out, the card is not blank.
- If the worker selected only Side 2, the card is not blank.
- If Phase 3 defaults Side 1, Side 1 alone does not make the card non-blank.
- If the worker typed `0` parts count and Phase 4 stores it, treat it as non-blank because it is user-entered data.

This helper should be pure and testable. Prefer `selectors.ts` or a state utility module over component-local logic.

## Reducer Behavior

### `CNC_ENTRY_ADD`

Expected behavior:

```ts
case 'CNC_ENTRY_ADD': {
  const entry = createAddedCncEntry(state);

  return {
    ...state,
    cncEntries: [...state.cncEntries, entry],
  };
}
```

Do not mutate the array in place.

### `CNC_ENTRY_DUPLICATE`

Expected behavior:

```ts
case 'CNC_ENTRY_DUPLICATE': {
  const index = state.cncEntries.findIndex((entry) => entry.id === action.entryId);
  if (index === -1) return state;

  const duplicate = createDuplicatedCncEntry(state.cncEntries[index]);

  return {
    ...state,
    cncEntries: [
      ...state.cncEntries.slice(0, index + 1),
      duplicate,
      ...state.cncEntries.slice(index + 1),
    ],
  };
}
```

### `CNC_ENTRY_REMOVE`

Expected behavior:

```ts
case 'CNC_ENTRY_REMOVE': {
  return {
    ...state,
    cncEntries: state.cncEntries.filter((entry) => entry.id !== action.entryId),
  };
}
```

If the id is not present, returning an equivalent state is acceptable.

Do not auto-create a replacement blank entry after removing the final entry. The empty state is part of this phase's acceptance criteria.

### `CNC_ENTRY_RESTORE`

Expected behavior:

```ts
case 'CNC_ENTRY_RESTORE': {
  if (state.cncEntries.some((entry) => entry.id === action.entry.id)) {
    return state;
  }

  const index = Math.max(0, Math.min(action.index, state.cncEntries.length));

  return {
    ...state,
    cncEntries: [
      ...state.cncEntries.slice(0, index),
      action.entry,
      ...state.cncEntries.slice(index),
    ],
  };
}
```

This prevents duplicate restores if the Undo button is tapped twice quickly.

## UI Components

## `AddCncEntryButton`

Create:

```text
src/components/cnc/AddCncEntryButton.tsx
```

Props:

```ts
type AddCncEntryButtonProps = {
  onClick: () => void;
};
```

Behavior:

- Renders after the last CNC card.
- Renders after the empty-state copy when there are zero CNC entries.
- Has type `button`.
- Uses copy exactly:

```text
+ Add CNC Entry
```

Style requirements from `detailed_ui_ux_design.md`:

```text
full width
height 56px
background var(--bg-card)
1.5px dashed border var(--border-strong)
border radius 16px
centered text
body-lg
font weight 600
color var(--accent-600)
120ms press fill to var(--accent-50)
```

If the app is using Tailwind classes from Phase 1, express these through the local token mapping instead of raw hex values.

## `CncSection`

Update:

```text
src/components/cnc/CncSection.tsx
```

Responsibilities:

- Render section heading and subtitle.
- Render all `cncEntries`.
- Render empty state when `cncEntries.length === 0`.
- Render `AddCncEntryButton`.
- Dispatch add and duplicate actions.
- Coordinate remove + undo.
- Keep animation state outside the production reducer.

Recommended local UI state:

```ts
const [exitingEntryIds, setExitingEntryIds] = useState<Set<string>>(new Set());
const [toast, setToast] = useState<ToastState | null>(null);
```

Alternative:

- Put toast state in `App.tsx` if later phases already introduced global toasts.
- Do not put transient UI animation flags into `ProductionState`.

Recommended helper for remove:

```ts
function removeEntry(entryId: string) {
  const index = state.cncEntries.findIndex((entry) => entry.id === entryId);
  if (index === -1) return;

  const removedEntry = state.cncEntries[index];
  // animate, dispatch remove, show toast
}
```

When all entries are removed, render:

```text
No CNC entries yet.
Tap + Add CNC Entry to start.
```

Use muted body text. Do not make it an error state.

## `CncEntryCard`

Update:

```text
src/components/cnc/CncEntryCard.tsx
```

New props should be close to:

```ts
type CncEntryCardProps = {
  entry: CncEntry;
  index: number;
  isBlank: boolean;
  isExiting?: boolean;
  onDuplicate: (entryId: string) => void;
  onRemove: (entryId: string) => void;
};
```

The card may own its own local confirmation state:

```ts
const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
```

Remove button behavior:

```text
if isBlank:
  onRemove(entry.id)
else:
  setIsConfirmingRemove(true)
```

When `isConfirmingRemove` is true:

- Replace the normal Duplicate/Remove action row.
- Render inline confirm strip.
- Cancel returns to normal action row.
- Remove calls `onRemove(entry.id)`.

Do not show both the normal action row and confirm strip at the same time.

## Toast Primitive

Create:

```text
src/components/primitives/Toast.tsx
```

Props:

```ts
type ToastProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  durationMs?: number;
};
```

For this phase:

```tsx
<Toast
  message="Entry removed"
  actionLabel="Undo"
  onAction={restoreRemovedEntry}
  durationMs={4000}
/>
```

Visually, this should read as:

```text
Entry removed · Undo
```

Implementation notes:

- The dot separator can be visual spacing between message and action.
- The Undo action must be a real button, not plain clickable text.
- Use `role="status"` for non-blocking announcement.
- Use one toast slot only.
- New toast replaces the old toast.
- Clear the timer on unmount.
- Clear the timer when Undo is tapped.

Styling from `detailed_ui_ux_design.md`:

```text
position fixed
bottom centered
width min(420px, calc(100% - 32px))
dark background using text-primary token
inverse text
padding space-3 space-4
border radius 12
shadow-lg
toast in/out 180ms
```

Phase 7 introduces the Sticky Action Bar. Until then, place the toast above the safe-area bottom with enough spacing:

```css
bottom: calc(env(safe-area-inset-bottom) + 24px);
```

In Phase 7, adjust this to sit just above the sticky action bar.

## Animation Plan

The design requires:

```text
Card add:    220ms cubic-bezier(0.2, 0, 0, 1)
Card remove: 180ms ease-in
Reduced motion: no slide
```

Use CSS classes or data attributes. Keep the implementation small.

Recommended class model:

```text
cnc-card-shell
cnc-card-shell--entering
cnc-card-shell--exiting
```

or:

```tsx
<div data-entering={isNew} data-exiting={isExiting}>
```

Suggested motion:

```css
.cnc-card-shell--entering {
  animation: cnc-card-enter 220ms cubic-bezier(0.2, 0, 0, 1);
}

.cnc-card-shell--exiting {
  animation: cnc-card-exit 180ms ease-in forwards;
}

@media (prefers-reduced-motion: reduce) {
  .cnc-card-shell--entering,
  .cnc-card-shell--exiting {
    animation: none;
  }
}
```

Keep motion functional:

- subtle translateY
- subtle opacity
- no bounce
- no scale larger than 1

Do not animate field values.

## Add Animation Implementation Detail

The easiest reliable add animation is:

1. Dispatch add/duplicate.
2. Record the newly created id as `lastInsertedEntryId`.
3. Render that card with entering class for one animation frame or one timeout.

However, the reducer currently returns only state, not the new id.

Use one of these approaches:

### Preferred Approach

Generate the new entry id inside the reducer helper, then identify the newest entry after state changes by position:

- Add inserts at the end, so the new card is the last entry.
- Duplicate inserts after the source, so the component can mark the source id as "duplicate requested" and then identify the next item after that source after dispatch.

This can get awkward.

### Simpler Approach

Skip JavaScript-driven add class tracking and use CSS animation on card mount:

```css
.cnc-card-shell {
  animation: cnc-card-enter 220ms cubic-bezier(0.2, 0, 0, 1);
}
```

Because existing cards are not remounted when keyed by stable `entry.id`, only newly inserted cards animate.

This requires stable keys:

```tsx
{cncEntries.map((entry, index) => (
  <CncEntryCard key={entry.id} ... />
))}
```

Use this simpler approach unless the existing component structure remounts all cards.

## Remove Animation Implementation Detail

For remove:

1. Add entry id to `exitingEntryIds`.
2. If reduced motion is not active, wait 180ms.
3. Dispatch `CNC_ENTRY_REMOVE`.
4. Remove id from `exitingEntryIds`.

Pseudo-code:

```ts
const removeDelay = prefersReducedMotion ? 0 : 180;

setExitingEntryIds((ids) => new Set(ids).add(entryId));

window.setTimeout(() => {
  dispatch({ type: 'CNC_ENTRY_REMOVE', entryId });
  setExitingEntryIds((ids) => {
    const next = new Set(ids);
    next.delete(entryId);
    return next;
  });
  showUndoToast(removedEntry, index);
}, removeDelay);
```

Avoid memory leaks:

- Track timeout ids if the component can unmount during the timer.
- Clear them in `useEffect` cleanup.

If the codebase has no reduced-motion hook, use CSS media query for visuals and a tiny hook only if needed to skip the remove delay.

## Reduced Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Acceptance requires card slide to be disabled.

At minimum:

- CSS disables card enter animation.
- CSS disables card exit animation.

Better:

- JS also skips the 180ms remove delay.

If adding a hook, keep it tiny:

```ts
function usePrefersReducedMotion(): boolean
```

It should:

- default to false during first render
- read `window.matchMedia('(prefers-reduced-motion: reduce)')`
- update if the media query changes
- guard against `window` being unavailable

## Totals Behavior

Phase 4 already implemented:

```text
entryProductionHours(entry)
totalCncHours(state)
```

Do not rewrite the formula.

This phase only needs to ensure totals respond to:

```text
add
duplicate
remove
restore
```

Expected outcomes:

- Added blank entries contribute `0.00`.
- Duplicated entries contribute `0.00` until parts count is entered because parts count is intentionally blank.
- Removed entries stop contributing.
- Undo restored entries contribute exactly what they contributed before removal.
- Empty CNC section shows `0.00` CNC hours.

## Implementation Steps

## Step 1 - Read Current Phase 4 State Shape

Inspect:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/components/cnc/CncSection.tsx
src/components/cnc/CncEntryCard.tsx
```

Confirm:

- actual `CncEntry` field names
- how ids are generated
- how shift defaults are computed
- where touched flags live
- how `CNC_FIELD_SET` is shaped
- how card title and subtitle derive from `index`
- how `totalCncHours` is consumed by `LiveTotalsStrip`

Do not begin edits until these names are known.

## Step 2 - Add Or Extend Entry Factories

In `src/state/reducer.ts`, or wherever Phase 1/4 put state factories:

1. Add helper for a blank entry.
2. Add helper for an added entry.
3. Add helper for duplicated entry.

Keep all default decisions in one place.

Make sure new entries receive stable unique ids. If the app already uses `crypto.randomUUID()`, continue using it. If it uses a local `createId()` helper, continue using that.

Do not use array index as an id.

## Step 3 - Add Reducer Actions

Extend `ProductionAction` with:

```text
CNC_ENTRY_ADD
CNC_ENTRY_REMOVE
CNC_ENTRY_DUPLICATE
CNC_ENTRY_RESTORE
```

Implement all four cases.

Reducer acceptance at this step:

- Add appends one entry.
- Duplicate inserts one entry immediately after source.
- Remove removes only the matching entry.
- Restore inserts at original index.
- Restore no-ops if the id is already present.

## Step 4 - Add Blank Detection Helper

In `src/state/selectors.ts`, add:

```ts
isCncEntryBlankForRemoval(entry, state)
```

This helper should know the current shift defaults so that untouched default time fields do not force confirmation.

Do not treat derived hours as data.

Use this helper in the UI rather than duplicating blank checks in `CncEntryCard`.

## Step 5 - Create Add Button Component

Create:

```text
src/components/cnc/AddCncEntryButton.tsx
```

Render exactly:

```text
+ Add CNC Entry
```

Wire only `onClick`.

No internal state.

No direct reducer access.

## Step 6 - Create Toast Primitive

Create:

```text
src/components/primitives/Toast.tsx
```

For this phase, support:

- message
- optional action label
- optional action callback
- 4s actionable timeout
- one visible toast
- automatic dismiss
- manual action dismiss

Keep it generic enough for later phases:

- Phase 7 uses `"Add an entry first."`
- Phase 8 uses `"Image ready."`
- Phase 9 uses share/download toasts
- Phase 10 uses `"Added [name]."`

Do not overbuild a full toast provider unless the current app architecture already has one.

## Step 7 - Wire `CncSection`

Update `CncSection` to:

1. Read `state.cncEntries`.
2. Render cards with stable `key={entry.id}`.
3. Pass `index + 1` or `index` according to existing title conventions.
4. Pass `isBlank`.
5. Pass `isExiting`.
6. Pass `onDuplicate`.
7. Pass `onRemove`.
8. Render empty state when there are no entries.
9. Render Add button after cards/empty state.
10. Render the toast slot.

The visible order should be:

```text
CNC Production
Add one entry per machine + size + side.

[CNC Entry 1]
[CNC Entry 2]
[CNC Entry 3]
[+ Add CNC Entry]
```

When empty:

```text
CNC Production
Add one entry per machine + size + side.

No CNC entries yet.
Tap + Add CNC Entry to start.

[+ Add CNC Entry]
```

## Step 8 - Wire `CncEntryCard`

Update `CncEntryCard` action area:

Resting state:

```text
[Duplicate] [Remove]
```

Confirm state:

```text
Remove this CNC entry? [Cancel] [Remove]
```

Behavior:

- Duplicate dispatches through `onDuplicate(entry.id)`.
- Remove checks `isBlank`.
- Blank remove calls `onRemove(entry.id)` immediately.
- Non-blank remove sets local confirm state.
- Cancel clears local confirm state.
- Confirm remove clears local confirm state and calls `onRemove(entry.id)`.

If a card begins exiting, disable controls on that card so duplicate/remove cannot be triggered twice during the 180ms window.

## Step 9 - Add Card Motion Classes

Add CSS for:

```text
cnc-card-enter
cnc-card-exit
```

Use the app's existing CSS location from Phase 1. If Phase 1 put all global styles in:

```text
src/index.css
```

add motion classes there.

If Phase 3 put card-specific styles beside the component, follow that pattern.

Do not introduce a new animation library.

## Step 10 - Integrate Toast In App Layout If Needed

If the toast is rendered inside `CncSection`, no `App.tsx` change may be needed.

If the existing layout clips overflow or if later phases already have app-level feedback, place the toast host in:

```text
src/App.tsx
```

For Phase 5, local `CncSection` toast state is acceptable because the only toast source in this phase is CNC remove undo.

## Step 11 - Verify Total Calculation Across List Changes

Manual state scenarios:

1. One complete CNC entry.
2. Add blank entry.
3. Duplicate complete entry.
4. Enter parts count into duplicate.
5. Remove original.
6. Undo remove.
7. Remove all entries.

At each point, verify:

```text
Live Totals Strip CNC Hours
entry-level Production Hours
card completeness state
```

The duplicate should not contribute hours until its own parts count is entered.

## Step 12 - Test Reduced Motion

Use browser devtools or a Playwright/browser emulation path if available.

Verify:

- Add does not slide under reduced motion.
- Remove does not slide under reduced motion.
- Remove still works.
- Undo still restores the entry.

If there is no automated browser tool available in the implementation session, document the manual check in the final implementation notes.

## Step 13 - Keep Scope Tight

Before finishing, verify this phase did not accidentally add:

- Burma fields
- Repair fields
- Notes fields
- sticky action bar
- summary preview
- persistence
- routing

Those belong to later phases.

## Component Contract Details

## `CncSection` Event Flow

Add:

```text
AddCncEntryButton click
-> dispatch CNC_ENTRY_ADD
-> new card mounts at bottom
-> CSS enter animation runs
-> total remains unchanged until production fields are filled
```

Duplicate:

```text
CncEntryCard Duplicate click
-> dispatch CNC_ENTRY_DUPLICATE(sourceId)
-> duplicate card mounts after source
-> copied fields render
-> parts count is blank
-> duplicate production hours is 0 / incomplete
```

Blank remove:

```text
CncEntryCard Remove click
-> isBlank true
-> CncSection captures entry + index
-> exit animation
-> dispatch CNC_ENTRY_REMOVE
-> toast appears
```

Filled remove:

```text
CncEntryCard Remove click
-> isBlank false
-> card shows inline confirm strip
-> worker taps Remove
-> CncSection captures entry + index
-> exit animation
-> dispatch CNC_ENTRY_REMOVE
-> toast appears
```

Undo:

```text
Toast Undo click
-> dispatch CNC_ENTRY_RESTORE(entry, originalIndex)
-> toast dismisses
-> restored card mounts at original index
-> totals include restored entry again
```

## Index And Title Behavior

Card title should remain positional:

```text
CNC Entry 1
CNC Entry 2
CNC Entry 3
```

Do not store display numbers in the entries.

When an entry is removed:

- remaining cards renumber naturally from array order

When Undo restores:

- restored entry returns to original index
- card titles renumber naturally

Example:

```text
Before remove:
CNC Entry 1: A
CNC Entry 2: B
CNC Entry 3: C

Remove B:
CNC Entry 1: A
CNC Entry 2: C

Undo:
CNC Entry 1: A
CNC Entry 2: B
CNC Entry 3: C
```

## Data Ownership

Production state owns:

```text
entry data
entry ids
entry array order
```

Component state owns:

```text
inline confirm open/closed
currently exiting ids
current toast
remove timeout ids
```

Do not put transient UI state into `ProductionState`.

## Toast Ownership

For Phase 5, the toast can be owned by `CncSection`.

The toast payload can be:

```ts
type ToastState = {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs: number;
};
```

The undo payload should not be stored inside the reducer. Store it in the closure passed to `onAction`, or in a local ref/state in `CncSection`.

When a new remove happens while an old undo toast is still visible:

- new toast replaces old toast
- old undo is no longer available
- this matches the design rule: at most one toast at a time

## Accessibility Notes

Keep this phase accessible without expanding scope:

- Add button is a real `<button>`.
- Duplicate and Remove are real `<button>` elements.
- Confirm Remove is a real button with danger styling.
- Toast Undo is a real `<button>`.
- Toast uses `role="status"`.
- Do not auto-focus the toast.
- When confirm strip appears, leave focus behavior simple:
  - acceptable: focus remains on Remove button
  - better: focus the Cancel button or confirm strip container
- Escape-to-cancel is optional for Phase 5 because this is inline UI, not a modal.

## Visual Notes

Follow the existing Phase 3 card visual system.

Add tile should not look like a primary CTA. It is a section-level utility action:

```text
dashed border
card background
accent text
no heavy shadow
```

Remove resting state should not use danger fill.

Danger is used only after confirmation:

```text
Confirm strip Remove button
```

The empty state should be quiet:

```text
muted text
no warning icon
no error color
no large empty illustration
```

## Edge Cases

## Add With Zero Entries

If the user removes all entries and then taps Add:

- create one blank entry
- use current shift defaults
- touched flags false
- card title is `CNC Entry 1`

## Duplicate With Zero Entries

Not possible from UI because no card exists.

Reducer should still no-op if source id is not found.

## Remove Last Entry

Allowed.

Result:

```text
cncEntries = []
totalCncHours = 0
empty state visible
Add button visible
```

Do not recreate a blank card automatically.

## Undo After Removing Last Entry

If the last entry is removed and Undo is tapped:

- restore at index `0`
- empty state disappears
- card returns as `CNC Entry 1`
- totals restore

## Undo After Adding Another Entry

Example:

```text
Remove B from [A, B, C]
Current list becomes [A, C]
User adds D
Current list becomes [A, C, D]
User taps Undo
```

Restore B at original index:

```text
[A, B, C, D]
```

Because restore clamps index and inserts, this works naturally.

## Undo After Source Data Changes

Undo restores the removed snapshot, not any edited future version.

This is correct because the removed card no longer exists after removal.

## Duplicate Then Shift Change

Duplicated entries should copy the source entry touched flags.

That means:

- If source times were untouched shift defaults, duplicate times can still shift with future shift changes.
- If source times were manually changed, duplicate times remain fixed.

This matches Phase 4's touched-flag model.

## Add Then Shift Change

New added entries that inherited actual user-touched times should not be overwritten by future shift changes.

New added entries that only received untouched shift defaults should continue to shift with the selected shift.

## Multiple Fast Remove Clicks

Prevent duplicate remove timers:

- disable card controls while `isExiting`
- no-op if entry id is already in `exitingEntryIds`

## Tests / Verification

If the project has a test setup by the time Phase 5 is implemented, add focused reducer tests.

Recommended reducer tests:

```text
CNC_ENTRY_ADD appends blank entry with smart-copied times
CNC_ENTRY_ADD uses shift defaults when previous times are untouched defaults
CNC_ENTRY_DUPLICATE inserts after source
CNC_ENTRY_DUPLICATE copies identity/cycle/time fields
CNC_ENTRY_DUPLICATE does not copy partsCount
CNC_ENTRY_REMOVE removes exactly one id
CNC_ENTRY_RESTORE restores original entry at original index
CNC_ENTRY_RESTORE no-ops when id already exists
```

Recommended selector tests:

```text
blank default entry is blank
entry with operator is not blank
entry with machine is not blank
entry with hex is not blank
entry with size is not blank
entry with Side 2 is not blank
entry with cycle time is not blank
entry with parts count is not blank
entry with touched Time In is not blank
entry with touched Time Out is not blank
```

Manual QA checklist:

- [ ] App opens with one blank CNC entry visible.
- [ ] Add button appears after the first card.
- [ ] Tapping Add appends a new card.
- [ ] Tapping Add five times produces six total cards including the initial card.
- [ ] New Add cards copy Time In / Time Out from the previous card.
- [ ] Add cards do not copy operator, machine, hex, size, cycle time, or parts count.
- [ ] Duplicate inserts the new card immediately after the source card.
- [ ] Duplicate copies operator.
- [ ] Duplicate copies machine.
- [ ] Duplicate copies hex.
- [ ] Duplicate copies size.
- [ ] Duplicate copies side.
- [ ] Duplicate copies cycle time.
- [ ] Duplicate copies Time In / Time Out.
- [ ] Duplicate does not copy parts count.
- [ ] Duplicate has production hours incomplete/zero until count is entered.
- [ ] Removing a blank card does not ask for confirmation.
- [ ] Removing a filled card shows inline confirmation.
- [ ] Cancel from inline confirmation returns to Duplicate/Remove buttons.
- [ ] Confirm Remove removes the card.
- [ ] Remove toast says `Entry removed · Undo`.
- [ ] Undo restores the removed card.
- [ ] Undo restores at the same index.
- [ ] Removing all entries shows empty state copy.
- [ ] Add from empty state creates `CNC Entry 1`.
- [ ] CNC Hours total reflects sum across all entries.
- [ ] CNC Hours total returns to `0.00` when all entries are removed.
- [ ] Add animation runs at normal motion settings.
- [ ] Remove animation runs at normal motion settings.
- [ ] Reduced motion disables add/remove slide.
- [ ] No console errors during add, duplicate, remove, undo.

## Acceptance Criteria

- [ ] Adding 5 CNC entries in a row works smoothly with no layout jank.
- [ ] New entries inherit Time In/Out from the previous entry.
- [ ] If previous entry times are untouched shift defaults, Add falls back to current shift defaults and keeps touched flags false.
- [ ] Add does not copy operator, machine, hex, size, cycle time, or parts count.
- [ ] Duplicate copies all specified fields except partsCount.
- [ ] Duplicate inserts immediately after the source entry.
- [ ] Remove on blank/default card removes instantly.
- [ ] Remove on filled card shows the inline confirm strip.
- [ ] Inline confirm copy is not scary and stays in context.
- [ ] Cancel from inline confirm restores the normal card action row.
- [ ] Confirm Remove removes the card.
- [ ] Bottom toast renders `Entry removed · Undo`.
- [ ] Toast lasts 4 seconds unless replaced or actioned.
- [ ] Undo restores the exact removed entry.
- [ ] Undo restores the entry at the same index.
- [ ] CNC Hours live total reflects the sum across all entries.
- [ ] Empty state renders when all entries are removed.
- [ ] Add button remains available from empty state.
- [ ] `prefers-reduced-motion: reduce` disables card add/remove slide.
- [ ] No later-phase surfaces are introduced.

## Handoff Notes For Phase 6

Phase 6 should be able to start from:

- CNC section that supports zero, one, or many entries
- stable add behavior
- stable duplicate behavior
- stable remove behavior
- undo restore at original index
- correct total CNC hours across all entries
- reusable `Toast` primitive
- reusable empty-state pattern
- card list animation that honors reduced motion

Expected Phase 6 changes:

- add Burma card
- add Repair card
- add Notes card
- add Burma total selector
- feed Burma total into Live Totals Strip
- reuse Toast only if needed; do not redesign it

## Rationale

This phase is intentionally focused on list behavior before adding the rest of the form surface.

The CNC section is the most complex part of the app because it combines:

```text
repeatable rows
derived calculations
smart defaults
destructive actions
undo
live totals
mobile layout
```

Getting that list model correct now keeps later phases simpler. Burma, Repair, Notes, Sticky Action Bar, Summary, and PNG generation can all trust that CNC state already behaves like the real production day: multiple entries, repeated machines, accidental removals, and totals that stay honest.
