# Phase 3: CNC Entry Card Identity Fields

## Objective

Add the first CNC Production section and one default CNC Entry Card with the identity half of the CNC workflow:

```text
CNC Production
Add one entry per machine + size + side.

CNC Entry 1                  Incomplete
[Duplicate] [Remove]

Operator
Machine
Hex
Size
Side
```

After this phase, the worker should see one CNC card on app open and be able to fill:

- Operator
- Machine
- Hex
- Size
- Side

These values should persist in reducer state and update the card identity subtitle live. Production fields, calculations, add/remove behavior, duplicate behavior, validation banners, and summary behavior remain out of scope.

## Prerequisite

Phases 1 and 2 must be implemented before this phase is executed.

This plan assumes the repository already contains the Phase 2 foundation:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/state/StateContext.tsx
src/components/Header.tsx
src/components/DateShiftCard.tsx
src/components/LiveTotalsStrip.tsx
src/components/primitives/Segmented.tsx
src/App.tsx
```

If those files do not exist yet, implement `PHASE_1_PLAN.md` and `PHASE_2_PLAN.md` first. Do not execute Phase 3 directly against the current docs-only root.

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

It also follows `03_phase_roadmap_standard.md`, which says every phase must be additive, visible, scoped, and tied back to the source documents.

For this phase, the source documents were read in detail:

- `requirements.md` sections 7, 8, and 11
- `frontend_ui_spec.md` sections 12 through 18, 39, and 42
- `detailed_ui_ux_design.md` sections 5.1.6, 6.1.1 through 6.1.8, 8, 9, 11, and 12
- `PHASE_ROADMAP.md` Phase 3
- `PHASE_2_PLAN.md` handoff notes
- `production_entry.html` CNC card template and identity-field behavior, as reference only

## Estimated Output

Approximate size: 600 LOC.

Expected files created:

```text
src/components/primitives/Chip.tsx
src/components/primitives/Select.tsx
src/components/cnc/CncSection.tsx
src/components/cnc/CncEntryCard.tsx
src/components/cnc/OperatorSelect.tsx
src/components/cnc/MachineGrid.tsx
src/components/cnc/HexInputWithChips.tsx
src/components/cnc/SizeSelect.tsx
src/components/cnc/SideToggle.tsx
```

Expected files modified:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/App.tsx
```

Optional if Phase 2 did not already include shared field styling:

```text
src/styles/base.css
```

Do not modify `production_entry.html` except as a read-only reference. Do not remove or rewrite existing planning documents.

## Inputs

Read in this order before implementing:

1. `requirements.md` section 7
   - CNC is the main detailed operation.
   - Each line item represents operator, machine, hex, size, side, cycle time, time window, and count.
   - Same operator/machine combinations can appear across multiple entries.
2. `requirements.md` section 8
   - Operator, Machine, Hex, Size, and Side are required CNC identity fields.
   - Machine must be M1 to M8.
   - Hex is numeric and should support common quick-select values.
   - Side is only 1 or 2.
3. `requirements.md` section 11
   - Validation rules exist, but this phase only wires immediate hex range handling where useful. Full validation pass lands later.
4. `frontend_ui_spec.md` section 12
   - CNC section header and default first card.
   - Add button exists in the spec, but roadmap defers add behavior to Phase 5.
5. `frontend_ui_spec.md` section 13
   - CNC card purpose, header, action placement, and field order.
6. `frontend_ui_spec.md` sections 14 through 18
   - Operator, Machine, Hex, Size, and Side behavior.
7. `detailed_ui_ux_design.md` section 5.1.6
   - CNC section header visual rhythm.
   - First card visible at app open.
8. `detailed_ui_ux_design.md` sections 6.1.1 through 6.1.8
   - Exact card anatomy and identity-field anatomy.
9. `detailed_ui_ux_design.md` sections 8, 9, and 11
   - Copy, responsive behavior, and accessibility.
10. `detailed_ui_ux_design.md` section 12
   - State model and `CncEntry` shape.
11. `PHASE_ROADMAP.md` Phase 3
   - Exact phase scope and acceptance checklist.
12. `PHASE_2_PLAN.md`
   - Existing state architecture and handoff notes.
