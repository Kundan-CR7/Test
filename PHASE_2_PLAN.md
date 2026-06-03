# Phase 2: Date and Shift Card with State Scaffolding

## Objective

Add the first real interactive surface to the app: the Date and Shift card, backed by the initial application state architecture.

After this phase, the app should show this working vertical rhythm:

```text
Header
Date and Shift Card
Live Totals Strip
empty content space for future CNC cards
```

The user can change the date and switch between Morning Shift and Evening Shift. The header subtitle updates from state, not from a local `new Date()` inside the header. The Live Totals Strip is visible and subscribed to selectors, but still shows quiet zeros because CNC and Burma entry UI does not exist yet.

## Prerequisite

Phase 1 must be implemented before this phase is executed.

This plan assumes the repository already contains:

```text
package.json
index.html
vite.config.ts
tailwind.config.ts
src/main.tsx
src/App.tsx
src/components/Header.tsx
src/styles/tokens.css
src/styles/base.css
```

If the app has not been scaffolded yet, implement `PHASE_1_PLAN.md` first. Do not execute Phase 2 directly against the current docs-only root.

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

It also follows `03_phase_roadmap_standard.md`, which says each phase should be additive, visible, scoped, and driven by source documents instead of invented behavior.

## Estimated Output

Approximate size: 300 LOC.

Expected files created:

```text
src/state/types.ts
src/state/reducer.ts
src/state/selectors.ts
src/state/StateContext.tsx
src/components/DateShiftCard.tsx
src/components/LiveTotalsStrip.tsx
src/components/primitives/Segmented.tsx
```

Expected files modified:

```text
src/App.tsx
src/components/Header.tsx
```

Do not modify `production_entry.html` except as a read-only reference. Do not remove or rewrite existing planning documents.

## Inputs

Read in this order:

1. `requirements.md` section 6
   - Date defaults to today.
   - Shift defaults to Morning.
   - Shift choices are Morning Shift and Evening Shift.
   - CNC time defaults are Morning 08:30 to 18:30 and Evening 19:00 to 21:30.
2. `frontend_ui_spec.md` section 10
   - Date and Shift card behavior.
   - Native date input.
   - Two-option shift segmented control.
   - Shift change should eventually update untouched CNC entry times.
3. `frontend_ui_spec.md` section 11
   - Live Totals Strip structure and purpose.
   - Three tiles: CNC Hours, CNC Entries, Burma Total.
4. `frontend_ui_spec.md` section 39
   - Suggested frontend state shape.
5. `detailed_ui_ux_design.md` section 5.1.4
   - Exact Date and Shift card anatomy and visual rules.
6. `detailed_ui_ux_design.md` section 5.1.5
   - Exact Live Totals Strip anatomy and zero-state behavior.
7. `detailed_ui_ux_design.md` section 12
   - `ProductionEntryState` and `CncEntry` types.
8. `PHASE_ROADMAP.md` Phase 2
   - Exact implementation scope and acceptance checklist.
9. `PHASE_1_PLAN.md`
   - Handoff notes and Phase 1 shell assumptions.

## What This Phase Adds

- First `ProductionEntryState` type definitions.
- First `CncEntry` type definition for future phases.
- Pure reducer with `DATE_SET` and `SHIFT_SET`.
- Initial state factory.
- Shift default time constants.
- React state provider using `useReducer`.
- Context hooks for reading state and dispatching actions.
- Placeholder selectors for totals.
- Date and Shift card component.
- Reusable accessible segmented control primitive.
- Live Totals Strip component.
- Header date now derived from app state.
- App layout now renders the first real content below the header.

## What This Phase Does NOT Do

- No CNC card yet.
- No default blank CNC entry yet.
- No Operator, Machine, Hex, Size, Side, Cycle Time, Time In, Time Out, Parts Count, or Production Hours inputs.
- No Burma card.
- No Repair card.
- No Notes card.
- No sticky bottom action bar.
- No summary modal.
- No validation UI.
- No persistence to `localStorage`.
- No Add Person modal.
- No PNG generation.
- No Web Share API.
- No service worker or offline caching.
- No tests framework installation unless one already exists.
- No router.
- No global state library beyond React `useReducer`.

