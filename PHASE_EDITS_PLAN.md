# Phase Edits: CNC Entry Defaults, Visibility Lockdown, and Preview Limit

## Objective

Update the final Production App so CNC entry is harder to manipulate before submission and better matches the current factory defaults.

After this edit phase:

- default operators are Radhe, Sanju, Avinash, Manish, and Kamal
- Hex common chips are only 37, 41, 46, 50, 60, and 65
- Size options use inch-free labels and include 1 1/4 and 4
- Side becomes an optional dropdown for Male, Female, Groove, and Custom
- default CNC time is 08:30 to 19:00 for the normal day shift
- CNC production hours are hidden everywhere before Preview Summary
- a CNC tile clearly turns green only when all mandatory production fields are valid
- Preview Summary is limited to 3 successful previews per real device day, then the app locks until the next day

## Estimated output

Approximate size: 250-450 LOC.

Expected files modified:

```text
app/src/App.tsx
app/src/state/types.ts
app/src/state/reducer.ts
app/src/state/bootstrap.ts
app/src/state/validation.ts
app/src/state/selectors.ts
app/src/state/persistence.ts
app/src/components/StickyActionBar.tsx
app/src/components/cnc/CncSection.tsx
app/src/components/cnc/CncEntryCard.tsx
app/src/components/cnc/SizeSelect.tsx
app/src/components/cnc/SideToggle.tsx
app/src/components/summary/SummaryCard.tsx
app/src/utils/textSummary.ts
```

Expected files removed or left unused after confirming imports:

```text
app/src/components/LiveTotalsStrip.tsx
app/src/components/cnc/ProductionHoursDisplay.tsx
```

Do not modify `production_entry.html` except as a read-only legacy reference. The active app is the React/Vite implementation under `app/`.

## Inputs

- `05_phase_plan_template.md`
- `PHASE_12_PLAN.md`
- `app/src/App.tsx`
- `app/src/state/types.ts`
- `app/src/state/reducer.ts`
- `app/src/state/bootstrap.ts`
- `app/src/state/validation.ts`
- `app/src/state/selectors.ts`
- `app/src/state/persistence.ts`
- `app/src/components/LiveTotalsStrip.tsx`
- `app/src/components/StickyActionBar.tsx`
- `app/src/components/cnc/CncSection.tsx`
- `app/src/components/cnc/CncEntryCard.tsx`
- `app/src/components/cnc/HexInputWithChips.tsx`
- `app/src/components/cnc/SizeSelect.tsx`
- `app/src/components/cnc/SideToggle.tsx`
- `app/src/components/cnc/ProductionHoursDisplay.tsx`
- `app/src/components/summary/SummaryCard.tsx`
- `app/src/utils/textSummary.ts`

## Current implementation audit

The final implementation is not the root `production_entry.html`; that file is legacy/reference. The live app is in `app/src`.

Current defaults and option sources:

- `basePeople` is in `app/src/state/reducer.ts` and is currently `Avinash`, `Raju`, `Sonu`.
- `commonHexValues` is in `app/src/state/reducer.ts` and is currently `37`, `41`, `55`, `60`, `65`.
- `sizeOptions` is in `app/src/state/reducer.ts` and currently includes labels like `1 inch`, `2 inch`, and `3 inch`.
- `defaultShiftTimes` is in `app/src/state/reducer.ts`; morning is currently `08:30` to `18:30`.
- `CncEntry.side` is typed as `1 | 2 | null` in `app/src/state/types.ts`.
- Side UI is `app/src/components/cnc/SideToggle.tsx`, currently a segmented control with `Side 1` and `Side 2`.

Current production-hour visibility:

- Top live strip shows `CNC Hours` in `app/src/components/LiveTotalsStrip.tsx`.
- Sticky action bar shows `Total CNC` in `app/src/components/StickyActionBar.tsx`.
- CNC card header and subtitle show hours in `app/src/components/cnc/CncEntryCard.tsx` through `entryProductionHours` and `cncIdentitySubtitle`.
- CNC card body shows `ProductionHoursDisplay`.
- Summary preview and shared text intentionally show calculated hours through `SummaryCard` and `textSummary`; this should remain because it is after Preview Summary.

