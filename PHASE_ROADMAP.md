# PHASE_ROADMAP — Production Entry Mobile App

## Context

### Final artifact

A **fully working, deployable mobile-first web app** that lets a factory worker enter a day's CNC + Burma + Repair + Notes data on their phone, generates a clean PNG summary, and shares it on WhatsApp.

This is **not** an HTML visualization. It is a real, installable, offline-capable PWA backed by `localStorage`, served over HTTPS.

### Build constraints

- **Stack**: Vite + React 18 + TypeScript + Tailwind CSS.
- **No backend in V1.** All persistence is `localStorage`.
- **No router.** Single screen with two overlay surfaces (Summary Preview, Add Person).
- **No global state library.** A single `useReducer` over `ProductionEntryState`.
- **PNG generation**: `html2canvas` (fallback `dom-to-image-more` if Android text rendering misbehaves).
- **Sharing**: native Web Share API with files, falling back to download + `whatsapp://send` text intent.
- **Hosting**: any static HTTPS host (Netlify / Vercel / Cloudflare Pages / GitHub Pages).
- **Mobile-first**, viewport capped at `max-width: 480px` even on desktop.
- **Browser targets**: modern Android Chrome (90+) and iOS Safari (15+). No IE, no legacy Edge.

### Source of truth

When phases conflict with documents, this order wins:

1. `requirements.md`
2. `frontend_ui_spec.md`
3. `detailed_ui_ux_design.md`
4. this roadmap
5. per-phase plan docs

### Estimated size

| Layer | Approx. LOC |
|---|---:|
| TSX components | ~2,800 |
| State / reducers / selectors | ~350 |
| Utils (png, share, format, persistence) | ~300 |
| Tokens + base CSS | ~250 |
| Tailwind config | ~80 |
| Tests (smoke, calc, validation) | ~250 |
| **Total** | **~4,000 LOC** |

Per `03_phase_roadmap_standard.md` §4.3, ~4,000 LOC of working app code maps to **8–12 phases**. We've chosen 12, with three of those being deliberately compact to keep visible-progress cadence high (one phase ≈ one demo-able win).

### Why 12 phases (not 8)

The CNC Entry Card is the most-touched surface in the app and contains nine field types. Bundling its identity fields (operator/machine/hex/size/side) and production fields (cycle/time/parts/hours) into a single phase made that phase too broad and risked design drift. We split it into two. We also gave the Summary Preview, the PNG/share pipeline, the Add Person modal, and persistence each their own phase because each is a discrete demo-able milestone — and because each has its own failure modes that deserve their own QA pass.

### Phase cadence rule

Every phase must end with:
- the dev server running,
- the app loadable on a real Android phone over HTTPS preview,
- a visible, demo-able piece of the final UX,
- no broken paths in code already shipped from prior phases.

If a phase can't end that way, it's the wrong phase boundary.

---

## Phase 1 — Foundation & Design Tokens

### What you're building
The empty-but-correct shell of the working app: a Vite + React + TS + Tailwind project with the design tokens from `detailed_ui_ux_design.md` §3 wired into Tailwind, the global app container at 480px max-width with safe-area insets, and a header that reads "Production Entry / Today's date".

### Why this phase exists now
Everything later inherits from this. If the typography ramp, color tokens, spacing scale, radius, shadows, and motion tokens are wrong here, every subsequent component carries the drift. Doing this once, cleanly, before any feature work, prevents two days of retroactive token-substitution later.

### Inputs
- `detailed_ui_ux_design.md` §3 (Global Visual System) — full token tables.
- `detailed_ui_ux_design.md` §4 (Global Shell Rules).
- `frontend_ui_spec.md` §7 (Global App Shell).

### What to implement
1. `npm create vite@latest` → React + TypeScript template.
2. Add Tailwind CSS, configure `tailwind.config.ts` to mirror tokens from `detailed_ui_ux_design.md` §3.2:
   - colors (`bg-app`, `bg-card`, `bg-sunken`, `text-primary`, `text-secondary`, `text-muted`, `accent-600/700/50`, `success-*`, `warning-*`, `danger-*`, `border-soft/strong/focus`),
   - spacing scale (4 → 56),
   - border radius (12, 14, 16, 20, 999),
   - shadow tokens (`sm`, `md`, `lg`),
   - font sizes mapped to the type scale (`display-xl` through `caption`/`micro`).
3. `src/styles/tokens.css` — CSS variables for tokens, set on `:root`. Tailwind reads these via `var(...)`.
4. `src/styles/base.css` — global reset, system font stack, `font-variant-numeric: tabular-nums` on selected utility classes.
5. `App.tsx` — render the 480px-capped container, app background, safe-area-aware top + bottom padding.
6. `Header.tsx` — the sticky-top 56px header with "Production Entry" + "Tuesday · 05 May 2026" subtitle (date computed from `new Date()` for now; will be wired to state in Phase 2).
7. ESLint + Prettier configured.
8. README updated with run/build/deploy instructions.
9. PWA manifest stub (icons can be placeholders; full manifest comes in Phase 12).

### Outcome
Open `npm run dev`, view in mobile viewport: see a centered 480px column with a soft gray background, a clean header showing the date, and the empty space below where everything else will live.

