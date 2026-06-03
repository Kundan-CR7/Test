# Phase 11: Draft Persistence + Day Rollover + Validation Pass

## Objective

Make the app resilient to accidental refreshes, next-day reopen behavior, and incomplete CNC data.

After this phase, the worker should be able to:

```text
enter production data
close or refresh the browser
reopen the app on the same date
see the draft restored exactly where it was
```

If the draft is from a previous day, the app should not silently overwrite it. It should show:

```text
You have an unsent entry from [date].  [Resume] [Start fresh]
```

The validation target interaction:

```text
1. Worker partially fills a CNC card.
2. Worker taps Preview.
3. Summary Preview still opens.
4. The incomplete CNC entry is excluded from the Summary Card.
5. The Summary modal says the incomplete entry will not be included.
6. Returning to the form shows a warning banner on the incomplete card.
7. Missing required fields show field-level Required captions.
8. Impossible values show immediately while typing.
9. Filling the missing fields clears the banner and errors.
```

This phase turns the state infrastructure and preview warnings planned in earlier phases into a real "do not lose my work" and "do not summarize bad data" pass.

## Prerequisite

Phases 1 through 10 must be implemented before this phase is executed.

This plan assumes the app already has:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/state/StateContext.tsx
src/state/persistence.ts
src/components/cnc/CncEntryCard.tsx
src/components/cnc/CncSection.tsx
src/components/cnc/OperatorSelect.tsx
src/components/cnc/MachineGrid.tsx
src/components/cnc/HexInputWithChips.tsx
src/components/cnc/SizeSelect.tsx
src/components/cnc/SideToggle.tsx
src/components/cnc/CycleTimeInput.tsx
src/components/cnc/TimeRangeInput.tsx
src/components/cnc/PartsCountInput.tsx
src/components/summary/SummaryModal.tsx
src/components/summary/SummaryCard.tsx
src/App.tsx
```

If the implementation lives under `app/`, apply every source path in this plan under `app/src/...`.

The current workspace has an `app/` implementation with earlier-phase source files and planning docs through Phase 10. Do not execute Phase 11 against `app/src` until Phases 4, 5, 6, 7, 8, 9, and 10 have actually landed there.

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

It also follows `04_mini_phase_protocol.md`: code the feature in English before coding it in React. Phase 11 touches boot state, storage, validation, card UI, and summary filtering, so the execution handoff must be explicit.

For this phase, the source documents and older phase files were reviewed in detail:

- `requirements.md` sections 11 and 22
- `frontend_ui_spec.md` sections 29 and 34
- `detailed_ui_ux_design.md` sections 6.1.13, 7.1, 8.4, 12.1, 12.3, 14, 15.4, and 15.5
- `PHASE_ROADMAP.md` Phase 11
- `PHASE_1_PLAN.md` through `PHASE_10_PLAN.md`
- `production_entry.html` draft, incomplete highlight, validation, and summary behavior as reference only

## Estimated Output

Approximate size: 400-550 LOC.

Expected files created:

```text
src/state/validation.ts
src/components/DraftRolloverBanner.tsx
```

Expected files modified:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/state/StateContext.tsx
src/state/persistence.ts
src/App.tsx
src/components/cnc/CncEntryCard.tsx
src/components/cnc/CncSection.tsx
src/components/cnc/OperatorSelect.tsx
src/components/cnc/MachineGrid.tsx
src/components/cnc/HexInputWithChips.tsx
src/components/cnc/SizeSelect.tsx
src/components/cnc/SideToggle.tsx
src/components/cnc/CycleTimeInput.tsx
src/components/cnc/TimeRangeInput.tsx
src/components/cnc/PartsCountInput.tsx
src/components/summary/SummaryModal.tsx
src/components/summary/SummaryCard.tsx
```

Optional if the existing implementation already has a banner primitive:

```text
src/components/primitives/Banner.tsx
```

Optional if boot-state construction needs to be separated from React:

```text
src/state/bootstrap.ts
```

Do not modify `production_entry.html` except as a read-only reference. Do not remove or rewrite earlier phase plans.

## Continuity Audit Across Phases 1-10

All existing phase plans line up for Phase 11. There are no blocking contradictions in the older plans.

### Phase 1 Alignment

Phase 1 deliberately avoided reducer actions, persistence, and service worker behavior.

That remains correct. Phase 11 should not revisit foundation, Tailwind tokens, base layout, header shell, or PWA manifest stub except to render the new banners inside the existing shell.

PWA/offline shell caching still belongs to Phase 12.

### Phase 2 Alignment

Phase 2 introduced the state architecture and the `ui.incompleteHighlights` flag.

Phase 11 should reuse that flag. Do not add a second flag named `showErrors`, `validationMode`, or `previewAttempted`.

The desired meaning by Phase 11:

```ts
state.ui.incompleteHighlights === true
```

means:

```text
the user has tried to preview at least once during this draft
```

That flag drives required-field visual errors and CNC card warning banners.

### Phase 3 Alignment

Phase 3 built CNC identity fields and explicitly deferred full required validation to Phase 11.

Phase 11 should add error props to the existing identity fields rather than replacing their UI:

```text
OperatorSelect
MachineGrid
HexInputWithChips
SizeSelect
SideToggle
```

The Phase 3 "Incomplete" card status should remain, but Phase 11 gives it a stronger error state after Preview is attempted.

### Phase 4 Alignment

Phase 4 built cycle time, time range, parts count, production hours, and soft warnings, while deferring the complete validation pass.

