# Detailed UI/UX Design — Production Entry Mobile App

## Document Purpose

This document is the visual-execution layer that sits between `frontend_ui_spec.md` and the actual implementation of the Production Entry Mobile App.

It exists so that the engineer building this app does not have to reinvent:
- the visual system,
- the spatial rhythm,
- the component anatomies,
- the state behaviors,
- or the screen choreography.

If `requirements.md` says **what the product must do** and `frontend_ui_spec.md` says **how the frontend should behave**, this document says **how it should look, feel, and be structured pixel-by-pixel and state-by-state**.

This document treats the project as a **fully working production web app**, not a single-file HTML visualization. That means:
- real PNG generation (not a fake screenshot),
- real WhatsApp share via Web Share API with proper fallbacks,
- real `localStorage` persistence,
- real validation that fires at sensible moments,
- a real, deployable build.

Implementation details for that working stack appear in §15 (Implementation Notes).

---

## 1. Translation Goal

This file operationalizes:

1. `requirements.md` — product intent, calculations, validation rules, summary content.
2. `frontend_ui_spec.md` — IA, components, layout order, interactions, copy direction.

Where a conflict appears between this file and the upstream pair, the upstream pair wins. This file may add specificity but never contradict the source of truth.

This file specifically does **not**:
- redesign the workflow,
- introduce new screens,
- introduce new fields,
- expand scope beyond V1,
- adopt the dense-enterprise dashboard aesthetic described in `vibe.md` (that vibe doc was carried over from earlier projects; the current product is explicitly calm-Apple-utility per `frontend_ui_spec.md` §3).

---

## 2. Design Vibe Anchor

One sentence:

> A calm, slightly soft, mobile-utility that feels like the production version of a well-designed iPhone form — quiet surfaces, generous whitespace, big confident touch targets, numbers that feel proud, totals that feel reassuring.

It should feel like:
- a personal utility, not an admin tool,
- a checklist a worker actually wants to open,
- a tool that does the math for them,
- a tool that "knows" today, the shift, and what they did last entry.

It must never feel like:
- an enterprise dashboard,
- a CRM,
- a spreadsheet,
- a government form,
- a settings screen.

---

## 3. Global Visual System

### 3.1 Typography

Single font stack (no web font load on V1, to keep TTFB low and offline-friendly):

```text
-apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI",
Roboto, "Helvetica Neue", Arial, sans-serif
```

Numerals must use tabular figures so totals don't jiggle as digits change:

```css
font-variant-numeric: tabular-nums;
```

Apply globally to elements that display calculated values (CNC hours, Burma totals, parts count, time chips).

#### 3.1.1 Type scale

| Token | Size / Line | Weight | Tracking | Use |
|---|---|---|---|---|
| `display/xl` | 28 / 34 | 700 | -0.01em | Summary big totals (Total CNC Hours in preview) |
| `display/lg` | 24 / 30 | 700 | -0.01em | Live totals strip big numbers |
| `heading/lg` | 20 / 26 | 600 | -0.005em | App title, modal titles |
| `heading/md` | 17 / 22 | 600 | 0 | Section card titles ("CNC Production", "Burma Production") |
| `heading/sm` | 15 / 20 | 600 | 0 | CNC card header ("CNC Entry 1") |
| `body/lg` | 17 / 24 | 400 | 0 | Input text values |
| `body/md` | 15 / 20 | 400 | 0 | Default body text, subtitles |
| `body/sm` | 13 / 18 | 500 | 0 | Field labels |
| `caption` | 12 / 16 | 500 | 0.005em | Helper text, "Common: 37 41 55..." |
| `micro` | 11 / 14 | 600 | 0.04em (uppercase) | Live totals strip labels ("CNC HOURS") |

Mobile inputs must be ≥16px to suppress the iOS auto-zoom on focus. `body/lg` (17px) covers all `<input>`/`<select>`/`<textarea>` value text.

#### 3.1.2 Numeric emphasis

Computed values (production hours, totals, counts) use:
- the next size up from their surrounding label,
- weight 700,
- tabular-nums,
- color `text/primary` (never gray) when valid; `text/muted` when pending.

This is the single biggest "trust" signal in the app. Numbers should look like they've been computed, not typed.

### 3.2 Color Palette

A neutral light palette with a single confident accent. No gradients. No multiple brand colors.

Implement as CSS variables on `:root`. (Tailwind config consumers can mirror these as `theme.extend.colors`.)

```css
:root {
  /* Surfaces */
  --bg-app:        #F4F5F7;   /* page background */
  --bg-card:       #FFFFFF;   /* card surface */
  --bg-sunken:     #EDEEF1;   /* inset fields, chip rail */
  --bg-overlay:    rgba(15, 17, 21, 0.55); /* modal scrim */

  /* Text */
  --text-primary:  #0F1115;
  --text-secondary:#3D424B;
  --text-muted:    #6B7280;
  --text-disabled: #A0A4AB;
  --text-inverse:  #FFFFFF;

  /* Accent (primary action) */
  --accent-600:    #1F6FEB;   /* primary CTA, selected chip fill */
  --accent-700:    #1A5FCC;   /* pressed */
  --accent-50:     #E8F0FE;   /* selected chip soft fill, focus halo */

  /* Semantic */
  --success-600:   #1F8F4A;
  --success-50:    #E5F6EC;
  --warning-600:   #B26A00;
  --warning-50:    #FFF4DF;
  --danger-600:    #C73A3A;
  --danger-50:     #FCE9E9;

  /* Lines */
  --border-soft:   #E5E7EB;
  --border-strong: #D1D5DB;
  --border-focus:  #1F6FEB;

  /* Shadow tokens — see §3.5 */
}
```

#### 3.2.1 Accent usage rules

The blue accent (`--accent-600`) is reserved for:
- primary CTAs ("Preview Summary", "Generate Image", "Share on WhatsApp", "Add Person"),
- selected state of segmented controls and chips (Shift toggle, Side toggle, Machine M1–M8, Hex chips),
- focus rings on inputs.

Do not use the accent for:
- regular text,
- dividers,
- icons that are decorative,
- card backgrounds,
- the live totals strip (it stays neutral; numbers are dark).

#### 3.2.2 Semantic usage rules

- **Success** appears only after image generation and after successful share.
- **Warning** is the color for soft validation ("Cycle time seems too low — please confirm.").
- **Danger** is reserved for hard validation errors and the destructive Remove confirmation. It must never be used for normal Remove buttons in their resting state — Remove resting is `text-secondary` with a small trash glyph.

#### 3.2.3 Dark mode

Out of scope for V1. The PNG output must always render in light mode regardless of any future system-dark-mode handling — the summary card is a fixed light artifact (see §6.4).

### 3.3 Spacing Rhythm

Base unit is 4px. The full ramp:

| Token | Value | Use |
|---|---:|---|
| `space-0` | 0 | reset |
| `space-1` | 4px | icon-to-label gap |
| `space-2` | 8px | inline button gap, chip-to-chip horizontal |
| `space-3` | 12px | label-to-input gap, intra-field rhythm |
| `space-4` | 16px | card inner padding (mobile), field-to-field |
| `space-5` | 20px | section title bottom margin |
| `space-6` | 24px | card-to-card gap, card inner padding (≥small-tablet) |
| `space-8` | 32px | screen top spacing under header |
| `space-10` | 40px | extra breathing for live totals strip vs. CNC section |
| `space-14` | 56px | bottom spacing above sticky action bar so content doesn't hide under it |