13. `production_entry.html`
   - Reference implementation of card layout, chips, size custom mode, and identity subtitle. Do not copy the vanilla DOM approach.

## What This Phase Adds

- One default CNC entry in app state at initialization.
- `CNC_FIELD_SET` reducer action for Phase 3 identity fields.
- Reusable `Chip` primitive.
- Reusable styled native `Select` primitive.
- CNC section header.
- CNC entry card shell.
- CNC card header with title, incomplete status, subtitle, Duplicate, and Remove.
- Operator select tied to `state.people`.
- No-op `+ Add new person` affordance under Operator.
- Machine M1-M8 chip grid.
- Hex number input with common chips: `37`, `41`, `55`, `60`, `65`.
- Size select with hardcoded values and `Custom...` text-input fallback.
- Side segmented control using the Phase 2 `Segmented` primitive.
- Live identity subtitle such as `Avinash - M1 - 1/2 - Side 1`.
- CNC entry count selector now returns the actual number of entries, so Live Totals `ENTRIES` should show `1`.

## What This Phase Does NOT Do

- No Cycle Time inputs.
- No Time In / Time Out inputs.
- No Parts Count input.
- No Production Hours display beyond the header status text `Incomplete`.
- No production-hours calculation.
- No Add CNC Entry button behavior.
- No Duplicate behavior.
- No Remove behavior.
- No Undo toast.
- No card warning banner.
- No full field-level validation pass.
- No Summary Preview.
- No PNG generation.
- No Add Person modal.
- No people persistence.
- No draft persistence.
- No Burma, Repair, or Notes cards.
- No sticky bottom action bar.
- No service worker.
- No router.
- No backend.

## State and Reducer Changes

### Update `src/state/types.ts`

If Phase 2 used the full `CncEntry` type from the design doc, keep it. If any fields are missing, update it to match:

```ts
export type CncEntry = {
  id: string;
  operator: string;
  machine: Machine;
  hex: number | null;
  size: string;
  side: 1 | 2 | null;
  cycleMinutes: number | null;
  cycleSeconds: number | null;
  timeIn: string;
  timeOut: string;
  partsCount: number | null;
  productionHours: number | null;
  timeInTouched: boolean;
  timeOutTouched: boolean;
};
```

Add or confirm these supporting types:

```ts
export type Machine =
  | ""
  | "M1"
  | "M2"
  | "M3"
  | "M4"
  | "M5"
  | "M6"
  | "M7"
  | "M8";

export type CncIdentityField = "operator" | "machine" | "hex" | "size" | "side";
```

Prefer specific action types in the reducer over loose `any` values.

### Update `src/state/reducer.ts`

Add constants:

```ts
export const machines = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"] as const;

export const commonHexValues = [37, 41, 55, 60, 65] as const;

export const sizeOptions = [
  "1/2",
  "3/4",
  "1 inch",
  "1-1/2",
  "2 inch",
  "2-1/2",
  "3 inch"
] as const;
```

Add an entry factory:

```ts
export function createEmptyCncEntry(shift: Shift): CncEntry {
  const defaults = defaultShiftTimes[shift];

  return {
    id: crypto.randomUUID(),
    operator: "",
    machine: "",
    hex: null,
    size: "",
    side: 1,
    cycleMinutes: null,
    cycleSeconds: null,
    timeIn: defaults.timeIn,
    timeOut: defaults.timeOut,
    partsCount: null,
    productionHours: null,
    timeInTouched: false,
    timeOutTouched: false
  };
}
```

If testability is important, allow dependency injection for the ID:

```ts
export function createEmptyCncEntry(shift: Shift, id = crypto.randomUUID()): CncEntry
```

Update `createInitialState` so it seeds one entry:

```ts
cncEntries: [createEmptyCncEntry("morning")]
```

This intentionally changes Phase 2 behavior. Live Totals should now show `ENTRIES = 1`.

Add reducer actions:

```ts
export type ProductionEntryAction =
  | { type: "DATE_SET"; date: string }
  | { type: "SHIFT_SET"; shift: Shift }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "operator"; value: string }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "machine"; value: Machine }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "hex"; value: number | null }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "size"; value: string }
  | { type: "CNC_FIELD_SET"; entryId: string; field: "side"; value: 1 | 2 | null };
```