Phase 11 should consolidate Phase 4's validation-like logic into `src/state/validation.ts` so cycle warnings, hard errors, entry completeness, and summary inclusion all agree.

Do not keep separate versions of "is this CNC entry valid?" in:

```text
CncEntryCard
selectors.ts
SummaryModal
SummaryCard
png capture
```

Those surfaces should consume one validation source.

### Phase 5 Alignment

Phase 5 added add, duplicate, remove, undo, and card indexing.

Phase 11 should validate every non-blank CNC entry independently. Blank default entries are not treated as incomplete, and should not produce card warning banners after Preview.

Duplicated entries inherit data exactly as Phase 5 defined. If a duplicated entry is incomplete, validation should detect that naturally from the copied values. Do not add duplicate-specific validation behavior.

### Phase 6 Alignment

Phase 6 added Burma, Repair, and Notes.

Phase 11 is CNC validation only. Blank Repair and blank Notes must not create validation errors.

Burma totals remain numeric and summaryable as planned. This phase should not create a final validation gate for Burma counts.

### Phase 7 Alignment

Phase 7 created the sticky Preview CTA state and a CNC completeness report.

Phase 11 should update that selector layer so the CTA, Summary modal, Summary Card, PNG, and card errors use the same validation semantics.

The important carry-forward rule:

```text
soft warnings do not make an entry incomplete
```

Examples that remain soft:

```text
cycle time less than 20 seconds
cycle time more than 10 minutes
parts count very high
production hours greater than shift window
```

### Phase 8 Alignment

Phase 8 introduced Summary Preview, SummaryCard, and the incomplete-entry strip.

Phase 11 should refine the incomplete count if needed, but should not redesign Summary Preview.

The Summary modal should still open even when there are incomplete entries. It should exclude incomplete CNC entries and show the warning strip.

Phase 8 already planned:

```text
1 CNC entry is incomplete and won't be included.
2 CNC entries are incomplete and won't be included.
```

Phase 11 should preserve that copy and compute the count from `validateEntry`.

### Phase 9 Alignment

Phase 9 added PNG generation, download, and share.

Phase 11 should not change the share pipeline. It should only make sure the hidden capture SummaryCard receives the same valid CNC entries as the visible Summary Preview.

Do not fork SummaryCard for capture. Do not add a second filtering path in `png.ts`.

### Phase 10 Alignment

Phase 10 created custom people persistence and `src/state/persistence.ts`.

Phase 11 must extend that file rather than replacing it.

Keep:

```ts
KEY_CUSTOM_PEOPLE = 'productionEntry.v1.customPeople'
```

Add:

```ts
KEY_DRAFT = 'productionEntry.v1.draft'
```

The custom people list remains its own persisted source. The draft may contain the full state, including `customPeople`, but the dedicated custom-people key still exists so Phase 10 behavior stays stable.

### Net Result

The phase boundaries remain well knit:

```text
Phase 7 decides whether Preview should warn.
Phase 8 shows incomplete entries in Summary Preview.
Phase 9 shares the SummaryCard.
Phase 10 persists custom people.
Phase 11 persists the full draft and makes validation authoritative.
Phase 12 owns installability and service worker offline shell.
```

## Inputs

Read in this order before implementing:

1. `PHASE_10_PLAN.md` handoff notes
   - Confirms `src/state/persistence.ts` exists.
   - Confirms custom people are already persisted.
   - Confirms Phase 11 owns draft persistence, day rollover, and validation.
2. `PHASE_ROADMAP.md` Phase 11
   - Defines exact storage key, debounce timing, rollover prompt, validation utility, field errors, and storage failure banner.
3. `requirements.md` section 11
   - Defines CNC hard validation and soft warning conditions.
4. `requirements.md` section 22
   - Confirms V1 local browser save is acceptable.
5. `frontend_ui_spec.md` section 29
   - Defines validation philosophy, required CNC fields, timing, and simple copy.
6. `frontend_ui_spec.md` section 34
   - Defines invalid CNC card banner and cycle/seconds error copy.
7. `detailed_ui_ux_design.md` section 6.1.13
   - Defines the CNC card warning banner placement and styling.
8. `detailed_ui_ux_design.md` section 7.1
   - Defines CNC card default, partial, valid, warned, and errored states.
9. `detailed_ui_ux_design.md` section 8.4
   - Defines validation copy for hard errors and soft warnings.
10. `detailed_ui_ux_design.md` sections 12.1 and 15.4
    - Define localStorage keys, full draft persistence, and 400ms debounce.
11. `detailed_ui_ux_design.md` sections 12.3 and 15.5
    - Define validation rules and timing.
12. `detailed_ui_ux_design.md` section 14
    - Defines storage-full and offline edge cases.
13. `production_entry.html`
    - Reference only for existing prototype behavior.

## What This Phase Adds

- Full-state draft persistence under `productionEntry.v1.draft`.
- Debounced 400ms save after state changes.
- Same-day draft restore on boot.
- Previous-day draft detection on boot.
- Previous-day draft banner with Resume and Start fresh actions.
- Protection against overwriting a previous-day draft before the user chooses.
- Non-blocking storage failure banner.
- `src/state/validation.ts`.
- `validateEntry(entry, state)` or `validateEntry(entry, context)` as the single CNC validation source.
- Hard validation issue list.
- Soft validation issue list.
- Card-level incomplete warning banner after first Preview.
- Field-level required errors after first Preview.
- Immediate field-level errors for impossible values.
- Summary modal incomplete strip backed by the validation utility.
- SummaryCard filtering backed by the validation utility.
- Selector updates so CTA, modal, summary, PNG, and validation agree.