Current validation:

- `validateEntry` already requires operator, machine, hex, size, side, cycle, time in/out, and parts.
- Side must become optional, so `side_required` must stop blocking completion.
- `validCncEntries` and `invalidNonBlankCncEntries` already drive summary inclusion and preview state.
- `isCncEntryBlank` treats default time values and default side as blank; this must be updated when side becomes optional.

## What this phase adds

- Updated factory defaults and option labels.
- A Side dropdown with optional categorical side type.
- Green completed-tile border once the mandatory CNC fields are valid.
- Add-entry and preview protections for incomplete CNC tiles.
- A daily preview counter stored locally and reset by the real local calendar date.
- A locked app state after the daily preview limit is reached.

## What this phase does NOT do

- It does not remove the summary page, PNG generation, download, WhatsApp/share, or calculated hours inside the summary.
- It does not add server-side anti-tamper controls. The preview limit is local-device enforcement using `localStorage`.
- It does not remove the shift selector unless separately requested.
- It does not restrict the Hex numeric input to only the common chips; the chips change to the requested common set, while the existing custom numeric Hex input remains available.
- It does not make Burma, Repair, Notes, or Side mandatory.

## Implementation steps

### Step 1: Update defaults and option lists

Modify `app/src/state/reducer.ts`.

- Change `basePeople` to:

```ts
export const basePeople = ['Radhe', 'Sanju', 'Avinash', 'Manish', 'Kamal'];
```

- Change `commonHexValues` to:

```ts
export const commonHexValues = [37, 41, 46, 50, 60, 65] as const;
```

- Change `sizeOptions` to inch-free labels:

```ts
export const sizeOptions = [
  '1/2',
  '3/4',
  '1',
  '1 1/4',
  '1 1/2',
  '2',
  '2 1/2',
  '3',
  '4',
] as const;
```

- Change the normal day shift default to:

```ts
morning: { timeIn: '08:30', timeOut: '19:00' }
```

Leave the existing evening shift default unchanged unless the shift model is removed or clarified later.

### Step 2: Normalize old saved size labels

Modify `app/src/state/bootstrap.ts`.

Add a small helper before `normalizeCncEntry`:

```ts
function normalizeSize(value: unknown): string {
  const size = normalizeString(value).trim();
  const legacyMap: Record<string, string> = {
    '1 inch': '1',
    '2 inch': '2',
    '3 inch': '3',
    '4 inch': '4',
    '1-1/2': '1 1/2',
    '2-1/2': '2 1/2',
  };

  return legacyMap[size] ?? size;
}
```

Use this for hydrated `entry.size`. This prevents old same-day drafts from opening the size field in custom mode just because the label changed.

### Step 3: Replace numeric side with optional side type

Modify `app/src/state/types.ts`.

- Add:

```ts
export type SideType = '' | 'Male' | 'Female' | 'Groove' | 'Custom';
```

- Change the side field update to:

```ts
| { field: 'side'; value: SideType }
```

- Change `CncEntry.side` to `SideType`.

Modify `app/src/state/reducer.ts`.

- Set new blank entry side to `''`.
- Keep the reducer field update name as `side` to avoid a larger rename.

Modify `app/src/state/bootstrap.ts`.

- Replace `normalizeSide` so valid new strings hydrate as-is.
- Map legacy numeric `1`, `2`, string `'1'`, and string `'2'` to `''` because there is no safe automatic mapping from old side numbers to Male/Female/Groove/Custom.

Modify `app/src/components/cnc/SideToggle.tsx`.

- Keep the file name for a smaller patch, but change the UI from `Segmented` to `Select`.
- Options should be:

```text
Select...
Male
Female
Groove
Custom
```

- Remove required-error styling from side because it is optional.

