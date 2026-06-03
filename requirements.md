# Production Entry Mobile App - Requirements

## 1. Purpose

Build a very simple mobile-first production entry UI to replace the monthly production sheet.

The app should allow a factory worker/supervisor to enter daily production in a very simple way and generate a clean summary image that can be shared on WhatsApp.

The app must be easy enough for a non-technical person to use. The UI should feel like filling a simple WhatsApp-style form, not like using a spreadsheet.

---

## 2. Main Goals

1. Capture daily production entries for CNC and Burma operations.
2. Auto-fill today’s date.
3. Allow shift selection: Morning shift or Evening shift.
4. Allow multiple line items because daily production can have 2 entries or 10+ entries.
5. Automatically calculate CNC production hours from cycle time and part count.
6. Capture Burma counts simply.
7. Capture repair work and notes.
8. Generate a clear summary PNG image.
9. Provide a direct CTA to share the summary on WhatsApp.

---

## 3. User Type

### Primary User

Factory worker / labour person / supervisor entering daily production data on a phone.

### User Skill Level

The user may not be comfortable with spreadsheets or complex forms.

Therefore:

- Use large buttons.
- Use dropdowns wherever possible.
- Avoid typing unless necessary.
- Keep each entry short.
- Use clear labels.
- Use plus/minus buttons for line items.
- Show auto-calculated values clearly.

---

## 4. Device Requirement

The app should be mobile-first.

### Design Priority

1. Android phone browser
2. WhatsApp sharing from phone
3. Desktop can work, but it is not the priority

### UI Style

- Large touch-friendly buttons
- Simple cards for each line item
- Minimal scrolling confusion
- Sticky submit/preview button at bottom if possible
- Hindi/Punjabi-friendly simple English labels can be considered later

---

## 5. High-Level App Flow

1. User opens the app link on phone.
2. Today’s date is automatically filled.
3. User selects shift: Morning or Evening.
4. User enters CNC production line items.
5. User enters Burma production counts.
6. User optionally enters repair work.
7. User optionally adds notes.
8. User taps “Preview Summary”.
9. App shows a clean summary screen.
10. App generates PNG image of the summary.
11. User taps “Share on WhatsApp”.
12. User sends the image to the WhatsApp group.

---

## 6. Date and Shift Section

This section appears at the top of the screen.

### Fields

| Field | Type | Default | Required |
|---|---|---|---|
| Date | Date picker | Today’s date | Yes |
| Shift | Button selection | Morning shift | Yes |

### Shift Options

1. Morning shift
2. Evening shift

### Default Time Logic

For CNC line items, the default time-in and time-out should be based on selected shift.

Suggested defaults:

| Shift | Default Time In | Default Time Out |
|---|---:|---:|
| Morning shift | 08:30 AM | 06:30 PM |
| Evening shift | 07:00 PM | 09:30 PM |

The user should still be able to change time-in and time-out manually.

---

## 7. CNC Production Section

CNC is the main detailed operation.

The app should allow multiple CNC line items.

Each CNC line item represents one unique combination of:

- Operator
- Machine
- Hex
- Size
- Side
- Cycle time
- Time in/out
- Part count

If the same operator runs multiple machines, or different sizes/sides/hex combinations, each should be entered as a separate line item.

---

## 8. CNC Line Item Fields

| Field | Type | Example | Required | Notes |
|---|---|---|---|---|
| Operator Name | Dropdown / text | Avinash | Yes | Dropdown preferred once operator list is available |
| Machine Number | Dropdown/buttons | M1 to M8 | Yes | CNC machine 1 to 8 |
| Hex | Number input / dropdown | 41, 37, 60, 55 | Yes | Range 0-100; common values should be quick-select |
| Size | Dropdown / searchable select | 1/2, 3/4, 1 inch, 2 inch | Yes | Should support many sizes |
| Side | Button selection | 1 or 2 | Yes | Only side 1 or side 2 |
| Cycle Time - Minutes | Number input | 2 | Yes | Minute part of cycle time |
| Cycle Time - Seconds | Number input | 26 | Yes | Second part of cycle time |
| Time In | Time picker | 08:30 AM | Yes | Default from shift |
| Time Out | Time picker | 06:30 PM | Yes | Default from shift |
| Parts Count | Number input | 193 | Yes | Total pieces produced |
| Auto Production Hours | Auto-calculated | 7.82 hrs | No input | Calculated from cycle time x parts count |

---

## 9. CNC Auto Calculation

For each CNC line item:

```text
Cycle Time in Seconds = (Cycle Time Minutes x 60) + Cycle Time Seconds
Production Seconds = Cycle Time in Seconds x Parts Count
Production Hours = Production Seconds / 3600
```

Example:

```text
Cycle Time = 2 min 26 sec = 146 seconds
Parts Count = 193
Production Seconds = 146 x 193 = 28,178 seconds
Production Hours = 28,178 / 3600 = 7.83 hours
```