## What This Phase Does NOT Do

- No service worker.
- No offline shell cache.
- No PWA install prompt.
- No backend.
- No Google Sheet sync.
- No server validation.
- No editing custom people.
- No deleting custom people.
- No history screen.
- No long-term reporting database.
- No redesign of Summary Preview.
- No redesign of SummaryCard.
- No change to PNG generation internals unless filtering currently happens there.
- No change to Web Share or download fallback.
- No hard-blocking Preview modal.
- No validation errors for blank Repair fields.
- No validation errors for blank Notes.
- No new route.
- No global state library.

## Product Contract

Phase 11 has two product promises.

### Promise 1: Work Is Not Lost

Every meaningful state change saves to localStorage after a short debounce.

The worker can refresh, close, or accidentally kill the tab. Reopening the same day restores the draft without requiring a manual action.

### Promise 2: Bad CNC Data Does Not Pollute Summary

Preview is still forgiving. It opens even with incomplete cards. But incomplete CNC entries are excluded from:

```text
visible SummaryCard
hidden capture SummaryCard
downloaded PNG
shared PNG
text fallback
```

The worker sees exactly why entries were excluded through the modal strip and form-level validation UI.

## State Model

### Existing Shape

After Phase 10, state should roughly include:

```ts
type ProductionEntryState = {
  date: string;
  shift: Shift;
  people: string[];
  customPeople: string[];
  cncEntries: CncEntry[];
  burma: BurmaState;
  repair: RepairState;
  notes: string;
  ui: {
    incompleteHighlights: boolean;
  };
};
```

### Phase 11 Shape

Prefer not to add more persisted UI flags unless needed.

The existing `ui.incompleteHighlights` is enough for:

```text
required field captions
card warning banners
preview-attempted behavior
```

Do not store ephemeral app-shell banner state inside `ProductionEntryState`.

Keep these outside the persisted draft in local React state:

```ts
rolloverDraft: ProductionEntryState | null
draftSaveFailed: boolean
draftSaveEnabled: boolean
```

Reason: if a previous-day draft exists, the app must not immediately save today's fresh state over it before the user chooses Resume or Start fresh.

### Reducer Actions

Add these actions if they do not already exist:

```ts
type ProductionEntryAction =
  | ExistingActions
  | { type: 'STATE_REPLACE'; state: ProductionEntryState }
  | { type: 'STATE_RESET_FRESH'; now?: Date; customPeople?: string[] }
  | { type: 'UI_INCOMPLETE_HIGHLIGHTS_SET'; value: boolean };
```

If Phase 8 already added `UI_INCOMPLETE_HIGHLIGHTS_SET`, reuse it.

`STATE_REPLACE` is used for Resume.

`STATE_RESET_FRESH` is used for Start fresh.

The reducer should stay pure. Do not call localStorage from the reducer.

## Persistence Architecture

### Keys

Extend `src/state/persistence.ts`.

Keep:

```ts
export const KEY_CUSTOM_PEOPLE = 'productionEntry.v1.customPeople';
```

Add:

```ts
export const KEY_DRAFT = 'productionEntry.v1.draft';
```

Do not rename the Phase 10 custom people key.

### Draft Format

Persist the full `ProductionEntryState`:

```ts
export function saveDraftNow(state: ProductionEntryState): SaveDraftResult
export function loadDraft(): ProductionEntryState | null
export function clearDraft(): void
```

Use a small result object for save so App can render the storage failure banner:

```ts
type SaveDraftResult =
  | { ok: true }
  | { ok: false; reason: 'quota' | 'unavailable' | 'unknown' };
```

The implementation can collapse reasons if the codebase does not need them, but it must return enough information for the UI to know the write failed.

### Debounce

Use a 400ms debounce.

Preferred shape:

```ts
export function createDraftSaver(options: {
  delayMs?: number;
  onError?: (result: SaveDraftResult) => void;
}) {
  let timeoutId: number | null = null;

  return {
    schedule(state: ProductionEntryState) {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const result = saveDraftNow(state);
        if (!result.ok) options.onError?.(result);
      }, options.delayMs ?? 400);
    },
    flush(state: ProductionEntryState) {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = null;
      return saveDraftNow(state);
    },
    cancel() {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = null;
    },
  };
}
```

If the app already has a generic debounce helper, use it.

### Boot Flow

The boot flow is the highest-risk part of this phase.

Do not implement this:

```text
initialize today's blank state
start autosave immediately
load previous-day draft later
```

That can overwrite the previous-day draft before the worker chooses.

Implement this instead:

```text
1. load custom people
2. load draft
3. compute today's date string
4. if no draft:
     initial state = createInitialState(today, customPeople)
     rolloverDraft = null
     draftSaveEnabled = true
5. if draft.date === today:
     initial state = normalizeHydratedDraft(draft, customPeople)
     rolloverDraft = null
     draftSaveEnabled = true
6. if draft.date !== today:
     initial state = createInitialState(today, customPeople)
     rolloverDraft = normalizeHydratedDraft(draft, customPeople)
     draftSaveEnabled = false
7. render app
8. if rolloverDraft exists, show top banner
```

### Normalizing Hydrated Drafts

Hydrated drafts should be normalized just enough to survive version drift.