Rules:
- Page padding: `space-4` left/right at all widths up to 480.
- Card padding: `space-4` on mobile, `space-6` once the viewport exceeds 380px wide.
- Section gap (between cards): `space-6`.
- Field-to-field gap inside a card: `space-4`.
- Label-to-input gap: `space-3`.
- Bottom of scroll region must always reserve `space-14` so the sticky action bar never overlaps the last card.

### 3.4 Shape Language

| Element | Radius |
|---|---:|
| Cards | 16px |
| Inputs / Selects / Textarea | 12px |
| Chips | 999px (pill) |
| Segmented control container | 12px |
| Segmented control segments | 10px (inner) |
| Buttons (primary, secondary) | 14px |
| Modal sheet | 20px (top corners) on mobile bottom sheet, 16px on centered desktop modal |
| Toast | 12px |
| Avatar / Operator initial badge (future) | 999px |

Borders are 1px `--border-soft` by default. Cards use border + shadow (not just shadow) so the edge stays crisp on bright phone screens.

### 3.5 Elevation

Three elevation tiers. No more.

```css
--shadow-sm: 0 1px 2px rgba(15, 17, 21, 0.04),
             0 1px 1px rgba(15, 17, 21, 0.03);

--shadow-md: 0 4px 12px rgba(15, 17, 21, 0.06),
             0 2px 4px rgba(15, 17, 21, 0.04);

--shadow-lg: 0 16px 40px rgba(15, 17, 21, 0.18),
             0 4px 12px rgba(15, 17, 21, 0.10);
```

Assignment:
- `shadow-sm`: cards (default rest).
- `shadow-md`: sticky action bar, live totals strip on scroll.
- `shadow-lg`: modals, summary preview sheet.

The sticky bar and totals strip both gain `shadow-md` only when content is scrolled beneath them (use IntersectionObserver on a sentinel; do not show the shadow at scroll=0).

### 3.6 Motion

All motion is short and functional. No theatrical animation.

| Action | Duration | Easing |
|---|---:|---|
| Hover/press color change | 120ms | `ease-out` |
| Chip select | 140ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Card add (new CNC entry) | 220ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Card remove | 180ms | `ease-in` |
| Modal open (mobile bottom sheet) | 260ms slide-up + 160ms scrim fade | `cubic-bezier(0.32, 0.72, 0, 1)` |
| Modal close | 200ms | `cubic-bezier(0.4, 0, 1, 1)` |
| Toast in/out | 180ms | `ease-out` / `ease-in` |
| Live total number change | 160ms | `ease-out` (cross-fade old→new digit; do not bounce) |

Reduced motion: respect `prefers-reduced-motion: reduce` — disable card add/remove animation, modal slide (replace with fade), and number cross-fade. Selection and hover transitions remain because they are short and informational.

---

## 4. Global Shell Rules

### 4.1 App container

```text
max-width: 480px
margin: 0 auto
background: var(--bg-app)
min-height: 100dvh   /* use dvh, not vh, so iOS URL bar doesn't break sticky bar */
padding-bottom: calc(env(safe-area-inset-bottom) + 96px)
```

The 96px bottom buffer = sticky action bar height (72px) + breathing room (24px).

### 4.2 Safe areas

Honor `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` on:
- header padding-top,
- sticky action bar padding-bottom,
- bottom-sheet modal padding-bottom.

### 4.3 Scroll behavior

- The page itself scrolls. Cards do not have internal scroll.
- The summary preview modal scrolls internally on small screens; its action bar at the bottom is sticky inside the modal.
- `overscroll-behavior: contain` on the modal scroll region so it doesn't propagate to the page underneath.

### 4.4 Sticky regions

Two sticky regions exist:

1. **Header** — only the small "Today's date" date refresh dot. Height 56px. Sticky at top.
2. **Action bar** — bottom. Always present. Contains the running CNC hours total on the left and "Preview Summary" CTA on the right.

The Live Totals Strip is **not** sticky in V1 — it lives in the natural flow under the Date & Shift card. (Sticking it would compete with the action bar and crowd the small viewport.)

### 4.5 Status / connection state

V1 is offline-tolerant. There is no network status indicator. If a future backend save fails, surface it as a non-blocking toast at the bottom — never a banner that pushes content down.

---

## 5. Screen Breakdown

V1 has **one primary screen** plus **two overlays**.

| # | Surface | Type |
|---|---|---|
| 1 | Production Entry | Primary scrolling page |
| 2 | Summary Preview | Full-screen modal (mobile) / centered modal (≥640px) |
| 3 | Add New Person | Bottom sheet (mobile) / centered modal (≥640px) |

### 5.1 Screen 1 — Production Entry

#### 5.1.1 Vibe

Quiet workspace. The worker should feel: "I just open it and fill the obvious bits."

#### 5.1.2 Vertical layout order

```text
[1]  Header                          (sticky)
[2]  Date & Shift card
[3]  Live Totals strip               (3 tiles)
[4]  CNC Production section
       ├─ Section header + subtitle
       ├─ CNC Entry Card 1          (default visible at start)
       ├─ CNC Entry Card 2..N
       └─ + Add CNC Entry           (full-width dashed-border tile)
[5]  Burma Production card
[6]  Repair Work card
[7]  Notes card
[8]  Bottom buffer (96px)
[9]  Sticky Action Bar              (sticky bottom)
```

#### 5.1.3 Header anatomy

Height 56px. Contents, left-aligned:

```text
Production Entry                        ← heading/lg
Tuesday · 05 May 2026                   ← caption, --text-muted
```

No menu, no avatar, no settings icon in V1. The header is information, not navigation.

The date line is computed locally from `new Date()` on mount and then synced to the Date picker's current value (so changing the date in the form updates this line).

#### 5.1.4 Date & Shift card

Card padding `space-4`. Two stacked rows:

**Row 1 — Date**
```text
Date                                    ← body/sm label, --text-secondary
[ 05 May 2026                       📅 ]← native date input, body/lg
```

The native `<input type="date">` is used directly. Style its container, not the input chrome — mobile browsers handle the picker reliably.

**Row 2 — Shift**

A 2-segment segmented control (not pills):

```text
┌─────────────────────────────────────┐
│ [  Morning Shift  ] [ Evening Shift ]│
└─────────────────────────────────────┘
```

- Container: `--bg-sunken`, radius 12px, padding 4px.
- Segments: equal width, height 44px, radius 10px.
- Selected segment: `--bg-card` background, `--shadow-sm`, weight 600.
- Unselected segment: transparent background, weight 500, `--text-secondary`.

This pattern reads as "iOS-style segmented control" and is instantly recognizable on mobile.

#### 5.1.5 Live Totals strip

A horizontal 3-tile strip beneath the Date & Shift card. Card-on-card-row, but visually one unit.

```text
┌──────────┐ ┌──────────┐ ┌──────────┐
│CNC HOURS │ │ ENTRIES  │ │  BURMA   │
│  14.83   │ │    3     │ │   420    │
└──────────┘ └──────────┘ └──────────┘
```

Each tile:
- background `--bg-card`,
- radius 16,
- padding `space-3` vertical, `space-4` horizontal,
- top label `micro`, uppercase, `--text-muted`,
- bottom number `display/lg`, weight 700, tabular-nums, `--text-primary`.

Strip layout: `display: grid; grid-template-columns: 1fr 1fr 1fr; gap: space-3;`.