## State Model Details

### `src/state/types.ts`

Define these types:

```ts
export type Shift = "morning" | "evening";

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

export type ProductionEntryState = {
  date: string;
  shift: Shift;
  people: string[];
  cncEntries: CncEntry[];
  burma: {
    burma1: number;
    burma2: number;
    burma3: number;
  };
  repair: {
    person: string;
    count: number;
    note: string;
  };
  notes: string;
  ui: {
    incompleteHighlights: boolean;
  };
};

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

Use the design doc's naming exactly where possible:

- `burma1`, `burma2`, `burma3`, not `b1`, `b2`, `b3`.
- `incompleteHighlights`, not `showErrors`.
- `productionHours` exists on the type but remains `null` until later phases.

### `src/state/reducer.ts`

Create:

```ts
export const basePeople = ["Avinash", "Raju", "Sonu"];

export const defaultShiftTimes = {
  morning: { timeIn: "08:30", timeOut: "18:30" },
  evening: { timeIn: "19:00", timeOut: "21:30" }
} satisfies Record<Shift, { timeIn: string; timeOut: string }>;
```

Create a local-date helper. Do not use `new Date().toISOString().split("T")[0]` for the default date because UTC conversion can shift the date near midnight in some time zones.

Recommended:

```ts
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

Create:

```ts
export function createInitialState(now = new Date()): ProductionEntryState
```

Initial values:

```ts
{
  date: toDateInputValue(now),
  shift: "morning",
  people: basePeople,
  cncEntries: [],
  burma: { burma1: 0, burma2: 0, burma3: 0 },
  repair: { person: "", count: 0, note: "" },
  notes: "",
  ui: { incompleteHighlights: false }
}
```

Define reducer actions:

```ts
export type ProductionEntryAction =
  | { type: "DATE_SET"; date: string }
  | { type: "SHIFT_SET"; shift: Shift };
```

Reducer behavior:

- `DATE_SET`
  - If the date is unchanged, return the existing state object.
  - Otherwise return `{ ...state, date: action.date }`.
- `SHIFT_SET`
  - If the shift is unchanged, return the existing state object.
  - Otherwise update `state.shift`.
  - Also map over `cncEntries` and update `timeIn` / `timeOut` only when `timeInTouched` / `timeOutTouched` are false.
  - This will be a no-op in Phase 2 because `cncEntries` is empty, but it preserves the documented behavior for future entries.

The reducer must be pure:

- no `localStorage`
- no `Date.now()` inside reducer
- no mutation of `state`
- no mutation of entries inside `cncEntries`

### `src/state/selectors.ts`

Create selector functions with the final names now, even if their behavior is mostly placeholder:

```ts
export function totalCncHours(state: ProductionEntryState): number
export function totalBurma(state: ProductionEntryState): number
export function cncEntryCount(state: ProductionEntryState): number
```

Phase 2 expected behavior:

- `totalCncHours` returns `0`.
- `totalBurma` can safely return `state.burma.burma1 + state.burma.burma2 + state.burma.burma3`, which is `0` in this phase.
- `cncEntryCount` returns `state.cncEntries.length`, which is `0` in this phase because Phase 3 adds the first CNC card.

Do not implement `entryProductionHours` yet unless the implementation needs a placeholder export. The real calculation lands in Phase 4.

### `src/state/StateContext.tsx`

Create a provider around `useReducer`:

```ts
export function ProductionEntryProvider({ children }: { children: React.ReactNode })
```

Expose hooks:

```ts
export function useProductionEntryState(): ProductionEntryState
export function useProductionEntryDispatch(): React.Dispatch<ProductionEntryAction>
```

Optional combined hook:

```ts
export function useProductionEntry()
```

Rules:

- Hooks should throw a clear error if used outside `ProductionEntryProvider`.
- Provider should call `useReducer(productionEntryReducer, undefined, createInitialState)` or equivalent lazy initialization.
- Do not persist state in this phase.
- Do not read `localStorage` in this phase.

## Component Details

### `src/components/primitives/Segmented.tsx`

Build a reusable 2-option segmented control primitive. It will be used for Shift now and Side later.

Suggested props:

```ts
type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};
```

Accessibility requirement:

- Container has `role="radiogroup"` and an accessible label.
- Each segment has `role="radio"`.
- Each segment sets `aria-checked`.
- Selected segment has `tabIndex={0}`.
- Unselected segments have `tabIndex={-1}`.
- ArrowLeft and ArrowRight move selection.
- Home selects first option.
- End selects last option.
- Enter and Space activate the focused option.

Visual rules:

- Container: `bg-bg-sunken`, radius 12px, padding 4px.
- Segments: equal width, 44px height for Shift, 10px inner radius.
- Selected: `bg-bg-card`, `shadow-sm`, `text-text-primary`, semibold.
- Unselected: transparent, `text-text-secondary`, medium weight.
- Transition: 140ms using `cubic-bezier(0.2, 0, 0, 1)`.

Keep the primitive generic. Do not hardcode "Morning Shift" or "Evening Shift" inside it.

### `src/components/DateShiftCard.tsx`

Render a card with two stacked rows:

```text
Date
[ native date input ]

[ Morning Shift ] [ Evening Shift ]
```

Behavior:

- Reads `state.date` and `state.shift` from context.
- Date input value is controlled by `state.date`.
- Date input `onChange` dispatches `{ type: "DATE_SET", date: value }`.
- Shift segmented control value is controlled by `state.shift`.
- Shift change dispatches `{ type: "SHIFT_SET", shift }`.
- Morning Shift is selected by default through initial state.

Visual rules:

- Use the card styling established in Phase 1 tokens.
- Card background: `bg-bg-card`.
- Border: `border-border-soft`.
- Radius: card radius.
- Shadow: `shadow-sm`.
- Padding: `p-4`.
- Label: `body-sm`, `text-text-secondary`.
- Date input: native `<input type="date">`, height 48px, 17px text.
- Style the input container/border without fighting mobile browser date picker behavior.

Do not add helper text or validation messages in this phase.

### `src/components/LiveTotalsStrip.tsx`

Render three equal-width tiles:

```text
CNC HOURS     ENTRIES      BURMA
0.00          0            0
```

Behavior:

- Reads state from context.
- Uses `totalCncHours`, `cncEntryCount`, and `totalBurma` selectors.
- In Phase 2 all values render as zeros.
- `CNC HOURS` formats to two decimals: `0.00`.
- `ENTRIES` renders as integer: `0`.
- `BURMA` renders as integer with no separator yet: `0`.

Visual rules:

- Strip is below DateShiftCard.
- Grid: 3 equal columns.
- Gap: spacing token 3.
- Tile background: `bg-bg-card`.
- Tile radius: card radius.
- Tile padding: vertical spacing 3, horizontal spacing 4.
- Label: `micro`, uppercase, `text-text-muted`.
- Number: `display-lg`, bold, tabular nums.
- When all values are zero, numbers use `text-text-muted`.

Do not implement number cross-fade animation yet unless trivial. The animation can land when numbers become dynamic in Phase 4 and Phase 6. The component should be structured so adding cross-fade later is easy.

### `src/components/Header.tsx`

Update the Phase 1 header so date comes from state.

Preferred approach:

- Make `Header` accept a `date` prop.
- Format that prop into the subtitle.
- In `App.tsx`, read `state.date` and pass it down.

Alternative:

- Let `Header` read from `useProductionEntryState()` directly.

Use whichever is more consistent with the existing Phase 1 implementation. Do not keep an internal `new Date()` source in `Header`.

Formatting:

- Input: `YYYY-MM-DD`.
- Output: same worker-readable format as Phase 1, for example `Tuesday - 05 May 2026`.
- Use local-date parsing so the displayed day does not shift unexpectedly.

Recommended:

```ts
function formatHeaderDate(dateInputValue: string): string {
  const [year, month, day] = dateInputValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
```

If Phase 1 used a separator between weekday and date, preserve that style.

### `src/App.tsx`

Wrap the app with `ProductionEntryProvider`.

Recommended structure:

```tsx
export default function App() {
  return (
    <ProductionEntryProvider>
      <ProductionEntryApp />
    </ProductionEntryProvider>
  );
}

function ProductionEntryApp() {
  const state = useProductionEntryState();

  return (
    <main>
      <Header date={state.date} />
      <DateShiftCard />
      <LiveTotalsStrip />
    </main>
  );
}
```

Preserve the Phase 1 shell:

- centered 480px max width
- `min-height: 100dvh`
- `bg-bg-app`
- safe-area bottom padding
- no desktop expansion

## Implementation Steps

### Step 1: Confirm Phase 1 baseline

Run:

```bash
npm run lint
npm run build
```

If Phase 1 does not build, fix Phase 1 before starting this phase. Do not layer state work onto a broken scaffold.

### Step 2: Add state types

Create `src/state/types.ts` with the full Phase 2 state contract.

Keep type names stable because every later phase will import them.

### Step 3: Add reducer and initial state factory

Create `src/state/reducer.ts`.

Implement:

- `basePeople`
- `defaultShiftTimes`
- `toDateInputValue`
- `createInitialState`
- `ProductionEntryAction`
- `productionEntryReducer`

Make `SHIFT_SET` future-ready for untouched CNC time propagation, even though Phase 2 has no CNC entries.

### Step 4: Add selectors

Create `src/state/selectors.ts`.

Implement the selector names that `LiveTotalsStrip` will use.

Keep selectors pure and view-independent.

### Step 5: Add state context

Create `src/state/StateContext.tsx`.

Use `useReducer` and expose state/dispatch hooks.

Do not add persistence effects.

### Step 6: Add segmented primitive

Create `src/components/primitives/Segmented.tsx`.

Implement visual and keyboard behavior now, because this primitive will be reused in Phase 3 for Side.

### Step 7: Add Date and Shift card

Create `src/components/DateShiftCard.tsx`.

Wire date and shift controls to the reducer.

### Step 8: Add Live Totals Strip

Create `src/components/LiveTotalsStrip.tsx`.

Use selectors and render zeros.

### Step 9: Update Header

Modify `src/components/Header.tsx` so it uses `state.date`, either through props or context.

Remove any direct `new Date()` dependency from the header display.

### Step 10: Update App composition

Modify `src/App.tsx` to:

- wrap the app with `ProductionEntryProvider`
- render `Header`
- render `DateShiftCard`
- render `LiveTotalsStrip`
- preserve the Phase 1 shell

### Step 11: Verify behavior

Run:

```bash
npm run lint
npm run build
npm run dev
```

Manual checks:

- Open app.
- Confirm Date input shows today's local date.
- Confirm Shift defaults to Morning Shift.
- Click Evening Shift.
- Confirm visual selected state moves to Evening Shift.
- Change date.
- Confirm header subtitle updates immediately.
- Confirm Live Totals Strip remains `0.00`, `0`, `0`.
- Tab to the segmented control.
- Use ArrowRight and ArrowLeft to change shift.

## Acceptance Criteria