Required normalization:

```text
ensure customPeople exists
merge basePeople + customPeople into people
ensure ui.incompleteHighlights exists
ensure cncEntries is an array
ensure at least one CNC entry exists
```

Do not aggressively "fix" user-entered values during hydration. Validation should report issues; hydration should preserve the draft.

### Resume Previous Draft

When the worker taps Resume:

```text
dispatch STATE_REPLACE with rolloverDraft
rolloverDraft = null
draftSaveEnabled = true
schedule or flush save for the restored draft
```

The resumed draft keeps its original date.

Reason: the banner says the entry is from a previous date. If the worker chooses Resume, that date should be preserved unless they manually change it.

### Start Fresh

When the worker taps Start fresh:

```text
clearDraft()
dispatch STATE_RESET_FRESH for today
rolloverDraft = null
draftSaveEnabled = true
schedule or flush save for the fresh state
```

Use today's date from the same date utility used by the reducer.

### Same-Day Restore

If the draft date is today:

```text
restore silently
do not show banner
autosave remains enabled
```

This should restore:

```text
date
shift
people/customPeople
CNC entries
Burma counts
Repair fields
Notes
ui.incompleteHighlights
```

Because the spec says full state, do not exclude `ui.incompleteHighlights`. If the worker had already previewed before closing, reopening should keep the validation state.

### Storage Full Handling

Catch all localStorage write failures.

Show a non-blocking banner:

```text
Couldn't save draft. Finish and share before closing.
```

The in-memory state must continue to work.

Do not crash. Do not block typing. Do not prevent Preview or Share.

Only one visible banner is needed. Avoid repeated toast spam on every failed debounced save.

### Draft Save Scope

Save on every state change after boot decision:

```ts
useEffect(() => {
  if (!draftSaveEnabled) return;
  draftSaver.schedule(state);
}, [state, draftSaveEnabled]);
```

Cancel pending saves on unmount if the helper supports it.

Optionally flush on `visibilitychange` when the page becomes hidden:

```text
document.visibilityState === 'hidden'
```

This is useful on mobile browsers, but the core acceptance is the 400ms debounced save.

## Validation Architecture

Create:

```text
src/state/validation.ts
```

This file should be pure. It should not import React, localStorage, DOM APIs, or UI components.

### Types

Use explicit issue codes so UI code does not parse messages.

```ts
export type ValidationSeverity = 'hard' | 'soft';

export type ValidationIssueField =
  | 'operator'
  | 'machine'
  | 'hex'
  | 'size'
  | 'side'
  | 'cycle'
  | 'cycleMinutes'
  | 'cycleSeconds'
  | 'timeIn'
  | 'timeOut'
  | 'partsCount'
  | 'productionHours';

export type ValidationIssueCode =
  | 'operator_required'
  | 'machine_required'
  | 'hex_required'
  | 'hex_range'
  | 'size_required'
  | 'side_required'
  | 'cycle_required'
  | 'cycle_seconds_range'
  | 'cycle_zero'
  | 'parts_required'
  | 'parts_positive'
  | 'time_required'
  | 'time_order'
  | 'cycle_low'
  | 'cycle_high'
  | 'hours_exceed_shift'
  | 'parts_high';

export type ValidationIssue = {
  severity: ValidationSeverity;
  code: ValidationIssueCode;
  field: ValidationIssueField;
  message: string;
};

export type ValidationReport = {
  hard: ValidationIssue[];
  soft: ValidationIssue[];
  complete: boolean;
};
```

### Public API

Provide one main function:

```ts
export function validateEntry(
  entry: CncEntry,
  context: {
    shift: Shift;
    shiftWindowMinutes?: number;
  },
): ValidationReport
```

Also provide small helpers:

```ts
export function isCncEntryBlank(entry: CncEntry): boolean
export function isCncEntryComplete(entry: CncEntry, context: ValidationContext): boolean
export function validCncEntries(state: ProductionEntryState): CncEntry[]
export function invalidNonBlankCncEntries(state: ProductionEntryState): CncEntry[]
```

If `validCncEntries` already exists in `selectors.ts`, keep the export there and make it delegate to `validation.ts`.

The goal is not file purity for its own sake. The goal is one validation definition.

### Blank Entry Rule

Blank default CNC cards should not count as incomplete.

Use an explicit blank check:

```text
operator empty
machine empty
hex null
size empty
side default or null
cycle minutes null or 0
cycle seconds null or 0
time values still default and untouched
parts count null or 0
production hours null
```

Because Phase 3 and Phase 4 may initialize Side 1 by default and shift default times by default, blankness cannot simply be "all fields empty".

Use touched flags and non-default production fields where available:

```text
timeInTouched
timeOutTouched
```

If earlier phases did not preserve touched flags, treat default shift times as blank only when every other user-entered field is blank.

### Hard Rules

Hard issues make the entry incomplete and exclude it from summary.

| Field | Rule | Message |
|---|---|---|
| operator | blank | `Required` |
| machine | not M1-M8 | `Required` |
| hex | blank | `Required` |
| hex | less than 0 or greater than 100 | `Hex must be between 0 and 100.` |
| size | blank | `Required` |
| side | neither 1 nor 2 | `Required` |
| cycle | missing | `Required` |
| cycleSeconds | less than 0 or greater than 59 | `Seconds should be 0 to 59.` |
| cycle | total seconds equals 0 | `Cycle time can't be zero.` |
| partsCount | blank | `Required` |
| partsCount | less than or equal to 0 | `Required` |
| timeIn/timeOut | missing | `Required` |
| timeOut | less than or equal to timeIn | `Time Out should be after Time In.` |