Reducer behavior:

- Find the matching entry by `entryId`.
- Return unchanged state if no entry matches.
- Return unchanged state if the new value equals the existing value.
- Otherwise return a new state object with a new `cncEntries` array.
- Do not mutate the entry object.
- Do not compute `productionHours` in this phase.

Keep existing `SHIFT_SET` behavior from Phase 2:

- update `timeIn` for entries where `timeInTouched === false`
- update `timeOut` for entries where `timeOutTouched === false`
- do not overwrite touched times

### Update `src/state/selectors.ts`

`cncEntryCount(state)` should now return `state.cncEntries.length`, which should be `1` after initial load.

`totalCncHours(state)` should remain `0` because production fields are not implemented.

`totalBurma(state)` should remain `0`.

Add a selector/helper if useful:

```ts
export function cncIdentitySubtitle(entry: CncEntry): string
```

Recommended subtitle pieces:

- operator if present
- machine if present
- size if present
- `Side 1` or `Side 2` if side is present

Subtitle activation rule:

- Do not render a subtitle on a completely blank card just because `side` defaults to `1`.
- Render the subtitle only once at least one of `operator`, `machine`, or `size` is filled.
- Once the subtitle is active, include side if present.

Do not include `Hex` in the subtitle unless the implementation needs it for clarity. The roadmap example omits hex and says `Avinash - M1 - 1/2 - Side 1`.

## Component Contracts

### `src/components/primitives/Chip.tsx`

Create a selectable chip primitive for Machine and Hex chips.

Suggested props:

```ts
type ChipProps = {
  selected?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "md" | "sm";
  type?: "button";
  "aria-pressed"?: boolean;
};
```

Visual rules:

- Medium chip:
  - height 44px
  - min-width 56px
  - radius pill
  - `body-lg`
  - semibold
- Small chip:
  - height 32px
  - horizontal padding 16px
  - `body-md` or compact body styling
- Default:
  - `bg-bg-sunken`
  - `text-text-secondary`
- Selected:
  - `bg-accent-600`
  - `text-text-inverse`
  - `shadow-sm`
- Transition:
  - 140ms
  - `cubic-bezier(0.2, 0, 0, 1)`
- Focus:
  - visible ring from Phase 1 base styles

Use `<button type="button">`.

### `src/components/primitives/Select.tsx`

Create a styled native select primitive.

Suggested props:

```ts
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};
```

Visual rules:

- height 48px
- padding `0 14px`
- right padding enough for native arrow or custom background arrow
- radius input
- 1px `border-border-soft`
- background `bg-bg-card`
- text `body-lg`
- focus ring from base styles
- invalid variant can be present but should not be used for full required validation yet

Do not replace native select with a custom popup. Native mobile select is preferred for V1 reliability.

### `src/components/cnc/CncSection.tsx`

Responsibilities:

- Read `state.cncEntries`.
- Render the section title and subtitle.
- Render one `CncEntryCard` per entry.
- For Phase 3 there should be exactly one entry from initial state.
- Do not render `+ Add CNC Entry` yet, because roadmap Phase 5 owns add behavior.

Copy:

```text
CNC Production
Add one entry per machine + size + side.
```

Visual rules:

- Header outside the card.
- Left padding `space-2`.
- `heading-md` for title.
- `body-md`, muted for subtitle.
- `space-4` between subtitle and first card.

### `src/components/cnc/CncEntryCard.tsx`

Responsibilities:

- Render card shell.
- Render header.
- Render identity subtitle.
- Render Duplicate/Remove ghost buttons as visible but no-op controls.
- Render identity field grid.

Header:

```text
CNC Entry 1                    Incomplete
Avinash - M1 - 1/2 - Side 1
[Duplicate] [Remove]
```

Rules:

- Title: `heading-sm`.
- Status: `Incomplete`, warning color, caption/body-sm weight.
- Subtitle appears only when at least one of operator, machine, or size exists.
- Default `Side 1` should not make the subtitle appear by itself on a blank card.
- Once the subtitle is active, include side if present.
- Duplicate and Remove are no-op in this phase.
- If clicked, they should either do nothing or use disabled/no-op semantics. Prefer no-op with `aria-disabled="true"` and no reducer dispatch. Do not show toast yet.
- Remove should not be danger-colored in resting state.