### Acceptance
- [ ] `npm run dev` boots in < 2s.
- [ ] `npm run build` produces a static `dist/` with no warnings.
- [ ] On an iPhone SE viewport (375×667), the app renders within safe areas.
- [ ] On a 1440×900 desktop viewport, content is centered at 480px max-width with the rest of the page showing the soft app background.
- [ ] Tailwind classes for every design token resolve (`bg-app`, `text-primary`, `rounded-[16px]`, `shadow-sm`, etc.).
- [ ] Lighthouse on `dist/` preview: PWA criteria not yet met (expected), Performance ≥95, Accessibility ≥95.

### Estimated weight
~250 LOC across config + 4 source files. Low complexity. Half a day.

---

## Phase 2 — Date & Shift Card + State Scaffolding

### What you're building
The first real interactive card (Date + Shift), plus the underlying state architecture (`useReducer`, action types, selectors) that every subsequent phase will plug into. Also the Live Totals Strip in its placeholder form (all zeros), so the visual rhythm of "header → date+shift → totals → cards" is established.

### Why this phase exists now
Every later phase mutates a slice of `ProductionEntryState`. We need the reducer, the type definitions, and the persistence subscription wire-frame before adding interactive features. Building the Date & Shift card on top of this infrastructure is also the easiest first proof that the reducer flow works end to end — date changes propagate to the header subtitle.

### Inputs
- `frontend_ui_spec.md` §10 (Date & Shift Card), §11 (Live Totals Strip), §39 (Frontend State).
- `detailed_ui_ux_design.md` §5.1.4, §5.1.5, §12 (Data Model).
- `requirements.md` §6 (Date and Shift Section).

### What to implement
1. `src/state/types.ts` — full `ProductionEntryState` and `CncEntry` types from `detailed_ui_ux_design.md` §12.
2. `src/state/reducer.ts` — initial state factory, action types covering `DATE_SET`, `SHIFT_SET` (more added in later phases), pure reducer.
3. `src/state/selectors.ts` — empty selector functions for `totalCncHours`, `totalBurma`, `cncEntryCount` (return zeros for now; bodies fill in later phases).
4. `src/state/StateContext.tsx` — React context exposing `state` + `dispatch`.
5. `src/components/DateShiftCard.tsx` — full card per `detailed_ui_ux_design.md` §5.1.4: native date input, segmented Shift control. Wire both to state.
6. `src/components/primitives/Segmented.tsx` — reusable 2-segment control primitive (used here for Shift, later for Side).
7. `src/components/LiveTotalsStrip.tsx` — three tiles (CNC Hours / Entries / Burma) with placeholder zeros, full styling. Subscribes to selectors (currently zero).
8. `Header.tsx` updated: subtitle derives from `state.date` not `new Date()`.

### Outcome
The user can change the date and switch between Morning/Evening shift. The header subtitle updates live. The Live Totals Strip is visible with quiet zeros. No CNC cards yet, but the rhythm is correct.

### Acceptance
- [ ] Date picker reflects today by default and fires `DATE_SET` on change.
- [ ] Shift defaults to Morning; tap on "Evening Shift" updates state and visual selection (140ms transition).
- [ ] Header subtitle re-renders with selected date.
- [ ] Live Totals Strip renders three tiles with `0.00`, `0`, `0` in muted color.
- [ ] Segmented control passes keyboard accessibility (Tab + Arrow keys move selection).
- [ ] Reducer is pure: dispatching the same action against the same state yields identical results.

### Estimated weight
~300 LOC. Low–medium complexity. ~1 day.

---

## Phase 3 — CNC Entry Card: Identity Fields

### What you're building
The first CNC Entry Card on screen, complete with the **identity** half of its fields: Operator (styled `<select>` only — Add Person modal comes in Phase 10), Machine (M1–M8 chip grid), Hex (input + common-values rail), Size (`<select>` with custom-text fallback), Side (segmented). No production fields yet, no calculation, no add/remove yet.

### Why this phase exists now
The CNC card is the most field-dense surface in the app. We split it across two phases. This first half establishes **the card shell, the field grid, the chip + segmented + select primitives, and the in-card layout rhythm** — all of which the production fields in Phase 4 will reuse without rebuilding.

### Inputs
- `frontend_ui_spec.md` §12 (CNC Section), §13 (CNC Entry Card), §14 (Operator), §15 (Machine), §16 (Hex), §17 (Size), §18 (Side).
- `detailed_ui_ux_design.md` §6.1 (CNC Entry Card anatomy), §6.1.4–§6.1.8.
- `requirements.md` §8, §11.

### What to implement
1. `src/components/primitives/Chip.tsx` — selectable pill chip with default/selected states (used for machine grid + hex common-values rail).
2. `src/components/primitives/Select.tsx` — styled native `<select>` with consistent border, focus ring, padding.
3. `src/components/cnc/CncEntryCard.tsx` — outer card shell (background, border, radius, shadow, padding), header row ("CNC Entry 1" + Incomplete pill), identity subtitle line that builds up as fields fill, body grid (2-col ≥360, 1-col below), Duplicate/Remove ghost buttons in header (no-op for now).
4. `src/components/cnc/OperatorSelect.tsx` — styled `<select>` reading from `state.people`. Inline "+ Add new person" link below (no-op for now).
5. `src/components/cnc/MachineGrid.tsx` — 4×2 grid of machine chips, single-select.
6. `src/components/cnc/HexInputWithChips.tsx` — number input + chips rail with `[37, 41, 55, 60, 65]`. Tapping a chip writes value; matching value highlights its chip.
7. `src/components/cnc/SizeSelect.tsx` — select with hardcoded list + "Custom…" → text input mode.
8. `src/components/cnc/SideToggle.tsx` — 2-segment control via `Segmented` primitive.
9. Reducer additions: `CNC_FIELD_SET(entryId, field, value)`. State seeded with one empty entry on init.
10. `src/components/cnc/CncSection.tsx` — section header ("CNC Production" + subtitle) + renders the one default card. Add button comes in Phase 5.

