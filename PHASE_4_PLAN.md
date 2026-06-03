# Phase 4: CNC Production Fields and Live Calculation

## Objective

Complete the first CNC Entry Card by adding the production half of the workflow:

```text
Cycle Time
Time In
Time Out
Parts Count
Production Hours
```

After this phase, the worker should be able to type cycle time and parts count and immediately see production hours calculated in the card and reflected in the Live Totals Strip.

The target demo:

```text
Cycle Time: 2 min 26 sec
Parts Count: 193
Production Hours: 7.83 hrs
Live Totals CNC Hours: 7.83
```

This phase turns the CNC card from an identity form into a useful production calculator.

## Prerequisite

Phases 1, 2, and 3 must be implemented before this phase is executed.

This plan assumes the app already has:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/state/StateContext.tsx
src/components/LiveTotalsStrip.tsx
src/components/cnc/CncSection.tsx
src/components/cnc/CncEntryCard.tsx
src/components/cnc/OperatorSelect.tsx
src/components/cnc/MachineGrid.tsx
src/components/cnc/HexInputWithChips.tsx
src/components/cnc/SizeSelect.tsx
src/components/cnc/SideToggle.tsx
src/components/primitives/Chip.tsx
src/components/primitives/Select.tsx
src/components/primitives/Segmented.tsx
```

If the implementation lives under `app/`, apply every source path in this plan under `app/src/...`. The current workspace contains an `app/` scaffold, but it appears minimal; do not execute this phase until Phase 2 and Phase 3 have actually landed in that app.

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

- `requirements.md` sections 9, 10, and 11
- `frontend_ui_spec.md` sections 19, 20, 21, 22, and 40
- `detailed_ui_ux_design.md` sections 6.1.3, 6.1.9, 6.1.10, 6.1.11, 6.1.12, 7.1, 7.3, 8.4, 12.2, 12.3, and 13
- `PHASE_ROADMAP.md` Phase 4
- `PHASE_3_PLAN.md` handoff notes
- `production_entry.html` cycle/time/count/hours behavior, as reference only

## Estimated Output

Approximate size: 450 LOC.

Expected files created:

```text
src/components/cnc/CycleTimeInput.tsx
src/components/cnc/TimeRangeInput.tsx
src/components/cnc/PartsCountInput.tsx
src/components/cnc/ProductionHoursDisplay.tsx
```

Expected files modified:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/components/LiveTotalsStrip.tsx
src/components/cnc/CncEntryCard.tsx
```

Optional if the implementation needs shared animation helpers:

```text
src/components/primitives/AnimatedNumber.tsx
```

Do not modify `production_entry.html` except as a read-only reference. Do not remove or rewrite existing planning documents.

## Inputs

Read in this order before implementing:

1. `requirements.md` section 9
   - Defines CNC production-hours formula.
   - Example: `2m 26s`, `193` parts -> `7.83` hours.
   - Hours should show immediately after cycle time and parts count are entered.
2. `requirements.md` section 10
   - Mentions smart defaults for time in/out for future multi-entry behavior.
   - Phase 4 only needs existing one-entry defaults and touched flags.
3. `requirements.md` section 11
   - Cycle time cannot be zero.
   - Parts count must be greater than zero.
   - Time Out should be after Time In.
   - Soft warnings for cycle time below 20 seconds and above 10 minutes.
4. `frontend_ui_spec.md` section 19
   - Cycle Time input is one joined min/sec control.
5. `frontend_ui_spec.md` section 20
   - Time In / Time Out inputs and shift defaults.
   - Smart-copy rules for future add behavior.
6. `frontend_ui_spec.md` section 21
   - Parts Count is a large numeric input.
7. `frontend_ui_spec.md` section 22
   - Production Hours display and live calculation behavior.
8. `frontend_ui_spec.md` section 40
   - Calculation rules for line hours and total CNC hours.
9. `detailed_ui_ux_design.md` sections 6.1.3 and 6.1.9 through 6.1.12
   - Exact grid placement and production-field anatomy.
10. `detailed_ui_ux_design.md` sections 7.1 and 7.3
   - CNC card states and Live Totals updating state.