Card shell:

- `bg-bg-card`
- border `border-border-soft`
- radius card
- `shadow-sm`
- padding `p-4`, `p-5` at `min-[380px]` if available
- width 100%

Field grid:

- 1 column below 360px.
- 2 columns at 360px and above.
- Use CSS grid, not manual flex rows.
- Phase 3 field order:
  1. Operator
  2. Machine
  3. Hex
  4. Size
  5. Side

Do not reserve visible cells for Cycle Time, Time In/Out, Parts Count, or Production Hours yet unless the design looks broken without them. Phase 4 will add production fields.

### `src/components/cnc/OperatorSelect.tsx`

Responsibilities:

- Render label `Operator`.
- Render styled native select.
- Read options from `state.people`.
- Dispatch `CNC_FIELD_SET` with field `operator`.
- Render inline `+ Add new person` link below the select.

Behavior:

- First option should be blank, such as `Select...`.
- Selecting a person updates state.
- `+ Add new person` is visible but no-op in Phase 3.
- Do not open modal.
- Do not add people.
- Do not persist people.

Accessibility:

- Use a real `<label>`.
- Associate label with select via `htmlFor` and `id`.

### `src/components/cnc/MachineGrid.tsx`

Responsibilities:

- Render label `Machine`.
- Render M1-M8 chips in 4 columns and 2 rows.
- Single-select.
- Dispatch `CNC_FIELD_SET` with field `machine`.

Behavior:

- Clicking selected machine can either keep it selected or clear it. Prefer keeping it selected to avoid accidental clearing.
- Machines are never disabled in V1.
- Selected chip uses accent fill.

Accessibility:

- Use `role="radiogroup"` around the chips.
- Each chip can use `role="radio"` and `aria-checked`.
- Tab and arrow-key behavior is nice to have but not required if each chip is a real button and reachable. If implementing roving focus, follow the `Segmented` model.

### `src/components/cnc/HexInputWithChips.tsx`

Responsibilities:

- Render label `Hex`.
- Render numeric input.
- Render common chips: `37`, `41`, `55`, `60`, `65`.
- Dispatch `CNC_FIELD_SET` with field `hex`.

Input behavior:

- `type="number"` or `type="text"` with numeric sanitization are both acceptable. Prefer `type="number"` for this phase unless browser behavior becomes awkward.
- Use `inputMode="numeric"`.
- Use `pattern="[0-9]*"`.
- Empty input maps to `null`.
- Numeric input maps to `number`.
- Common chip click writes that number to state.
- Matching common chip highlights when `entry.hex` equals the chip value.

Validation:

- If hex is not `null` and is outside `0-100`, show `Hex must be between 0 and 100.`
- Do not block typing.
- Do not mark blank as an error in this phase.
- Full required validation appears in Phase 11.

### `src/components/cnc/SizeSelect.tsx`

Responsibilities:

- Render label `Size`.
- Render select with hardcoded values:

```text
1/2
3/4
1 inch
1-1/2
2 inch
2-1/2
3 inch
Custom...
```

Behavior:

- Blank first option: `Select...`.
- Selecting a normal value dispatches `CNC_FIELD_SET` with field `size`.
- Selecting `Custom...` swaps select to a text input.
- Text input value dispatches field `size`.
- Render `← back to list` below the custom input.
- Clicking back clears the size and returns to select mode.
- If an existing state value is not one of the hardcoded options, component should render in custom mode with that value.

Do not use a searchable select in this phase.

### `src/components/cnc/SideToggle.tsx`

Responsibilities:

- Render label `Side`.
- Render `Side 1` and `Side 2` using the Phase 2 `Segmented` primitive.
- Dispatch `CNC_FIELD_SET` with field `side`.

Behavior:

- Default side is `1` from `createEmptyCncEntry`.
- Segment height should be 40px if the primitive supports a compact size. If not, use the existing 44px/48px styling from Shift and refine later only if needed.

## App Composition