When a number changes, the tile does a 160ms cross-fade swap (old number 50% out, new number 100% in, slight 2px Y-translate). Honor reduced-motion.

When all values are 0/empty, numbers are still rendered as `0` / `0.00` in `--text-muted` (not red, not warning — just quiet zeros).

#### 5.1.6 CNC Production section

Section header is **outside** the cards, with `space-2` left padding:

```text
CNC Production                          ← heading/md, --text-primary
Add one entry per machine + size + side. ← body/md, --text-muted
```

`space-4` between subtitle and first CNC card.

The first CNC card is always visible at app open. Cards stack vertically with `space-4` between them.

After the last CNC card, render the **Add CNC Entry** tile:

```text
┌─────────────────────────────────────┐
│              + Add CNC Entry         │
└─────────────────────────────────────┘
```

- Full-width.
- Height 56px.
- Background `--bg-card`.
- 1.5px dashed border `--border-strong`.
- Radius 16.
- Centered text, `body/lg`, weight 600, color `--accent-600`.
- On press: 120ms fill to `--accent-50`.

This deliberately looks "addable" — dashed signals "not yet a thing".

#### 5.1.7 Burma Production card

Card title row:
```text
Burma Production                        ← heading/md
```

Three rows of `Label • Number Input`:

```text
Burma 1            [    500   ]
Burma 2            [    700   ]
Burma 3            [    350   ]
```

Each row:
- label: `body/md`, weight 500, `--text-secondary`,
- input: 100px wide, right-aligned text, `body/lg`, tabular-nums.

Footer of the card, separated by 1px `--border-soft`:

```text
Total Burma Count                  1,550
```

- Label `body/sm` weight 600.
- Number `heading/md` weight 700, tabular-nums, right-aligned.
- Updates live on every keystroke.
- Use `Intl.NumberFormat('en-IN')` for thousand separators.

Use `inputmode="numeric"` and `pattern="[0-9]*"` on the inputs so Android shows the number pad and not the full keyboard.

#### 5.1.8 Repair Work card

Marked optional in the title row:

```text
Repair Work        Optional           ← heading/md + caption pill on right
```

The "Optional" pill: `--bg-sunken`, `--text-muted`, `caption`, padding `2px 8px`, radius 999.

Three fields stacked:

```text
Repair Person          [ Avinash         ▼ ]
Repair Count           [           45 ]
Repair Note            [ Thread repair      ]
```

- Person uses the same Operator select as CNC (shares the people list, including any Add-New-Person additions).
- Count is a single number input, full-width, right-aligned digits.
- Note is a single-line text input (not a textarea — repair notes are short).

If all three are empty at preview time, the Repair section is omitted from the summary entirely (not shown as "—").

#### 5.1.9 Notes card

```text
Notes              Optional
```

A single textarea:
- min-height 96px,
- max-height 240px,
- padding `space-3` × `space-4`,
- placeholder `body/lg`, `--text-disabled`: "Anything extra — machine issue, power cut, material delay…"
- auto-grows up to max-height (use `field-sizing: content` where supported, JS fallback otherwise).

### 5.2 Sticky Action Bar

Always-visible bottom bar.

#### 5.2.1 Anatomy

```text
┌───────────────────────────────────────────────┐
│  Total CNC                                    │
│  14.83 hrs                  [ Preview Summary ]│
└───────────────────────────────────────────────┘
```

- Height 72px (plus safe-area inset).
- Background `--bg-card`.
- Top border `1px --border-soft`.
- `shadow-md` only when scroll position > 0.
- Content padded `space-4` left/right.
- Left block:
  - "Total CNC" — `caption`, `--text-muted`,
  - "14.83 hrs" — `heading/md`, weight 700, tabular-nums.
- Right block — primary CTA button:
  - Label "Preview Summary",
  - Background `--accent-600`,
  - Color `--text-inverse`,
  - Height 48,
  - Padding `0 20px`,
  - Radius 14,
  - Weight 600.

#### 5.2.2 CTA states

| State | Look | Behavior |
|---|---|---|
| Default | accent-600 fill, white text | tap → open summary |
| Pressed | accent-700 fill | 120ms |
| Disabled | accent-600 @ 30% opacity, no shadow | when zero CNC entries AND zero Burma; tap shows toast: "Add an entry first." |
| Validation soft-warn | accent-600 fill but with small ⚠ glyph 16px before label | when there are incomplete CNC entries; tap still opens summary, summary highlights the incomplete cards |

#### 5.2.3 On very narrow screens (<340px)

Drop the "Total CNC / 14.83 hrs" left block down a line under the CTA only as a fallback. Preferred: keep as one row by reducing CTA padding.

### 5.3 Screen 2 — Summary Preview

Opens as a full-screen modal on mobile (`<640px`) and a centered modal (`max-width: 520px`) on larger viewports.

#### 5.3.1 Mobile modal anatomy

Top app bar inside the modal, height 56px, sticky:

```text
[ ←  ]   Production Summary                       [ ✕ ]
```

- `←` Edit (returns to entry screen, preserves all state).
- `✕` Close (same effect; redundant for thumb reachability).

Below the bar is the **Summary Card** — this is the artifact that gets converted to PNG. Its design is fixed and locked (see §6).

Below the Summary Card is the **Action Stack** — three full-width buttons, in this order:

```text
[  Generate Image           ] ← primary, accent-600
[  Share on WhatsApp        ] ← appears only after image is ready
[  Download Image           ] ← appears only after image is ready
[  Edit Entry               ] ← always visible, secondary, ghost
```

Stack spacing: `space-3` between buttons. Bottom inset = safe-area + `space-4`.

#### 5.3.2 State flow

| Phase | Visible buttons |
|---|---|
| Preview opened | "Generate Image", "Edit Entry" |
| Image generating (≥150ms) | "Generate Image" → spinner + "Generating…" disabled |
| Image ready | "Share on WhatsApp", "Download Image", "Edit Entry" + small "Image ready" green text above stack |
| Share success | Toast "Shared to WhatsApp" — modal stays open |
| Share failure | Toast "Couldn't open share sheet — image was downloaded instead." Buttons stay; download already triggered. |

A small **image thumbnail** (180px wide, aspect of the canvas, centered, soft border) appears between the summary card and the action stack once the image is ready, so the worker knows the image was actually rendered.

#### 5.3.3 Highlighted incomplete entries

If preview was opened with incomplete CNC entries:
- top of the modal shows a `warning-50` strip with `warning-600` text:
  ```
  ⚠ 1 CNC entry is incomplete and will not be included in the summary.
  ```
- the live summary already excludes incomplete entries (does not show "Avinash | M? | Hex ?"),
- the underlying entry screen (when "Edit" is tapped) re-shows the incomplete card with a soft warning banner inside it.

### 5.4 Screen 3 — Add New Person modal

Bottom sheet on mobile, centered modal on desktop.

#### 5.4.1 Mobile bottom sheet anatomy

```text
┌─────────────────────────────────────┐
│ ┈┈┈┈                                │  ← drag handle (visual only)
│                                     │
│  Add New Person                     │  ← heading/lg
│  Add a new operator to this device. │  ← body/md, --text-muted
│                                     │
│  Person Name                        │  ← body/sm label
│  [ Type a name…              ]      │  ← input, body/lg, autoFocus
│                                     │
│  This name will be saved on this    │  ← caption, --text-muted
│  phone for future entries.          │
│                                     │
│  [   Cancel   ] [   Add Person  ]   │  ← secondary + primary
└─────────────────────────────────────┘
```

