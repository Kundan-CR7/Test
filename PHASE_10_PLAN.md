# Phase 10: Add New Person Modal + People Persistence

## Objective

Let the worker add a new operator/person name without leaving the production entry flow.

After this phase, the worker should be able to:

```text
tap + Add new person
type a name
save it
have it auto-selected in the field that opened the modal
reload the app and still see the name
```

The target interaction:

```text
1. Worker opens a CNC Operator select and does not see the needed name.
2. Worker taps + Add new person.
3. Add New Person sheet opens and focuses the Person Name input.
4. Worker types "Mahesh".
5. Add Person becomes enabled.
6. Worker taps Add Person.
7. Sheet closes.
8. The originating CNC Operator field now has "Mahesh" selected.
9. Toast appears: Added Mahesh.
10. Worker reloads the app.
11. "Mahesh" still appears in CNC and Repair person selects.
```

This phase completes the last daily-flow surface that was intentionally deferred from the early CNC phases.

## Prerequisite

Phases 1 through 9 must be implemented before this phase is executed.

This plan assumes the app already has:

```text
src/components/primitives/Sheet.tsx
src/components/primitives/Toast.tsx
src/components/cnc/OperatorSelect.tsx
src/components/cnc/CncSection.tsx
src/components/cnc/CncEntryCard.tsx
src/components/RepairCard.tsx
src/state/types.ts
src/state/reducer.ts
src/state/StateContext.tsx
```

If the implementation lives under `app/`, apply every source path in this plan under `app/src/...`.

The current workspace has an `app/` implementation with earlier-phase source files and planning docs through Phase 9. Do not execute Phase 10 against `app/src` until Phases 4, 5, 6, 7, 8, and 9 have actually landed there.

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

- `requirements.md` sections 14 and 26
- `frontend_ui_spec.md` sections 14, 32, and 35.1
- `detailed_ui_ux_design.md` sections 5.1.8, 5.4, 6.1.6, 6.6, 6.7, 7.5, 8.1, 8.3, 8.4, 12.1, 15.4, and 15.6
- `PHASE_ROADMAP.md` Phase 10
- `PHASE_2_PLAN.md` people state and no-early-localStorage boundary
- `PHASE_3_PLAN.md` `OperatorSelect` no-op `+ Add new person` handoff
- `PHASE_6_PLAN.md` Repair Person reuse of `OperatorSelect`
- `PHASE_8_PLAN.md` reusable `Sheet` primitive handoff
- `PHASE_9_PLAN.md` Toast and Phase 10 handoff notes
- `production_entry.html` Add Person modal behavior, as reference only

## Estimated Output

Approximate size: 250-350 LOC.

Expected files created:

```text
src/components/AddPersonModal.tsx
src/state/persistence.ts
```

Expected files modified:

```text
src/state/types.ts
src/state/reducer.ts
src/state/StateContext.tsx
src/components/cnc/OperatorSelect.tsx
src/components/cnc/CncEntryCard.tsx
src/components/cnc/CncSection.tsx
src/components/RepairCard.tsx
src/components/primitives/Sheet.tsx
src/App.tsx
```

Optional if the implementation needs shared helpers:

```text
src/utils/people.ts
```

Do not modify `production_entry.html` except as a read-only reference. Do not remove or rewrite existing planning documents.

## Seamless Continuity Review

Phase 10 must wire the previously planned affordance without disturbing the now-working preview/share path.

### From Phase 2

Phase 2 introduced:

```text
people: string[]
basePeople: ['Avinash', 'Raju', 'Sonu']
```

Phase 10 should preserve those base names and add custom names on top.

Do not add full draft persistence here. Phase 11 owns `productionEntry.v1.draft`.

### From Phase 3

Phase 3 added the visible no-op link:

```text
+ Add new person
```

Phase 10 makes that link real.

The link should remain visually small and helper-like. It should not become an admin feature.

### From Phase 6

Phase 6 reused `OperatorSelect` for Repair Person.

Phase 10 should support Add Person from both contexts:

```text
CNC Operator
Repair Person
```

If Phase 6 hid the add link in Repair, Phase 10 should make it available there too.