The roadmap hard-rule list omits `size`, but `frontend_ui_spec.md` section 29 says a complete CNC entry requires size. Include it.

### Soft Rules

Soft issues do not exclude the entry from summary.

| Condition | Message |
|---|---|
| cycle seconds less than 20 | `Cycle time looks low - please confirm.` |
| cycle seconds greater than 600 | `Cycle time looks high - please confirm.` |
| production hours greater than shift window | `Hours exceed shift window - please check count or cycle.` |
| parts count greater than 1000 | `Please check if count is correct.` |

Use ASCII hyphens in source text unless the app already uses typographic punctuation.

### Time Parsing

Add a pure helper if one does not already exist:

```ts
function timeToMinutes(value: string): number | null
```

Rules:

```text
empty -> null
invalid HH:mm -> null
08:30 -> 510
18:30 -> 1110
```

For V1, do not support overnight shifts unless an earlier phase already did. Current shifts are same-day:

```text
Morning 08:30-18:30
Evening 19:00-21:30
```

### Cycle Parsing

Use a helper:

```ts
function cycleSeconds(entry: CncEntry): number | null
```

Rules:

```text
minutes null and seconds null -> null
minutes missing -> 0
seconds missing -> 0
seconds outside 0-59 -> hard issue
total 0 -> hard issue
```

Do not compute hours from invalid cycle seconds.

### Production Hours

If `entryProductionHours(entry)` exists from Phase 4 or selectors, use it.

If it does not exist, create one shared helper in selectors or validation and consume it everywhere.

Formula:

```text
cycleSeconds * partsCount / 3600
```

Round only for display. Validation can compare raw or rounded values, but be consistent.

### Summary Inclusion

An entry appears in the SummaryCard only when:

```text
!isCncEntryBlank(entry)
validateEntry(entry, context).hard.length === 0
```

A blank default card appears nowhere and does not count as incomplete.

A non-blank card with any hard issue is excluded and counted as incomplete.

Soft warnings do not exclude.

## UI Wiring

### App-Level Draft Banners

Render app-level banners below the header and above Date/Shift.

Previous-day draft banner:

```text
You have an unsent entry from [date].
[Resume] [Start fresh]
```

Storage failure banner:

```text
Couldn't save draft. Finish and share before closing.
```

These should use existing warning colors:

```text
--warning-50 background
--warning-600 text
--border-soft or warning border
```

Use compact mobile sizing. The banner should not look like a modal and should not block form input.

### CNC Card Warning Banner

In `CncEntryCard`, compute:

```ts
const report = validateEntry(entry, validationContext);
const showCardWarning =
  state.ui.incompleteHighlights &&
  !isCncEntryBlank(entry) &&
  report.hard.length > 0;
```

Render at the top of the card body above the field grid:

```text
Please complete this entry.
```

It should auto-clear once `report.hard.length === 0`.

Do not show the banner on initial page load.

Do not show the banner on a blank default card.

### Field-Level Error Timing

Required errors:

```text
show only when state.ui.incompleteHighlights === true
and the entry is non-blank
and the required field is missing
```

Impossible values:

```text
show immediately when present
```

Immediate cases:

```text
hex outside 0-100
seconds outside 0-59
cycle total equals 0 after the user has typed a cycle value
timeOut <= timeIn after both values are present
partsCount <= 0 after the user has typed a value
```

If the existing implementation has touched flags for specific fields, use them for cleaner timing. Do not introduce a large touched-state system unless the codebase already needs it.

### Field Error Props

Prefer a simple prop convention across components:

```ts
type FieldValidationProps = {
  error?: string;
  warning?: string;
};
```

Apply to:

```text
OperatorSelect
MachineGrid
HexInputWithChips
SizeSelect
SideToggle
CycleTimeInput
TimeRangeInput
PartsCountInput
```

Visuals:

```text
red border on invalid field/control
danger caption below the field
warning caption below fields with soft warnings
```

Do not add large helper text blocks. Use compact captions.

### Specific Field Mappings

Operator:

```text
operator_required -> OperatorSelect error "Required"
```

Machine:

```text
machine_required -> MachineGrid error "Required"
```

Hex:

```text
hex_required -> HexInputWithChips error "Required"
hex_range -> HexInputWithChips error "Hex must be between 0 and 100."
```

Size:

```text
size_required -> SizeSelect error "Required"
```

Side:

```text
side_required -> SideToggle error "Required"
```

Cycle:

```text
cycle_required -> CycleTimeInput error "Required"
cycle_seconds_range -> CycleTimeInput error "Seconds should be 0 to 59."
cycle_zero -> CycleTimeInput error "Cycle time can't be zero."
cycle_low -> CycleTimeInput warning "Cycle time looks low - please confirm."
cycle_high -> CycleTimeInput warning "Cycle time looks high - please confirm."
```

Time:

```text
time_required -> TimeRangeInput error "Required"
time_order -> TimeRangeInput error "Time Out should be after Time In."
```

Prefer to visually attach `time_order` to the Time Out input.

Parts:

```text
parts_required -> PartsCountInput error "Required"
parts_positive -> PartsCountInput error "Required"
parts_high -> PartsCountInput warning "Please check if count is correct."
```

Production hours:

```text
hours_exceed_shift -> warning near production hours or cycle/parts group
```