- Sheet padding `space-5` × `space-5` × `safe-area + space-5` (top, sides, bottom).
- Drag handle: 40px × 4px, `--border-strong`, radius 999, `space-3` top margin.
- Buttons row: equal width on mobile.
- "Add Person" disabled until input has trimmed length ≥ 1.

#### 5.4.2 Behavior

- Open: input is auto-focused, IME shows.
- Submit: trim, validate non-empty, validate not duplicate (case-insensitive match against `basePeople ∪ customPeople`).
- On success:
  - persist to `localStorage` under `productionEntry.customPeople`,
  - close sheet,
  - the Operator field that triggered the modal auto-selects the new name,
  - global toast "Added Avinash" (3s).
- On duplicate:
  - inline error under input, `body/sm`, `--danger-600`: "This person is already in the list."
  - "Add Person" stays disabled until the input changes.
- Esc / backdrop tap / Cancel: discards.

#### 5.4.3 People list source-of-truth

```ts
const basePeople = ['Avinash', 'Raju', 'Sonu'];               // hardcoded V1 seed
const customPeople = JSON.parse(localStorage.getItem(KEY) ?? '[]');
const people = uniqueCaseInsensitive([...basePeople, ...customPeople]);
```

Operator selects in CNC and Repair both read from this same `people` array. Do not duplicate state.

---

## 6. Component Anatomy

This section defines the shared building blocks. A working app should implement each as a real component with the props listed.

### 6.1 CNC Entry Card

The most-touched component. It must feel **calm** and **unintimidating** even though it has 9+ fields.

#### 6.1.1 Outer shape

- Background: `--bg-card`.
- Border: 1px `--border-soft`.
- Radius: 16.
- Shadow: `shadow-sm`.
- Padding: `space-4` (mobile), `space-5` (≥380px wide).
- Width: 100% of column.

#### 6.1.2 Header row

```text
CNC Entry 1                          7.83 hrs
Avinash · M1 · 1/2 · Side 1          ←(secondary line, only when fields present)
                                  [Duplicate] [Remove]
```

- Title `heading/sm`.
- Hours pill on the right:
  - When valid: `body/md` weight 700, `--text-primary`, tabular-nums.
  - When incomplete: caption "Incomplete", `--warning-600`, no number.
- Secondary identity line: only renders when at least operator/machine/size are filled. `body/sm` `--text-muted`. Helps the worker re-identify cards after collapsing.
- Action buttons (Duplicate, Remove): icon-with-label, ghost style, height 36, padding `0 12px`, `--text-secondary`. Remove gets `--danger-600` only on the confirm step (see §6.1.6).

#### 6.1.3 Body — field grid

Two-column grid on screens ≥360px, single column below.

Field order (from `frontend_ui_spec.md` §13.4):

```
[ Operator              ]  [ Machine            ]
[ Hex                   ]  [ Size               ]
[ Side                  ]  [ Cycle Time         ]
[ Time In               ]  [ Time Out           ]
[ Parts Count           ]  [ Production Hours   ]
```

Field cell anatomy:

```text
Label                                ← body/sm, --text-secondary, weight 500
[control]                            ← per-component anatomy
helper / error                       ← caption, color depends on state
```

Label-to-control gap: `space-2`. Control-to-helper gap: `space-1`.

#### 6.1.4 Operator field

A custom-styled `<select>` (or a button-opens-bottom-sheet on mobile if implementation budget allows). For V1 a styled native `<select>` is fine.

```text
Operator
[ Avinash                          ▼ ]
+ Add new person                       ← inline ghost link below the select
```

- Native select: height 48, padding `0 12px`, radius 12, border 1px `--border-soft`, body/lg.
- "+ Add new person": `body/sm`, `--accent-600`, weight 600, `space-1` top margin, no underline at rest, underline on hover.

#### 6.1.5 Machine field

8 chips in a 4×2 grid:

```text
[ M1 ] [ M2 ] [ M3 ] [ M4 ]
[ M5 ] [ M6 ] [ M7 ] [ M8 ]
```

- Each chip: height 44, min-width 56, radius 999, body/lg, weight 600, tabular-nums.
- Default: `--bg-sunken` background, `--text-secondary` text.
- Selected: `--accent-600` background, `--text-inverse` text, `shadow-sm`.
- Tap target ≥44px on all sides — the visible chip is 44px tall but the hit area pads `space-1` outside.
- 140ms ease-out color transition on select.

#### 6.1.6 Hex field

Number input + chip rail underneath:

```text
[       41        ]
Common: 37  41  55  60  65
```

- Input height 48, right-aligned, `inputmode="numeric"`, body/lg.
- Validation: integer 0–100. On out-of-range: caption `--danger-600` "Hex must be between 0 and 100."
- Common-values rail: chips height 32, `space-2` gap, `--bg-sunken`. Tapping a chip writes that value into the input. The currently-selected value (if it matches a chip) shows the chip in `--accent-600` fill.
- The rail is purely a shortcut — it does not constrain input. Free-typing 43 is fine.

#### 6.1.7 Size field

A `<select>` with a fixed list and a special "Custom…" option that swaps it into a free-text input:

```
Sizes:
  1/2, 3/4, 1 inch, 1-1/2, 2 inch, 2-1/2, 3 inch, Custom…
```

When "Custom…" is selected, the field morphs into a text input with a small "← back to list" link below it. The list is hardcoded in V1 per `frontend_ui_spec.md` §17.

#### 6.1.8 Side field

2-segment segmented control, identical visual to the Shift control but smaller (height 40):

```text
[ Side 1 ] [ Side 2 ]
```

Default: Side 1 selected.

#### 6.1.9 Cycle Time field

A single field cell that visually contains two number inputs joined into one control:

```text
Cycle Time
┌──────────────────────────────────────┐
│  [   2  ] min     [   26  ] sec      │
└──────────────────────────────────────┘
```

- Outer container has the field border (1px `--border-soft`, radius 12).
- Each inner input has no border of its own — the visual frame is the container.
- A 1px `--border-soft` divider sits between minutes and seconds.
- "min" / "sec" suffixes are `caption`, `--text-muted`, inside the container, non-editable.
- Validation: minutes ≥ 0, seconds 0–59, total > 0. Inline error appears under the container.

#### 6.1.10 Time In / Time Out

Side-by-side `<input type="time">` fields on screens ≥360px wide; stacked below.

Default values follow shift logic from `requirements.md` §6:

| Shift | Time In | Time Out |
|---|---|---|
| Morning | 08:30 | 18:30 |
| Evening | 19:00 | 21:30 |

Smart-copy rules (`frontend_ui_spec.md` §20.4):
- When a new CNC entry is added, it inherits Time In/Out from the previous CNC entry — not from shift default — unless the previous entry has the empty defaults.
- When the shift is changed, only entries whose time fields are still untouched are updated.
- "Untouched" tracking: each CNC entry tracks `timeInTouched` / `timeOutTouched` flags that flip true on user edit. Shift changes propagate only to entries where the flag is false.

Validation: `timeOut > timeIn` (string compare on `HH:MM` works for all same-day shifts; for shifts that cross midnight, interpret end as next-day — V1 assumes same-day).

#### 6.1.11 Parts Count field

Large right-aligned number input with a `pcs` suffix:

```text
Parts Count
[              193 ]  pcs
```

