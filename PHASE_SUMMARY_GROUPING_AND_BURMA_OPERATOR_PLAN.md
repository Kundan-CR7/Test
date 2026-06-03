# Phase Plan: Hex Range, Burma Operator, and Smarter Summary Grouping

## Objective

Improve the production app in three related areas without changing the core data-entry workflow:

1. Allow CNC Hex values up to `200` instead of the current `100`.
2. Add a Burma operator/person field using the same people list and Add Person flow already used by CNC and Repair.
3. Rework the shared summary so the owner can understand production by person and machine instead of reading a raw entry-order list.

This document is planning only. It should guide a later implementation patch. Do not change source code as part of this planning phase.

## Current Implementation Context

The active app is the Vite/React implementation under `app/src`.

Relevant current files:

```text
app/src/App.tsx
app/src/state/types.ts
app/src/state/reducer.ts
app/src/state/bootstrap.ts
app/src/state/selectors.ts
app/src/state/validation.ts
app/src/state/persistence.ts
app/src/components/BurmaCard.tsx
app/src/components/RepairCard.tsx
app/src/components/AddPersonModal.tsx
app/src/components/cnc/OperatorSelect.tsx
app/src/components/cnc/HexInputWithChips.tsx
app/src/components/summary/SummaryCard.tsx
app/src/components/summary/SummaryModal.tsx
app/src/components/summary/ShareActions.tsx
app/src/utils/format.ts
app/src/utils/textSummary.ts
```

Important current behavior:

- `HexInputWithChips` independently treats `value > 100` as out of range.
- `validateEntry` also treats `entry.hex > 100` as a hard validation error.
- `BurmaCard` currently has only `burma1`, `burma2`, and `burma3` count inputs.
- `RepairCard` already reuses `OperatorSelect` and supports Add Person.
- `AddPersonModal` is already shared across CNC and Repair by tracking an `AddPersonTarget`.
- `SummaryCard` currently renders valid CNC entries in input order.
- `buildTextSummary` currently mirrors the same input-order CNC list for WhatsApp text fallback.
- Summary PNG generation captures the visible `SummaryCard`, so summary structure changes affect both preview and shared image.

## Change 1: Hex Range 0-200

### Desired Behavior

The Hex field should allow values from `0` through `200`.

Values greater than `200` should remain invalid. Values below `0`, blank values in nonblank entries, and nonnumeric states should continue to behave according to existing validation rules.

### Logic Changes

Update both validation surfaces, not just the visible UI:

1. In `HexInputWithChips`, change the local range check:

```ts
value !== null && (value < 0 || value > 200)
```

2. Update the inline error text:

```text
Hex must be between 0 and 200.
```

3. In `validateEntry`, change the hard validation range to:

```ts
entry.hex < 0 || entry.hex > 200
```

4. Update the hard validation message to the same text.

### Why Both Places Must Change

The input component gives immediate visual feedback, but the authoritative rule lives in `validation.ts`. If only the UI changes, preview can still be blocked. If only validation changes, the input still shows a false red error. Both must agree.

### Verification

- Hex `100` remains valid.
- Hex `101`, `150`, and `200` become valid.
- Hex `201` remains invalid.
- Existing common chips do not need to change unless the business wants new common values.

## Change 2: Burma Operator / Person

### Desired Behavior

Burma Production should let the worker select who handled Burma production for the day.

The field should behave like CNC Operator and Repair Person:

- Uses the same `state.people` list.
- Supports the same Add Person modal.
- Newly added names persist locally.
- When a new person is added from Burma, that new person is auto-selected in the Burma operator field.
- Summary preview and shared text include the Burma operator when present.

### State Shape

Current state:

```ts
burma: {
  burma1: number | null;
  burma2: number | null;
  burma3: number | null;
}
```

Proposed state:

```ts
burma: {
  person: string;
  burma1: number | null;
  burma2: number | null;
  burma3: number | null;
}
```

Use `person` instead of `operator` for consistency with `repair.person`, while the UI label can say `Burma Operator`.

### Reducer Actions

Keep numeric Burma count updates strongly typed. Do not overload `BURMA_SET` with both strings and numbers if avoidable.

Recommended action shape:

```ts
type BurmaField = 'burma1' | 'burma2' | 'burma3';

| { type: 'BURMA_SET'; field: BurmaField; value: number | null }
| { type: 'BURMA_PERSON_SET'; value: string }
```

This keeps the count inputs simple and avoids a mixed-value action.

