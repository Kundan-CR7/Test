# Phase 6: Burma + Repair + Notes Cards

## Objective

Complete the remaining data-entry surface of the V1 production form.

After this phase, the worker should be able to fill:

```text
Burma Production
Repair Work
Notes
```

The target screen order after Phase 6:

```text
Header
Date / Shift
Live Totals Strip
CNC Production
Burma Production
Repair Work
Notes
```

This phase completes every input the worker needs before the app adds the sticky action bar and summary flow.

## Prerequisite

Phases 1, 2, 3, 4, and 5 must be implemented before this phase is executed.

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
src/components/primitives/Select.tsx
src/components/primitives/Toast.tsx
```

If the implementation lives under `app/`, apply every source path in this plan under `app/src/...`.

The current workspace has an `app/` implementation with Phase 2/3-era state and CNC identity files. It does not yet appear to contain Phase 4 and Phase 5 source changes. Do not execute Phase 6 against `app/src` until Phase 4 and Phase 5 have landed there, or the plan will be forced to solve earlier-phase problems.

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

- `requirements.md` sections 12, 13, and 14
- `frontend_ui_spec.md` sections 25, 26, and 27
- `detailed_ui_ux_design.md` sections 5.1.7, 5.1.8, 5.1.9, 6.4.3, 8.3, and 8.5
- `PHASE_ROADMAP.md` Phase 6
- `PHASE_1_PLAN.md` shell boundaries
- `PHASE_2_PLAN.md` state shape, selectors, and Live Totals Strip contract
- `PHASE_3_PLAN.md` reusable field primitives and `OperatorSelect`
- `PHASE_4_PLAN.md` Live Totals cross-fade and CNC total contract
- `PHASE_5_PLAN.md` multi-entry CNC handoff and reusable Toast handoff
- `production_entry.html` Burma / Repair / Notes markup, as reference only

## Estimated Output

Approximate size: 250-350 LOC.

Expected files created:

```text
src/components/BurmaCard.tsx
src/components/RepairCard.tsx
src/components/NotesCard.tsx
```

Expected files modified:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/components/LiveTotalsStrip.tsx
src/components/cnc/OperatorSelect.tsx
src/App.tsx
```

Optional if the existing component set does not already have a reusable text input style:

```text
src/components/primitives/TextInput.tsx
```

Do not modify `production_entry.html` except as a read-only behavior reference. Do not remove or rewrite existing planning documents.

## Seamless Continuity Review

Phase 6 must feel like it was planned with the earlier phases, not bolted on.

### From Phase 1

Keep the app shell intact:

- no route changes
- no page-level redesign
- no new max-width
- no landing page
- no PWA/offline work

The new cards should use the same app background, spacing, card radius, and token system established by Phase 1.

### From Phase 2

Phase 2 already introduced the final state areas:

```ts
burma: { burma1, burma2, burma3 }
repair: { person, count, note }
notes: string
```

Phase 6 activates those state areas with real inputs and reducer actions.

Phase 2 also introduced:

```ts
totalBurma(state)
```

Phase 6 turns that selector from placeholder-ready into user-visible live behavior.

### From Phase 3

Phase 3 introduced:

```text
OperatorSelect
Select
card shell styles
field label conventions
```

Repair Person should use the same people list as CNC.

If `OperatorSelect` currently hardcodes the label `Operator`, extend it with a label prop instead of duplicating select logic:

```ts
<OperatorSelect label="Repair Person" ... />
```

If `OperatorSelect` currently renders a Phase 10 no-op `+ Add new person` button, make that button optional:

```ts
showAddPersonButton?: boolean
```

Use:

```tsx
<OperatorSelect label="Repair Person" showAddPersonButton={false} ... />
```

This keeps Phase 6 clean while preserving Phase 10's future path.

### From Phase 4

Do not touch:

```text
entryProductionHours
totalCncHours
CNC production calculation
CNC time touched flags
CNC card completeness
```

