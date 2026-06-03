# Production Entry Mobile App - Frontend UI Spec

## 1. Document Purpose

This document defines the frontend experience for the Production Entry Mobile App.

It translates the product requirements into:

- screen structure,
- mobile-first layout,
- interaction behavior,
- component responsibilities,
- visual design principles,
- state handling,
- and implementation-ready frontend guidance.

This is written for a simple HTML-first V1.

The goal is not to create a complex application. The goal is to create a highly usable production entry interface that feels extremely simple to a factory worker while still producing clean, structured output for the business owner.

---

## 2. Product Summary

The app is a mobile-first daily production entry tool.

The worker/supervisor opens the app on a phone, enters production details for CNC and Burma operations, optionally adds repair and notes, previews a summary, generates a PNG, and shares it on WhatsApp.

The app replaces a manual production sheet.

The frontend must be:

- simple,
- fast,
- touch-friendly,
- forgiving,
- visually clean,
- and easy enough for a 5th grader to use.

---

## 3. Design Philosophy

The UI should feel like:

> A clean Apple-style mobile utility built for factory production entry.

It should not feel like:

- a spreadsheet,
- an ERP,
- an admin panel,
- a government form,
- or a dense accounting tool.

### 3.1 Apple-like interpretation

“Apple-like” here does not mean decorative luxury.

It means:

- calm screens,
- high clarity,
- minimal visual noise,
- large touch targets,
- strong spacing,
- obvious hierarchy,
- gentle feedback,
- simple language,
- fewer decisions per screen,
- and interface confidence.

---

## 4. Core UX Principles

### 4.1 The worker should never feel lost

Every section should clearly answer:

- What am I filling?
- What is already done?
- What should I do next?

### 4.2 The screen should guide, not demand

Use defaults wherever possible.

Examples:

- date defaults to today,
- shift defaults to Morning,
- first CNC time defaults from shift,
- next CNC entry copies previous time,
- person selection comes from list,
- common hex values appear as quick chips.

### 4.3 Use cards, not table rows

On mobile, spreadsheet-like rows are hard to use.

Each CNC entry should be a card.

A card feels like:

> “This is one production entry.”

### 4.4 Make important totals always visible

The user and owner care most about:

- total CNC hours,
- total Burma count,
- number of CNC entries,
- and whether summary is ready.

Show these clearly near the bottom and in preview.

### 4.5 Do not over-expose complexity

Advanced fields, future backend behavior, analytics, history, and admin controls should not appear in V1.

---

## 5. Information Architecture

V1 can be a single-page app.

Primary page sections:

1. Header
2. Date & Shift
3. Quick Totals Strip
4. CNC Entries
5. Burma Entry
6. Repair Entry
7. Notes
8. Sticky Bottom Action Bar
9. Summary Preview Modal / Screen
10. Add Person Modal

Suggested structure:

```text
Production Entry
├── Header
├── Date & Shift
├── Live Totals
├── CNC Section
│   ├── CNC Entry Card 1
│   ├── CNC Entry Card 2
│   └── + Add CNC Entry
├── Burma Section
├── Repair Section
├── Notes Section
├── Preview Summary CTA
└── Summary Preview / PNG Share
```

---

## 6. Navigation Model

V1 should not use multi-page navigation.

Use one vertical flow:

```text
Open app → Fill form → Preview summary → Share
```

The only modal overlays should be:

1. Add New Person modal.
2. Summary Preview modal/screen.

No tabs are needed in V1.

---

## 7. Global App Shell

### 7.1 Page Width

Mobile-first max width:

```text
max-width: 480px
```

On desktop, center the app in the viewport.

### 7.2 Background

Use a soft neutral background.

Example direction:

```text
#F5F5F7 or similar warm light gray
```

### 7.3 Card Style

Cards should be white or near-white with:

- rounded corners,
- soft shadow,
- internal padding,
- strong section title,
- enough spacing between fields.