### From Phase 8

Phase 8 created the `Sheet` primitive.

Phase 10 should reuse it for Add New Person rather than building a separate modal system.

If `Sheet` only supports the Summary modal shape, extend it with a bottom-sheet/centered-modal variant. Do not fork a second sheet primitive.

### From Phase 9

Phase 9 completed PNG generation and sharing.

Phase 10 should not touch:

```text
SummaryCard
SummaryModal
ShareActions
png.ts
share.ts
textSummary.ts
```

Do not risk the product promise while adding people persistence.

## Inputs

Read in this order before implementing:

1. `PHASE_9_PLAN.md` handoff notes
   - Confirms `Sheet` and Toast are reusable.
   - Confirms no people persistence exists yet.
2. `PHASE_ROADMAP.md` Phase 10
   - Defines AddPersonModal, validation, `PERSON_ADD`, custom-people persistence, auto-select target, and acceptance criteria.
3. `requirements.md` section 14
   - Confirms Repair Person uses a dropdown/text pattern.
4. `requirements.md` section 26
   - Leaves final operator list open; Phase 10 answers V1 with local custom people.
5. `frontend_ui_spec.md` section 14
   - Defines Operator selection and Add New Person behavior.
6. `frontend_ui_spec.md` section 32
   - Defines Add Person modal layout, interaction rules, state, and duplicate handling.
7. `frontend_ui_spec.md` section 35.1
   - Defines small confirmation for person added.
8. `detailed_ui_ux_design.md` section 5.1.8
   - Confirms Repair Person shares the same people list as CNC.
9. `detailed_ui_ux_design.md` section 5.4
   - Defines Add New Person sheet anatomy, behavior, persistence, and source of truth.
10. `detailed_ui_ux_design.md` section 6.1.6
    - Defines Operator select anatomy and `+ Add new person` link style.
11. `detailed_ui_ux_design.md` section 7.5
    - Defines Add Person modal states.
12. `detailed_ui_ux_design.md` sections 8.1, 8.3, and 8.4
    - Defines Add Person copy, validation copy, and toast copy.
13. `detailed_ui_ux_design.md` sections 12.1 and 15.4
    - Defines localStorage key for custom people.
14. `production_entry.html`
    - Reference only for open-target tracking and submit behavior.

## What This Phase Adds

- Add New Person sheet/modal.
- Auto-focus name input on open.
- Blank-name disabled state.
- Whitespace trimming.
- Case-insensitive duplicate detection.
- Inline duplicate error.
- Inline storage error.
- `PERSON_ADD` reducer action.
- `customPeople` state source.
- `state.people` derived from base plus custom people.
- `productionEntry.v1.customPeople` localStorage persistence.
- Custom people hydration on app boot.
- `+ Add new person` opens modal from CNC Operator.
- `+ Add new person` opens modal from Repair Person.
- Successful add auto-selects new name in the originating field.
- Success toast: `Added [name].`

## What This Phase Does NOT Do

- No full draft persistence.
- No day-rollover prompt.
- No service worker.
- No offline shell cache.
- No backend.
- No Google Sheet sync.
- No editing or deleting custom people.
- No reordering people.
- No admin people-management screen.
- No server validation.
- No changes to PNG generation or sharing.
- No changes to Summary Modal.
- No changes to CNC production calculations.
- No final validation pass.

## State Model

Current earlier-phase shape likely has:

```ts
people: string[];
```

Phase 10 should add a custom list so persistence has a clean source:

```ts
type ProductionEntryState = {
  people: string[];
  customPeople: string[];
  ...
};
```

Rules:

- `basePeople` remains hardcoded.
- `customPeople` contains only user-added names.
- `people` is derived as a case-insensitive unique merge:

```text
basePeople + customPeople
```

Order:

```text
base people first, in hardcoded order
custom people after, in the order added
```

Do not sort alphabetically unless the app already does. Added-order is easier for workers because the newest name appears where expected.

## People Helpers

Add helpers near the reducer or in `src/utils/people.ts` if reuse is cleaner:

```ts
export function normalizePersonName(name: string): string
export function personKey(name: string): string
export function hasPerson(people: string[], name: string): boolean
export function mergePeople(basePeople: string[], customPeople: string[]): string[]
```

Recommended behavior:

```ts
normalizePersonName(name) = name.trim()
personKey(name) = normalizePersonName(name).toLocaleLowerCase()
```

Do not lowercase the saved/displayed name. Preserve the worker's capitalization after trimming.

Optional:

```text
collapse repeated internal spaces
```

Only do this if the implementation already normalizes text that way elsewhere. At minimum, trim leading/trailing whitespace.

## Persistence Plan

Create:

```text
src/state/persistence.ts
```

Phase 10 should only handle custom people persistence.

Required key:

```ts
export const KEY_CUSTOM_PEOPLE = 'productionEntry.v1.customPeople';
```

Required functions:

```ts
export function loadCustomPeople(): string[]
export function saveCustomPeople(names: string[]): boolean
```

Recommended implementation:

```ts
export function loadCustomPeople(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY_CUSTOM_PEOPLE) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

export function saveCustomPeople(names: string[]): boolean {
  try {
    localStorage.setItem(KEY_CUSTOM_PEOPLE, JSON.stringify(names));
    return true;
  } catch {
    return false;
  }
}
```

Important:

- Do not write draft state in this file yet.
- Do not debounce custom people writes; this is one small synchronous write per add.
- Catch storage errors.
- Sanitize loaded names before hydrating state.

Phase 11 can expand this file with draft persistence:

```text
productionEntry.v1.draft
```

## Initial State Hydration

Keep the reducer pure. Do not read `localStorage` inside the reducer.

Preferred approach:

```ts
const customPeople = loadCustomPeople();
const initialState = createInitialState(new Date(), customPeople);
```

Update the state factory:

```ts
export function createInitialState(
  now = new Date(),
  customPeople: string[] = []
): ProductionEntryState
```

Inside:

```ts
const cleanCustomPeople = unique custom people, excluding base duplicates;

return {
  ...
  customPeople: cleanCustomPeople,
  people: mergePeople(basePeople, cleanCustomPeople),
};
```

If the provider currently calls `useReducer(reducer, undefined, createInitialState)`, adjust it to preserve lazy initialization while loading custom people once.

## Reducer Action

Add:

```ts
type ProductionEntryAction =
  | { type: 'PERSON_ADD'; name: string };
```

Reducer behavior:

```ts
case 'PERSON_ADD': {
  const name = normalizePersonName(action.name);
  if (!name) return state;
  if (hasPerson(state.people, name)) return state;

  const customPeople = [...state.customPeople, name];
  return {
    ...state,
    customPeople,
    people: mergePeople(basePeople, customPeople),
  };
}
```

The reducer must remain pure:

- no `localStorage`
- no DOM reads
- no focus handling
- no toast

## Add Person Target Tracking

The modal must remember which field opened it.

Use app/component state:

```ts
type AddPersonTarget =
  | { type: 'cnc'; entryId: string }
  | { type: 'repair' };
```

Store:

```ts
const [addPersonTarget, setAddPersonTarget] = useState<AddPersonTarget | null>(null);
```

Open handlers:

```ts
openAddPerson({ type: 'cnc', entryId });
openAddPerson({ type: 'repair' });
```

Do not use DOM ids to infer the target.

Do not store this target in `ProductionEntryState`; it is transient UI state.

## Successful Add Flow

Recommended flow:

```text
submit name
-> trim
-> validate non-empty
-> validate duplicate case-insensitively
-> compute next customPeople
-> saveCustomPeople(nextCustomPeople)
-> if save fails, show inline error and do not close
-> dispatch PERSON_ADD(name)
-> dispatch field update for originating target
-> close modal
-> show toast Added [name].
```

Auto-select target:

```ts
if (target.type === 'cnc') {
  dispatch({
    type: 'CNC_FIELD_SET',
    entryId: target.entryId,
    field: 'operator',
    value: name,
  });
}

if (target.type === 'repair') {
  dispatch({
    type: 'REPAIR_SET',
    field: 'person',
    value: name,
  });
}
```