### Boot / Draft Hydration

`bootstrap.ts` must tolerate old drafts that do not have `burma.person`.

Hydration rule:

```ts
person: normalizeString(burma.person)
```

If the field is missing, it becomes an empty string. This is backward compatible with existing saved drafts.

### UI Changes

Update `BurmaCard`:

1. Add an `onAddPerson` prop, same pattern as `RepairCard`.
2. Render `OperatorSelect` at the top of the card:

```text
Label: Burma Operator
Value: state.burma.person
Add new person: opens AddPersonModal with target { type: 'burma' }
```

3. Keep the existing Burma 1/2/3 fields and total footer unchanged.
4. Do not make Burma operator required unless explicitly requested later.

### Add Person Target Changes

Current target concept:

```ts
type AddPersonTarget =
  | { type: 'cnc'; entryId: string }
  | { type: 'repair' };
```

Proposed:

```ts
type AddPersonTarget =
  | { type: 'cnc'; entryId: string }
  | { type: 'repair' }
  | { type: 'burma' };
```

After successful add:

- CNC target: set `entry.operator`.
- Repair target: set `repair.person`.
- Burma target: set `burma.person`.

### Summary Changes For Burma

In `SummaryCard` Burma section:

```text
Burma Production
Operator: [name]        // only if present
Burma 1: 135
Burma 2: 313
Burma 3: 121
Total Burma: 569
```

In `buildTextSummary`, include the same operator line only when `state.burma.person.trim() !== ''`.

## Change 3: Smarter CNC Summary Grouping

## Problem With Current Summary

Current summary lists CNC entries in the exact order the worker entered them.

That is easy for data entry, but hard for review. In the supplied real examples, one person appears in multiple separated blocks:

- Nandini appears as entries 1, 9, 10, 11, 12 on 26 May.
- Sanju appears as entries 2, 3, 6, 13, 14 on 26 May.
- Manish appears across M1 and M2 on 24 May.

The owner needs a report that answers:

- Who worked today?
- Which machines did each person work on?
- How many CNC entries did each person have?
- How many side-counts did each person produce?
- What is the estimated finished-parts count?
- How many CNC hours are attached to each person and machine?

The summary should become a production report, not just a dump of form rows.

## Important Terminology

The current CNC `partsCount` field is operationally counting sides/operations, not always finished physical parts.

One finished part usually needs two sides.

Therefore:

```text
totalCncSides = sum(validEntry.partsCount)
estimatedFinishedParts = totalCncSides / 2
```

The summary should avoid hiding this distinction.

Recommended summary labels:

```text
Total CNC Sides
Estimated Finished Parts
```

If the product owner strongly prefers the shorter wording, use:

```text
Total Sides
Est. Parts
```

Do not silently rename the data-entry field yet. The field can still say Count in the card until a separate UX decision is made.

## Proposed Summary Structure

The summary should have four CNC layers:

1. CNC Overview
2. Operator Totals
3. CNC Production by Operator
4. Existing Burma, Repair, Notes sections

Recommended visual order:

```text
Daily Production Summary
26 May 2026 - Morning Shift

CNC Overview
Total CNC Hours: 51.35 hrs
Total CNC Sides: 1,321
Estimated Finished Parts: 660.5
CNC Entries: 14

Operator Totals
Nandini - M1, M2, M7, M8 - 5 entries - 332 sides - est. 166 parts - 11.36 hrs
Sanju - M3, M4 - 5 entries - 162 sides - est. 81 parts - 12.98 hrs
Anita - M5, M6 - 2 entries - 442 sides - est. 221 parts - 14.56 hrs
Avinash - M7, M8 - 2 entries - 385 sides - est. 192.5 parts - 12.45 hrs

CNC Production by Operator
Nandini - 5 entries - 332 sides - est. 166 parts - 11.36 hrs
  M1 - 1 entry - 241 sides - 7.30 hrs
    Hex 41 - Size 1/2 - Side Male - Count 241 - Cycle 1m 49s - 7.30 hrs
  M2 - 2 entries - 44 sides - 2.56 hrs
    Hex 95 - Size 3 - Side Custom - Count 7 - Cycle 3m 42s - 0.43 hrs
    Hex 100 - Size 4 - Side Male - Count 37 - Cycle 3m 27s - 2.13 hrs
  M7 - ...
  M8 - ...

Burma Production
Operator: [name if present]
Burma 1: ...
Burma 2: ...
Burma 3: ...
Total Burma: ...
```