Modify summary and text output:

- `app/src/components/summary/SummaryCard.tsx` should only print side when `entry.side !== ''`.
- `app/src/utils/textSummary.ts` should only include side when selected.
- Compact summary rows should not print `S` for a blank side.
- `app/src/state/selectors.ts` should update `cncIdentitySubtitle` so it never appends hours and only appends side when selected.

### Step 4: Make side optional and keep required CNC fields strict

Modify `app/src/state/validation.ts`.

- Remove side from hard completion requirements.
- Keep mandatory fields as:

```text
operator
machine
hex
size
cycle minutes/seconds
timeIn
timeOut
partsCount
```

- Update `isCncEntryBlank` so side is ignored for blank detection.
- Remove `side_required` from `requiredIssueCodes` in `CncEntryCard`.
- Keep `time_order`, `cycle_zero`, `hex_range`, `parts_positive`, and other non-required hard validations.

### Step 5: Hide all pre-preview production hours

Modify `app/src/App.tsx`.

- Remove `LiveTotalsStrip` import and rendering.
- Remove `totalCncHours` import and the `totalCncHours={...}` prop passed into `StickyActionBar`.
- Remove `liveTotalsSentinelRef` and `liveTotalsElevated` if no longer used.

Modify `app/src/components/StickyActionBar.tsx`.

- Remove `totalCncHours` prop.
- Remove the left `Total CNC` block.
- Make the button the only visible control in the bar.
- Keep the visible button text as exactly `Preview Summary`.

Modify `app/src/components/cnc/CncEntryCard.tsx`.

- Remove `ProductionHoursDisplay`.
- Remove `entryProductionHours` from the card header and status.
- Remove hours from the tile subtitle.
- Replace the header status with non-production status text such as `Complete` or `Incomplete`.
- Keep calculated hours in selectors and summary paths only.

Do not remove:

- `entryProductionHours` in validation/selectors, because it is still needed for summary totals.
- Summary rows and text summary hours, because those appear only after Preview Summary.

### Step 6: Add green complete-tile border

Modify `app/src/components/cnc/CncEntryCard.tsx`.

- Use the existing `isComplete` value.
- When complete, apply success styling to the outer shell:

```text
border-success-600 shadow-sm ring-1 ring-success-600/20
```

- When incomplete and validation has been requested, keep current warning/error field behavior.
- A blank tile should remain neutral, not green.

This gives the data-entry person immediate feedback that the tile is ready without showing production hours.

### Step 7: Block adding another CNC tile until existing nonblank tiles are valid

Modify `app/src/components/cnc/CncSection.tsx`.

- Before dispatching `CNC_ENTRY_ADD`, check `invalidNonBlankCncEntries(state)`.
- Also prevent adding another blank tile if the current last tile is blank.
- If blocked:
  - dispatch `UI_INCOMPLETE_HIGHLIGHTS_SET` with `true`
  - show a toast such as `Complete this CNC entry first.`
  - do not add the new tile

This keeps one active unfinished tile at a time and prevents a user from stacking partial entries.

### Step 8: Block preview when CNC entries are incomplete

Modify `app/src/App.tsx`.

- In `handlePreview`, check `invalidNonBlankCncEntries(state)` before opening summary.
- If any invalid nonblank entry exists:
  - dispatch `UI_INCOMPLETE_HIGHLIGHTS_SET` with `true`
  - show a toast such as `Complete required CNC fields first.`
  - do not open summary
  - do not increment the daily preview counter

Keep the existing empty-preview toast for cases with no production data.

### Step 9: Add daily Preview Summary limit

Modify `app/src/state/persistence.ts` or add a small adjacent module if cleaner.

Use a new key:

```ts
export const KEY_PREVIEW_LIMIT = 'productionEntry.v1.previewLimit';
```

Persist this shape:

```ts
type PreviewLimitState = {
  date: string;
  count: number;
  locked: boolean;
};
```

Important behavior:

- The date should use the real local device day from `toDateInputValue(new Date())`, not the editable production-entry date field.
- If stored date is not today, reset to `{ date: today, count: 0, locked: false }`.
- Count only successful preview opens.
- Allow successful preview opens for counts 1, 2, and 3.
- After the third successful preview, persist `locked: true`.
- If already locked, do not open preview and show a blocking message.
- On the next real local day, reset automatically.

Modify `app/src/App.tsx`.

- Load preview limit state on app boot.
- Before opening summary, enforce the limit.
- After the third successful preview, allow the summary to open so the worker can still share/download the final summary, but lock editing once the summary closes.
- When locked, prevent app form interaction by rendering a blocking overlay or replacing the main form with a lock message:

```text
Preview limit reached for today. The app will unlock tomorrow.
```

- Keep summary share/download actions usable while the third preview modal is open.

LocalStorage is not tamper-proof. This is acceptable for this phase because the current app is local-first and has no backend identity or audit trail.

### Step 10: Keep summary output complete and readable

Modify `app/src/components/summary/SummaryCard.tsx` and `app/src/utils/textSummary.ts`.

- Continue showing each valid CNC entry.
- Continue showing cycle, count, and calculated hours in summary only.
- Continue showing total CNC hours in summary only.
- Update side formatting so side appears only when selected:

```text
Side Male
Side Female
Side Groove
Side Custom
```

- Do not show dangling separators when side is blank.

### Step 11: Verification

Run from `app/`:

```text
npm run typecheck
npm run build
```

Manual QA:

- Fresh app opens with operator list Radhe, Sanju, Avinash, Manish, Kamal.
- Hex common chips show exactly 37, 41, 46, 50, 60, 65.
- Size dropdown shows inch-free labels and includes 1 1/4 and 4.
- A saved old draft with `1 inch`, `2 inch`, `3 inch`, `1-1/2`, or `2-1/2` hydrates into the new labels.
- Side dropdown has Male, Female, Groove, Custom, and can be left blank.
- A tile with operator, machine, hex, size, cycle, time in/out, and parts turns green even if side is blank.
- A partial nonblank tile does not allow adding another CNC tile.
- A partial nonblank tile does not open Preview Summary.
- No CNC hours appear on the main form before preview.
- Sticky action bar only shows the Preview Summary button.
- Summary preview still shows per-entry CNC hours and Total CNC Hours.
- Preview can successfully open 3 times on the same real local date.
- After the third successful preview, editing is blocked until the next real local date.
- Changing the editable production date does not reset the preview limit.

## Acceptance

- [ ] `basePeople` defaults are exactly Radhe, Sanju, Avinash, Manish, Kamal.
- [ ] Hex common chips are exactly 37, 41, 46, 50, 60, 65.
- [ ] Size dropdown labels do not contain `inch`.
- [ ] Size dropdown includes `1 1/4` and `4`.
- [ ] Side is optional and uses a dropdown with Male, Female, Groove, Custom.
- [ ] New blank CNC entries default to 08:30 and 19:00 for the normal day shift.
- [ ] CNC hours are not visible before Preview Summary.
- [ ] CNC hours remain visible in Summary Preview and shared summary output.
- [ ] CNC tile green border appears only for valid nonblank entries.
- [ ] Add CNC Entry is blocked when an existing nonblank tile is incomplete.
- [ ] Preview Summary is blocked when an existing nonblank tile is incomplete.
- [ ] Preview Summary opens at most 3 successful times per real local day.
- [ ] The app locks after the third successful preview and unlocks automatically the next real local day.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.

## Notes

- The preview limit is a deterrent, not a secure audit control. A determined user with localStorage access or device-time control can bypass a local-only limit.
- Using the real local date instead of the editable production date prevents a simple reset by changing the form date.
- The current app already calculates hours from cycle time and parts. This phase hides those calculations from the data-entry surface, but keeps them for summary generation.
- Keeping the side field name avoids broad reducer/action churn. Only the value type and display semantics need to change.