- Height 56 — slightly taller than other inputs because this is the most-typed field.
- `font-size: 22px`, weight 600, tabular-nums.
- `inputmode="numeric"`, `pattern="[0-9]*"`.
- "pcs" suffix lives inside the field at the right edge, `--text-muted`, `body/md`.
- On focus, content is selected (so a worker can type over an existing value without clearing).

#### 6.1.12 Production Hours display

This is **not** an input. It's a calculated read-only readout that occupies the same grid cell that an input would.

```text
Production Hours
┌──────────────────────────────────────┐
│                              7.83 hrs │
└──────────────────────────────────────┘
```

- Container background: `--accent-50` when valid, `--bg-sunken` when pending.
- Number: `display/lg`, weight 700, tabular-nums, `--accent-600` when valid, `--text-muted` when pending.
- "hrs" suffix: `body/md`, `--text-secondary`, `space-1` left of the number.
- When pending, render "—" instead of "0.00" to avoid implying a real result.

This visual elevation is the moment the worker realizes "the app did the math for me."

#### 6.1.13 Card warning banner

When the card is incomplete and Preview was attempted:

```text
┌──────────────────────────────────────┐
│ ⚠  Please complete this entry.       │  ← --warning-50 bg, --warning-600 text
└──────────────────────────────────────┘
```

Renders at the top of the card body (above the field grid). Auto-clears once the missing fields are filled.

#### 6.1.14 Remove confirmation

If the card has any non-default data, tap on Remove flips the action area into an inline confirm:

```text
                          Remove this entry?  [Cancel]  [Remove]
```

- "Remove" button here is `--danger-600` fill, `--text-inverse`.
- This replaces the Duplicate/Remove buttons inline, no modal — so it stays in context.
- If the card is blank/default, tap on Remove deletes immediately with no confirm.
- After successful remove, a toast "Entry removed · Undo" appears for 4s with a tap target to restore.

### 6.2 Burma Card

Already specified in §5.1.7. No additional component anatomy needed.

### 6.3 Repair Card

Already specified in §5.1.8. No additional component anatomy needed.

### 6.4 Summary Card (the PNG artifact)

This is the most important visual component for the receiver (the owner reading WhatsApp). It must:
- be readable on a phone after WhatsApp's compression,
- look like a **document**, not like a screenshot of a form,
- print well,
- never depend on web fonts that might not load.

#### 6.4.1 Canvas dimensions

Render at **1080 × dynamic height** at 2× device-pixel-ratio. 1080 wide is WhatsApp's default delivered width and survives compression cleanly.

The DOM that gets converted via `html2canvas` lives in a hidden container styled to **540px** wide; html2canvas captures at `scale: 2` to produce the 1080-wide PNG.

#### 6.4.2 Visual structure

```
┌────────────────────────────────────────────┐
│                                            │
│   Daily Production Summary                 │ ← display/xl, weight 700
│   05 May 2026 · Morning Shift              │ ← body/lg, --text-muted
│                                            │
│   ─────────────────────────────────────    │ ← 1px --border-soft
│                                            │
│   CNC Production                           │ ← heading/md weight 700
│                                            │
│   1.  Avinash · M1 · Hex 41                │ ← body/lg
│       Size 1/2 · Side 1                    │ ← body/md, --text-muted
│       Cycle 2m 26s · Count 193 · 7.83 hrs  │ ← body/md, tabular-nums
│                                            │
│   2.  Raju · M3 · Hex 55                   │
│       Size 3/4 · Side 2                    │
│       Cycle 1m 45s · Count 240 · 7.00 hrs  │
│                                            │
│   Total CNC Hours              14.83 hrs   │ ← display/lg, weight 700, right
│                                            │
│   ─────────────────────────────────────    │
│                                            │
│   Burma Production                         │
│   Burma 1                          120     │
│   Burma 2                          150     │
│   Burma 3                           90     │
│   Total Burma                      360     │ ← display/lg right, weight 700
│                                            │
│   ─────────────────────────────────────    │
│                                            │
│   Repair                                   │
│   Avinash · 20 pcs · Thread repair         │
│                                            │
│   ─────────────────────────────────────    │
│                                            │
│   Notes                                    │
│   Machine 4 setting took extra time.       │
│                                            │
└────────────────────────────────────────────┘
```

#### 6.4.3 Rules for the summary card