If Phase 4 already shows this warning under the hours pill, preserve that placement.

### Summary Modal

On Preview tap:

```text
dispatch UI_INCOMPLETE_HIGHLIGHTS_SET true
open Summary modal
```

The modal still opens even with incomplete CNC entries.

Compute:

```ts
const incompleteCount = invalidNonBlankCncEntries(state).length;
const validEntries = validCncEntries(state);
```

Warning strip copy:

```text
1 CNC entry is incomplete and won't be included.
{n} CNC entries are incomplete and won't be included.
```

Do not count blank default CNC cards.

### SummaryCard

`SummaryCard` should receive either:

```ts
validCncEntries
```

or compute them through the shared selector.

It must not include incomplete entries.

The same component is used for visible preview and hidden capture, so this fixes both PNG and share output.

### Sticky CTA

If Phase 7's CTA uses a completeness selector, update that selector to delegate to validation.

Expected behavior remains:

```text
no data -> disabled or empty-state toast
only valid data -> primary CTA
non-blank incomplete CNC data -> warning CTA
valid + incomplete data -> warning CTA
```

Do not make the CTA block Preview when incomplete entries exist.

## Implementation Steps

### Step 1 - Read Current State and Selector Contracts

Inspect:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/state/StateContext.tsx
src/state/persistence.ts
```

Confirm:

```text
customPeople is already in state
people is still merged from base + custom
UI_INCOMPLETE_HIGHLIGHTS_SET exists or needs to be added
validCncEntries or completeness selectors exist
```

Do not start by editing UI components. The validation source must be clear first.

### Step 2 - Extend Persistence Helpers

In `src/state/persistence.ts`:

```text
add KEY_DRAFT
add saveDraftNow
add loadDraft
add clearDraft
add createDraftSaver
preserve loadCustomPeople/saveCustomPeople
```

All localStorage calls must be wrapped in try/catch.

Return a failed result on write errors so the app can render the storage failure banner.

### Step 3 - Add Draft Boot Logic

Add a boot initializer either in `StateContext.tsx`, `App.tsx`, or `src/state/bootstrap.ts`.

The boot initializer should return:

```ts
type BootState = {
  initialState: ProductionEntryState;
  rolloverDraft: ProductionEntryState | null;
  shouldEnableDraftSave: boolean;
};
```

Use the boot flow described earlier.

The important invariant:

```text
if rolloverDraft is not null, autosave starts disabled
```

### Step 4 - Add Resume and Start Fresh Actions

Wire `DraftRolloverBanner`:

Resume:

```text
dispatch STATE_REPLACE
enable autosave
save restored draft
hide banner
```

Start fresh:

```text
clearDraft
dispatch STATE_RESET_FRESH
enable autosave
save fresh state
hide banner
```

Use existing button primitives if available. Keep buttons compact.

### Step 5 - Add Draft Autosave Effect

In `App.tsx` or the provider layer:

```text
create one draft saver
watch state changes
schedule save when enabled
set draftSaveFailed true on failed save
render storage failure banner
```

Make sure the saver is not recreated on every render.

Avoid saving while the previous-day banner is waiting for a choice.

### Step 6 - Create Validation Utility

Create `src/state/validation.ts` with:

```text
types
time parser
cycle parser
entry blank check
validateEntry
validCncEntries
invalidNonBlankCncEntries
```

Keep all logic pure.

Use the exact hard and soft rules from this plan.

### Step 7 - Update Selectors To Delegate To Validation

In `src/state/selectors.ts`:

```text
update cncEntryCompletenessReport
update validCncEntries if it exists
update hasPreviewableProductionData if needed
update totalCncHours if it currently counts invalid entries
```

Do not duplicate validation rules inside selectors. Selectors should call validation helpers.

### Step 8 - Wire Card-Level Validation

In `CncSection` or `CncEntryCard`:

```text
compute validation report per entry
derive showRequiredErrors from state.ui.incompleteHighlights
derive showCardWarning
pass error/warning props to child fields
render warning banner above field grid
```

Keep the card layout stable. Adding a banner should push fields down naturally, not overlay them.

### Step 9 - Wire Field Components

Add `error?: string` and `warning?: string` props where needed.

Each field should:

```text
apply danger border when error exists
render danger caption below field
render warning caption below field when warning exists and error does not
preserve focus ring
preserve existing selected/active states
```

For joined controls like cycle min/sec, apply the error to the grouped control, not only one tiny input.

For time order errors, attach the danger border to Time Out and show the caption under the time group.

### Step 10 - Refine Preview Tap

On Preview:

```text
dispatch UI_INCOMPLETE_HIGHLIGHTS_SET true
open modal
```

This may already exist from Phase 8. If so, verify it still happens before the modal renders.

Do not block modal open because of incomplete entries.

### Step 11 - Refine Summary Modal And SummaryCard

Use validation-backed selectors for:

```text
incomplete count
valid CNC entries
summary totals
SummaryCard rows
hidden capture SummaryCard rows
text fallback rows
```

If SummaryCard receives full state, make sure its internal filtering delegates to selectors.

If SummaryCard receives prefiltered entries, make sure both visible and hidden callers pass the same prefiltered list.

### Step 12 - Manual Storage Failure Hook For Testing

Add no permanent debug UI.

For implementation verification, temporarily simulate localStorage failure in dev tools or by monkey-patching `localStorage.setItem`.

Do not commit test-only debug toggles.

## Edge Cases

### Reload Same Day

Given:

```text
draft.date === today
```

Expected:

```text
draft restores silently
no rollover banner
autosave enabled
```

### Reopen Next Day

Given:

```text
draft.date !== today
```

Expected:

```text
fresh today state renders
rollover banner renders
old draft is not overwritten
autosave disabled until choice
```

### Resume Previous Day

Expected:

```text
old date is preserved
old CNC entries are restored
old notes and repair are restored
autosave enabled after restore
banner disappears
```

### Start Fresh

Expected:

```text
old draft cleared
today's blank state appears
custom people remain
autosave enabled
banner disappears
```

### localStorage Unavailable

Expected:

```text
app boots
user can type
save failure banner appears after first failed write
Preview and Share still work
```

### Corrupt Draft JSON

Expected:

```text
loadDraft returns null
app boots fresh
custom people still load if that key is valid
no crash
```

### Blank Default CNC Card After Preview

Expected:

```text
no card warning banner
no required captions
not counted in incomplete strip
not included in SummaryCard
```

### Partial CNC Card After Preview

Expected:

```text
card warning banner appears
missing required fields show Required
incomplete strip count increments
entry excluded from SummaryCard
```

### Soft-Warned Complete CNC Card

Expected:

```text
no card warning banner
no exclusion from summary
soft warning caption appears
entry included in SummaryCard
```

### Invalid Immediate Value

Expected:

```text
hex 101 shows hex range error immediately
seconds 60 shows seconds error immediately
timeOut before timeIn shows time order error immediately once both times exist
```

## Styling Rules

Use existing tokens:

```text
--warning-50
--warning-600
--danger-600
--border-focus
--border-soft
```

Do not introduce a new color palette.

Use compact captions:

```text
text-caption
font-medium
```

Do not make warning banners look like modal cards.

Do not put a card inside a card.

Do not let error text resize controls horizontally. Captions should wrap under the field.

## Accessibility

Field error captions should be connected to inputs where practical:

```text
aria-invalid=true
aria-describedby=[error-caption-id]
```

For chip groups:

```text
role=radiogroup
aria-invalid=true when error exists
```

The rollover banner buttons must be keyboard reachable.

The storage failure banner does not need focus capture because it is non-blocking.

## Testing Strategy

If the app has tests by Phase 11, add focused unit tests for:

```text
validateEntry
isCncEntryBlank
validCncEntries
invalidNonBlankCncEntries
loadDraft corrupt JSON handling
saveDraftNow write failure handling
boot initializer same-day draft
boot initializer previous-day draft
```

Recommended test cases:

```text
blank default entry -> blank, not complete, not invalid incomplete
operator-only entry -> non-blank, hard errors
complete normal entry -> complete, no hard errors
hex 101 -> hex_range
seconds 60 -> cycle_seconds_range
cycle 0 -> cycle_zero
timeOut == timeIn -> time_order
cycle 10 sec -> soft cycle_low
cycle 601 sec -> soft cycle_high
parts 1001 -> soft parts_high
hours greater than shift window -> soft hours_exceed_shift
```

If no test framework exists, document the manual QA results in the phase completion notes.

## Manual QA Checklist

### Draft Restore

- [ ] Enter a CNC operator, machine, hex, size, side, cycle time, time range, and parts.
- [ ] Enter Burma values.
- [ ] Enter Repair values.
- [ ] Enter Notes.
- [ ] Wait at least 400ms.
- [ ] Refresh the page.
- [ ] All values restore.
- [ ] No duplicate CNC cards appear.
- [ ] Custom people still appear in people selects.

### Same-Day Silent Restore

- [ ] Save a draft with today's date.
- [ ] Reopen the app.
- [ ] No rollover banner appears.
- [ ] Draft data is visible.

### Previous-Day Prompt

- [ ] Create a draft with yesterday's date in localStorage.
- [ ] Open the app today.
- [ ] Fresh today state appears.
- [ ] Banner says `You have an unsent entry from [date].`
- [ ] Before choosing, inspect localStorage and confirm the old draft was not overwritten.

### Resume

- [ ] Tap Resume.
- [ ] Old draft loads.
- [ ] Old draft date remains visible.
- [ ] Banner disappears.
- [ ] Editing the resumed draft saves normally.

### Start Fresh

- [ ] Recreate a previous-day draft.
- [ ] Open the app.
- [ ] Tap Start fresh.
- [ ] Today's blank state appears.
- [ ] Old draft is cleared.
- [ ] Custom people remain.

### Required Validation

- [ ] Partially fill a CNC entry.
- [ ] Tap Preview.
- [ ] Summary modal opens.
- [ ] Incomplete strip appears.
- [ ] Edit Entry / close modal.
- [ ] The incomplete card shows `Please complete this entry.`
- [ ] Missing fields show `Required`.
- [ ] Filling each missing field clears its error.
- [ ] Completing the card clears the banner.

### Immediate Validation

- [ ] Enter hex `101`.
- [ ] Hex field shows `Hex must be between 0 and 100.`
- [ ] Change to `100`.
- [ ] Error clears.
- [ ] Enter seconds `60`.
- [ ] Cycle control shows `Seconds should be 0 to 59.`
- [ ] Change to `59`.
- [ ] Error clears.
- [ ] Set Time Out equal to Time In.
- [ ] Time Out shows `Time Out should be after Time In.`
- [ ] Change Time Out later than Time In.
- [ ] Error clears.

### Soft Warnings

- [ ] Enter cycle time less than 20 seconds.
- [ ] Soft warning appears.
- [ ] Entry still appears in SummaryCard if otherwise complete.
- [ ] Enter cycle time greater than 10 minutes.
- [ ] Soft warning appears.
- [ ] Entry still appears in SummaryCard if otherwise complete.
- [ ] Enter parts count over 1000.
- [ ] Soft warning appears.
- [ ] Entry still appears in SummaryCard if otherwise complete.

### Summary Filtering

- [ ] Add one complete CNC entry.
- [ ] Add one partial CNC entry.
- [ ] Tap Preview.
- [ ] Incomplete strip says `1 CNC entry is incomplete and won't be included.`
- [ ] SummaryCard includes only the complete CNC entry.
- [ ] Generated PNG includes only the complete CNC entry.
- [ ] Shared/downloaded output includes only the complete CNC entry.