The exact visual layout can be polished in implementation, but the data order and aggregation logic should follow this structure.

## CNC Grouping Logic

### Input

Use only `validCncEntries(state)`.

Do not include:

- Blank CNC entries.
- Incomplete CNC entries.
- Entries blocked by hard validation errors.

This preserves current summary integrity.

### Preserve Original Index

Before grouping, attach the original valid-entry index:

```ts
type IndexedCncEntry = {
  entry: CncEntry;
  originalIndex: number;
};
```

This is needed for stable tie-breaking and for preserving entry order within the same person-machine group.

### Machine Rank

Use numeric machine order:

```text
M1 -> 1
M2 -> 2
M3 -> 3
M4 -> 4
M5 -> 5
M6 -> 6
M7 -> 7
M8 -> 8
unknown/blank -> very large fallback
```

Implementation helper:

```ts
function machineRank(machine: Machine): number {
  const match = /^M(\d+)$/.exec(machine);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}
```

Because valid entries require a machine, the fallback should rarely be used.

### Operator Key

Group operators case-insensitively using the same name normalization already used by people helpers:

```ts
operatorKey = normalizePersonName(entry.operator).toLocaleLowerCase()
displayName = first normalized operator name seen for the key
```

### Person Group Shape

Recommended derived type:

```ts
type CncOperatorGroup = {
  operator: string;
  operatorKey: string;
  firstEntryIndex: number;
  primaryMachineRank: number;
  machines: CncMachineGroup[];
  totals: {
    entries: number;
    sides: number;
    estimatedParts: number;
    hours: number;
  };
};

type CncMachineGroup = {
  machine: Machine;
  machineRank: number;
  firstEntryIndex: number;
  entries: IndexedCncEntry[];
  totals: {
    entries: number;
    sides: number;
    estimatedParts: number;
    hours: number;
  };
};
```

### Person Ordering

Sort operator groups by:

1. `primaryMachineRank` ascending.
2. `firstEntryIndex` ascending.
3. `operator` alphabetical as final fallback.

Where:

```ts
primaryMachineRank = minimum machineRank across that person's valid entries
```

This matches the requested shop-floor logic:

- A person who worked on M1 is shown before people whose first/lowest machine is M2, M3, etc.
- If that same person also worked on M2, M3, or M8, all of their entries stay together under that person.
- Within that person, their M1 entries come first, then M2, then M3, through M8.

This also handles real examples:

- On 26 May, Nandini has M1, M2, M7, M8, so she comes before Sanju, Anita, and Avinash.
- On 24 May, Manish and Sanju both include M1. Manish is seen first in the source data, so Manish stays before Sanju.

### Machine Ordering Within A Person

Sort machine groups by:

1. `machineRank` ascending.
2. `firstEntryIndex` ascending.

### Entry Ordering Within A Machine

Preserve original input order within the same person and machine.

Reason:

- Data entry order may represent actual production sequence.
- Sorting by size/hex/count could hide useful chronology.
- The main readability problem is cross-person mixing, not same-machine order.

If future users request more order, add a later option to sort same-machine entries by size or hex.

## CNC Totals Logic

### Entry Hours

Continue using the current authoritative helper:

```ts
entryProductionHours(entry)
```

### Total CNC Hours

Use the existing `totalSummaryCncHours(state)` logic or extract it to share with the new grouped selector.

Round only after summing:

```ts
round2(sum(hours))
```

Do not sum already formatted strings.

### Sides

Use:

```ts
entry.partsCount ?? 0
```

But because only valid entries are included, `partsCount` should be non-null and positive.

### Estimated Finished Parts

Use:

```ts
estimatedParts = sides / 2
```

Formatting:

- If whole number: `166`
- If half count: `660.5`
- Avoid rounding `660.5` to `661` unless the label says approximate.

Suggested formatter:

```ts
function formatEstimatedParts(value: number): string {
  return Number.isInteger(value) ? formatCount(value) : value.toFixed(1);
}
```

### Machine Count

Useful in operator totals:

```ts
machines.length
```

Display as machine list instead of just count when space allows:

```text
M1, M2, M7, M8
```

## Derived Metrics From Supplied Data

These examples should be used as QA expectations for the new summary logic.

### 26 May 2026

Overall:

```text
Total CNC Hours: 51.35 hrs
Total CNC Sides: 1,321
Estimated Finished Parts: 660.5
CNC Entries: 14
```

Operator order and totals:

```text
Nandini - M1, M2, M7, M8 - 5 entries - 332 sides - est. 166 parts - 11.36 hrs
Sanju - M3, M4 - 5 entries - 162 sides - est. 81 parts - 12.98 hrs
Anita - M5, M6 - 2 entries - 442 sides - est. 221 parts - 14.56 hrs
Avinash - M7, M8 - 2 entries - 385 sides - est. 192.5 parts - 12.45 hrs
```

Nandini machine breakdown:

```text
M1 - 1 entry - 241 sides - 7.30 hrs
M2 - 2 entries - 44 sides - 2.56 hrs
M7 - 1 entry - 23 sides - 0.77 hrs
M8 - 1 entry - 24 sides - 0.73 hrs
```

### 25 May 2026

Overall:

```text
Total CNC Hours: 61.51 hrs
Total CNC Sides: 1,611
Estimated Finished Parts: 805.5
CNC Entries: 14
```

Operator order and totals:

```text
Nandini - M1, M2, M7 - 5 entries - 303 sides - est. 151.5 parts - 16.05 hrs
Sanju - M3, M4, M8 - 4 entries - 439 sides - est. 219.5 parts - 17.05 hrs
Anita - M5, M6 - 3 entries - 480 sides - est. 240 parts - 15.71 hrs
Avinash - M7, M8 - 2 entries - 389 sides - est. 194.5 parts - 12.70 hrs
```

### 24 May 2026

Overall:

```text
Total CNC Hours: 59.79 hrs
Total CNC Sides: 1,604
Estimated Finished Parts: 802
CNC Entries: 13
```

Operator order and totals:

```text
Manish - M1, M2 - 5 entries - 249 sides - est. 124.5 parts - 12.13 hrs
Sanju - M1, M2, M3, M4 - 4 entries - 462 sides - est. 231 parts - 19.02 hrs
Anita - M5, M6 - 2 entries - 445 sides - est. 222.5 parts - 13.44 hrs
Avinash - M7, M8 - 2 entries - 448 sides - est. 224 parts - 15.20 hrs
```

## Proposed Selector/API Design

Add pure selector helpers, preferably in `state/selectors.ts` unless it becomes too large. If it becomes noisy, create `state/summarySelectors.ts`.

Recommended exports:

```ts
export type CncSummaryTotals = {
  entries: number;
  sides: number;
  estimatedParts: number;
  hours: number;
};

export type CncMachineSummaryGroup = {
  machine: Machine;
  entries: CncEntry[];
  totals: CncSummaryTotals;
};

export type CncOperatorSummaryGroup = {
  operator: string;
  machines: CncMachineSummaryGroup[];
  totals: CncSummaryTotals;
};

export function cncSummaryTotals(state: ProductionEntryState): CncSummaryTotals;
export function cncOperatorSummaryGroups(state: ProductionEntryState): CncOperatorSummaryGroup[];
```

Keep all grouping logic pure and unit-testable. `SummaryCard` and `buildTextSummary` should only render the derived data, not rebuild grouping logic independently.

## SummaryCard Rendering Plan

### Overview Section

Replace the current simple CNC section total with a richer overview.

Recommended fields:

```text
Total CNC Hours
Total CNC Sides
Estimated Finished Parts
CNC Entries
```

Use tabular numbers. Keep visual density high because the PNG must stay readable.

### Operator Totals Section

Add a compact section before detailed rows.

Each row:

```text
Name
M1, M2, M7, M8
5 entries | 332 sides | est. 166 parts | 11.36 hrs
```

This section gives the owner the fast answer without reading every detail line.

### Detailed Grouped CNC Section

Render:

1. Operator header with totals.
2. Machine subheader with machine totals.
3. Individual detail rows.

Individual row should remain compact:

```text
Hex 41 - Size 1/2 - Side Male - Cycle 1m 49s - Count 241 - 7.30 hrs
```

Avoid repeating the operator and machine on every row because the grouping already provides that context.

### Compact Mode

The current summary switches to compact mode when entry count is high. With grouping, compact mode should be based on detail row count and total rendered height.

Suggested first implementation:

```ts
const compact = validEntryCount > 12;
```

But the grouped design should still be readable when compact:

- Keep operator headers.
- Keep machine headers.
- Make detail rows one line.
- Reduce vertical spacing between rows.

### Empty State

If there are no valid CNC entries:

```text
No CNC entries
```

Do not render empty Operator Totals.

## Text Summary Rendering Plan

`buildTextSummary` must use the same grouped selector as `SummaryCard`.