The app should show production hours immediately after parts count and cycle time are entered.

### Display Format

Show hours up to 2 decimals.

Example:

```text
Production Hours: 7.83 hrs
```

---

## 10. CNC Line Item Behavior

### Add Line

There should be a clear button:

```text
+ Add CNC Entry
```

When clicked, a new blank CNC card opens.

### Remove Line

Each CNC card should have a simple remove button:

```text
Remove
```

or a trash icon.

### Duplicate Line

Optional but useful:

```text
Duplicate
```

This is helpful because many fields may remain the same, like operator, shift time, size, machine, etc.

### Smart Defaults

Once the user enters Time In and Time Out in the first CNC entry, the same times should be copied by default to the next CNC entries.

Reason:

Most people in the same shift will have the same time-in and time-out.

---

## 11. CNC Validation Rules

The app should prevent obvious mistakes.

| Field | Validation |
|---|---|
| Operator | Cannot be blank |
| Machine | Must be M1-M8 |
| Hex | Must be 0-100 |
| Side | Must be 1 or 2 |
| Cycle time | Cannot be zero |
| Parts count | Must be greater than zero |
| Time out | Should be after time in |

### Warning Logic

The app should show warning, not necessarily block submission, for unusual entries.

| Condition | Warning |
|---|---|
| Production hours greater than time available | “Production hours seem higher than shift time. Please check cycle time or count.” |
| Parts count very high | “Please check if count is correct.” |
| Cycle time less than 20 sec | “Cycle time seems too low. Please confirm.” |
| Cycle time more than 10 min | “Cycle time seems high. Please confirm.” |

---

## 12. Burma Section

Burma is simpler than CNC.

There are 3 Burma machines / stations:

1. Burma 1
2. Burma 2
3. Burma 3

The user only needs to enter count for each Burma.

### Fields

| Field | Type | Example | Required |
|---|---|---:|---|
| Burma 1 Count | Number input | 500 | Optional |
| Burma 2 Count | Number input | 700 | Optional |
| Burma 3 Count | Number input | 350 | Optional |

If blank, treat as zero.

### Total Burma Count

```text
Total Burma Count = Burma 1 + Burma 2 + Burma 3
```

Display clearly:

```text
Total Burma Count: 1,550 pcs
```

---

## 13. Repair Section

Sometimes someone repairs pieces.

This should be optional.

### Simple Version

| Field | Type | Example |
|---|---|---|
| Repair Person Name | Text / dropdown | Avinash |
| Repair Count | Number | 45 |
| Repair Note | Text | Thread repair |

### Multiple Repair Entries

Ideally, repair should also support plus/minus line items, but it can be optional in Version 1.

If keeping Version 1 very simple:

```text
Repair Count: ___
Repair Notes: ___
```

---

## 14. Notes Section

There should be one simple notes box.

Examples of notes:

- Machine 3 stopped due to coolant issue.
- Power cut from 2 PM to 3 PM.
- Setting took longer for 2 inch part.
- Operator left early.
- Tooling not available.
- Rework done for 50 pcs.

### Field

| Field | Type | Required |
|---|---|---|
| Notes | Multi-line text | No |

---

## 15. Preview Summary Screen

After entering data, user taps:

```text
Preview Summary
```

The app shows a clean summary before generating image.

The summary should be easy to read on WhatsApp.

---

## 16. Summary Content

The PNG summary should include:

1. Date
2. Shift
3. CNC entries
4. Total CNC production hours
5. Burma counts
6. Total Burma count
7. Repair details, if any
8. Notes, if any

---

## 17. CNC Summary Format

Example:

```text
CNC Production

1. Avinash | M1 | Hex 41 | Size 1/2 | Side 1
   Cycle: 2m 26s | Count: 193 | Hours: 7.83

2. Avinash | M2 | Hex 55 | Size 3/4 | Side 2
   Cycle: 1m 50s | Count: 210 | Hours: 6.42

Total CNC Hours: 14.25 hrs
```

---

## 18. Burma Summary Format

Example:

```text
Burma Production

Burma 1: 500 pcs
Burma 2: 700 pcs
Burma 3: 350 pcs

Total Burma Count: 1,550 pcs
```

---

## 19. Final PNG Summary Example

```text
Daily Production Summary
Date: 05 May 2026
Shift: Morning

CNC Production
1. Avinash | M1 | Hex 41 | Size 1/2 | Side 1
   Cycle: 2m 26s | Count: 193 | Hours: 7.83

2. Sonu | M3 | Hex 60 | Size 1 inch | Side 2
   Cycle: 1m 55s | Count: 220 | Hours: 7.03

Total CNC Hours: 14.86 hrs

Burma Production
Burma 1: 500 pcs
Burma 2: 700 pcs
Burma 3: 350 pcs
Total Burma Count: 1,550 pcs

Repair
Repair Count: 45 pcs
Note: Thread repair by Avinash

Notes
Machine 2 setting took extra time.
```