### Storage Failure

- [ ] Simulate `localStorage.setItem` throwing.
- [ ] Edit a field.
- [ ] App does not crash.
- [ ] Banner appears: `Couldn't save draft. Finish and share before closing.`
- [ ] User can still Preview and Share.

## Acceptance Criteria

- [ ] `productionEntry.v1.draft` is written after state changes with a 400ms debounce.
- [ ] Existing `productionEntry.v1.customPeople` behavior from Phase 10 still works.
- [ ] Same-day draft restores silently on boot.
- [ ] Previous-day draft shows the rollover banner and is not overwritten before choice.
- [ ] Resume restores the previous-day draft as-is and enables saving.
- [ ] Start fresh clears the old draft, initializes today, preserves custom people, and enables saving.
- [ ] Corrupt draft JSON does not crash the app.
- [ ] localStorage write failure shows the non-blocking banner and preserves in-memory editing.
- [ ] `src/state/validation.ts` is the single source for CNC validation rules.
- [ ] Blank default CNC cards do not count as incomplete.
- [ ] Non-blank incomplete CNC cards count as incomplete.
- [ ] Soft warnings do not make entries incomplete.
- [ ] Preview tap sets `ui.incompleteHighlights` to true.
- [ ] Preview modal opens even with incomplete entries.
- [ ] Card-level warning banner appears only after Preview and only on non-blank incomplete cards.
- [ ] Required field errors appear after Preview, not on first load.
- [ ] Hex out-of-range error appears immediately.
- [ ] Cycle seconds out-of-range error appears immediately.
- [ ] Cycle zero error appears at the correct time.
- [ ] Time Out <= Time In error appears immediately once both times exist.
- [ ] Filling invalid or missing fields clears their errors without refresh.
- [ ] Summary modal incomplete strip count uses validation-backed incomplete entries.
- [ ] SummaryCard excludes incomplete CNC entries.
- [ ] Hidden capture SummaryCard excludes incomplete CNC entries.
- [ ] PNG and share output exclude incomplete CNC entries.
- [ ] Repair and Notes do not gain validation errors.
- [ ] No service worker or PWA offline shell work is added.