### 7.4 Touch Targets

All buttons and selectable chips should be at least:

```text
44px height
```

Prefer 48px–56px for primary interactions.

### 7.5 Typography

Use a clean system font stack:

```text
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif
```

Text hierarchy:

| Use | Suggested Size |
|---|---:|
| Main heading | 22-26px |
| Section heading | 17-20px |
| Field label | 13-15px |
| Input text | 16-18px |
| Calculated number | 20-28px |
| Helper text | 12-13px |

Inputs should use at least 16px text to prevent mobile browser zoom.

---

## 8. Screen 1 - Main Production Entry Screen

### 8.1 Screen Goal

Allow the worker to enter the day’s production quickly and correctly.

### 8.2 Screen Layout

Recommended order:

```text
[Header]
[Date + Shift Card]
[Live Total Strip]
[CNC Section]
[Burma Section]
[Repair Section]
[Notes Section]
[Sticky Preview Button]
```

---

## 9. Header

### 9.1 Purpose

Give the app a clear identity and show that this is today’s production entry.

### 9.2 Content

Suggested header:

```text
Production Entry
Today’s CNC & Burma Work
```

Optional small date text:

```text
Tuesday, 05 May 2026
```

### 9.3 Behavior

Date in header should update based on selected date.

---

## 10. Date & Shift Card

### 10.1 Purpose

Set the context for the full entry.

### 10.2 Fields

1. Date picker
2. Shift segmented control

### 10.3 Shift Control

Use large two-option buttons:

```text
[Morning Shift] [Evening Shift]
```

Selected state should be visually obvious.

Morning should be default.

### 10.4 Shift Defaults

When shift changes:

- update default Time In/Out for new CNC entries,
- ask no confirmation,
- do not overwrite manually edited times unless user has not edited them.

Suggested logic:

```text
If CNC line time is untouched → update to shift default.
If CNC line time was manually changed → keep user value.
```

---

## 11. Live Totals Strip

### 11.1 Purpose

Give immediate confidence that the form is calculating correctly.

### 11.2 Content

Show three compact tiles:

```text
CNC Hours
7.83 hrs

CNC Entries
3

Burma Total
420
```

### 11.3 Behavior

Update instantly when:

- CNC entry is added,
- CNC entry is removed,
- cycle time changes,
- part count changes,
- Burma count changes.

### 11.4 Visual Direction

This should feel like a soft dashboard strip, not a heavy report.

Use:

- big number,
- small label,
- subtle card background.

---

## 12. CNC Section

### 12.1 Section Purpose

Capture one or more CNC production line items.

### 12.2 Section Header

Use:

```text
CNC Production
```

Subtext:

```text
Add one entry for each machine / size / side combination.
```

### 12.3 Add Button

At section top or bottom:

```text
+ Add CNC Entry
```

This button should be large and easy to see.

### 12.4 Default First Entry

The screen should start with one blank CNC card already visible.

Do not make the user tap “Add” for the first entry.

---

## 13. CNC Entry Card

### 13.1 Card Purpose

Represent one production line item.

### 13.2 Card Header

Example:

```text
CNC Entry 1
7.83 hrs
```

Right side shows calculated hours if available.

If incomplete:

```text
Incomplete
```

### 13.3 Card Actions

Each CNC card should have:

- Duplicate
- Remove

Remove should be visually secondary and maybe red/gray, not primary.

If only one CNC card exists, remove can be hidden or disabled.

### 13.4 Card Field Order

The field order should match how the worker naturally thinks.

Recommended order:

1. Operator
2. Machine
3. Hex
4. Size
5. Side
6. Cycle Time
7. Time In / Time Out
8. Parts Count
9. Production Hours

This order is important because it moves from identity/context to production quantity.

---

## 14. Operator Selection

### 14.1 Purpose

Select who performed the CNC work.

### 14.2 UI Pattern

Use a select/dropdown or large selection pill list.