11. `detailed_ui_ux_design.md` section 8.4
   - Validation and warning copy.
12. `detailed_ui_ux_design.md` section 12.2
   - `entryProductionHours`, `totalCncHours`, and single-source calculation rule.
13. `PHASE_ROADMAP.md` Phase 4
   - Exact scope, outcome, and acceptance checklist.
14. `PHASE_3_PLAN.md`
   - Existing card shell, field grid, `CNC_FIELD_SET`, and handoff notes.
15. `production_entry.html`
   - Reference for visual shape and event behavior only. Do not copy the vanilla DOM mutation model.

## What This Phase Adds

- Cycle Time joined min/sec input.
- Time In and Time Out fields.
- Parts Count input with `pcs` suffix and select-all-on-focus.
- Production Hours display.
- `entryProductionHours(entry)` selector.
- Real `totalCncHours(state)` selector.
- Reducer support for:
  - `cycleMinutes`
  - `cycleSeconds`
  - `timeIn`
  - `timeOut`
  - `partsCount`
  - `timeInTouched`
  - `timeOutTouched`
- Live Totals Strip now reads real CNC hours.
- Live Totals Strip gets a 160ms number-change cross-fade.
- Header/status area of the CNC card can show computed hours when the full entry is complete.
- Identity subtitle can append the hours fragment when the entry is complete.
- Soft cycle-time warnings for values below 20 seconds or above 600 seconds.

## What This Phase Does NOT Do

- No Add CNC Entry behavior.
- No Remove behavior.
- No Duplicate behavior.
- No Undo toast.
- No empty CNC state.
- No Burma card.
- No Repair card.
- No Notes card.
- No sticky bottom action bar.
- No Summary Preview.
- No PNG generation.
- No Web Share API.
- No Add Person modal.
- No localStorage persistence.
- No day-rollover behavior.
- No complete validation pass.
- No validation banner at top of card.
- No submission/prevention behavior.
- No backend.
- No router.

## Calculation Rules

All production-hours calculation must live in selectors or shared pure utilities, not in components.

Implement in `src/state/selectors.ts`:

```ts
export function entryProductionHours(entry: CncEntry): number | null {
  const cycleMinutes = entry.cycleMinutes ?? 0;
  const cycleSeconds = entry.cycleSeconds ?? 0;
  const partsCount = entry.partsCount ?? 0;

  if (cycleMinutes < 0) return null;
  if (cycleSeconds < 0 || cycleSeconds > 59) return null;
  if (partsCount <= 0) return null;

  const cycleSec = cycleMinutes * 60 + cycleSeconds;
  if (cycleSec <= 0) return null;

  return Math.round(((cycleSec * partsCount) / 3600) * 100) / 100;
}
```

Implement:

```ts
export function totalCncHours(state: ProductionEntryState): number {
  return state.cncEntries
    .map(entryProductionHours)
    .filter((value): value is number => value !== null)
    .reduce((sum, value) => sum + value, 0);
}
```

Rules:

- Missing cycle or count returns `null`.
- Invalid seconds returns `null`.
- Zero total cycle returns `null`.
- Parts count `0`, blank, or negative returns `null`.
- Components display `null` as pending, not as `0.00`.
- Live totals can show `0.00` when the sum is zero.
- The formula must not be duplicated in `CncEntryCard`, `ProductionHoursDisplay`, or `LiveTotalsStrip`.

## State and Reducer Changes

### Update `src/state/types.ts`

Phase 3 should already have these fields on `CncEntry`:

```ts
cycleMinutes: number | null;
cycleSeconds: number | null;
timeIn: string;
timeOut: string;
partsCount: number | null;
productionHours: number | null;
timeInTouched: boolean;
timeOutTouched: boolean;
```

Keep them.

If Phase 3 added `CncIdentityField`, add a production-field type:

```ts
export type CncProductionField =
  | "cycleMinutes"
  | "cycleSeconds"
  | "timeIn"
  | "timeOut"
  | "partsCount";
```

Optional combined type:

```ts
export type CncField = CncIdentityField | CncProductionField;
```