## Implementation Risks

### Risk: Previous-Day Draft Gets Overwritten

This is the biggest correctness risk.

Mitigation:

```text
disable autosave while rolloverDraft is pending
only enable after Resume or Start fresh
```

### Risk: Validation Logic Forks

If `CncEntryCard`, `SummaryModal`, and `SummaryCard` each decide validity separately, the app will drift.

Mitigation:

```text
one validateEntry function
selectors delegate to it
UI consumes selectors or validation report
```

### Risk: Blank Default Card Looks Broken After Preview

The app starts with one blank CNC card. If Phase 11 treats it as incomplete, Preview will look noisy even when the worker only entered Burma.

Mitigation:

```text
explicit isCncEntryBlank helper
required errors only for non-blank entries
```

### Risk: Required Errors Show Too Early

The spec says validation should be helpful, not punishing.

Mitigation:

```text
required errors are gated by state.ui.incompleteHighlights
impossible values are immediate
```

### Risk: Custom People Drift During Draft Restore

The draft contains state, and custom people also have their own key.

Mitigation:

```text
load custom people first
normalize hydrated draft
merge basePeople + customPeople into people
preserve Phase 10 customPeople key
```

## Handoff Notes For Phase 12

Phase 12 should be able to start from:

- full draft persistence working under `productionEntry.v1.draft`
- custom people still persisted under `productionEntry.v1.customPeople`
- same-day restore working
- previous-day rollover prompt working
- validation utility in `src/state/validation.ts`
- SummaryCard and PNG excluding incomplete CNC entries
- storage failure handled gracefully

Expected Phase 12 changes:

- PWA manifest completion
- service worker app-shell caching
- installability polish
- offline-first verification
- icon asset completion
- production deployment checklist
- final end-to-end Android/iOS QA

Phase 12 should not need to redefine CNC validation or draft persistence. It should verify those behaviors continue to work offline.

## Rationale

Phase 11 is intentionally late because it touches many surfaces that needed to exist first:

```text
CNC fields
production calculations
add/remove/duplicate
Burma/Repair/Notes
Preview modal
SummaryCard
PNG/share
custom people persistence
```

Doing draft persistence earlier would have made every later reducer change riskier. Doing validation earlier would have forced the app to validate fields and summary surfaces that did not exist yet.

At this point, the right move is to make validation and persistence authoritative. The app should preserve the worker's draft, warn at the right time, and ensure only complete CNC entries reach the final summary artifact.