- White background. Always.
- Padding: 32px all sides at the 540px source width.
- No icons inside the PNG. Glyphs render unreliably across devices when WhatsApp compresses.
- Section divider: 1px `--border-soft`, `space-6` margin top and bottom.
- All numbers use tabular-nums and right-align in their column.
- Repair section is omitted entirely if all fields are empty.
- Notes section is omitted entirely if blank.
- If there are zero valid CNC entries, the CNC section shows a small "No CNC entries" muted line (don't omit — owner should still see the total Burma).
- Footer line, smallest, `caption`, `--text-muted`, right-aligned: `Generated 05 May 2026 · 18:42`. This helps the receiver distinguish today's summary from yesterday's at a glance in the WhatsApp gallery.

#### 6.4.4 Long-list overflow

The card grows vertically — no height cap. With 10+ CNC entries, the resulting PNG might be ~2400px tall. That is fine for WhatsApp.

If 20+ entries, switch the CNC list rendering from 3-line-per-entry to 1-line-per-entry compact mode (single line: `Avinash · M1 · Hex 41 · 1/2 · S1 · 2m 26s · 193 · 7.83 hrs`). Trigger threshold: `cncEntries.length > 12`.

### 6.5 Sticky Action Bar

Already specified in §5.2.

### 6.6 Toast / Inline feedback

A single toast slot at the bottom of the viewport, just above the sticky action bar, never overlapping it.

```text
[ ✓  Added Avinash             ]
```

- Width: `min(420px, calc(100% - 32px))`, centered.
- Height auto, padding `space-3` × `space-4`.
- Background: `--text-primary` (dark pill on light app — high contrast).
- Text: `body/md`, weight 500, `--text-inverse`.
- Radius 12.
- Shadow `shadow-lg`.
- Auto-dismiss 3s for info, 4s for actionable (with Undo).
- Stack: at most one toast at a time. New toast replaces existing.

Variants by leading glyph (kept simple):
- `✓` success (`--success-600` glyph color)
- `⚠` warning (`--warning-600` glyph color)
- `✕` error (`--danger-600` glyph color)
- (none) neutral

### 6.7 Buttons (catalog)

| Variant | Background | Border | Text | Use |
|---|---|---|---|---|
| Primary | `--accent-600` | none | `--text-inverse` | Preview Summary, Generate Image, Share on WhatsApp, Add Person |
| Secondary | `--bg-card` | 1px `--border-strong` | `--text-primary` | Edit Entry, Cancel, Download Image (post-share) |
| Ghost | transparent | none | `--text-secondary` | Duplicate, Remove (rest), modal close ✕ |
| Destructive | `--danger-600` | none | `--text-inverse` | Confirm Remove |
| Disabled | base @ 30% opacity | n/a | n/a | Add Person before name typed; Preview when fully empty |

Heights: 48 (primary actions), 44 (secondary actions in lists), 40 (segmented, side toggle), 36 (ghost in card headers), 32 (chips in rails).

All buttons have:
- `cursor: pointer`,
- `:focus-visible` ring: 3px `--accent-50` + 1px `--accent-600`,
- press state: 96% scale + accent-700 fill (or equivalent darkening) for 80ms.

### 6.8 Inputs (catalog)

All editable inputs share:
- height 48 (base),
- padding `0 14px`,
- radius 12,
- border 1px `--border-soft`,
- background `--bg-card`,
- font-size 17px (body/lg) — important for iOS no-zoom,
- placeholder color `--text-disabled`.

Focus state:
- border `--border-focus`,
- box-shadow `0 0 0 4px var(--accent-50)`.

Error state:
- border `--danger-600`,
- helper text below in `--danger-600`.

Disabled state:
- background `--bg-sunken`,
- color `--text-disabled`,
- border `--border-soft`,
- cursor `not-allowed`.

Numeric inputs additionally:
- `inputmode="numeric"`,
- `pattern="[0-9]*"`,
- `font-variant-numeric: tabular-nums`,
- text-align `right` for parts/burma counts; `left` for hex; centered for cycle minutes/seconds inside the joined cycle-time control.

---

## 7. State Anatomy

State coverage matrix for components that have multiple meaningful states.

### 7.1 CNC Entry Card states

| State | Trigger | Visual |
|---|---|---|
| Default (empty) | Just added | All fields empty, hours pill says "Incomplete" in `--warning-600` (no fill), card otherwise normal |
| Partial | Some required fields filled | hours pill still "Incomplete"; identity subtitle line populated where possible |
| Valid | All required fields filled | hours pill shows computed hours in `--text-primary`, identity subtitle complete |
| Warned | Cycle time <20s or >10min, or hours exceed shift window | small `caption` `--warning-600` line under the relevant input; card itself unchanged |
| Errored (preview-attempted) | User pressed Preview while incomplete | card warning banner at top (§6.1.13), missing fields gain error border |
| Removing (confirm) | Remove tapped on non-empty | header action area replaced by inline confirm strip |

### 7.2 Sticky Action Bar states

| State | Trigger | Visual |
|---|---|---|
| At rest, has data | ≥1 valid entry | accent CTA, totals show |
| At rest, empty | All entries empty AND Burma all 0 | CTA disabled @ 30% opacity, totals show 0.00 |
| Has incomplete entries | ≥1 incomplete CNC entry but some content exists | CTA enabled, ⚠ glyph prepended to label |
| Scrolled | scroll > 0 | shadow-md + 1px border-soft top |
| Loading (rare) | image generating from this bar — N/A in V1 | — |

### 7.3 Live Totals strip states

| State | Visual |
|---|---|
| All zero | Numbers `0` / `0.00` in `--text-muted` |
| Updating | 160ms cross-fade |
| One value high enough to wrap | Numbers shrink one step (display/lg → heading/lg) before wrapping |

### 7.4 Summary Preview states

| State | Visual |
|---|---|
| Open, no image yet | Summary card visible, "Generate Image" CTA primary |
| Generating | CTA → spinner + "Generating…" |
| Image ready | Thumbnail appears, Share + Download appear, success caption "Image ready" |
| Share success | Toast "Shared to WhatsApp" |
| Share API unavailable | "Share on WhatsApp" CTA does direct download + opens `whatsapp://send?text=…` (text fallback) |
| Generation failure | Toast "Couldn't generate image. Please try again." CTA returns to "Generate Image" |

### 7.5 Add New Person modal states

| State | Visual |
|---|---|
| Open | Input auto-focused, IME up, "Add Person" disabled |
| Valid name | "Add Person" enabled |
| Duplicate | Inline error, "Add Person" disabled |
| Submitting | "Add Person" → spinner; usually instant |
| Success | Sheet closes, toast "Added X" |
| Error (storage full) | Inline error "Couldn't save. Try again." |

---

## 8. Copy Guidance

Voice rules:
- Plain operational English. Imperative when giving instruction.
- Never use ERP-language ("entity", "record", "submission").
- Never apologize for the user.
- Never say "please wait" — show a spinner and shut up.

### 8.1 Headlines

| Surface | Copy |
|---|---|
| App header | "Production Entry" |
| App subtitle | "Today's CNC & Burma work" |
| CNC section title | "CNC Production" |
| CNC section subtitle | "Add one entry per machine + size + side." |
| Burma section title | "Burma Production" |
| Repair section title | "Repair Work" |
| Notes section title | "Notes" |
| Summary modal title | "Production Summary" |
| Add Person modal title | "Add New Person" |
| Add Person subtitle | "Add a new operator to this device." |

### 8.2 Field labels

Short, capitalized in title case, no colon:

```
Operator
Machine
Hex
Size
Side
Cycle Time
Time In
Time Out
Parts Count
Production Hours
Burma 1 / Burma 2 / Burma 3
Total Burma Count
Repair Person
Repair Count
Repair Note
Notes
```

### 8.3 Buttons

| Action | Copy |
|---|---|
| Primary CTA | "Preview Summary" |
| Add CNC | "+ Add CNC Entry" |
| Add Person | "+ Add new person" (inline) / "Add Person" (modal CTA) |
| Modal cancel | "Cancel" |
| Card duplicate | "Duplicate" |
| Card remove | "Remove" → confirm "Remove" |
| Generate | "Generate Image" |
| Share | "Share on WhatsApp" |
| Download | "Download Image" |
| Edit | "Edit Entry" |

### 8.4 Helpers and validations

Use simple second-person where appropriate.

| Situation | Copy |
|---|---|
| Hex out of range | "Hex must be between 0 and 100." |
| Seconds out of range | "Seconds should be 0 to 59." |
| Cycle time zero | "Cycle time can't be zero." |
| Cycle time too low | "Cycle time looks low — please confirm." |
| Cycle time too high | "Cycle time looks high — please confirm." |
| Production exceeds shift | "Hours exceed shift window — please check count or cycle." |
| Required field missing | "Required" (inline next to label, `caption`, `--danger-600`) |
| Time out before time in | "Time Out should be after Time In." |
| Person blank | "Please enter a name." |
| Person duplicate | "This person is already in the list." |
| Empty preview attempt | "Add an entry first." (toast on disabled CTA tap) |
| Preview with incomplete | "1 CNC entry is incomplete and won't be included." |
| Image generated | "Image ready." |
| Shared | "Shared to WhatsApp." |
| Share fallback | "Image saved to your phone. Share it manually in the group." |
| Downloaded | "Image downloaded." |
| Person added | "Added [name]." |
| Entry removed | "Entry removed · Undo" |

### 8.5 Empty states

| Surface | Copy |
|---|---|
| All CNC entries removed | "No CNC entries yet. Tap + Add CNC Entry to start." |
| Burma fields all blank | (no copy — show "0" silently) |
| Notes blank | (placeholder only) |

---

## 9. Responsive Notes

V1 is mobile-first. Three viewport bands.

### 9.1 < 360px (small Android)

- Card padding drops from 16 → 12.
- Time In / Time Out stack vertically.
- CNC field grid collapses from 2-col to 1-col.
- Live totals tile labels can wrap to 2 lines.
- Sticky action bar reduces CTA padding to keep one row.

### 9.2 360–479px (mainstream Android, iPhone SE)

- Default tuned design.
- 2-col CNC field grid.
- Side-by-side Time In / Time Out.
- 4×2 machine chip grid.

### 9.3 ≥480px (small tablets, desktop centered)

- App container hits its 480px max width.
- Left and right of container: `--bg-app` empty space.
- Optionally render a soft watermark on desktop background — out of scope V1.
- Card padding goes from 16 → 24.
- Add Person and Summary become centered modals (not bottom sheets).

The app is **not** redesigned for desktop. Even on a 1440px monitor, the user sees a 480px-wide phone-app centered on the screen. This is intentional — it's a mobile utility.

---

## 10. Iconography

Minimal. The app uses **at most** these glyphs:

| Glyph | Source | Use |
|---|---|---|
| 📅 | calendar | inside date input — actually rendered by browser, do not draw our own |
| ✕ | close | modal close |
| ← | back | summary modal back |
| + | plus | "+ Add CNC Entry", "+ Add new person" |
| ⚠ | warning | inline validation, sticky CTA warn state |
| ✓ | check | toast success |
| 🗑 / Trash | icon | Remove (optional — can be text-only) |

Use Heroicons (outline, 20px) or equivalent SVG for ⚠ ✓ ✕ ← +. Do not load an icon font.

The PNG summary card has **zero** icons — text only — to survive WhatsApp compression.

---

## 11. Accessibility

V1 must pass these basics:

- All interactive controls reachable by tab.
- Focus ring visible on every focusable element (3px halo, see §6.7).
- All color contrast ≥4.5:1 for body text, ≥3:1 for large text and UI elements (verify with the chosen palette — the spec values pass).
- Native semantic elements wherever possible (`<button>`, `<select>`, `<input type="time">`, `<input type="date">`, `<textarea>`).
- Labels are `<label for>` or wrap their input — not `aria-label` only.
- Modal traps focus while open and restores it on close.
- Toast uses `role="status"` (polite); no aria-live shouting.
- `prefers-reduced-motion` honored (§3.6).
- Language: `<html lang="en">`. (Hindi/Punjabi support is out of V1 per `requirements.md` §26.)

---

## 12. Data Model (for the working app)

The app holds a single state object. This mirrors `frontend_ui_spec.md` §39 with a few additions for the working version:

```ts
type ProductionEntryState = {
  date: string;                    // 'YYYY-MM-DD'
  shift: 'morning' | 'evening';
  people: string[];                // basePeople ∪ customPeople, deduped (case-insensitive)
  cncEntries: CncEntry[];
  burma: { burma1: number; burma2: number; burma3: number };
  repair: { person: string; count: number; note: string };
  notes: string;
  ui: {
    incompleteHighlights: boolean; // turned on after first failed Preview
  };
};

type CncEntry = {
  id: string;                      // crypto.randomUUID()
  operator: string;
  machine: '' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8';
  hex: number | null;
  size: string;
  side: 1 | 2 | null;
  cycleMinutes: number | null;
  cycleSeconds: number | null;
  timeIn: string;                  // 'HH:MM' 24h
  timeOut: string;
  partsCount: number | null;

  // Derived (recomputed; not the source of truth, but cached for UI)
  productionHours: number | null;

  // Tracking
  timeInTouched: boolean;
  timeOutTouched: boolean;
};
```

### 12.1 Persistence

- `localStorage` key prefix: `productionEntry.v1.*`
- Saved keys:
  - `productionEntry.v1.draft` — full state, debounced 400ms on change. Restored on next open if same date.
  - `productionEntry.v1.customPeople` — string[] of operator names added via the modal.
  - `productionEntry.v1.lastSubmitted` — timestamp of last successful share, used for "Resume yesterday's draft? Yes / Discard" prompt if today is different.

### 12.2 Calculations (single source of truth)

All derivations are computed in pure functions consumed by the view. No two places should compute hours.

```ts
function entryProductionHours(e: CncEntry): number | null {
  if (!e.cycleMinutes && !e.cycleSeconds) return null;
  if (!e.partsCount) return null;
  const cycleSec = (e.cycleMinutes ?? 0) * 60 + (e.cycleSeconds ?? 0);
  if (cycleSec <= 0) return null;
  return Math.round((cycleSec * e.partsCount / 3600) * 100) / 100;
}

function totalCncHours(s: ProductionEntryState): number {
  return s.cncEntries
    .map(entryProductionHours)
    .filter((x): x is number => x != null)
    .reduce((a, b) => a + b, 0);
}

function totalBurma(s: ProductionEntryState): number {
  return (s.burma.burma1 || 0) + (s.burma.burma2 || 0) + (s.burma.burma3 || 0);
}
```

### 12.3 Validation rules (from `requirements.md` §11)

Hard-blocking errors (prevent inclusion in summary, surface red): operator blank, machine missing, hex out-of-range, side missing, cycleSec === 0, partsCount ≤ 0, timeOut ≤ timeIn.

Soft-warns (still allow): cycleSec < 20, cycleSec > 600, hours > shift window, partsCount > 1000.

Validation timing:
- Field-level errors fire on blur for required fields, immediately on change for range errors.
- Card-level "complete this entry" banner appears only after the first Preview attempt.
- The Preview modal can always be opened (it just excludes incomplete entries and shows the warning strip).

---

## 13. Workflow Choreography

A precise walkthrough of the happy path, used as the choreography reference for the implementation:

```
T0  user opens app
    → date set to today
    → shift defaults to Morning
    → 1 empty CNC card visible
    → live totals all 0
    → sticky CTA disabled (no data yet)

T1  user picks shift = Evening (if needed)
    → Time In/Out defaults of all untouched CNC entries flip to 19:00 / 21:30
    → header subtitle stays "Today's CNC & Burma work"

T2  user fills CNC Entry 1: operator → machine → hex → size → side
    → identity line on the card builds up live: "Avinash · M1 · 1/2 · Side 1"

T3  user fills cycle time (2m 26s) and parts count (193)
    → Production Hours cell goes from "—" to "7.83 hrs" with --accent-50 background
    → Live Totals: CNC HOURS 0.00 → 7.83 (160ms cross-fade)
    → Sticky bar Total CNC: 0.00 → 7.83
    → Sticky CTA enabled

T4  user taps + Add CNC Entry
    → new card slides in (220ms)
    → operator, machine, hex, size, side blank
    → cycle time blank
    → time in / time out copied from Entry 1 (smart copy)
    → live totals: ENTRIES 1 → 2

T5  user fills Burma 1 = 500
    → live totals: BURMA 0 → 500
    → Burma card footer total updates

T6  user taps Preview Summary
    → if all complete: full-screen modal slides up (260ms)
    → summary card rendered with real values
    → "Generate Image" CTA primary

T7  user taps Generate Image
    → button → "Generating…" with spinner
    → html2canvas runs at scale 2 on the hidden 540-wide DOM clone
    → ~150-700ms later: thumbnail appears, "Image ready" caption, Share + Download visible

T8  user taps Share on WhatsApp
    → if Web Share API supports files: navigator.share({ files: [pngFile], title, text })
    → user picks WhatsApp from share sheet
    → toast "Shared to WhatsApp"

T9  fallback path (no file share): PNG downloads + whatsapp://send?text=<plain-text-summary> opens
    → toast "Image saved to your phone. Share it manually in the group."
```

---

## 14. Edge Cases

| Case | Behavior |
|---|---|
| User opens app at 23:55 and it ticks past midnight | Date does not auto-change while the app is open; header date stays as the value in the date picker. |
| User opens with a previous draft from earlier today | Restore silently. |
| User opens with a draft from a previous day | Banner at top: "You have an unsent entry from 04 May. [Resume] [Start fresh]" |
| 10+ CNC entries | Render normally; ensure scroll performance via virtualization is **not** needed at this scale. |
| 20+ CNC entries | Summary card switches to compact 1-line-per-entry mode (§6.4.4). |
| User pastes non-numeric into a number field | Strip non-digits on input; do not show error. |
| User enters parts count = 999999 | Soft-warn "Please check if count is correct."; allow. |
| Time picker not supported (very old browser) | Fall back to text input with `pattern="[0-9]{2}:[0-9]{2}"` and helper "HH:MM". |
| Web Share API absent | "Share on WhatsApp" auto-falls back to download + text-only `whatsapp://send`. |
| html2canvas fails (rare CORS / canvas taint) | Toast error, keep summary modal open, offer plain-text WhatsApp fallback. |
| User offline | App fully functional. Persistence to localStorage works. Share works (it's local). |
| Phone's storage full | localStorage write fails silently → in-memory state preserved for the session, banner: "Couldn't save draft. Finish and share before closing." |
| User rotates to landscape | Layout still capped at 480px. Lots of empty space — fine. |
| Text size set very large by OS | All sizes are rem-based; layout adapts. Avoid absolute pixel sizes for type. |

---

## 15. Implementation Notes

This section is the bridge from the design doc into a real working build. Engineer-readable.

### 15.1 Recommended stack

This is a **fully working** mobile web app, not a single HTML file. Recommended stack:

- **Vite + React + TypeScript** — fastest dev cycle for a small SPA, ships clean static bundle.
- **Tailwind CSS** with custom theme tokens mirroring §3.2.
- **html2canvas** (or `dom-to-image-more` if html2canvas's text-rendering quirks bite on Android) for PNG generation.
- **No router** — single screen. Modals are local React state.
- **No global state library** — `useReducer` over the `ProductionEntryState` is sufficient. Optional: Zustand if the team already uses it.
- **No backend in V1** — all persistence is `localStorage`.
- **Service worker** with Workbox for offline shell + PWA install (optional but cheap; lets workers add the app to home screen).

Suggested file structure:

```
src/
  main.tsx
  App.tsx
  state/
    reducer.ts
    selectors.ts          // entryProductionHours, totalCncHours, totalBurma
    persistence.ts        // localStorage read/write, debounced
  components/
    Header.tsx
    DateShiftCard.tsx
    LiveTotalsStrip.tsx
    cnc/
      CncSection.tsx
      CncEntryCard.tsx
      OperatorSelect.tsx
      MachineGrid.tsx
      HexInputWithChips.tsx
      SizeSelect.tsx
      SideToggle.tsx
      CycleTimeInput.tsx
      TimeRangeInput.tsx
      PartsCountInput.tsx
      ProductionHoursDisplay.tsx
    BurmaCard.tsx
    RepairCard.tsx
    NotesCard.tsx
    StickyActionBar.tsx
    summary/
      SummaryModal.tsx
      SummaryCard.tsx     // the PNG-target DOM
      ShareActions.tsx
    AddPersonModal.tsx
    primitives/
      Button.tsx
      Input.tsx
      Select.tsx
      Segmented.tsx
      Chip.tsx
      Toast.tsx
      Sheet.tsx
  styles/
    tokens.css            // CSS variables from §3.2
    base.css
  utils/
    png.ts                // html2canvas wrapper, blob → File
    share.ts              // Web Share API + fallbacks
    format.ts             // Intl.NumberFormat etc.
index.html
tailwind.config.ts
vite.config.ts
```

### 15.2 PNG generation

```ts
// utils/png.ts
import html2canvas from 'html2canvas';

export async function captureSummary(node: HTMLElement): Promise<File> {
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#FFFFFF',
    useCORS: false,
    logging: false,
    windowWidth: 540, // matches the source DOM width
  });
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/png')
  );
  const fname = `production-summary-${dateSlug()}-${shiftSlug()}.png`;
  return new File([blob], fname, { type: 'image/png' });
}
```

The summary DOM lives in a hidden absolutely-positioned container while capturing (`top: -10000px`), then is unmounted. The visible modal renders its own copy with the same component for visual fidelity — the captured one is the "source-of-truth" render at exact 540px.

### 15.3 Web Share API + fallbacks

```ts
// utils/share.ts
export async function shareSummary(
  file: File,
  textFallback: string
): Promise<'shared' | 'downloaded' | 'failed'> {
  // 1) Best path: native share with file
  if (
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: 'Production Summary',
      });
      return 'shared';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'failed';
      // fall through to download
    }
  }

  // 2) Fallback: download + open WhatsApp with text
  downloadFile(file);
  window.location.href = `whatsapp://send?text=${encodeURIComponent(textFallback)}`;
  return 'downloaded';
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

### 15.4 Persistence (debounced)

```ts
// state/persistence.ts
const DRAFT_KEY = 'productionEntry.v1.draft';
const PEOPLE_KEY = 'productionEntry.v1.customPeople';

export const saveDraft = debounce((state: ProductionEntryState) => {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); }
  catch { /* storage full — handled in UI banner */ }
}, 400);

export function loadDraft(): ProductionEntryState | null {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null'); }
  catch { return null; }
}
```

A side-effect subscriber in the App calls `saveDraft(state)` on every state change.

### 15.5 Validation timing

Implement `validateEntry(e: CncEntry): ValidationReport` and run:
- in real time for soft warns shown under fields,
- on blur for hard required-field errors only when `state.ui.incompleteHighlights === true` (set true the first time Preview is tapped),
- on Preview tap to compute the count of incomplete entries for the summary banner.

### 15.6 What this app must really do (vs. visualize)

Because this is a working app:

1. The PNG must be a real PNG, not a screenshot of a dummy summary. `captureSummary` runs against live state.
2. The share button must really open the native share sheet on Chrome/Android, with the file attached. Verified path: deploy to HTTPS (required for Web Share API).
3. localStorage must really persist across reloads and across days, with the day-rollover prompt working.
4. Validation must really run and prevent meaningless data from showing in the summary.
5. The app must work fully offline after first load (service worker shell cache).
6. The PWA manifest must allow Add-to-Home-Screen with the right icons and `display: standalone`.

### 15.7 Out of scope for V1 (deliberate)

- No login.
- No backend write.
- No analytics.
- No user roles.
- No history view.
- No Hindi/Punjabi labels.
- No multiple-repair-row support.
- No machine downtime tracking.
- No expense/sales modules.
- No dark mode.

These are explicitly listed in `requirements.md` §24 and reaffirmed here so they don't drift in.

### 15.8 Build / deploy

- Build: `vite build` → static `dist/`.
- Host: any static host (Netlify / Vercel / Cloudflare Pages / GitHub Pages with HTTPS — required for Web Share API and service workers).
- HTTPS is non-negotiable.
- Use Vite's `--base` if hosted on a sub-path.
- Lighthouse target on a mid-tier Android: PWA installable, performance ≥85, accessibility ≥95.

---

## 16. Quality Bar

This document is "done" if a competent implementer can read it and say:

> I know exactly what to render at every pixel, what every state looks like, what every interaction does, how the PNG is produced, how the share works, where data is stored, and what is explicitly out of scope.

If they still need to make a substantive design decision while coding, this document failed to do its job and should be tightened — not the implementation drifted away from it.

---

## 17. Source-of-truth Reminder

When this document and an upstream document conflict:

```
requirements.md  >  frontend_ui_spec.md  >  this document
```

When this document and the implementation conflict, the implementation must change — not this document.

When this document is changed during the build, update the changelog at the bottom and re-circulate before merging UI changes.

---

## 18. Changelog

| Date | Change | Reason |
|---|---|---|
| 2026-05-05 | Initial draft. | Created from `requirements.md` v1 and `frontend_ui_spec.md` v1, retargeted from "single-file HTML visualization" to "fully working deployable web app" per project owner. |