### Update `src/state/reducer.ts`

Extend `CNC_FIELD_SET` to cover production fields.

Recommended action union:

```ts
export type ProductionEntryAction =
  | { type: "DATE_SET"; date: string }
  | { type: "SHIFT_SET"; shift: Shift }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "operator"; value: string }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "machine"; value: Machine }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "hex"; value: number | null }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "size"; value: string }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "side"; value: 1 | 2 | null }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "cycleMinutes"; value: number | null }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "cycleSeconds"; value: number | null }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "partsCount"; value: number | null }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "timeIn"; value: string; markTouched?: boolean }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "timeOut"; value: string; markTouched?: boolean };
```

Reducer behavior:

- For numeric fields, update the value directly.
- For `timeIn`, update `timeIn` and set `timeInTouched: true` when `markTouched` is true.
- For `timeOut`, update `timeOut` and set `timeOutTouched: true` when `markTouched` is true.
- Existing `SHIFT_SET` must continue to update only untouched time fields.
- Do not calculate production hours inside the reducer.
- Do not mutate entries.

About `productionHours`:

- Treat selectors as the source of truth.
- It is acceptable for `entry.productionHours` to remain `null` in Phase 4 if components use `entryProductionHours(entry)`.
- If an existing implementation already caches `productionHours`, update it only by calling the shared selector logic. Do not duplicate the formula.

## Component Contracts

### `src/components/cnc/CycleTimeInput.tsx`

Responsibilities:

- Render label `Cycle Time`.
- Render one joined visual control containing two number inputs:
  - minutes
  - seconds
- Render `min` and `sec` suffix labels inside the control.
- Dispatch updates for `cycleMinutes` and `cycleSeconds`.
- Show hard validation and soft warnings.

Suggested props:

```ts
type CycleTimeInputProps = {
  minutes: number | null;
  seconds: number | null;
  onMinutesChange: (value: number | null) => void;
  onSecondsChange: (value: number | null) => void;
};
```

Visual rules:

- Outer control height: 48px.
- Outer control border: `border-border-soft`.
- Outer control radius: input radius.
- Inner inputs have no individual border.
- 1px divider between minutes and seconds.
- Inputs use tabular nums.
- Inputs are centered.
- Suffix labels use caption styling and muted text.
- Focus-within uses the standard focus ring.

Input behavior:

- Blank maps to `null`.
- Numeric text maps to a number.
- Negative minutes are invalid.
- Seconds below 0 or above 59 are invalid.
- Total cycle seconds of 0 is invalid once the user has typed a value.

Validation and warning copy:

```text
Seconds should be 0 to 59.
Cycle time can't be zero.
Cycle time looks low - please confirm.
Cycle time looks high - please confirm.
```

Rules:

- Do not show a required error on first render with blank values.
- Show the seconds range error immediately when seconds is outside 0-59.
- Show zero-cycle error when the user has interacted and the total is 0.
- Show low warning when `0 < cycleSec < 20`.
- Show high warning when `cycleSec > 600`.
- Warnings do not block calculation if the value is otherwise valid.

### `src/components/cnc/TimeRangeInput.tsx`

Responsibilities:

- Render `Time In` and `Time Out`.
- Use native `<input type="time">`.
- Dispatch updates for `timeIn` and `timeOut`.
- Mark fields touched on manual edit.

Suggested props:

```ts
type TimeRangeInputProps = {
  timeIn: string;
  timeOut: string;
  onTimeInChange: (value: string) => void;
  onTimeOutChange: (value: string) => void;
};
```

Reducer dispatch behavior:

```ts
dispatch({
  type: "CNC_FIELD_SET",
  entryId,
  field: "timeIn",
  value,
  markTouched: true
});
```

Visual rules:

- Side-by-side on screens `>= 360px`.
- Stack below 360px.
- Native input height 48px.
- Body-lg text.
- Tabular nums.

Validation:

- If both values exist and `timeOut <= timeIn`, show:

```text
Time Out should be after Time In.
```

- This is immediate field-level feedback only.
- Full validation timing and summary exclusion are Phase 11.