For V1 HTML, a native select is acceptable if styled cleanly.

Example:

```text
Operator
[ Avinash ▼ ]
+ Add New Person
```

### 14.3 Add New Person Button

Place a small but clear button directly below or beside the operator field:

```text
+ Add New Person
```

This should not feel like an admin feature. It should feel like a quick helper.

### 14.4 Add New Person Modal Behavior

When tapped:

1. Open modal.
2. Show title: `Add New Person`.
3. Show single input: `Person name`.
4. Show buttons: `Cancel` and `Add Person`.
5. On submit:
   - trim extra spaces,
   - prevent blank names,
   - avoid exact duplicate names,
   - add the name to the current frontend list,
   - auto-select it in the current CNC card,
   - close modal.

### 14.5 Persistence

V1 minimum:

- Added name persists during the current session/page state.

V1 nice-to-have:

- Store added names in browser `localStorage`.

Backend persistence is not part of V1.

### 14.6 Modal Empty/Error State

If user taps Add Person with blank input:

```text
Please enter a name.
```

If duplicate:

```text
This person is already added.
```

Keep error text simple.

---

## 15. Machine Selection

### 15.1 Purpose

Select CNC machine number.

### 15.2 UI Pattern

Use 8 large chips/buttons:

```text
M1 M2 M3 M4
M5 M6 M7 M8
```

This is better than a dropdown because M1-M8 is a small fixed set.

### 15.3 Behavior

- Only one machine can be selected.
- Selected machine should have strong visual state.
- Machines should not be disabled in V1, even if another card uses the same machine, because same machine can run multiple entries in a day.

---

## 16. Hex Input

### 16.1 Purpose

Capture hex value.

### 16.2 UI Pattern

Use number input plus quick chips.

Example:

```text
Hex
[ 41 ]
Common: 37 41 55 60 65
```

### 16.3 Validation

- Must be between 0 and 100.
- Allow whole numbers.
- If blank, show incomplete state.

---

## 17. Size Input

### 17.1 Purpose

Capture adapter size.

### 17.2 UI Pattern

For V1, use a styled select or input with datalist.

Examples:

- 1/2
- 3/4
- 1 inch
- 1-1/2
- 2 inch
- 2-1/2
- 3 inch

### 17.3 Behavior

Size list can be hardcoded in HTML.

Allow manual text input if the required size is missing.

This prevents blocking production entry.

---

## 18. Side Selection

### 18.1 Purpose

Capture whether side 1 or side 2 was produced.

### 18.2 UI Pattern

Use two-button segmented control:

```text
[Side 1] [Side 2]
```

### 18.3 Behavior

- One side must be selected.
- Default can be empty or Side 1.
- If factory generally starts with Side 1, default to Side 1.

---

## 19. Cycle Time Input

### 19.1 Purpose

Capture per-piece CNC cycle time.

### 19.2 UI Pattern

Use two adjacent number inputs:

```text
Cycle Time
[ 2 ] min   [ 26 ] sec
```

### 19.3 Validation

- Minutes must be 0 or more.
- Seconds must be 0-59.
- Cycle time cannot be 0 seconds total.

### 19.4 UX Detail

The field should look like one combined input, not two unrelated fields.

---

## 20. Time In / Time Out

### 20.1 Purpose

Capture working window.

### 20.2 UI Pattern

Two time inputs side by side:

```text
Time In       Time Out
[08:30 AM]    [06:30 PM]
```

On small screens, side-by-side is acceptable if readable; otherwise stack.

### 20.3 Defaults

Morning:

- 08:30 AM
- 06:30 PM

Evening:

- 07:00 PM
- 09:30 PM

### 20.4 Smart Copy Behavior

When user creates a new CNC entry:

- copy Time In and Time Out from the previous CNC entry,
- not just from shift default.

Reason:

If one operator’s actual timing is 8:45 to 6:15, new entries will likely use similar timing.