If the target no longer exists, still add and persist the person, then close and toast. This should be rare because the modal blocks the page underneath.

## `AddPersonModal`

Create:

```text
src/components/AddPersonModal.tsx
```

Recommended props:

```ts
type AddPersonModalProps = {
  open: boolean;
  people: string[];
  onCancel: () => void;
  onSubmit: (name: string) => Promise<AddPersonSubmitResult> | AddPersonSubmitResult;
};

type AddPersonSubmitResult =
  | { ok: true; name: string }
  | { ok: false; reason: 'duplicate' | 'blank' | 'storage' };
```

Alternative:

- The modal may receive `onAddPerson(name)` and handle result via thrown errors or return booleans.
- Keep validation understandable and local.

### Layout

Use `Sheet` from Phase 8.

Mobile:

```text
bottom sheet
drag handle
top-rounded panel
safe-area bottom padding
```

Desktop >=640px:

```text
centered modal
max-width around 420px
rounded 16px
shadow-lg
```

Content:

```text
Add New Person
Add a new operator to this device.

Person Name
[ Type a name... ]
This name will be saved on this phone for future entries.

[ Cancel ] [ Add Person ]
```

Use the project-standard placeholder if it already uses the Unicode ellipsis; otherwise ASCII `Type a name...` is acceptable in source.

### Behavior

On open:

- clear input
- clear errors
- disable Add Person
- auto-focus input
- IME should open on Android

On input:

- update local draft value
- clear duplicate/storage errors
- enable Add Person when trimmed length >= 1

On Cancel / backdrop / Escape:

- close modal
- discard draft name
- do not add person
- restore focus to the opening `+ Add new person` button if `Sheet` supports focus restore

On submit:

- trim
- validate
- show duplicate/storage errors inline
- close only on success

### Inline Errors

Blank:

```text
Please enter a name.
```

Duplicate:

```text
This person is already in the list.
```

Storage:

```text
Couldn't save. Try again.
```

Blank should usually be prevented by disabled Add button, but keep the error path for Enter-key submit or defensive code.

### Submit Button States

Disabled:

```text
trimmed input length === 0
duplicate error active
storage error active
submitting
```

Enabled:

```text
trimmed input length >= 1
no active error
not submitting
```

Submitting state is usually brief because localStorage is synchronous, but keep it to prevent double submits.

## Sheet Primitive Update

Update:

```text
src/components/primitives/Sheet.tsx
```

Only if needed.

Phase 8 likely optimized `Sheet` for Summary Preview:

```text
full-screen mobile
centered desktop
```

Phase 10 needs:

```text
bottom-sheet mobile
centered desktop
```

Recommended API extension:

```ts
type SheetVariant = 'fullscreen' | 'bottom-sheet';

type SheetProps = {
  variant?: SheetVariant;
  showHandle?: boolean;
  ...
};
```

Rules:

- Summary Modal keeps its Phase 8 behavior.
- Add Person uses `variant="bottom-sheet"` and `showHandle`.
- Do not create a second modal primitive.
- Keep focus trap, Escape, backdrop close, scroll lock, and focus restore working for both variants.

## OperatorSelect Update

Update:

```text
src/components/cnc/OperatorSelect.tsx
```

Recommended props:

```ts
type OperatorSelectProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showAddPersonButton?: boolean;
  onAddPerson?: () => void;
};
```

Defaults:

```ts
label = 'Operator'
showAddPersonButton = true
```

Behavior:

- Reads options from `state.people`.
- Renders `+ Add new person` when `showAddPersonButton` is true.
- If `onAddPerson` exists, calls it.
- If `onAddPerson` is missing, the button should be hidden or inert only in earlier incomplete phases. In Phase 10 all visible add links should be wired.

Accessibility:

- Use a unique id via `useId` for label/select.
- The add button is a real `<button type="button">`.
- Add button copy is exactly:

```text
+ Add new person
```

## CNC Wiring

Update:

```text
src/components/cnc/CncEntryCard.tsx
src/components/cnc/CncSection.tsx
```

Pass an add-person handler from App or the nearest owner:

```tsx
<OperatorSelect
  value={entry.operator}
  onChange={...}
  onAddPerson={() => onAddPerson({ type: 'cnc', entryId: entry.id })}
/>
```

Do not dispatch `PERSON_ADD` from inside `OperatorSelect`.

`OperatorSelect` should remain a field component, not a state orchestration component.

## Repair Wiring

Update:

```text
src/components/RepairCard.tsx
```

Repair should use the same people list and the same Add Person flow:

```tsx
<OperatorSelect
  label="Repair Person"
  value={state.repair.person}
  onChange={...}
  showAddPersonButton
  onAddPerson={() => onAddPerson({ type: 'repair' })}
/>
```

After success, the new name should auto-select in:

```text
Repair Person
```

## Toast Behavior

Use the existing app-level Toast system.

Success copy:

```text
Added [name].
```

Example:

```text
Added Mahesh.
```

Duration:

```text
3 seconds
```

Do not show a toast for duplicate or blank errors. Those are inline modal errors.

## Implementation Steps

## Step 1 - Confirm Phase 9 Baseline

Verify:

```text
Sheet primitive exists
Toast system exists
Summary/PNG/share flow still works
OperatorSelect reads state.people
Repair Person uses state.people
```

If `Sheet` or Toast is missing, complete earlier phases first.

## Step 2 - Add People Helpers

Add helper functions in the most appropriate location:

```text
src/utils/people.ts
```

or near reducer constants if the app keeps state helpers together.

Implement:

- trim normalization
- case-insensitive keying
- case-insensitive dedupe
- base + custom merge

## Step 3 - Add Custom People Persistence

Create:

```text
src/state/persistence.ts
```

Add:

```text
KEY_CUSTOM_PEOPLE
loadCustomPeople
saveCustomPeople
```

Only implement custom people persistence. Leave draft persistence for Phase 11.

## Step 4 - Hydrate Initial State

Update:

```text
src/state/reducer.ts
src/state/StateContext.tsx
```

Make initial state load custom people once on app boot.

Verify initial state still includes base people:

```text
Avinash
Raju
Sonu
```

and then custom people.

## Step 5 - Add `PERSON_ADD`

Update:

```text
src/state/types.ts
src/state/reducer.ts
```

Add:

```text
customPeople
PERSON_ADD
```

Reducer should:

- trim defensively
- no-op on blank
- no-op on duplicate
- update `customPeople`
- update `people`
- remain pure

## Step 6 - Extend `Sheet` If Needed

Add bottom-sheet variant support without breaking Summary Modal.

Manual check:

- Summary Modal still full-screen on mobile.
- Add Person is bottom sheet on mobile.
- Both are centered modals on desktop.
- Focus trap still works.

## Step 7 - Create `AddPersonModal`

Create:

```text
src/components/AddPersonModal.tsx
```

Implement:

- Sheet composition
- drag handle
- title/subtitle
- Person Name field
- helper caption
- inline errors
- Cancel button
- Add Person button
- auto-focus
- Enter submit
- disabled states
- duplicate detection
- storage error display

## Step 8 - Wire Open Target In App

Update:

```text
src/App.tsx
```

Add transient state:

```text
addPersonTarget
```

Add handlers:

```text
openAddPerson(target)
closeAddPerson()
handleAddPersonSubmit(name)
```

`handleAddPersonSubmit` should:

- validate
- save custom people
- dispatch `PERSON_ADD`
- dispatch auto-select target field action
- show toast
- close modal

## Step 9 - Wire CNC OperatorSelect

Update:

```text
CncSection
CncEntryCard
OperatorSelect
```

Every CNC OperatorSelect should open Add Person with:

```text
{ type: 'cnc', entryId }
```

Verify auto-select works for:

- first CNC card
- duplicated CNC card
- newly added CNC card

## Step 10 - Wire Repair Person

Update:

```text
RepairCard
```

Repair Person should open Add Person with:

```text
{ type: 'repair' }
```

Verify auto-select works for Repair.

## Step 11 - Verify Persistence

Manual flow:

1. Add `Mahesh` from CNC card.
2. Confirm it appears in all CNC operator selects.
3. Confirm it appears in Repair Person select.
4. Reload page.
5. Confirm `Mahesh` still appears.
6. Add `Suresh` from Repair.
7. Reload.
8. Confirm both names appear after base people.

## Step 12 - Verify Duplicate Handling

Manual cases:

```text
Avinash
avinash
 AVINASH 
Mahesh
mahesh
```

Expected:

- existing names duplicate case-insensitively
- inline error appears
- Add Person disabled until input changes
- no duplicate names are persisted

## Step 13 - Verify Storage Error Handling

If practical, simulate `localStorage.setItem` throwing.

Expected:

- modal stays open
- inline error says `Couldn't save. Try again.`
- name is not added to state
- no success toast

If this is not practical manually, document it as a residual risk.

## Step 14 - Run Checks

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

Also verify the Phase 9 PNG/share flow still opens after this change.

## Data Flow

Open:

```text
+ Add new person click
-> set addPersonTarget
-> open AddPersonModal
-> input auto-focus
```

Submit:

```text
input name
-> trim
-> duplicate check against state.people
-> saveCustomPeople(nextCustomPeople)
-> dispatch PERSON_ADD
-> dispatch CNC_FIELD_SET or REPAIR_SET
-> close modal
-> toast Added [name].
```

Boot:

```text
app starts
-> loadCustomPeople()
-> createInitialState(now, customPeople)
-> people = mergePeople(basePeople, customPeople)
-> OperatorSelect and RepairCard read same people array
```

## Accessibility Notes

- `+ Add new person` is a real button.
- Modal uses `role="dialog"` through `Sheet`.
- Input has visible `Person Name` label.
- Input auto-focuses on open.
- Inline error should be associated with the input via `aria-describedby`.
- Duplicate/storage errors should use `aria-live="polite"` or equivalent.
- Add Person disabled state should use native `disabled` because no toast is required for blank submit.
- Escape, backdrop, and Cancel close without side effects.
- Focus should restore to the `+ Add new person` button that opened the modal.

## Visual Details

Add Person sheet:

```text
mobile bottom sheet
desktop centered modal
drag handle on mobile
heading-lg title
body-md muted subtitle
body-sm label
body-lg input
caption muted helper text
equal-width Cancel/Add buttons on mobile
```

Inline add link:

```text
body-sm
accent-600
font weight 600
space-1 top margin
no underline at rest
underline on hover
```

Do not add icons unless the existing button system already uses them.

## Edge Cases

### Blank Input

Input:

```text
spaces only
```

Expected:

```text
Add Person disabled
no state change
```

### Duplicate Base Name

Input:

```text
avinash
```

Expected:

```text
This person is already in the list.
Add Person disabled until input changes
```

### Duplicate Custom Name

Input:

```text
Mahesh
mahesh
```

Expected:

```text
second add is blocked
customPeople does not contain duplicates
```

### Extra Whitespace

Input:

```text
  Mahesh  
```

Expected saved/displayed:

```text
Mahesh
```

### Storage Full / Blocked localStorage

Expected:

```text
Couldn't save. Try again.
modal remains open
name not added
```

### Origin CNC Entry Removed

This should be rare because modal blocks page interaction.

If it happens:

```text
person is added and persisted
auto-select no-ops
toast still appears
```

### Reload After Add

Expected:

```text
custom names reload
base people remain
order remains base first, custom after
```

### Repair Add Person

Expected:

```text
new person auto-selects in Repair Person
same name appears in CNC Operator selects
```

## Tests / Verification

If the project has tests by Phase 10, add focused tests for helpers, reducer, and persistence.

People helper tests:

- [ ] `normalizePersonName` trims leading/trailing spaces.
- [ ] `hasPerson` matches case-insensitively.
- [ ] `mergePeople` keeps base people first.
- [ ] `mergePeople` removes duplicates case-insensitively.
- [ ] `mergePeople` preserves display casing of the first occurrence.

Reducer tests:

- [ ] `PERSON_ADD` adds a custom person.
- [ ] `PERSON_ADD` updates `people`.
- [ ] `PERSON_ADD` no-ops for blank name.
- [ ] `PERSON_ADD` no-ops for duplicate base name.
- [ ] `PERSON_ADD` no-ops for duplicate custom name.
- [ ] `PERSON_ADD` does not mutate existing arrays.

Persistence tests:

- [ ] `loadCustomPeople` returns an empty array when no key exists.
- [ ] `loadCustomPeople` returns an empty array for malformed JSON.
- [ ] `loadCustomPeople` ignores non-string array values.
- [ ] `saveCustomPeople` returns true on success.
- [ ] `saveCustomPeople` returns false when `localStorage.setItem` throws.

Manual QA checklist:

- [ ] `+ Add new person` link in CNC opens modal.
- [ ] `+ Add new person` link in Repair opens modal.
- [ ] Modal input auto-focuses.
- [ ] Android IME appears on open.
- [ ] Add Person disabled for blank input.
- [ ] Add Person disabled for whitespace-only input.
- [ ] Duplicate base name shows inline error.
- [ ] Duplicate custom name shows inline error.
- [ ] Duplicate comparison is case-insensitive.
- [ ] Error clears when input changes.
- [ ] Cancel closes without adding.
- [ ] Escape closes without adding.
- [ ] Backdrop closes without adding.
- [ ] Successful add closes modal.
- [ ] Successful add auto-selects originating CNC Operator.
- [ ] Successful add auto-selects Repair Person when opened from Repair.
- [ ] Successful add shows `Added [name].` toast.
- [ ] New person appears in all CNC Operator selects.
- [ ] New person appears in Repair Person select.
- [ ] Reload preserves custom people.
- [ ] PNG/share flow from Phase 9 still works.

## Acceptance Criteria

- [ ] Phase 9 PNG/share flow remains intact.
- [ ] AddPersonModal exists and uses the Phase 8 `Sheet` primitive.
- [ ] AddPersonModal is a bottom sheet on mobile.
- [ ] AddPersonModal is centered at >=640px.
- [ ] Input auto-focuses on open.
- [ ] Add Person is disabled for blank/whitespace-only input.
- [ ] Duplicate name comparison is case-insensitive.
- [ ] Duplicate name shows inline error `This person is already in the list.`
- [ ] Duplicate keeps Add Person disabled until input changes.
- [ ] Storage failure shows inline error `Couldn't save. Try again.`
- [ ] `PERSON_ADD` adds custom names immutably.
- [ ] `state.people` derives from base people plus custom people.
- [ ] Custom people persist under `productionEntry.v1.customPeople`.
- [ ] App boot hydrates custom people from localStorage.
- [ ] CNC OperatorSelect `+ Add new person` opens modal.
- [ ] Repair Person `+ Add new person` opens modal.
- [ ] Successful add auto-selects the new name in the originating CNC field.
- [ ] Successful add auto-selects the new name in Repair when opened from Repair.
- [ ] Success toast says `Added [name].`
- [ ] Reload page shows the new name in CNC and Repair selects.
- [ ] No draft persistence, day rollover, service worker, backend, summary, PNG, or validation-pass behavior is changed.

## Handoff Notes For Phase 11

Phase 11 should be able to start from:

- custom people persisted in localStorage
- `src/state/persistence.ts` exists
- `KEY_CUSTOM_PEOPLE` exists
- state has `customPeople` and merged `people`
- `PERSON_ADD` reducer action exists
- Add Person modal works
- app-level Toast still works
- Summary/PNG/share flow still works

Expected Phase 11 changes:

- add full draft persistence under `productionEntry.v1.draft`
- add day-rollover prompt
- add validation utility
- wire `ui.incompleteHighlights` to per-card warning banners
- wire field-level validation errors
- refine Summary modal incomplete strip if needed
- handle draft storage failures with the specified banner

## Rationale

The operator list is small but important. Workers should not be blocked just because a name was missing from the hardcoded seed list.

This phase deliberately persists only custom people. Full form draft persistence is larger and riskier because it touches every field and day-rollover behavior, so it stays in Phase 11. Keeping Phase 10 focused gives the Add Person flow a clean implementation while preserving the completed PNG/share pipeline.