### `src/components/cnc/PartsCountInput.tsx`

Responsibilities:

- Render label `Parts Count`.
- Render large numeric input.
- Render `pcs` suffix inside the field.
- Dispatch `partsCount`.
- Select all text on focus.

Suggested props:

```ts
type PartsCountInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};
```

Visual rules:

- Height 56px.
- Font size 22px.
- Font weight 600.
- Right aligned.
- Tabular nums.
- Suffix `pcs` positioned at the right edge.
- Enough right padding so value does not overlap suffix.

Input behavior:

- Blank maps to `null`.
- Numeric text maps to a number.
- Use `inputMode="numeric"`.
- Use `pattern="[0-9]*"`.
- On focus, select the existing content.

Validation:

- Do not show required error on blank in this phase.
- If the user enters `0` or a negative value, production hours stays pending.
- Full required-field error appears in Phase 11.

### `src/components/cnc/ProductionHoursDisplay.tsx`

Responsibilities:

- Render label `Production Hours`.
- Render a read-only calculated display.
- Accept a value of `number | null`.

Suggested props:

```ts
type ProductionHoursDisplayProps = {
  value: number | null;
};
```

Visual rules:

- Height 56px.
- Radius input.
- Right aligned.
- If `value === null`:
  - background `bg-bg-sunken`
  - number text muted
  - display `-` or the existing pending glyph used in prior phases
- If `value !== null`:
  - background `bg-accent-50`
  - number text `text-accent-600`
  - display `value.toFixed(2)`
  - show `hrs` suffix

Use tabular nums.

### Update `src/components/cnc/CncEntryCard.tsx`

Add the new production fields to the existing Phase 3 grid.

Final field order after Phase 4:

```text
[ Operator              ]  [ Machine            ]
[ Hex                   ]  [ Size               ]
[ Side                  ]  [ Cycle Time         ]
[ Time In               ]  [ Time Out           ]
[ Parts Count           ]  [ Production Hours   ]
```

Implementation notes:

- Keep all identity fields unchanged.
- Add Cycle Time after Side.
- Add Time In and Time Out after Cycle Time.
- Add Parts Count and Production Hours after time fields.
- Use the existing `setField` helper from Phase 3 if present.
- Compute `const hours = entryProductionHours(entry)` once in `CncEntryCard`.
- Pass `hours` to `ProductionHoursDisplay`.
- Use `hours` for header/status display when the entry is complete.

Entry complete rule for header/status:

An entry is complete when:

- operator is filled
- machine is selected
- hex is not null and is between 0 and 100
- size is filled
- side is 1 or 2
- cycle time is valid and greater than 0
- parts count is greater than 0
- time in exists
- time out exists
- time out is after time in

If complete:

- Header status shows `7.83 hrs` in text-primary.
- Identity subtitle may append `- 7.83 hrs`.

If incomplete:

- Header status stays `Incomplete` in warning color.
- Production Hours display can still show computed hours if cycle/count are valid. This helps the worker even before all identity fields are filled.

Do not show the card warning banner yet.

### Update `src/components/LiveTotalsStrip.tsx`

The CNC Hours tile should now subscribe to real `totalCncHours(state)`.

Behavior:

- With no valid production values, show `0.00` in muted text.
- When cycle/count produce hours, show the sum in primary text.
- Format with two decimals.
- Entries tile continues to show `cncEntryCount(state)`.
- Burma stays `0`.

Add 160ms cross-fade on number changes.

Implementation options:

1. Implement a local `AnimatedValue` inside `LiveTotalsStrip`.
2. Create `src/components/primitives/AnimatedNumber.tsx` if reuse is cleaner.

Rules:

- Honor `prefers-reduced-motion: reduce`.
- Do not bounce or scale numbers.
- Simple opacity cross-fade is enough.

## Implementation Steps

### Step 1: Confirm Phase 3 baseline

Run:

```bash
npm run lint
npm run build
```

If the app is under `app/`, run these commands from `app/`.

If Phase 3 does not build, fix Phase 3 first.

### Step 2: Extend action types and reducer