---

## 21. Parts Count Input

### 21.1 Purpose

Capture produced pieces.

### 21.2 UI Pattern

Large number input.

Example:

```text
Parts Count
[ 193 ] pcs
```

### 21.3 Validation

- Must be a positive whole number.
- If zero or blank, production hours should remain 0/incomplete.

---

## 22. Production Hours Display

### 22.1 Purpose

Show calculated production hours clearly.

### 22.2 Display

Inside CNC card, after count:

```text
Production Hours
7.83 hrs
```

### 22.3 Behavior

Calculate live.

Formula:

```text
((minutes * 60) + seconds) * parts_count / 3600
```

Round to 2 decimals.

If required fields missing:

```text
Enter cycle time and count to calculate hours.
```

---

## 23. Duplicate CNC Entry

### 23.1 Purpose

Reduce repeated entry effort.

### 23.2 Behavior

When user taps Duplicate:

Copy:

- operator,
- machine,
- hex,
- size,
- side,
- cycle time,
- time in,
- time out.

Do not copy:

- parts count by default.

Optional: copy parts count but select it for easy overwrite. However for V1, safer to leave count blank.

---

## 24. Remove CNC Entry

### 24.1 Behavior

When user taps Remove:

- If the card is blank, remove immediately.
- If the card has data, ask a simple confirmation:

```text
Remove this CNC entry?
Cancel / Remove
```

Do not use scary language.

---

## 25. Burma Section

### 25.1 Purpose

Capture Burma count simply.

### 25.2 Layout

Use a card titled:

```text
Burma Production
```

Inside show three count fields:

```text
Burma 1    [ ___ ]
Burma 2    [ ___ ]
Burma 3    [ ___ ]
```

### 25.3 Input Pattern

Use number inputs with optional plus/minus controls.

For simplicity, V1 can use number inputs.

### 25.4 Total Display

At bottom of card:

```text
Total Burma Count: 420
```

Large enough to read clearly.

---

## 26. Repair Section

### 26.1 Purpose

Capture repair work without complicating main production entry.

### 26.2 Layout

Use a smaller optional card.

Title:

```text
Repair Work
```

Fields:

- person,
- repair count,
- note.

### 26.3 Behavior

V1 can support one repair row.

Future version can support multiple repair rows.

If no repair was done, the user can leave it blank.

---

## 27. Notes Section

### 27.1 Purpose

Capture additional context.

### 27.2 UI

Simple textarea:

```text
Notes
[Any extra information]
```

### 27.3 Guidance Text

```text
Optional: machine issue, special work, material issue, or anything extra.
```

Keep the text light.

---

## 28. Sticky Bottom Action Bar

### 28.1 Purpose

Make the main next action always accessible.

### 28.2 Content

At bottom of screen:

```text
Total CNC: 18.42 hrs     Preview Summary
```

On very small screens:

```text
18.42 CNC hrs
[Preview Summary]
```

### 28.3 Behavior

Button remains visible as user scrolls.

Primary CTA:

```text
Preview Summary
```

If required fields are missing, CTA can still open preview but should show warnings, or it can show validation before preview.

Recommended V1 behavior:

- Allow preview.
- Highlight incomplete CNC entries.
- Do not silently omit incomplete data.

---

## 29. Validation Model

### 29.1 Philosophy

Validation should be helpful, not punishing.

Use simple language.

Avoid technical error messages.

### 29.2 Required CNC Fields

A CNC entry is complete only if it has:

- operator,
- machine,
- hex,
- size,
- side,
- valid cycle time,
- time in,
- time out,
- parts count.

### 29.3 Validation Timing

Do not show all errors immediately on page load.

Show errors when:

- user tries to preview,
- user leaves a touched required field blank,
- user enters an impossible value.

### 29.4 Example Error Copy

```text
Select operator.
Choose machine.
Enter parts count.
Seconds should be between 0 and 59.
Hex should be between 0 and 100.
```