---

## 20. PNG Generation Requirement

The app should generate a PNG image of the summary.

### Requirement

- Summary should be captured as an image.
- Image should be readable on WhatsApp.
- Text should be large enough.
- Use clean spacing.
- Avoid tiny tables.
- Use bold section headings.

### Possible Technical Approach

For a simple HTML app:

- Build a summary div/card in HTML.
- Use a browser library like `html2canvas` to convert the summary card into PNG.
- Allow user to download/share the PNG.

---

## 21. WhatsApp Sharing Requirement

There should be a clear button:

```text
Share on WhatsApp
```

### Ideal Behavior

On mobile:

1. Generate PNG.
2. Use native Web Share API if available.
3. Open phone sharing sheet.
4. User selects WhatsApp group.
5. Image gets shared.

### Fallback Behavior

If direct image sharing does not work:

1. Generate PNG.
2. Download image to phone.
3. Show instruction: “Image saved. Please share it on WhatsApp.”
4. Provide optional WhatsApp text summary copy button.

---

## 22. Data Storage Requirement

Version 1 can be simple.

### Option A - No Database

- User fills form.
- Generates PNG.
- Shares on WhatsApp.
- No data is saved.

This is easiest but has no historical database.

### Option B - Local Browser Save

- Save recent entries in browser local storage.
- Useful if app accidentally refreshes.
- Not reliable for long-term reporting.

### Option C - Google Sheet Backend

- On submit, send data to Google Sheet.
- This creates production history automatically.
- More useful for future analysis.

### Recommendation

Start with:

1. PNG summary for WhatsApp
2. Local browser save to prevent accidental loss
3. Later add Google Sheet backend

---

## 23. Future Backend Data Structure

If later saving to Google Sheet or database, store CNC entries as separate rows.

### CNC Table

| Field |
|---|
| Date |
| Shift |
| Operator |
| Machine |
| Hex |
| Size |
| Side |
| Cycle Minutes |
| Cycle Seconds |
| Cycle Seconds Total |
| Time In |
| Time Out |
| Parts Count |
| Production Hours |
| Notes |
| Created At |

### Burma Table

| Field |
|---|
| Date |
| Shift |
| Burma 1 Count |
| Burma 2 Count |
| Burma 3 Count |
| Total Burma Count |
| Notes |
| Created At |

### Repair Table

| Field |
|---|
| Date |
| Shift |
| Repair Person |
| Repair Count |
| Repair Note |
| Created At |

---

## 24. Version 1 Scope

Version 1 should include only the essentials.

### Must Have

- Mobile-first form
- Auto-filled date
- Shift selection
- CNC multiple line items
- Burma counts
- Repair optional field
- Notes field
- Auto CNC hours calculation
- Auto total CNC hours calculation
- Auto total Burma count calculation
- Preview summary
- Generate PNG
- Share/download PNG

### Should Have

- Duplicate CNC line item
- Smart default time copying
- Basic validations
- Local browser save

### Not Required in Version 1

- Login
- User roles
- Full database
- Advanced analytics
- Expense tracking
- Sales tracking
- Machine downtime tracking
- Payroll calculation
- Complex reports

---

## 25. Key Design Principle

The app should not feel like a spreadsheet.

It should feel like:

```text
Select → Enter count → Add line → Preview → Share
```

The worker should not have to think about formulas.

---

## 26. Open Questions

These need to be finalized before development:

1. Final operator list
2. Final size dropdown list
3. Whether hex should be dropdown, number input, or both
4. Exact default shift timings
5. Whether repair needs multiple entries or just one total count
6. Whether data must be saved to Google Sheets in Version 1
7. Whether summary PNG should include time-in/time-out or only production hours
8. Whether the app should support Hindi/Punjabi labels later

---

## 27. Recommended Build Approach

### Phase 1 - Static Mobile HTML Prototype

- Single HTML file
- Form entry
- Add/remove CNC entries
- Auto calculations
- Preview summary
- PNG generation
- WhatsApp/share button

### Phase 2 - Save Data

- Add Google Sheet or simple backend
- Store every entry
- Generate daily/weekly reports later

### Phase 3 - Add Intelligence

- Operator-wise production
- Machine-wise production
- Daily CNC hour target
- Production vs target
- Basic downtime notes
- Repeated part/product templates

---

## 28. Success Criteria

The app is successful if:

1. Worker can complete daily entry in under 3 minutes.
2. Worker does not need calculator or spreadsheet.
3. CNC hours are calculated automatically.
4. WhatsApp summary is clear and readable.
5. The owner can instantly see total CNC hours and Burma count.
6. The form is simple enough that mistakes reduce compared to manual sheets.