Update `src/state/types.ts` and `src/state/reducer.ts` to support:

- `cycleMinutes`
- `cycleSeconds`
- `timeIn`
- `timeOut`
- `partsCount`
- touched flags for manual time edits

Keep reducer pure and immutable.

### Step 3: Implement selectors

Update `src/state/selectors.ts`:

- add `entryProductionHours`
- update `totalCncHours`
- keep `cncEntryCount`
- keep `totalBurma`

Add tiny helper functions if useful:

```ts
export function cycleSeconds(entry: CncEntry): number | null
export function isCncEntryComplete(entry: CncEntry): boolean
```

Only add helpers if they remove duplicated logic.

### Step 4: Add production input components

Create:

```text
src/components/cnc/CycleTimeInput.tsx
src/components/cnc/TimeRangeInput.tsx
src/components/cnc/PartsCountInput.tsx
src/components/cnc/ProductionHoursDisplay.tsx
```

Keep components controlled by props.

### Step 5: Integrate fields into `CncEntryCard`

Place production fields into the existing grid in the documented order.

Wire all field changes to `CNC_FIELD_SET`.

Compute hours via `entryProductionHours(entry)`.

### Step 6: Update Live Totals Strip

Update CNC Hours to use real total.

Add number cross-fade.

Verify zero state still looks muted.

### Step 7: Verify shift propagation

Manual test:

1. Start with Morning shift.
2. Confirm entry time defaults are `08:30` and `18:30`.
3. Switch to Evening.
4. Confirm untouched entry times become `19:00` and `21:30`.
5. Manually edit Time In.
6. Switch shift again.
7. Confirm Time In stays manually edited.
8. Confirm Time Out still updates if untouched.

### Step 8: Verify calculation

Manual test:

1. Enter cycle minutes `2`.
2. Enter cycle seconds `26`.
3. Enter parts count `193`.
4. Confirm Production Hours shows `7.83`.
5. Confirm Live Totals CNC Hours shows `7.83`.

### Step 9: Run checks

Run:

```bash
npm run lint
npm run build
npm run dev
```

If app lives under `app/`, run from `app/`.

## Acceptance Criteria

- [ ] Phase 1 shell remains intact.
- [ ] Phase 2 DateShiftCard and LiveTotalsStrip remain intact.
- [ ] Phase 3 CNC identity fields remain intact.
- [ ] Existing docs and `production_entry.html` are preserved.
- [ ] `CycleTimeInput` renders one joined min/sec control.
- [ ] Cycle minutes dispatches to state.
- [ ] Cycle seconds dispatches to state.
- [ ] Seconds above `59` shows `Seconds should be 0 to 59.`
- [ ] Cycle time of `0` after interaction shows `Cycle time can't be zero.`
- [ ] Cycle time below 20 seconds shows soft warning.
- [ ] Cycle time above 600 seconds shows soft warning.
- [ ] Time In renders as native time input.
- [ ] Time Out renders as native time input.
- [ ] Morning defaults are `08:30` and `18:30`.
- [ ] Evening defaults are `19:00` and `21:30`.
- [ ] Switching shift updates Time In/Out only when untouched.
- [ ] Manual edit of Time In sets `timeInTouched = true`.
- [ ] Manual edit of Time Out sets `timeOutTouched = true`.
- [ ] Touched time fields are not overwritten by later shift changes.
- [ ] Time Out <= Time In shows `Time Out should be after Time In.`
- [ ] Parts Count renders as a 56px high right-aligned numeric input.
- [ ] Parts Count shows a `pcs` suffix.
- [ ] Parts Count selects all text on focus.
- [ ] Parts Count dispatches to state.
- [ ] `entryProductionHours` returns `7.83` for 2m 26s and 193 parts.
- [ ] `entryProductionHours` returns `null` for missing cycle.
- [ ] `entryProductionHours` returns `null` for missing parts.
- [ ] `entryProductionHours` returns `null` for invalid seconds.
- [ ] Production Hours display shows pending state when hours are null.
- [ ] Production Hours display uses accent-50 background and accent-600 number when valid.
- [ ] Live Totals CNC Hours reads from `totalCncHours`.
- [ ] Live Totals CNC Hours updates to `7.83` in the same render flow.
- [ ] Live Totals CNC Hours cross-fades over 160ms when changed.
- [ ] Reduced-motion users do not get the cross-fade animation.
- [ ] Card header still shows `Incomplete` until the full entry is complete.
- [ ] Card header can show computed hours when the full entry is complete.
- [ ] Identity subtitle can append hours only when the full entry is complete.
- [ ] No add/remove/duplicate behavior is introduced.
- [ ] No persistence, summary, PNG, share, PWA, or service worker functionality is introduced.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Manual QA Checklist