- [ ] Phase 1 shell remains intact.
- [ ] Existing docs and `production_entry.html` are preserved.
- [ ] `src/state/types.ts` defines `ProductionEntryState` and `CncEntry`.
- [ ] `src/state/reducer.ts` exports a pure reducer and initial state factory.
- [ ] Initial state date is today's local date in `YYYY-MM-DD` format.
- [ ] Initial state shift is `morning`.
- [ ] Initial state people are `Avinash`, `Raju`, and `Sonu`.
- [ ] Initial state `cncEntries` is an empty array.
- [ ] Initial Burma counts are all `0`.
- [ ] `DATE_SET` updates `state.date`.
- [ ] `SHIFT_SET` updates `state.shift`.
- [ ] `SHIFT_SET` is written to preserve untouched CNC time propagation for future entries.
- [ ] Reducer returns the same state object when date or shift is unchanged.
- [ ] Reducer never mutates existing state.
- [ ] `StateContext` exposes state and dispatch through hooks.
- [ ] Hooks fail clearly if used outside the provider.
- [ ] `DateShiftCard` renders a native date input.
- [ ] Date input is controlled by `state.date`.
- [ ] Date input dispatches `DATE_SET` on change.
- [ ] Shift control renders Morning Shift and Evening Shift.
- [ ] Shift control is controlled by `state.shift`.
- [ ] Shift control dispatches `SHIFT_SET` on selection.
- [ ] Shift selected state visibly changes with the documented 140ms transition.
- [ ] Segmented control supports Tab focus.
- [ ] Segmented control supports ArrowLeft and ArrowRight selection.
- [ ] Segmented control has correct radiogroup/radio ARIA semantics.
- [ ] Header subtitle derives from `state.date`, not local `new Date()`.
- [ ] Changing date updates the header subtitle in the same render flow.
- [ ] Live Totals Strip renders three tiles.
- [ ] Live Totals Strip values are `0.00`, `0`, and `0`.
- [ ] Zero values use muted text, not warning or danger colors.
- [ ] No CNC card is rendered yet.
- [ ] No persistence, summary, PNG, share, PWA, or service worker functionality is introduced.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Manual QA Checklist

Use desktop browser and mobile emulation.

Viewports:

- [ ] 375x667
- [ ] 360x640
- [ ] 1440x900

Checks:

- [ ] No horizontal scroll.
- [ ] DateShiftCard sits below the header with correct spacing.
- [ ] LiveTotalsStrip sits below DateShiftCard with correct spacing.
- [ ] App remains capped at 480px on desktop.
- [ ] Date picker opens the native date UI.
- [ ] Header date updates after date change.
- [ ] Morning Shift is selected by default.
- [ ] Evening Shift can be selected by tap/click.
- [ ] Arrow keys change segmented selection.
- [ ] Focus ring is visible.
- [ ] No console errors.

## Reducer Purity Review

Before closing the phase, inspect `productionEntryReducer` manually:

- [ ] No state mutation.
- [ ] No entry mutation inside `cncEntries.map`.
- [ ] No `localStorage`.
- [ ] No network calls.
- [ ] No random IDs.
- [ ] No direct DOM access.
- [ ] No date creation except in `createInitialState`.

If a test harness exists, add small reducer tests for:

- default state date injection with fixed `Date`
- `DATE_SET`
- `SHIFT_SET`
- no-op unchanged date
- no-op unchanged shift
- untouched time propagation on a seeded test entry

If no test harness exists, do not install one just for Phase 2 unless the project owner explicitly asks.

## Risks and Guardrails

- Do not use UTC date defaults. Use local date parts so the factory worker sees the correct day.
- Do not seed the first CNC entry in this phase. Phase 3 owns that.
- Do not implement CNC hour calculation early. Phase 4 owns it.
- Do not implement localStorage early. Phase 10 and Phase 11 own people and draft persistence.
- Do not make the Live Totals Strip sticky. The design doc says it lives in normal flow.
- Do not introduce a router. This remains one screen.
- Do not introduce a global state library. React `useReducer` is the intended architecture.
- Do not redesign Phase 1 tokens. Reuse them.

## Handoff Notes For Phase 3

Phase 3 should be able to start from:

- stable `ProductionEntryState` and `CncEntry` types
- stable reducer and dispatch path
- working `CNC_FIELD_SET` insertion point in reducer architecture
- reusable `Segmented` primitive for Side
- working page rhythm: Header, DateShiftCard, LiveTotalsStrip

Expected Phase 3 changes:

- add first empty CNC entry on init or through the CNC section setup, per roadmap
- add `CNC_FIELD_SET`
- add CNC section and identity fields
- reuse the people list from state
- reuse the shift default time helpers when creating entries