### Outcome
On load, the worker sees one CNC card with the section header above it. They can pick an operator from the list, tap a machine chip, type a hex (or pick from common chips), select a size (or type a custom one), and toggle Side 1/Side 2. The identity subtitle line under the card title fills in as they go: `Avinash · M1 · 1/2 · Side 1`. Hours pill still says "Incomplete" (production fields aren't built yet).

### Acceptance
- [ ] One blank CNC card visible at app open.
- [ ] All five identity fields are interactive and persist to state.
- [ ] Identity subtitle appears once any of operator/machine/size are filled, updates live.
- [ ] Machine chip selection has the spec'd transition (140ms) and the `--accent-600` fill.
- [ ] Hex chip rail highlights the matching chip when input value matches.
- [ ] Size select's "Custom…" option swaps to text input with "← back to list" link.
- [ ] No console errors when tabbing through every field.
- [ ] Visually matches `detailed_ui_ux_design.md` §6.1 anatomy.

### Estimated weight
~600 LOC. Medium complexity (lots of small primitives). ~1.5 days.

---

## Phase 4 — CNC Entry Card: Production Fields + Live Calculation

### What you're building
The production half of the CNC card: Cycle Time (joined min/sec input), Time In / Time Out (with shift defaults), Parts Count (large, right-aligned, tabular), Production Hours readout (computed live, elevated visual when valid). And the actual `entryProductionHours` selector that the Live Totals Strip subscribes to.

### Why this phase exists now
With identity fields in place, this phase makes the card *useful*. Production hours appearing live the moment cycle time and parts count are entered is the single most rewarding UX moment in the app — the worker sees the math do itself. It also wires the first real feed into the Live Totals Strip (CNC Hours).

### Inputs
- `frontend_ui_spec.md` §19 (Cycle Time), §20 (Time In/Out), §21 (Parts Count), §22 (Production Hours), §40 (Calculation Rules).
- `detailed_ui_ux_design.md` §6.1.9–§6.1.12, §12.2.
- `requirements.md` §9 (CNC Auto Calculation).

### What to implement
1. `src/components/cnc/CycleTimeInput.tsx` — single visual control containing two number inputs (min, sec) joined with a 1px divider; "min" / "sec" suffix labels; validation (min ≥ 0, sec 0–59, total > 0).
2. `src/components/cnc/TimeRangeInput.tsx` — two `<input type="time">` side-by-side ≥360px, stacked below. Defaults from shift (Morning 08:30/18:30, Evening 19:00/21:30). Tracks `timeInTouched` / `timeOutTouched` flags on edit.
3. `src/components/cnc/PartsCountInput.tsx` — height-56 right-aligned numeric input with "pcs" suffix, content-select on focus, `inputmode="numeric"`.
4. `src/components/cnc/ProductionHoursDisplay.tsx` — read-only readout. `--accent-50` bg + `--accent-600` number when valid; `--bg-sunken` + "—" when pending.
5. `src/state/selectors.ts` — implement `entryProductionHours` and `totalCncHours` per `detailed_ui_ux_design.md` §12.2.
6. Reducer wiring: cycle minutes/seconds, time in/out, parts count → all dispatch `CNC_FIELD_SET`.
7. Live Totals Strip: `CNC Hours` and `Entries` tiles now read real values; cross-fade animation (160ms) on number change.
8. Identity subtitle now optionally shows the trailing hours fragment when complete.
9. Soft warnings under cycle time per `requirements.md` §11 (cycle <20s, >10min).

### Outcome
A single fully functional CNC entry. Type cycle time + parts count → Production Hours appears in the elevated readout. CNC Hours tile in the live strip updates in sync.

### Acceptance
- [ ] Entering cycle 2m 26s + parts 193 produces "7.83 hrs" in Production Hours within the same render pass.
- [ ] Production Hours display visually elevates (`--accent-50` background) when valid; reads "—" when missing.
- [ ] Live Totals: CNC Hours updates with 160ms cross-fade.
- [ ] Switching shift updates Time In/Out only on entries where `timeInTouched`/`timeOutTouched` are still false.
- [ ] Manual edit of Time In sets `timeInTouched = true` and prevents shift propagation thereafter.
- [ ] Soft warning shows for cycle time outside [20s, 600s] range; doesn't block.
- [ ] Parts Count selects all on focus.
- [ ] All numeric inputs use tabular-nums.

### Estimated weight
~450 LOC. Medium complexity (calculation correctness + smart-copy edge cases). ~1.5 days.

---

## Phase 5 — CNC Section Behavior: Add / Remove / Duplicate / Smart Copy

### What you're building
Multi-entry support: "+ Add CNC Entry" tile, Duplicate action, Remove action with inline confirm, and the smart-copy behavior where new cards inherit Time In/Out (and on Duplicate, also operator/machine/etc.) from the previous entry.

### Why this phase exists now
With one fully working entry from Phases 3–4, scaling to N entries is the natural next move. Doing it now (rather than later) keeps the totals math honest from this point forward — every subsequent phase that touches totals (Burma, Sticky Bar, Summary, PNG) inherits a multi-entry-correct CNC reducer.

### Inputs
- `frontend_ui_spec.md` §12.3, §23 (Duplicate), §24 (Remove), §20.4 (Smart Copy).
- `detailed_ui_ux_design.md` §5.1.6, §6.1.6.
- `requirements.md` §10 (CNC Line Item Behavior).

### What to implement
1. `src/components/cnc/AddCncEntryButton.tsx` — full-width dashed-border tile.
2. Reducer: `CNC_ENTRY_ADD`, `CNC_ENTRY_REMOVE(entryId)`, `CNC_ENTRY_DUPLICATE(entryId)`.
3. `CNC_ENTRY_ADD` logic: new entry inherits Time In/Out from the last existing entry (if untouched defaults, fall back to shift defaults). Other fields blank.
4. `CNC_ENTRY_DUPLICATE` logic: copy operator, machine, hex, size, side, cycle time, time in/out. Do **not** copy partsCount.
5. `CncEntryCard` Duplicate/Remove buttons wired:
   - Duplicate: dispatch + new card slides in.
   - Remove: if card is blank/default → instant remove. If has data → swap action area into inline confirm strip ("Remove this entry?  [Cancel]  [Remove]").
6. After remove: bottom toast "Entry removed · Undo" with 4s lifetime; tapping Undo restores the entry at its original index.
7. Card add/remove animation per `detailed_ui_ux_design.md` §3.6 (220ms in, 180ms out). Honor `prefers-reduced-motion`.
8. Empty state: if user removes all entries, render the empty-state copy from `detailed_ui_ux_design.md` §8.5.

### Outcome
A worker can build up the full day's set of CNC entries: tap +, fill it, duplicate when same operator/machine/size repeats, remove if they made a mistake. Live totals scale correctly across all entries.

### Acceptance
- [ ] Adding 5 CNC entries in a row works smoothly with no layout jank.
- [ ] New entries inherit Time In/Out from the previous entry.
- [ ] Duplicate copies all spec'd fields except partsCount.
- [ ] Remove on blank card removes instantly.
- [ ] Remove on filled card shows the inline confirm strip.
- [ ] Undo toast restores the entry at the same index.
- [ ] CNC Hours live total reflects the sum across all entries.
- [ ] Empty state renders when all entries are removed.
- [ ] `prefers-reduced-motion: reduce` disables card add/remove slide.

### Estimated weight
~250 LOC. Medium complexity (undo-restore with index correctness). ~1 day.

---

## Phase 6 — Burma + Repair + Notes Cards

### What you're building
The three secondary cards: Burma Production (three count fields + total footer), Repair Work (person + count + note, optional), Notes (auto-growing textarea, optional). Plus the live Burma total feeding into the Live Totals Strip.

### Why this phase exists now
With the CNC section feature-complete, the rest of the page's surface area is a quick fill. Grouping these three small cards into one phase keeps the cadence high — they share the same "labeled field cell" pattern and are independently trivial. This phase also completes every input the worker will ever need.

### Inputs
- `frontend_ui_spec.md` §25 (Burma), §26 (Repair), §27 (Notes).
- `detailed_ui_ux_design.md` §5.1.7, §5.1.8, §5.1.9.
- `requirements.md` §12, §13, §14.

### What to implement
1. `src/components/BurmaCard.tsx` — three rows of label + numeric input (right-aligned, 100px wide), separator line, footer row "Total Burma Count" + computed total (uses `Intl.NumberFormat('en-IN')`).
2. `src/components/RepairCard.tsx` — title row with "Optional" pill, three fields: Repair Person (`OperatorSelect` reused — same `state.people`), Repair Count (numeric), Repair Note (single-line text).
3. `src/components/NotesCard.tsx` — title row with "Optional" pill, auto-growing textarea (`field-sizing: content` with JS fallback for unsupported browsers), placeholder text.
4. Reducer: `BURMA_SET(field, value)`, `REPAIR_SET(field, value)`, `NOTES_SET(value)`.
5. Selectors: implement `totalBurma`. Wire Burma tile in Live Totals Strip.

### Outcome
Every input the V1 form ever needs is now on screen and functional. The Live Totals Strip reflects all three sources (CNC Hours, Entries, Burma).

### Acceptance
- [ ] Burma 1/2/3 inputs accept numeric only (`inputmode="numeric"`).
- [ ] Burma footer total updates on every keystroke with thousands separators.
- [ ] Repair fields are all optional; blank Repair section doesn't trigger validation errors anywhere.
- [ ] Notes textarea grows to 240px max then internally scrolls.
- [ ] Live Totals Burma tile reflects sum.
- [ ] Reused `OperatorSelect` in Repair shows the same people list as CNC.

### Estimated weight
~250 LOC. Low complexity. ~0.5 day.

---

## Phase 7 — Sticky Action Bar + Scroll Choreography

### What you're building
The sticky bottom action bar with the running CNC total and "Preview Summary" CTA; scroll-shadow on both the bar and the Live Totals Strip; the disabled/warning states of the CTA based on entry validity.

### Why this phase exists now
With every input live, the worker now needs a way to "finish". The sticky bar is that handoff. Building it now (before the Summary modal) lets us validate the disabled / warning visual states without anything to navigate to yet — the CTA's UX is locked first, then it gets a destination in Phase 8.

### Inputs
- `frontend_ui_spec.md` §28 (Sticky Bottom Action Bar).
- `detailed_ui_ux_design.md` §5.2, §7.2.
- `requirements.md` §11 (validation context).

### What to implement
1. `src/components/StickyActionBar.tsx` — fixed-bottom 72px (+ safe-area) bar with totals on left, primary CTA on right.
2. Selector: `cncEntryCompletenessReport(state)` returning `{ valid: number; incomplete: number }`.
3. CTA states from `detailed_ui_ux_design.md` §5.2.2:
   - default (≥1 valid entry): solid accent.
   - disabled (zero CNC entries AND zero Burma): 30% opacity, tap shows toast "Add an entry first."
   - soft-warn (≥1 incomplete entry): solid accent + ⚠ glyph before label.
4. IntersectionObserver-based scroll sentinel: shadow-md applied to action bar + Live Totals Strip when content has scrolled past their top edges.
5. Toast component (deferred from earlier phases) — `src/components/primitives/Toast.tsx`. Single-slot, replace-in-place. `role="status"`, polite.

### Outcome
The bar is always there. As the worker scrolls through the form, both it and the Live Totals Strip cast a soft elevation shadow. The CTA's state honestly reflects whether there's something worth previewing.

### Acceptance
- [ ] Bar is visible at bottom on all screen heights, never overlaps the last card.
- [ ] CTA disabled when state has no data; tapping shows the toast.
- [ ] CTA shows ⚠ glyph when ≥1 incomplete CNC entry exists alongside complete ones.
- [ ] Shadow appears on bar only when scrollY > 0.
- [ ] Toast auto-dismisses at 3s; second toast replaces first.

### Estimated weight
~250 LOC. Medium complexity (scroll sentinel + completeness logic). ~1 day.

---

## Phase 8 — Summary Preview Modal + Summary Card DOM

### What you're building
The full-screen Summary Preview modal (centered modal on ≥640px). Inside it, the locked **Summary Card** — the same DOM that will be PNG'd in Phase 9. No image generation yet; Generate Image is a placeholder. Edit returns to the entry screen.

### Why this phase exists now
The Summary Card is the artifact the owner actually consumes via WhatsApp. It is the most visually-critical surface in the product and the one most damaged by drift if built in tandem with PNG generation. Locking its visual fidelity *first* — purely as a DOM render — guarantees the PNG in Phase 9 captures the right thing. Splitting visual layout from canvas conversion also makes debugging html2canvas issues 10× easier.

### Inputs
- `frontend_ui_spec.md` §30 (Summary Preview Screen / Modal).
- `detailed_ui_ux_design.md` §5.3, §6.4 (Summary Card).
- `requirements.md` §15–§19 (summary content).

### What to implement
1. `src/components/primitives/Sheet.tsx` — full-screen-modal-on-mobile / centered-modal-on-desktop primitive. Focus trap, Esc-close, backdrop tap, scroll-lock on body, `overscroll-behavior: contain` on the panel.
2. `src/components/summary/SummaryModal.tsx` — modal shell with internal sticky top bar (Edit / title / Close), scrolling body, sticky internal action stack.
3. `src/components/summary/SummaryCard.tsx` — the locked artifact DOM per `detailed_ui_ux_design.md` §6.4. Pure render of state. White background. No icons. Section dividers. Tabular numerals. Compact mode auto-engages when `cncEntries.length > 12`.
4. `src/utils/format.ts` — `formatDateLong`, `formatShift`, `formatCycleTime`, `formatCount`. Used by both SummaryCard and identity subtitle.
5. Wire "Preview Summary" CTA in StickyActionBar to open the modal.
6. Action stack inside modal: "Generate Image" (primary, no-op for now), "Edit Entry" (secondary, closes modal).
7. Incomplete-entry warning strip at top of modal when applicable (hooked up here, prepares ground for Phase 11 final validation pass).
8. State action: `UI_INCOMPLETE_HIGHLIGHTS_SET(true)` fires on first Preview tap (used in Phase 11 to switch on per-card warning banners).

### Outcome
Tap "Preview Summary" → a full-height modal slides up showing exactly what would be shared, populated from current state. The artifact looks like a clean document, not a screenshot of a form. Tap Edit → modal slides down, state preserved.

### Acceptance
- [ ] Modal opens with 260ms slide-up + 160ms scrim fade (or fade-only under reduced-motion).
- [ ] Modal traps focus; Esc/backdrop/Close all dismiss; focus restores to "Preview Summary" button.
- [ ] Summary card renders with: date+shift header, CNC list (numbered), Total CNC Hours line, Burma section, Total Burma line, optional Repair, optional Notes, footer timestamp.
- [ ] Repair section omitted when all repair fields blank.
- [ ] Notes section omitted when blank.
- [ ] If 13+ CNC entries, list switches to compact 1-line-per-entry.
- [ ] Numbers in summary use tabular-nums and right-align where spec'd.

### Estimated weight
~500 LOC. Medium-high complexity (Sheet primitive + Summary Card layout fidelity). ~1.5 days.

---

## Phase 9 — PNG Generation + Web Share + Download

### What you're building
The real PNG pipeline: `html2canvas` against the locked Summary Card, the Web Share API integration with file fallbacks, and the post-generation UI (thumbnail + Share + Download buttons + success/failure toasts).

### Why this phase exists now
With the Summary Card locked in Phase 8, this phase converts it to a real bitmap and gets it into WhatsApp. This is the literal product promise. It must work on a real Android phone over HTTPS — not just in dev — so this phase ends with a real-device test, not just a desktop demo.

### Inputs
- `frontend_ui_spec.md` §31 (PNG Generation Behavior).
- `detailed_ui_ux_design.md` §6.4 (canvas dimensions), §15.2, §15.3, §13 (workflow).
- `requirements.md` §20, §21.

### What to implement
1. `npm install html2canvas`.
2. `src/utils/png.ts` — `captureSummary(node) → File`. Renders against a hidden 540px-wide DOM clone at scale 2 → 1080-wide PNG. Filename `production-summary-YYYY-MM-DD-{shift}.png`.
3. Hidden capture container: absolute, `top: -10000px`, mounted only during capture, unmounted after.
4. `src/utils/share.ts` — `shareSummary(file, textFallback) → 'shared' | 'downloaded' | 'failed'`:
   - Best path: `navigator.canShare({files})` + `navigator.share({files, title})`.
   - Fallback: trigger download + open `whatsapp://send?text=…` with plain-text summary.
5. `src/utils/textSummary.ts` — produces the WhatsApp text fallback (same content as Summary Card, plain text).
6. `src/components/summary/ShareActions.tsx` — manages action-stack state: idle → generating → ready → shared/downloaded/failed. Spinner during generation.
7. Post-generation thumbnail: 180px-wide preview of the PNG between Summary Card and action stack.
8. Toasts for each terminal state per `detailed_ui_ux_design.md` §5.3.2.
9. **On-device test pass**: deploy preview to HTTPS host and validate share-with-file works on Chrome/Android and that fallback works on browsers without `canShare({files})`.

### Outcome
Tap Generate Image → small spinner → ~150–700ms later thumbnail appears with Share + Download buttons. Tap Share on Android Chrome → native sheet opens with the PNG attached → pick WhatsApp group → image lands in WhatsApp. The product's primary promise is now demonstrably real.

### Acceptance
- [ ] PNG dimensions are 1080-wide regardless of source viewport.
- [ ] PNG is white-backgrounded, no transparency artifacts.
- [ ] Generated filename matches the `production-summary-YYYY-MM-DD-{shift}.png` pattern.
- [ ] On Android Chrome (HTTPS): Share opens native share sheet with the file attached.
- [ ] On Safari iOS: Share opens iOS share sheet with the file (or downloads + opens WhatsApp text).
- [ ] On a desktop browser without `canShare({files})`: clicking Share triggers download + opens `whatsapp://send` text.
- [ ] Thumbnail visible after successful generation.
- [ ] Generation failure shows the spec'd error toast and resets the CTA.
- [ ] Real-device test: image arrives in a WhatsApp group from a real factory-context phone, readable.

### Estimated weight
~350 LOC. High complexity (real-device cross-browser issues are where this phase eats time). ~2 days including device QA.

---

## Phase 10 — Add New Person Modal + People Persistence

### What you're building
The Add New Person bottom sheet (centered modal on ≥640px), the validation around it (blank, duplicate), and the `localStorage` persistence of custom-added operator names. Wires up the "+ Add new person" affordance in OperatorSelect for both CNC and Repair contexts.

### Why this phase exists now
With the entry flow → preview → share path complete, this is the last user-facing surface that affects daily flow. We delayed it deliberately: introducing it earlier risked tangling state migration with reducer growth. Now that the reducer and people-array shape are stable, dropping it in is clean.

### Inputs
- `frontend_ui_spec.md` §14, §32 (Add Person Modal).
- `detailed_ui_ux_design.md` §5.4.
- `requirements.md` §26 (open question on operator list — V1 answer: localStorage-backed, no backend).

### What to implement
1. `src/components/AddPersonModal.tsx` — bottom sheet on mobile, centered modal on desktop. Uses the `Sheet` primitive from Phase 8 with the bottom-sheet variant (drag handle, top-rounded corners).
2. Auto-focus the input on open. "Add Person" disabled until trimmed length ≥ 1.
3. Validation: trim, lowercase-compare against `state.people` for duplicates. Inline error under input on duplicate.
4. Reducer: `PERSON_ADD(name)`. Adds to `customPeople`, updates derived `people`.
5. `src/state/persistence.ts`:
   - `KEY_CUSTOM_PEOPLE = 'productionEntry.v1.customPeople'`.
   - `loadCustomPeople()` / `saveCustomPeople(names)`.
   - On app boot, hydrate `state.people = unique([...basePeople, ...loadCustomPeople()])`.
   - Subscribe: persist on `PERSON_ADD`.
6. After successful add: close modal, auto-select the new name in the originating field (CNC or Repair), toast "Added [name]".
7. Open-handler tracks **which field opened the modal** (entry id + field type) so the auto-select goes to the right place.

### Outcome
A worker can add a new operator name on the fly and immediately use it. The name persists across app reloads on that device.

### Acceptance
- [ ] "+ Add new person" link in any OperatorSelect opens the modal.
- [ ] Input auto-focuses; IME appears on Android.
- [ ] Add button disabled for blank/whitespace-only input.
- [ ] Duplicate name (case-insensitive) shows inline error and keeps Add disabled.
- [ ] Successful add: closes modal, auto-selects in originating field, toast appears.
- [ ] Reload page → new name is still in the list.
- [ ] Names persist across both CNC OperatorSelects and the Repair person field.

### Estimated weight
~250 LOC. Medium complexity (open-context tracking + persistence). ~1 day.

---

## Phase 11 — Draft Persistence + Day Rollover + Validation Pass

### What you're building
Full-state draft persistence (debounced localStorage save of the entire `ProductionEntryState`), day-rollover prompt ("Resume / Start fresh"), and the consolidated validation pass — wiring per-card warning banners, field-level error states, and the incomplete-entry strip at the top of the Summary modal.

### Why this phase exists now
Drafts are the user's safety net: if the phone reboots or the browser tab is killed, the day's data must survive. Validation is the data-quality net: by now we know every input, every field, every interaction — so we can finally do a single coherent validation sweep without reverse-fitting.

### Inputs
- `frontend_ui_spec.md` §29 (Validation Model), §34 (Error States).
- `detailed_ui_ux_design.md` §12.1, §12.3, §6.1.13, §7.1.
- `requirements.md` §11 (CNC Validation Rules), §22 (Data Storage — Option B).

### What to implement
1. Extend `src/state/persistence.ts`:
   - `KEY_DRAFT = 'productionEntry.v1.draft'`.
   - Debounced save (400ms) of full state on every dispatch.
   - On boot:
     - If draft exists and `draft.date === today` → restore silently.
     - If draft exists and `draft.date !== today` → render top-of-page banner "You have an unsent entry from [date]. [Resume] [Start fresh]".
     - "Resume" loads draft as-is (date stays old). "Start fresh" clears draft, initializes today.
2. `src/state/validation.ts`:
   - `validateEntry(e: CncEntry)` returns `{ hard: ValidationIssue[], soft: ValidationIssue[] }`.
   - Hard rules per `requirements.md` §11. Soft rules from `detailed_ui_ux_design.md` §12.3.
3. CNC card warning banner (`§6.1.13`) appears when entry is incomplete AND `state.ui.incompleteHighlights === true`.
4. Field-level error states wired:
   - Hex out of range → red border + caption error.
   - Cycle minutes/seconds invalid → red border on the joined control + error caption.
   - Time Out ≤ Time In → red border on Time Out + error caption.
   - Required-and-blank fields → red border + "Required" caption (only after first Preview).
5. Summary modal incomplete-strip refined: shows count of excluded incomplete entries.
6. SummaryCard render filters out incomplete entries from the CNC list.
7. Storage-full handling: catch quota errors on save, surface non-blocking banner "Couldn't save draft. Finish and share before closing."

### Outcome
Close the tab mid-entry, reopen — everything is exactly where it was. If you open the app the day after a forgotten share, you get a polite prompt asking what to do. Tap Preview with an incomplete card → that card highlights what's missing inline.

### Acceptance
- [ ] Fill several fields → close tab → reopen → state restored.
- [ ] Reopen on the next calendar day → rollover banner appears with both options.
- [ ] "Start fresh" clears draft and resets to a clean state.
- [ ] First Preview tap with incomplete entries:
  - lights up per-card warning banners,
  - lights up red borders on missing required fields,
  - shows the "1 entry incomplete and won't be included" strip at top of modal.
- [ ] Hex out of range → field error appears immediately on change.
- [ ] Cycle 0/0 → cycle field error appears.
- [ ] Time Out ≤ Time In → Time Out field error.
- [ ] Filling missing fields auto-clears their error states.
- [ ] localStorage write failure surfaces the spec'd banner without crashing.

### Estimated weight
~400 LOC. Medium-high complexity (correctness across many edge cases). ~1.5 days.

---

## Phase 12 — PWA + Offline + Polish + QA

### What you're building
The final operational layer: PWA manifest with proper icons, service worker shell-cache for offline use, accessibility audit + fixes, motion polish, copy review, and the full QA checklist from `frontend_ui_spec.md` §44.

### Why this phase exists now
Everything functional is in place. This phase is the difference between "works on my machine" and "a worker on a flaky 4G connection in a factory floor opens the app, fills it offline, and shares it the moment they get signal." It's also the last chance to catch drift between spec and implementation before the app gets used in anger.

### Inputs
- `frontend_ui_spec.md` §44 (QA Checklist), §45 (Acceptance Criteria), §47 (Final Product Direction).
- `detailed_ui_ux_design.md` §11 (Accessibility), §15.6, §15.8.
- `requirements.md` §28 (Success Criteria).

### What to implement
1. PWA manifest:
   - name, short_name, description.
   - icons (192, 512, maskable variants).
   - `display: standalone`, `orientation: portrait-primary`.
   - theme_color and background_color matching tokens.
2. Service worker (Workbox or `vite-plugin-pwa`):
   - Precache app shell (HTML, CSS, JS, fonts if any).
   - Runtime cache for icons.
   - Skip-waiting + clients-claim on install.
3. Accessibility pass:
   - All buttons reachable by keyboard.
   - Focus rings visible everywhere.
   - Modal focus trap verified.
   - Color contrast verified (axe-core or Lighthouse).
   - All inputs have proper `<label>` associations.
   - Toast `role="status"`.
   - Reduced-motion check on every animated surface.
4. Copy audit: compare every visible string to `detailed_ui_ux_design.md` §8 — fix drift.
5. Empty / loading / error states audit: every state from `detailed_ui_ux_design.md` §7 visually verified.
6. Edge case run-through from `detailed_ui_ux_design.md` §14: each one manually exercised.
7. Smoke tests:
   - `entryProductionHours` correctness (table of 6+ examples).
   - `totalBurma`, `totalCncHours` correctness.
   - Reducer purity tests for each action type.
   - Validation rules tests.
8. Lighthouse pass: PWA installable, Performance ≥85 on mid-tier Android emulation, Accessibility ≥95, Best Practices ≥95.
9. README final pass: deploy steps, env requirements, browser support matrix.

### Outcome
A real, installable, factory-floor-ready PWA. Add to home screen on a worker's phone → opens like a native app → works offline → entries saved → shared to WhatsApp when signal returns.

### Acceptance
- [ ] Add to Home Screen works on Android Chrome.
- [ ] App opens offline (after first load).
- [ ] App fully usable offline — only Share might require connectivity for the WhatsApp handoff itself.
- [ ] Lighthouse PWA: installable, Performance ≥85, Accessibility ≥95, Best Practices ≥95.
- [ ] Every QA case in `frontend_ui_spec.md` §44 passes.
- [ ] Every acceptance bullet in `frontend_ui_spec.md` §45 satisfied.
- [ ] Real-worker dry run: a non-technical person completes a full daily entry and shares it in <3 minutes.
- [ ] No console errors or warnings during a full happy-path session.

### Estimated weight
~250 LOC + thorough manual QA. Medium complexity. ~1.5 days including polish round.

---

## Final Build Summary

### Phase weight totals

| Phase | Title | LOC | Effort |
|---|---|---:|---:|
| 1 | Foundation & Design Tokens | 250 | 0.5 d |
| 2 | Date & Shift + State Scaffolding | 300 | 1.0 d |
| 3 | CNC Card: Identity Fields | 600 | 1.5 d |
| 4 | CNC Card: Production + Calculation | 450 | 1.5 d |
| 5 | CNC Section: Add/Remove/Duplicate | 250 | 1.0 d |
| 6 | Burma + Repair + Notes Cards | 250 | 0.5 d |
| 7 | Sticky Action Bar + Scroll | 250 | 1.0 d |
| 8 | Summary Modal + Summary Card DOM | 500 | 1.5 d |
| 9 | PNG + Share + Download | 350 | 2.0 d |
| 10 | Add Person Modal + People Persistence | 250 | 1.0 d |
| 11 | Draft Persistence + Validation Pass | 400 | 1.5 d |
| 12 | PWA + Offline + Polish + QA | 250 | 1.5 d |
| | **Total** | **~4,100** | **~14.5 d** |

### Demo-ability per phase

| After phase… | The demo is… |
|---|---|
| 1 | A clean empty mobile shell with the app's identity. |
| 2 | Date + shift selection working. Live totals visible (zero). |
| 3 | One CNC card with operator/machine/hex/size/side filling. |
| 4 | That card now also computes hours live as you type cycle + count. |
| 5 | Multiple CNC entries — add, duplicate, remove with undo. |
| 6 | All three secondary cards working. Live totals fully wired. |
| 7 | Sticky bar with running total + functional Preview CTA. |
| 8 | Tap Preview → see the locked summary artifact in a modal. |
| 9 | Generate a real PNG and share it on WhatsApp. **Product promise delivered.** |
| 10 | Add a new operator on the fly — persists across reloads. |
| 11 | Close the tab mid-entry, reopen — state survives. Validation polished. |
| 12 | Installable PWA, offline-capable, accessible, fully QA'd. |

### Expected end-state

A factory worker on an Android phone:
1. Adds the app to their home screen.
2. Opens it offline if needed.
3. Fills the day's CNC entries and Burma counts in under 3 minutes.
4. Taps Preview, sees a clean summary, taps Share on WhatsApp, and the production summary lands in the group chat.

The owner sees a clear, readable PNG every shift, with totals and per-entry detail. No spreadsheet. No formulas. No training.

That is the entire product.

---

## When to deviate from this roadmap

These phases are deliberately additive — each leaves the artifact more complete than the last, and none breaks the artifact left by a prior phase. If during implementation you find that:

- a phase is taking >2× its estimate → split it, don't ram through.
- a phase introduces a regression in a prior phase → stop, fix the regression in a focused mini-phase before continuing.
- a real-device test in Phase 9 reveals a fundamental share-API limitation → adjust scope and document in `detailed_ui_ux_design.md` §15.6, don't paper over.

The roadmap reduces guesswork. It does not replace judgment.