Phase 6 only adds Burma to the Live Totals Strip. The CNC Hours tile should continue to behave exactly as it did after Phase 4 and Phase 5.

If Phase 4 added a reusable number cross-fade for the CNC Hours tile, use the same mechanism for the Burma tile. Do not create a second animation pattern.

### From Phase 5

Do not touch:

```text
CNC_ENTRY_ADD
CNC_ENTRY_REMOVE
CNC_ENTRY_DUPLICATE
CNC_ENTRY_RESTORE
undo toast
card add/remove animation
empty CNC state
```

Phase 5 created or planned a reusable Toast primitive. Phase 6 should not redesign the toast. It does not need new toast behavior.

The new cards should render after the CNC section, regardless of whether there are zero, one, or many CNC entries.

## Inputs

Read in this order before implementing:

1. `PHASE_5_PLAN.md` handoff notes
   - Confirms CNC section supports zero, one, or many entries.
   - Confirms total CNC hours are correct across all entries.
   - Confirms reusable Toast exists but should not be redesigned.
2. `PHASE_ROADMAP.md` Phase 6
   - Defines the exact files and reducer actions for this phase.
   - Defines acceptance criteria for Burma, Repair, Notes, and Live Totals.
3. `requirements.md` section 12
   - Defines Burma 1/2/3 counts.
   - Blank Burma inputs count as zero.
   - Total Burma Count equals the sum of all three counts.
4. `requirements.md` section 13
   - Repair is optional.
   - V1 supports one repair row.
   - Fields: Repair Person, Repair Count, Repair Note.
5. `requirements.md` section 14
   - Notes are optional and free-form.
   - Notes capture extra context such as machine issues, material issues, or special work.
6. `frontend_ui_spec.md` section 25
   - Burma card title, layout, input pattern, and total display.
7. `frontend_ui_spec.md` section 26
   - Repair Work optional card and one-row behavior.
8. `frontend_ui_spec.md` section 27
   - Notes textarea and light guidance text.
9. `detailed_ui_ux_design.md` section 5.1.7
   - Exact Burma row, input, footer, separator, typography, and formatter details.
10. `detailed_ui_ux_design.md` section 5.1.8
    - Exact Repair card structure, Optional pill, and field types.
11. `detailed_ui_ux_design.md` section 5.1.9
    - Notes textarea min/max height, placeholder, and auto-grow behavior.
12. `detailed_ui_ux_design.md` section 6.4.3
    - Future summary rules: blank Repair omitted; blank Notes omitted; Burma still matters even if CNC is empty.
13. `PHASE_2_PLAN.md`
    - Existing state areas and Live Totals Strip contract.
14. `PHASE_4_PLAN.md`
    - Live Totals number cross-fade and reduced-motion expectations.
15. `production_entry.html`
    - Reference only for visual grouping and field order.

## What This Phase Adds

- Burma Production card.
- Three Burma count inputs.
- Live Total Burma Count footer inside the Burma card.
- `BURMA_SET` reducer action.
- Real `totalBurma(state)` selector behavior if not already complete.
- Live Totals Strip Burma tile wired to real state.
- Repair Work optional card.
- Repair Person select using the same people list as CNC.
- Repair Count numeric input.
- Repair Note single-line text input.
- `REPAIR_SET` reducer action.
- Notes optional card.
- Auto-growing Notes textarea.
- `NOTES_SET` reducer action.
- App composition update to render the three new cards after CNC.

## What This Phase Does NOT Do

- No Sticky Action Bar.
- No Preview Summary CTA.
- No Summary Modal.
- No Summary Card DOM.
- No PNG generation.
- No WhatsApp sharing.
- No Add Person modal.
- No multiple repair rows.
- No Burma plus/minus steppers.
- No validation blocking for blank Repair fields.
- No validation blocking for blank Notes.
- No localStorage persistence.
- No backend.
- No route changes.
- No changes to CNC add/remove/duplicate behavior.
- No changes to CNC production-hours formula.