### Update `src/App.tsx`

Preserve the Phase 2 rhythm:

```text
Header
DateShiftCard
LiveTotalsStrip
CNCSection
```

Recommended ordering:

```tsx
<Header date={state.date} />
<div className="space-y-6">
  <DateShiftCard />
  <LiveTotalsStrip />
  <CncSection />
</div>
```

Keep the outer shell from Phase 1:

- max-width 480px
- centered
- soft app background
- safe-area-aware bottom padding
- mobile-first

## Implementation Steps

### Step 1: Confirm Phase 2 baseline

Run:

```bash
npm run lint
npm run build
```

If Phase 2 does not build, fix Phase 2 first.

### Step 2: Update state types and constants

Modify `src/state/types.ts` and `src/state/reducer.ts` with:

- `Machine`
- `CncIdentityField`
- machine constants
- common hex constants
- size constants

Keep constants exported from the state or a nearby module so UI components do not duplicate lists.

### Step 3: Add CNC entry factory and seed initial state

Add `createEmptyCncEntry`.

Update `createInitialState` so the app opens with one blank CNC entry.

Confirm Live Totals `ENTRIES` moves from `0` to `1`.

### Step 4: Add `CNC_FIELD_SET`

Add the Phase 3 field action to `ProductionEntryAction`.

Implement immutable field updates.

Do not add add/remove/duplicate actions yet.

### Step 5: Add primitives

Create:

```text
src/components/primitives/Chip.tsx
src/components/primitives/Select.tsx
```

Use documented token classes and native semantics.

### Step 6: Add CNC identity components

Create:

```text
src/components/cnc/OperatorSelect.tsx
src/components/cnc/MachineGrid.tsx
src/components/cnc/HexInputWithChips.tsx
src/components/cnc/SizeSelect.tsx
src/components/cnc/SideToggle.tsx
```

Each component should be controlled by `entry` props and dispatch state updates through callbacks or direct context.

Preferred pattern:

- `CncEntryCard` receives `entry`.
- `CncEntryCard` defines `setField(field, value)`.
- Field components receive current value and `onChange`.

This keeps field components easier to test and reuse.

### Step 7: Add `CncEntryCard`

Create card shell, header, no-op actions, subtitle, and identity grid.

Keep the card calm and not dense. It will get more fields in Phase 4.

### Step 8: Add `CncSection`

Create section header and render the seeded card.

Do not render add tile yet.

### Step 9: Update App

Render `CncSection` below `LiveTotalsStrip`.

### Step 10: Verify behavior

Run:

```bash
npm run lint
npm run build
npm run dev
```

Manual checks:

- One CNC card visible on app open.
- `ENTRIES` tile shows `1`.
- Operator select uses `Avinash`, `Raju`, `Sonu`.
- Selecting operator updates subtitle.
- Selecting machine updates chip state and subtitle.
- Typing hex updates input state.
- Clicking common hex chip writes value and highlights chip.
- Selecting size updates subtitle.
- Selecting `Custom...` swaps to text input.
- Typing custom size updates subtitle.
- Clicking `← back to list` returns to select mode.
- Side defaults to Side 1.
- Side 2 can be selected.
- No console errors while tabbing through every field.

## Acceptance Criteria