Text structure should mirror the visual summary:

```text
Daily Production Summary
26 May 2026 - Morning Shift

CNC Overview
Total CNC Hours: 51.35 hrs
Total CNC Sides: 1,321
Estimated Finished Parts: 660.5
CNC Entries: 14

Operator Totals
Nandini - M1, M2, M7, M8 - 5 entries - 332 sides - est. 166 parts - 11.36 hrs
...

CNC Production by Operator
Nandini - 5 entries - 332 sides - est. 166 parts - 11.36 hrs
  M1 - 1 entry - 241 sides - 7.30 hrs
    Hex 41 - Size 1/2 - Side Male - Cycle 1m 49s - Count 241 - 7.30 hrs
...
```

Use ASCII separators in text fallback, preferably `-`, because WhatsApp text rendering is predictable.

## Implementation Steps

### Step 1: Expand Hex Range

Files:

```text
app/src/components/cnc/HexInputWithChips.tsx
app/src/state/validation.ts
```

Actions:

- Change maximum from `100` to `200` in both places.
- Update messages.
- Add manual checks for 101, 200, and 201.

### Step 2: Add Burma Person To State

Files:

```text
app/src/state/types.ts
app/src/state/reducer.ts
app/src/state/bootstrap.ts
```

Actions:

- Add `burma.person: string`.
- Initialize to `''`.
- Hydrate old drafts safely.
- Add `BURMA_PERSON_SET`.

### Step 3: Wire Burma Operator UI

Files:

```text
app/src/App.tsx
app/src/components/BurmaCard.tsx
app/src/components/AddPersonModal.tsx
app/src/components/cnc/OperatorSelect.tsx
```

Actions:

- Extend `AddPersonTarget` with `{ type: 'burma' }`.
- Pass `onAddPerson` into `BurmaCard`.
- Render `OperatorSelect` in `BurmaCard`.
- On successful add from Burma, dispatch `BURMA_PERSON_SET`.

`AddPersonModal` itself likely does not need UI changes unless copy should mention operators more generally.

### Step 4: Add Grouped CNC Summary Selectors

Files:

```text
app/src/state/selectors.ts
```

or:

```text
app/src/state/summarySelectors.ts
```

Actions:

- Build `cncSummaryTotals`.
- Build `cncOperatorSummaryGroups`.
- Group by normalized operator.
- Sort people by primary machine rank.
- Sort each person's machines by machine rank.
- Preserve original order inside each person-machine group.

### Step 5: Add Formatting Helpers

Files:

```text
app/src/utils/format.ts
```

Actions:

- Add `formatEstimatedParts`.
- Add `formatEntryLabel` or similar plural helper if needed:

```text
1 entry
2 entries
```

- Consider `formatMachineList(['M1', 'M2']) -> 'M1, M2'`.

### Step 6: Rework SummaryCard CNC Section

Files:

```text
app/src/components/summary/SummaryCard.tsx
```

Actions:

- Replace input-order CNC list with grouped rendering.
- Add CNC Overview.
- Add Operator Totals.
- Add grouped details.
- Keep Total CNC Hours visible.
- Add Total CNC Sides and Estimated Finished Parts.
- Keep Repair and Notes behavior.
- Add Burma operator line in Burma section.

### Step 7: Rework Text Summary

Files:

```text
app/src/utils/textSummary.ts
```

Actions:

- Use the same grouped selector.
- Add overview metrics.
- Add operator totals.
- Add grouped details.
- Add Burma operator line when present.

### Step 8: Verify PNG Capture Readability

Files:

```text
app/src/components/summary/SummaryModal.tsx
app/src/utils/png.ts
```

Expected source changes may not be needed, but verify:

- Hidden capture still mounts the same `SummaryCard`.
- Tall grouped cards are captured completely.
- Text remains readable after WhatsApp compression.

If the image gets too tall, prefer tighter summary layout over splitting into multiple images for this phase.

## Acceptance Criteria

### Hex

- [ ] Hex `101` is accepted.
- [ ] Hex `150` is accepted.
- [ ] Hex `200` is accepted.
- [ ] Hex `201` is rejected with `Hex must be between 0 and 200.`
- [ ] Preview is not blocked for Hex values between 101 and 200.

### Burma Operator

- [ ] Burma Production card has a `Burma Operator` select.
- [ ] Burma Operator uses the same person list as CNC and Repair.
- [ ] Add Person opens from Burma.
- [ ] Newly added Burma person is persisted and auto-selected.
- [ ] Old drafts without `burma.person` load without crashing.
- [ ] Summary preview includes Burma operator when selected.
- [ ] WhatsApp text fallback includes Burma operator when selected.