---

## 30. Summary Preview Screen / Modal

### 30.1 Purpose

Show exactly what will be shared.

### 30.2 Screen Type

Can be a full-screen modal on mobile.

Recommended because phone screens are small.

### 30.3 Header

```text
Production Summary
05 May 2026 · Morning Shift
```

### 30.4 Summary Structure

```text
Production Summary
Date: 05 May 2026
Shift: Morning Shift

CNC Production
1. Avinash · M1 · Hex 41 · 1/2 · Side 1
   Cycle: 2m 26s · Count: 193 · Hours: 7.83

2. Raju · M3 · Hex 55 · 3/4 · Side 2
   Cycle: 1m 45s · Count: 240 · Hours: 7.00

Total CNC Hours: 14.83 hrs

Burma Production
Burma 1: 120
Burma 2: 150
Burma 3: 90
Total Burma: 360

Repair
Avinash: 20 pcs

Notes
Machine 4 setting took extra time.
```

### 30.5 Visual Requirements for PNG

The summary card should be:

- white background,
- high contrast text,
- not too wide,
- readable after WhatsApp compression,
- no tiny text,
- clean section dividers.

### 30.6 Summary Actions

At bottom:

```text
[Edit]
[Generate Image]
[Share on WhatsApp]
```

For V1, `Generate Image` and `Share on WhatsApp` can be combined if implementation supports it.

Recommended:

1. First show `Generate Image`.
2. Once image is ready, show `Share on WhatsApp` and `Download Image`.

---

## 31. PNG Generation Behavior

### 31.1 Purpose

Convert summary card into image.

### 31.2 Frontend Approach

In HTML/JS V1, use a client-side approach such as rendering the summary DOM node into canvas/image.

Implementation options can include libraries like:

- `html2canvas`,
- `dom-to-image`,
- or equivalent.

### 31.3 PNG File Name

Suggested filename:

```text
production-summary-2026-05-05-morning.png
```

### 31.4 Sharing Fallbacks

Mobile browser sharing can vary.

Preferred behavior:

1. If Web Share API supports files: share PNG directly.
2. Else: download PNG and show instruction.
3. Else: open WhatsApp with text summary and allow manual image upload.

Fallback copy:

```text
Image downloaded. Please share it in the WhatsApp group.
```

---

## 32. Add Person Modal

### 32.1 Modal Purpose

Allow temporary frontend-only creation of a person/operator.

### 32.2 Modal Layout

```text
Add New Person

Person Name
[ Enter name ]

[Cancel] [Add Person]
```

### 32.3 Interaction Rules

- Open from the active CNC entry’s Operator field.
- Auto-focus input when modal opens.
- `Add Person` disabled until input has text.
- Trim whitespace.
- Prevent duplicate exact names.
- After adding, select the person in the active CNC card.
- Close modal.

### 32.4 State

Maintain an in-memory people array.

Optional:

- Store custom people in localStorage.

Suggested logic:

```text
basePeople = hardcoded list
customPeople = localStorage list or []
people = basePeople + customPeople
```

### 32.5 Duplicate Name Handling

If duplicate:

```text
This person is already in the list.
```

---

## 33. Empty States

### 33.1 No CNC Entry

Ideally not possible because one blank card appears by default.

If all entries are removed:

```text
No CNC entries yet.
Tap + Add CNC Entry to start.
```

### 33.2 No Burma Count

Show zero total, not an error.

```text
Total Burma Count: 0
```

### 33.3 No Notes

Omit notes section from summary or show:

```text
No notes.
```

Recommended: omit empty notes in PNG to keep summary clean.

---

## 34. Error States

### 34.1 Invalid CNC Card

Show a soft warning at top of the card:

```text
Please complete this entry.
```

Highlight missing fields.

### 34.2 Impossible Cycle Time

```text
Cycle time cannot be 0.
```

### 34.3 Invalid Seconds