- [ ] Phase 1 shell remains intact.
- [ ] Phase 2 DateShiftCard and LiveTotalsStrip remain intact.
- [ ] Existing docs and `production_entry.html` are preserved.
- [ ] App initializes with exactly one CNC entry.
- [ ] Live Totals `ENTRIES` displays `1`.
- [ ] `totalCncHours` still displays `0.00`.
- [ ] `totalBurma` still displays `0`.
- [ ] `CNC_FIELD_SET` updates only the targeted entry.
- [ ] `CNC_FIELD_SET` does not mutate existing state.
- [ ] One blank CNC card is visible at app open.
- [ ] CNC section header reads `CNC Production`.
- [ ] CNC section subtitle reads `Add one entry per machine + size + side.`
- [ ] Card title reads `CNC Entry 1`.
- [ ] Card status reads `Incomplete`.
- [ ] Duplicate and Remove are visible but do not perform Phase 5 behavior.
- [ ] Operator select is interactive and reads from `state.people`.
- [ ] `+ Add new person` is visible but does not open a modal yet.
- [ ] Machine grid renders M1 through M8.
- [ ] Only one machine can be selected.
- [ ] Selected machine uses accent fill and inverse text.
- [ ] Machine chip selection has the documented 140ms transition.
- [ ] Hex input accepts numeric values.
- [ ] Hex common chips render `37`, `41`, `55`, `60`, and `65`.
- [ ] Clicking a hex chip writes the value into state.
- [ ] Matching hex chip highlights.
- [ ] Hex outside `0-100` shows `Hex must be between 0 and 100.`
- [ ] Blank hex does not show a required error yet.
- [ ] Size select renders the documented hardcoded options.
- [ ] `Custom...` swaps to a text input.
- [ ] Custom size text updates state.
- [ ] `← back to list` returns to select mode.
- [ ] Side uses the reusable `Segmented` primitive.
- [ ] Side defaults to `Side 1`.
- [ ] Side can switch to `Side 2`.
- [ ] Identity subtitle appears when operator, machine, or size data exists.
- [ ] Default Side 1 alone does not show an identity subtitle on a blank card.
- [ ] Identity subtitle updates live.
- [ ] No production fields are rendered yet.
- [ ] No add/remove/duplicate behavior is implemented yet.
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
- [ ] CNC field grid is one column below 360px.
- [ ] CNC field grid is two columns at 360px and above.
- [ ] Machine grid remains 4x2 and tappable.
- [ ] All touch targets are at least 44px high.
- [ ] Native select controls are usable on mobile.
- [ ] Date and Shift from Phase 2 still work.
- [ ] Header date still updates after DateShiftCard changes.
- [ ] Tab order follows field order.
- [ ] Focus ring is visible for select, input, chips, and side toggle.
- [ ] No console errors.

## Reducer Review

Before closing the phase, inspect reducer changes:

- [ ] `createInitialState` seeds one entry.
- [ ] Entry ID is generated outside reducer action handling.
- [ ] `CNC_FIELD_SET` has type-safe values.
- [ ] Unknown `entryId` returns unchanged state.
- [ ] Unchanged field value returns unchanged state where practical.
- [ ] Matching entry update returns new entry object.
- [ ] Other entries preserve object identity.
- [ ] No localStorage.
- [ ] No DOM access.
- [ ] No production-hours math.

If a test harness exists, add tests for:

- initial state has one CNC entry
- default side is `1`
- default times follow Morning shift
- `SHIFT_SET` updates untouched times
- `CNC_FIELD_SET` updates operator
- `CNC_FIELD_SET` updates machine
- `CNC_FIELD_SET` updates hex
- `CNC_FIELD_SET` updates size
- `CNC_FIELD_SET` updates side
- unknown entry ID is a no-op

If no test harness exists, do not install one just for Phase 3 unless the project owner explicitly asks.

## Risks and Guardrails

- Do not drift into Phase 4. Cycle, time, count, and hours are intentionally absent.
- Do not wire Add Person. The link appears now; the modal arrives in Phase 10.
- Do not implement Add, Remove, Duplicate, Undo, or empty state. Phase 5 owns that behavior.
- Do not show required-field errors on first load. Full validation timing arrives in Phase 11.
- Do not compute production hours from partial identity fields.
- Do not duplicate machine/size/hex constants inside multiple components if a shared export exists.
- Do not replace native select with a custom dropdown.
- Do not make the card feel like a table. It should stay card-first and touch-friendly.
- Do not use the old `production_entry.html` DOM mutation model in React.

## Handoff Notes For Phase 4

Phase 4 should be able to start from:

- a seeded CNC entry
- stable card shell
- stable field grid
- `CNC_FIELD_SET` action that can be expanded to production fields
- reusable `Chip`, `Select`, and `Segmented` primitives
- identity subtitle helper
- default shift times already stored on entries

Expected Phase 4 changes:

- add Cycle Time field
- add Time In / Time Out fields
- add Parts Count field
- add Production Hours display
- implement `entryProductionHours`
- update `totalCncHours`
- keep using the same `CncEntryCard` shell and grid