## State Model

Phase 2 may already have numeric zero placeholders:

```ts
burma: {
  burma1: 0;
  burma2: 0;
  burma3: 0;
};

repair: {
  person: "";
  count: 0;
  note: "";
};
```

For actual editable optional inputs, prefer nullable numeric values:

```ts
type BurmaField = 'burma1' | 'burma2' | 'burma3';

type BurmaState = {
  burma1: number | null;
  burma2: number | null;
  burma3: number | null;
};

type RepairState = {
  person: string;
  count: number | null;
  note: string;
};
```

Use:

```ts
null = blank input
0 = user explicitly entered zero
positive number = user-entered count
```

This is a small internal upgrade from Phase 2. It is acceptable because no persistence exists yet and user-visible totals still render as zero when fields are blank.

If the implementation strongly prefers keeping `0` internally, the UI must still render blank inputs initially. Do not show `0` inside every optional field on page load.

Recommended initial state after Phase 6:

```ts
burma: { burma1: null, burma2: null, burma3: null },
repair: { person: '', count: null, note: '' },
notes: ''
```

Selectors should treat `null` as zero.

## Reducer Actions

Add these actions:

```ts
type ProductionEntryAction =
  | { type: 'BURMA_SET'; field: BurmaField; value: number | null }
  | { type: 'REPAIR_SET'; field: 'person'; value: string }
  | { type: 'REPAIR_SET'; field: 'count'; value: number | null }
  | { type: 'REPAIR_SET'; field: 'note'; value: string }
  | { type: 'NOTES_SET'; value: string };
```

Keep existing Phase 1-5 actions unchanged.

### `BURMA_SET`

Behavior:

```ts
case 'BURMA_SET': {
  if (state.burma[action.field] === action.value) return state;

  return {
    ...state,
    burma: {
      ...state.burma,
      [action.field]: action.value,
    },
  };
}
```

Rules:

- reducer receives already-parsed `number | null`
- reducer does not parse strings
- reducer does not clamp silently except for type-level safety
- reducer remains pure

### `REPAIR_SET`

Behavior:

```ts
case 'REPAIR_SET': {
  if (state.repair[action.field] === action.value) return state;

  return {
    ...state,
    repair: {
      ...state.repair,
      [action.field]: action.value,
    },
  };
}
```

Rules:

- person and note are strings
- count is `number | null`
- blank repair fields are valid
- reducer does not trim on every keystroke

Trimming can happen later in summary rendering or final validation. Do not damage intentional note spacing while the user is typing.

### `NOTES_SET`

Behavior:

```ts
case 'NOTES_SET': {
  if (state.notes === action.value) return state;
  return { ...state, notes: action.value };
}
```

Rules:

- preserve line breaks
- preserve user-entered text during editing
- do not trim on every keystroke
- do not impose validation in this phase

## Numeric Input Parsing

Use one shared helper for optional count parsing, either component-local or in a small utility if it is reused three or more times.

Recommended helper:

```ts
function parseOptionalWholeNumber(raw: string): number | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return null;
  return Number(digits);
}
```

Recommended formatter for input value:

```ts
function optionalNumberInputValue(value: number | null): string {
  return value === null ? '' : String(value);
}
```

Why sanitize instead of trusting `type="number"`:

- mobile number inputs can still allow unwanted characters in some browsers
- blank optional fields are easier to handle with text input + numeric keyboard
- pasted values like `1,500` can become `1500` instead of being rejected

Recommended input attributes:

```tsx
type="text"
inputMode="numeric"
pattern="[0-9]*"
```

This still satisfies the product requirement: numeric-only count entry with mobile number pad.

Do not allow:

```text
negative values
decimals
letters
scientific notation
```

## Selectors

Update:

```text
src/state/selectors.ts
```

### `totalBurma`

Implement:

```ts
function toCount(value: number | null | undefined): number {
  return value ?? 0;
}

export function totalBurma(state: ProductionEntryState): number {
  return (
    toCount(state.burma.burma1) +
    toCount(state.burma.burma2) +
    toCount(state.burma.burma3)
  );
}
```

If the state still uses numbers instead of nullable numbers, this selector still works.

### Optional Future-Friendly Selectors

These are optional in Phase 6, but useful for Phase 8:

```ts
export function hasRepairData(state: ProductionEntryState): boolean
export function hasNotes(state: ProductionEntryState): boolean
```

Implement them only if they make the components cleaner. Do not build summary rendering in this phase.

Suggested behavior:

```ts
hasRepairData =
  repair.person.trim() !== '' ||
  repair.count !== null ||
  repair.note.trim() !== ''

hasNotes = notes.trim() !== ''
```

## Formatting

Use `Intl.NumberFormat('en-IN')` for Burma card footer and Live Totals Burma tile.

Recommended:

```ts
const countFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});
```

Render examples:

```text
0
500
1,550
12,34,567
```

Do not format the input value while the user is typing. Format only display totals.

## Component Plan

## `BurmaCard`

Create:

```text
src/components/BurmaCard.tsx
```

Responsibilities:

- read Burma state
- dispatch `BURMA_SET`
- render three count rows
- render live footer total

Rows:

```text
Burma 1            [    500   ]
Burma 2            [    700   ]
Burma 3            [    350   ]
```

Footer:

```text
Total Burma Count                  1,550
```

Component shape:

```tsx
export default function BurmaCard() {
  const { state, dispatch } = useProductionEntry();
  const total = totalBurma(state);

  return (
    <section aria-labelledby="burma-heading" className="...">
      ...
    </section>
  );
}
```

Visual rules from `detailed_ui_ux_design.md`:

- card background
- card border
- card radius
- shadow-sm
- title `Burma Production`
- row label `body/md`, weight 500, secondary text
- input width 100px
- input right-aligned
- input `body/lg`
- input tabular nums
- footer separated by 1px `border-soft`
- footer label `body/sm`, weight 600
- footer number `heading/md`, weight 700, tabular nums, right-aligned
- footer updates live on every keystroke

Keep the component full-width inside the existing app column. Do not put this card inside another card.

### Burma Input Row

Use a tiny local row component inside `BurmaCard` unless there is already a shared field-row pattern.

Recommended:

```ts
type BurmaInputRowProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
};
```

Input behavior:

- blank input dispatches `null`
- pasted `1,500` dispatches `1500`
- typed letters do not enter state
- value displays as raw digits, not formatted with commas
- `aria-label` should match the visible label

## `RepairCard`

Create:

```text
src/components/RepairCard.tsx
```

Responsibilities:

- read repair state
- dispatch `REPAIR_SET`
- reuse the same people list as CNC
- render optional card pill
- keep all fields optional

Title row:

```text
Repair Work        Optional
```

Fields:

```text
Repair Person          [ Avinash      v ]
Repair Count           [          45 ]
Repair Note            [ Thread repair ]
```

Visual rules:

- same card shell as Burma and CNC
- Optional pill:
  - background `bg-sunken`
  - muted text
  - caption size
  - padding `2px 8px`
  - radius 999
- fields stacked
- Repair Person uses people list from `state.people`
- Repair Count is full-width and right-aligned
- Repair Note is a single-line text input, not a textarea

### Repair Person

Preferred approach:

Extend `OperatorSelect`:

```ts
type OperatorSelectProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showAddPersonButton?: boolean;
};
```

Default behavior should preserve CNC:

```ts
label = 'Operator'
showAddPersonButton = true
```

Repair usage:

```tsx
<OperatorSelect
  label="Repair Person"
  value={state.repair.person}
  onChange={(value) =>
    dispatch({ type: 'REPAIR_SET', field: 'person', value })
  }
  showAddPersonButton={false}
/>
```