```text
Seconds should be 0 to 59.
```

### 34.4 Share Failure

```text
Sharing did not work on this phone. Please download the image and share manually.
```

---

## 35. Success States

### 35.1 Person Added

Small confirmation:

```text
Person added.
```

Do not use disruptive alert boxes.

### 35.2 Image Generated

```text
Summary image is ready.
```

Show preview thumbnail or keep summary visible.

### 35.3 Shared / Downloaded

```text
Image downloaded.
```

or

```text
Ready to share on WhatsApp.
```

---

## 36. Responsive Behavior

### 36.1 Mobile

Primary target.

Layout:

- single column,
- large cards,
- sticky bottom CTA,
- minimal horizontal scrolling,
- large inputs.

### 36.2 Small Phone

For very small screens:

- stack Time In/Out vertically if needed,
- reduce card padding slightly,
- keep CTA full-width.

### 36.3 Desktop

Center content in a mobile-width container.

Do not expand into wide desktop table layout.

This product is phone-first.

---

## 37. Visual Design System Direction

### 37.1 Overall Feel

The app should feel:

- calm,
- precise,
- operational,
- premium but not fancy,
- easy and trustworthy.

### 37.2 Color Direction

Use a mostly neutral palette.

Suggested roles:

| Role | Direction |
|---|---|
| Background | soft gray |
| Cards | white |
| Primary CTA | strong blue/black |
| Selected chips | dark/blue filled |
| Secondary actions | light gray |
| Error | red but soft |
| Success | green but minimal |

Avoid too many colors.

### 37.3 Spacing

Use generous spacing.

Approx direction:

- page padding: 16px,
- card padding: 16px,
- section gap: 16-20px,
- field gap: 12px,
- button gap: 8px.

### 37.4 Buttons

Primary button:

- full-width on mobile,
- 48-56px height,
- bold label,
- rounded corners.

Secondary button:

- lighter background,
- still large enough to tap.

Danger/remove:

- low emphasis,
- avoid accidental taps.

### 37.5 Inputs

Inputs should be:

- large,
- easy to tap,
- rounded,
- high contrast,
- with clear labels above them.

Avoid placeholder-only labels.

---

## 38. Component Inventory

V1 frontend components:

1. AppContainer
2. Header
3. DateShiftCard
4. ShiftSegmentedControl
5. LiveTotalsStrip
6. CNCSection
7. CNCEntryCard
8. OperatorSelect
9. AddPersonModal
10. MachineSelector
11. HexInputWithChips
12. SizeSelector
13. SideToggle
14. CycleTimeInput
15. TimeRangeInput
16. PartsCountInput
17. ProductionHoursDisplay
18. BurmaCard
19. RepairCard
20. NotesCard
21. StickyActionBar
22. SummaryPreviewModal
23. ShareActions
24. Toast/InlineFeedback

Even in plain HTML, these can be represented as logical sections/functions.

---

## 39. Data Model - Frontend State

Suggested frontend state shape:

```js
{
  date: "2026-05-05",
  shift: "morning",
  people: ["Avinash", "Raju", "Sonu"],
  cncEntries: [
    {
      id: "entry_1",
      operator: "Avinash",
      machine: "M1",
      hex: 41,
      size: "1/2",
      side: 1,
      cycleMinutes: 2,
      cycleSeconds: 26,
      timeIn: "08:30",
      timeOut: "18:30",
      partsCount: 193,
      productionHours: 7.83
    }
  ],
  burma: {
    burma1: 0,
    burma2: 0,
    burma3: 0
  },
  repair: {
    person: "",
    count: 0,
    note: ""
  },
  notes: ""
}
```

---

## 40. Calculation Rules

### 40.1 CNC Line Production Hours

```text
Production Hours = (((cycleMinutes * 60) + cycleSeconds) * partsCount) / 3600
```

Round to 2 decimals.

### 40.2 Total CNC Hours