Use desktop browser and mobile emulation.

Viewports:

- [ ] 320x568
- [ ] 360x640
- [ ] 375x667
- [ ] 1440x900

Checks:

- [ ] No horizontal scroll.
- [ ] CNC grid remains one column below 360px.
- [ ] CNC grid is two columns at 360px and above.
- [ ] Cycle control does not visually split into two separate boxes.
- [ ] Time fields stack below 360px if needed.
- [ ] Parts Count text does not overlap `pcs`.
- [ ] Production Hours display aligns with Parts Count.
- [ ] Header, DateShiftCard, LiveTotalsStrip, and CNC identity fields still work.
- [ ] Tab order follows the visual field order.
- [ ] Focus ring is visible on cycle inputs, time inputs, parts input, and existing identity controls.
- [ ] No console errors.

## Calculation Review

Before closing the phase, inspect the calculation path:

- [ ] Formula exists in one place only.
- [ ] Components call selectors/helpers instead of duplicating math.
- [ ] Rounding happens once.
- [ ] `null` means pending/invalid.
- [ ] `0.00` in totals means the sum is zero, not that an entry is valid.
- [ ] `2m 26s * 193` gives `7.83`.
- [ ] `1m 50s * 210` gives `6.42`.
- [ ] `1m 55s * 220` gives `7.03`.
- [ ] `0m 0s * 193` returns `null`.
- [ ] `2m 60s * 193` returns `null`.
- [ ] `2m 26s * 0` returns `null`.

If a test harness exists, add tests for the calculation examples and reducer time touched behavior.

If no test harness exists, do not install one just for Phase 4 unless the project owner explicitly asks.

## Reducer Review

Before closing the phase, inspect reducer changes:

- [ ] `CNC_FIELD_SET` supports production fields.
- [ ] Numeric field updates preserve `number | null`.
- [ ] Time field updates preserve string format.
- [ ] Manual time edits set touched flags.
- [ ] Shift changes update untouched times only.
- [ ] Unknown `entryId` returns unchanged state.
- [ ] Unchanged field value returns unchanged state where practical.
- [ ] No state mutation.
- [ ] No localStorage.
- [ ] No DOM access.
- [ ] No production-hours math in reducer unless it calls the shared selector helper.

## Risks and Guardrails

- Do not drift into Phase 5. Multi-entry add/remove/duplicate is not part of this phase.
- Do not add the sticky action bar yet. Phase 7 owns it.
- Do not add validation banners or preview-attempt behavior. Phase 11 owns the full validation pass.
- Do not compute hours in multiple places.
- Do not store stale computed values if selectors already provide the value.
- Do not overwrite manually edited time fields on shift change.
- Do not show red required errors on blank fields at first load.
- Do not treat soft warnings as blockers.
- Do not use non-native time pickers.
- Do not introduce a backend or persistence.

## Handoff Notes For Phase 5

Phase 5 should be able to start from:

- one fully functional CNC entry
- stable identity fields
- stable production fields
- working live production-hours calculation
- `entryProductionHours`
- `totalCncHours`
- untouched time defaults and touched flags
- card shell ready to be repeated for multiple entries

Expected Phase 5 changes:

- add `CNC_ENTRY_ADD`
- add `CNC_ENTRY_REMOVE`
- add `CNC_ENTRY_DUPLICATE`
- implement smart copy from previous entry
- implement inline remove confirm
- implement undo toast
- update card list animations