This keeps Phase 10 ready to wire the Add Person modal later without showing a no-op add button in the Repair card.

If the implementation already has a cleaner people-select primitive, use that instead, but keep the data source identical to CNC.

### Repair Count

Use the same optional numeric parsing helper as Burma.

Rules:

- blank means `null`
- `null` is valid
- `0` is allowed but should not create a validation error
- display right-aligned tabular digits
- no thousands separators inside the input

### Repair Note

Use:

```text
single-line text input
```

Do not use a textarea for Repair Note.

Do not trim while typing.

Keep placeholder modest if one is needed:

```text
Thread repair
```

or:

```text
e.g. Thread repair
```

The docs do not require a placeholder here, so avoid extra helper text unless the existing field pattern expects it.

## `NotesCard`

Create:

```text
src/components/NotesCard.tsx
```

Responsibilities:

- read `state.notes`
- dispatch `NOTES_SET`
- render optional card pill
- render auto-growing textarea

Title row:

```text
Notes              Optional
```

Textarea:

```text
Anything extra - machine issue, power cut, material delay...
```

The design source uses an em dash and ellipsis in this placeholder. Use the exact product copy already present in the implemented app if one exists. If not, use the ASCII-safe copy above unless the project has standardized on exact Unicode UI copy.

Visual rules:

- same card shell as Burma and Repair
- min-height 96px
- max-height 240px
- padding `space-3` x `space-4`
- placeholder body-lg, disabled text
- auto-grow until max height
- internally scroll after max height

### Auto-Grow Behavior

Preferred CSS:

```css
field-sizing: content;
```

But browser support is not universal, so implement a small JS fallback:

```ts
function resizeTextarea(element: HTMLTextAreaElement) {
  element.style.height = 'auto';
  element.style.height = `${Math.min(element.scrollHeight, 240)}px`;
}
```

Use:

- `useRef`
- `useLayoutEffect` or `useEffect`
- call after value changes
- set `overflowY` to `auto` after 240px

Do not use a third-party textarea autosize library.

## `LiveTotalsStrip`

Update:

```text
src/components/LiveTotalsStrip.tsx
```

Expected tiles after Phase 6:

```text
CNC HOURS     ENTRIES      BURMA
14.83         3            1,550
```

Rules:

- CNC Hours remains two decimals.
- Entries remains integer count of CNC entries.
- Burma uses `Intl.NumberFormat('en-IN')`.
- Burma `0` is muted when total is zero.
- Burma becomes primary/bold when total is greater than zero.
- If Phase 4 added number cross-fade, Burma changes should use the same cross-fade.
- Reduced motion should disable cross-fade if the existing implementation supports that.

Do not make Live Totals sticky in Phase 6. Phase 7 owns sticky scroll choreography.

## `App`

Update:

```text
src/App.tsx
```

Render the new cards after CNC:

```tsx
<DateShiftCard />
<LiveTotalsStrip />
<CncSection />
<BurmaCard />
<RepairCard />
<NotesCard />
```

Keep the existing app max width and padding.

Do not add bottom sticky action bar padding beyond what already exists for the current shell. Phase 7 owns final bottom-bar spacing.

## Implementation Steps

## Step 1 - Confirm Phase 5 Baseline

Before editing Phase 6, verify these files exist:

```text
src/components/cnc/AddCncEntryButton.tsx
src/components/primitives/Toast.tsx
```

Verify these behaviors are implemented:

- add CNC entry
- duplicate CNC entry
- remove CNC entry
- undo remove
- empty CNC state
- total CNC hours across multiple entries

If those are missing, implement Phase 5 first.

## Step 2 - Review Current State Types