```text
Total CNC Hours = sum(all CNC entry production hours)
```

### 40.3 Burma Total

```text
Burma Total = Burma 1 + Burma 2 + Burma 3
```

### 40.4 CNC Entry Count

```text
CNC Entry Count = number of CNC cards
```

---

## 41. Copy Style

Use simple operational English.

Good labels:

```text
Operator
Machine
Hex
Size
Side
Cycle Time
Parts Count
Production Hours
Preview Summary
Share on WhatsApp
```

Avoid:

```text
Resource Name
Asset Identifier
Production Metadata
Operational Shift Instance
```

The app should speak like a helpful production assistant.

---

## 42. Implementation Priorities

### Priority 1 - Must Work

1. Date auto-fill.
2. Shift selection.
3. CNC add/remove entries.
4. Operator select.
5. Add New Person modal.
6. Machine M1-M8 selection.
7. CNC hours calculation.
8. Burma total.
9. Summary preview.
10. PNG generation.

### Priority 2 - Should Work

1. Duplicate CNC entry.
2. Smart default copying for time.
3. localStorage for added people.
4. Basic validation.
5. Download image fallback.

### Priority 3 - Nice Later

1. Backend save.
2. Historical entries.
3. Admin person list.
4. Analytics.
5. Machine downtime tracking.
6. Export to sheet.

---

## 43. V1 Build Recommendation

Because the first version is simple HTML, keep architecture light.

Suggested stack:

- HTML
- CSS
- Vanilla JavaScript
- Optional client-side PNG library

Avoid heavy frameworks unless there is a clear reason.

Recommended file structure:

```text
/index.html
/styles.css
/app.js
```

Or single-file version for fastest prototype:

```text
production-entry.html
```

For V1, single-file HTML is acceptable.

---

## 44. QA Checklist

Before V1 is considered usable, test these cases:

### Basic Flow

- Open app on Android phone.
- Date auto-fills correctly.
- Morning shift selected by default.
- Add one CNC entry.
- CNC hours calculate correctly.
- Add Burma counts.
- Preview summary.
- Generate/download/share image.

### Multi Entry

- Add 10 CNC entries.
- Remove one entry.
- Duplicate one entry.
- Total CNC hours updates correctly.

### Add Person

- Add a new person.
- Person appears in dropdown.
- Person is auto-selected.
- Blank name is blocked.
- Duplicate name is blocked.

### Validation

- Missing operator shows error.
- Seconds above 59 shows error.
- Zero cycle time is blocked.
- Blank count is handled.

### Summary Image

- Summary is readable after image generation.
- Long notes do not break the image.
- 10 CNC entries still fit reasonably.

### WhatsApp

- Share button works if supported.
- Download fallback works if sharing fails.

---

## 45. Acceptance Criteria

The UI is ready for V1 if:

1. A non-technical worker can complete the form on phone.
2. The app does not feel like a spreadsheet.
3. Date and shift setup takes less than 5 seconds.
4. Adding a CNC line feels easy.
5. Adding a person feels easy and non-technical.
6. Total CNC hours are always visible.
7. Burma total is always clear.
8. Preview summary matches entered data.
9. PNG summary is readable in WhatsApp.
10. The app handles 2 entries and 10+ entries gracefully.

---

## 46. What This UI Must Avoid

Do not build:

- a dense table layout,
- a complicated dashboard,
- too many tabs,
- tiny inputs,
- hidden required fields,
- backend dependency in V1,
- login screen in V1,
- unnecessary analytics,
- excessive dropdown nesting,
- or a form that requires training.

The best version of this UI is boring in the right way:

> Open. Fill. Preview. Share.

---

## 47. Final Product Direction

The frontend should be designed around one promise:

> A factory worker can enter the day’s CNC and Burma production from a phone, without confusion, and share a clean WhatsApp-ready production summary in under a few minutes.

Every UI decision should protect that promise.