### Grouped Summary

- [ ] CNC entries are grouped by operator.
- [ ] Operators are ordered by their lowest machine number.
- [ ] If two operators share the same lowest machine number, the one seen earlier in valid input order comes first.
- [ ] Within each operator, machine groups are ordered M1 through M8.
- [ ] Within the same operator and machine, original entry order is preserved.
- [ ] Operator totals show entries, sides, estimated parts, hours, and machine list.
- [ ] Summary overview shows total CNC hours, total CNC sides, estimated finished parts, and CNC entries.
- [ ] Existing Burma totals still render correctly.
- [ ] Existing Repair and Notes optional sections still render correctly.
- [ ] PNG generation captures the new grouped summary.
- [ ] Text fallback matches the grouped visual summary.

## Suggested Test Cases

### Pure Function Tests

Add tests if a test runner is introduced. If no test runner exists, run these manually with temporary sample states.

1. Single operator, single machine:
   - One group.
   - One machine group.
   - Totals match entry.

2. One operator, multiple machines:
   - One operator group.
   - Machine groups sorted M1, M2, M8.
   - Person positioned by lowest machine.

3. Multiple operators, mixed input order:
   - Input: A on M4, B on M1, A on M2.
   - Output person order: B first, A second, because B primary is M1 and A primary is M2.

4. Same primary machine tie:
   - Input: A on M1 later than B on M1.
   - Output follows first valid entry index.

5. Odd side count:
   - Total sides `1321`.
   - Estimated finished parts `660.5`.

6. Incomplete entry excluded:
   - Grouping uses only `validCncEntries`.
   - Invalid nonblank entry remains excluded just like today.

### Sample Data QA

Use the supplied 24/25/26 May summaries as golden manual fixtures.

For 26 May:

- Overall sides should be `1,321`.
- Estimated parts should be `660.5`.
- Operator order should be `Nandini`, `Sanju`, `Anita`, `Avinash`.
- Nandini machine order should be `M1`, `M2`, `M7`, `M8`.

For 25 May:

- Overall sides should be `1,611`.
- Estimated parts should be `805.5`.
- Operator order should be `Nandini`, `Sanju`, `Anita`, `Avinash`.

For 24 May:

- Overall sides should be `1,604`.
- Estimated parts should be `802`.
- Operator order should be `Manish`, `Sanju`, `Anita`, `Avinash`.

## Risks And Decisions

### Risk: Summary Image Becomes Too Tall

Grouping adds headers and totals. This improves clarity but can create a taller PNG.

Mitigation:

- Keep detail rows compact.
- Avoid repeating operator and machine on every row.
- Use dense operator total rows.
- Keep section spacing tighter in capture mode than preview mode if needed.

### Risk: Estimated Parts Can Be Half Values

If total side count is odd, estimated finished parts ends in `.5`.

Decision:

- Show the `.5`.
- Do not round unless the label says approximate.

### Risk: Person Ordering May Be Ambiguous When People Share Machines

Two operators can both have M1 as their lowest machine.

Decision:

- Tie-break by first valid entry index.
- This keeps output deterministic and grounded in the worker's input.

### Risk: Burma Operator Might Be Blank

Burma operator should not block summary generation.

Decision:

- Optional field.
- Omit the operator line when blank.

### Risk: Naming "Parts" vs "Sides"

The current field says Count, but operationally each count may represent a side operation.

Decision:

- Summary should explicitly show `Total CNC Sides`.
- Summary should separately show `Estimated Finished Parts`.
- Do not rename the data-entry field in this phase.

## Out Of Scope

- Backend audit trail or server-side tamper resistance.
- Historical multi-day analytics.
- Per-person wage or efficiency calculations.
- Editing old summaries after generation.
- Replacing localStorage persistence.
- Changing the CNC entry form beyond Hex max and summary-related output.
- Making Burma operator required.

## Final Implementation Order

Recommended order for a future implementation:

1. Hex range change.
2. Burma operator state and UI.
3. Burma operator summary output.
4. Grouped CNC selectors.
5. Visual summary rework.
6. Text summary rework.
7. Formatting and compact capture polish.
8. Typecheck, build, and manual PNG/share QA.

This order keeps the smallest independent change first and leaves the highest-risk visual/reporting work until the grouping logic is stable.