Open:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
```

Confirm whether Burma and Repair counts are currently:

```text
number
```

or:

```text
number | null
```

If they are `number`, decide whether to migrate to `number | null`.

Recommended migration:

```text
burma counts: number | null
repair count: number | null
initial values: null
selectors treat null as 0
```

This produces better optional input behavior while preserving existing totals.

## Step 3 - Add Action Types

Update action types with:

```text
BURMA_SET
REPAIR_SET
NOTES_SET
```

Keep existing action names unchanged.

Do not merge these into a generic `FIELD_SET` action. The state areas are different enough that explicit actions are clearer and easier to test.

## Step 4 - Add Reducer Cases

Implement immutable reducer cases.

Check no reducer case:

- parses raw strings
- mutates nested state
- trims while typing
- writes to localStorage
- changes CNC entries

## Step 5 - Update Selectors

Update `totalBurma`.

If useful, add:

```text
hasRepairData
hasNotes
```

Do not add summary selectors yet unless the implementation already needs them. Phase 8 owns summary rendering.

## Step 6 - Add Numeric Parsing Helper

Either:

- keep `parseOptionalWholeNumber` local to `BurmaCard` and duplicate tiny logic in `RepairCard`, or
- create a small shared helper if the codebase already has a utility location.

If creating a helper, suggested file:

```text
src/utils/input.ts
```

But do not create a utilities folder only for one line unless it improves clarity.

## Step 7 - Create `BurmaCard`

Create `src/components/BurmaCard.tsx`.

Implement:

- card shell
- title
- three count rows
- live footer total
- numeric-only input behavior
- formatted total

Manual check:

```text
Burma 1 = 500
Burma 2 = 700
Burma 3 = 350
Footer = 1,550
Live Totals Burma = 1,550
```

## Step 8 - Make `OperatorSelect` Reusable

If needed, update:

```text
src/components/cnc/OperatorSelect.tsx
```

Add props:

```ts
label?: string;
showAddPersonButton?: boolean;
```

Defaults must preserve CNC behavior.

Verify existing CNC card still renders:

```text
Operator
+ Add new person
```

Repair should render:

```text
Repair Person
```

with no no-op Add Person link in this phase.

## Step 9 - Create `RepairCard`

Create `src/components/RepairCard.tsx`.

Implement:

- card shell
- title row
- Optional pill
- Repair Person select
- Repair Count numeric input
- Repair Note single-line input

Manual check:

- leaving all fields blank is allowed
- selecting a person updates state
- typing count updates state
- typing note updates state
- clearing count returns state to `null`

## Step 10 - Create `NotesCard`

Create `src/components/NotesCard.tsx`.

Implement:

- card shell
- title row
- Optional pill
- textarea
- auto-grow to 240px max
- internal scroll after max height

Manual check:

- short note stays around 96px
- long note grows
- very long note caps at 240px and scrolls internally
- line breaks are preserved in state

## Step 11 - Update App Composition

Update `src/App.tsx`.

Render:

```text
BurmaCard
RepairCard
NotesCard
```

after:

```text
CncSection
```

Do not insert them above Live Totals. Live Totals should stay near the top as the global running status.

## Step 12 - Update Live Totals Burma Tile

Update `LiveTotalsStrip`.

Ensure:

- it reads the updated `totalBurma`
- it formats with `Intl.NumberFormat('en-IN')`
- it updates live on each Burma keystroke
- it keeps Phase 4 cross-fade behavior if present
- it does not become sticky

## Step 13 - Verify Optional Behavior

Blank Repair and blank Notes must not create validation errors.

In this phase, there is no final validation UI, but the state should be ready for future behavior:

- blank Repair omitted from summary in Phase 8
- blank Notes omitted from summary in Phase 8
- Burma total still appears as zero when all Burma fields are blank

## Step 14 - Run Checks

Run from the app directory:

```bash
npm run lint
npm run build
npm run dev
```

If app lives under `app/`, run:

```bash
cd app
npm run lint
npm run build
npm run dev
```

Manual browser checks are required because textarea auto-grow and mobile numeric keyboard behavior are UI behaviors.

## Data Flow

Burma:

```text
Burma input change
-> parse optional whole number
-> dispatch BURMA_SET
-> reducer updates state.burma
-> totalBurma recomputes
-> Burma card footer updates
-> Live Totals Burma tile updates
```

Repair:

```text
Repair field change
-> dispatch REPAIR_SET
-> reducer updates state.repair
-> card reflects state
-> later summary phase can omit section if blank
```

Notes:

```text
Notes textarea change
-> dispatch NOTES_SET
-> reducer updates state.notes
-> textarea auto-grows
-> later summary phase can omit section if blank
```

No Phase 6 data flow should touch CNC entries except reading shared people through `OperatorSelect`.

## Visual Layout Details

Use one vertical stack under the existing app shell:

```text
space-y-6
```

or whatever spacing Phase 2/3 established.

Cards should be visually consistent:

```text
bg-bg-card
border border-soft
radius 16
shadow-sm
p-4 / p-5 responsive
```

Do not nest cards.

Do not use marketing-style decorative sections.

Do not add icons to these cards.

Do not add large empty-state artwork.

## Accessibility Notes

Burma inputs:

- visible label for each input
- numeric keyboard hints
- `aria-label` only if visible label is not programmatically associated

Repair fields:

- Repair Person select has label
- Repair Count input has label
- Repair Note input has label

Notes:

- textarea has visible label through card title or explicit label
- if using the title as label, wire `aria-labelledby`

Optional pills:

- decorative, not required for screen reader announcement
- if included in accessibility tree, text `Optional` is acceptable

No custom keyboard interaction is needed beyond native controls.

## Edge Cases

### Blank Burma Inputs

State:

```text
null / blank
```

Display:

```text
input empty
footer total 0
Live Totals Burma 0
```

### Pasted Formatted Burma Count

Input:

```text
1,500
```

State:

```text
1500
```

Input display after change:

```text
1500
```

Footer display:

```text
1,500
```

### Pasted Invalid Count

Input:

```text
abc
```

State:

```text
null
```

Input display:

```text
empty
```

### Repair All Blank

Allowed.

No validation.

Future summary should omit the Repair section entirely.

### Repair Person Only

Allowed.

Do not force count or note.

Future summary can decide how to display partial repair info.

### Notes Long Text

Textarea grows until 240px.

After 240px:

```text
textarea scrolls internally
page layout remains stable
```

### CNC Empty With Burma Present

Allowed after Phase 5.

If CNC entries are all removed but Burma has counts:

- Live Totals CNC Hours = `0.00`
- Entries = `0`
- Burma = entered total
- Phase 7 CTA should later allow preview because there is production data

Phase 6 should not prevent this state.

## Tests / Verification

If the project has tests by the time Phase 6 is implemented, add focused reducer and selector tests.

Reducer tests:

- [ ] `BURMA_SET` updates only the targeted Burma field.
- [ ] `BURMA_SET` supports `null`.
- [ ] `REPAIR_SET` updates person.
- [ ] `REPAIR_SET` updates count.
- [ ] `REPAIR_SET` supports `null` count.
- [ ] `REPAIR_SET` updates note.
- [ ] `NOTES_SET` updates notes.
- [ ] Existing CNC actions still behave after adding new action cases.

Selector tests:

- [ ] `totalBurma` returns `0` when all fields are null/blank.
- [ ] `totalBurma` sums one filled field.
- [ ] `totalBurma` sums all three fields.
- [ ] `totalBurma` treats null as zero.
- [ ] `totalBurma` handles explicit zero.

Manual QA checklist:

- [ ] App still opens to the Phase 5 CNC section correctly.
- [ ] Burma card renders below CNC section.
- [ ] Burma 1 input accepts digits.
- [ ] Burma 2 input accepts digits.
- [ ] Burma 3 input accepts digits.
- [ ] Burma inputs reject letters.
- [ ] Blank Burma input is treated as zero.
- [ ] Burma footer total updates on every keystroke.
- [ ] Burma footer total uses Indian thousands separators.
- [ ] Live Totals Burma tile updates on every keystroke.
- [ ] Live Totals CNC Hours is unchanged by Burma edits.
- [ ] Live Totals Entries is unchanged by Burma edits.
- [ ] Repair card renders below Burma.
- [ ] Repair card shows Optional pill.
- [ ] Repair Person uses the same people list as CNC.
- [ ] Repair fields can all remain blank.
- [ ] Repair Count accepts digits.
- [ ] Repair Count can be cleared back to blank.
- [ ] Repair Note is single-line.
- [ ] Notes card renders below Repair.
- [ ] Notes card shows Optional pill.
- [ ] Notes textarea starts at 96px min height.
- [ ] Notes textarea grows with content.
- [ ] Notes textarea caps at 240px and scrolls internally.
- [ ] No validation errors appear for blank Repair or Notes.
- [ ] No toast redesign or new toast behavior appears.
- [ ] No sticky action bar appears.
- [ ] No summary modal appears.
- [ ] No console errors during typing.

## Acceptance Criteria

- [ ] Phase 1 shell remains intact.
- [ ] Phase 2 state/context architecture remains intact.
- [ ] Phase 3 CNC identity components remain intact.
- [ ] Phase 4 CNC production calculation remains intact.
- [ ] Phase 5 CNC add/remove/duplicate/undo remains intact.
- [ ] Burma Production card renders below CNC.
- [ ] Burma 1/2/3 inputs accept numeric-only input with `inputMode="numeric"`.
- [ ] Blank Burma fields are treated as zero.
- [ ] Burma footer total updates on every keystroke.
- [ ] Burma footer total uses `Intl.NumberFormat('en-IN')`.
- [ ] Live Totals Burma tile reflects the same sum as the Burma card footer.
- [ ] Live Totals CNC Hours still reflects only CNC production hours.
- [ ] Live Totals Entries still reflects CNC entry count.
- [ ] Repair Work card renders below Burma.
- [ ] Repair Work card shows Optional pill.
- [ ] Repair Person uses the same people list as CNC.
- [ ] Repair Count is optional and numeric-only.
- [ ] Repair Note is optional and single-line.
- [ ] Blank Repair section does not trigger validation errors.
- [ ] Notes card renders below Repair.
- [ ] Notes card shows Optional pill.
- [ ] Notes textarea uses the documented placeholder or project-standard equivalent.
- [ ] Notes textarea auto-grows to 240px max.
- [ ] Notes textarea scrolls internally after 240px.
- [ ] `BURMA_SET`, `REPAIR_SET`, and `NOTES_SET` are implemented immutably.
- [ ] No new persistence, summary, PNG, sharing, sticky action bar, or Add Person modal behavior is introduced.

## Handoff Notes For Phase 7

Phase 7 should be able to start from:

- all V1 input cards on screen
- complete CNC multi-entry workflow
- real total CNC hours
- real CNC entry count
- real total Burma count
- optional Repair state
- optional Notes state
- reusable Toast primitive from Phase 5
- Live Totals Strip still in normal document flow

Expected Phase 7 changes:

- add Sticky Action Bar
- add Preview Summary CTA
- add CTA disabled/warning states
- add completeness report selector
- use existing Toast for `"Add an entry first."`
- add scroll shadow choreography for Live Totals and Sticky Action Bar

## Rationale

Phase 6 is intentionally low-risk but important.

The earlier phases built the app shell, state foundation, CNC identity, CNC calculation, and CNC list behavior. This phase should not revisit those decisions. It should simply fill the remaining production data areas using the same state and visual language.

Keeping Burma, Repair, and Notes together is the right grouping because:

- they are independent from CNC calculations
- they share card and field styling
- they complete the V1 input surface
- they prepare Phase 7 to focus only on finishing flow and CTA behavior

The most important implementation detail is optional numeric state. The UI should show blank optional count fields while selectors still produce clear zero totals. That keeps the form natural to use and keeps later summary logic straightforward.
