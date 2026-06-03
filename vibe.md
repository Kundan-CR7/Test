# Product Vibe Document

## 1. Executive Summary
This product reads as a high-density internal operations dashboard system with a neutral enterprise base and selective blue-led emphasis. The dominant visual language is practical, table-and-card driven, and status-oriented, with frequent semantic color coding (blue/green/amber/red) layered over mostly white/gray surfaces. It feels like a shadcn/Radix foundation adapted into a real-world multi-team admin tool where speed, scanability, and operational clarity are prioritized over brand expressiveness.

## 2. Core Visual Character
The core feeling is operational, utilitarian, and mildly polished rather than premium-minimal. It sits between modern component-system UI and legacy internal dashboard styling.

- Calm vs intense: mostly calm neutral surfaces, with intense moments in status colors and alert states.
- Premium vs utilitarian: clearly utilitarian; polish appears in rounded cards, shadows, and gradients, not luxury detail.
- Modern vs conventional: modern primitives (Radix/shadcn patterns) with conventional internal-tool composition.
- Sparse vs dense: medium-to-dense information density; many pages are multi-panel and table-heavy.
- Enterprise vs consumer: strongly enterprise/internal tooling.
- Technical vs expressive: technical/operational dominant; expressive treatment appears only in a few pages (login, send-message, some sales cards).
- Serious vs playful: serious with occasional friendly accents; no playful illustration language.
- Operational vs narrative: heavily operational; screens are built for workflow throughput.
- Neutral vs brand-heavy: neutral-first with repeated blue-indigo accents, not deep bespoke branding.

## 3. Theme Foundation
### 3.1 Dominant Colors
- Dominant base:
  - White and near-white surfaces (`bg-white`, token background `0 0% 100%`)
  - Gray neutrals (`gray-50/100/600/700/900`, muted zinc-like tones)
  - Dark neutral text (`gray-900`, token foreground near-black)
- Primary accent:
  - Blue/indigo family is the consistent action/accent anchor (`blue-600/700`, `indigo-600/700`, blue-50 hovers)
- Semantic colors:
  - Success: green/emerald (`green-50/100/600`, `emerald-50/700`)
  - Warning/in-progress: amber/yellow
  - Error/destructive: red/rose
  - Informational secondary states: slate/purple in specific workflows (ticket status)
- Charts:
  - Tokenized multi-hue chart palette with warm-cool spread (`--chart-1` to `--chart-5`), plus ad-hoc blue for primary bars/lines.
- Temperature:
  - Cool-neutral overall, warmed only by semantic status colors.
- Color restraint:
  - Most layout/background layers stay restrained (white/gray).
  - Expressive color is concentrated in badges, actions, alerts, status pills, and occasional gradient hero/header blocks.

### 3.2 Typography
- Base family: global `Arial, Helvetica, sans-serif` is the active default.
- Font personality: system-like, operational, no editorial flourish.
- Size tendencies:
  - Heavy use of `text-sm` and `text-xs` for controls, metadata, table contexts.
  - Section/page headings usually `text-xl` to `text-3xl`.
- Weight usage:
  - Frequent `font-medium` and `font-semibold`; `font-bold` reserved for key headings/KPIs.
- Numeric styling:
  - Repeated use of `font-mono` for IDs, currency, and metric readouts.
- Casing tendencies:
  - Regular use of uppercase micro-labels and tracking for categories/section tags in analytics areas.
- Hierarchy style:
  - Functional hierarchy: label -> value -> metadata; optimized for fast scan rather than typographic drama.

### 3.3 Spacing and Layout Rhythm
- Typical shell:
  - Padded containers (`p-4`, `p-6`, `py-6/8`, `max-w-5xl/6xl/7xl`) with centered content columns.
- Vertical rhythm:
  - Modular stack rhythm using `space-y-4/6`, `gap-4/6` and card blocks.
- Horizontal density:
  - Desktop-first dense rows for filters/actions; collapses to stacked mobile layouts.
- Grid behavior:
  - Frequent responsive grids (`grid-cols-1` -> `md:grid-cols-2/3/4` -> `lg/xl` expansions).
- Panel spacing:
  - Card internals often `p-4` or `p-6`; table containers use compact cell padding.
- Feel:
  - Dashboard-like and throughput-oriented, not airy presentation UI.

### 3.4 Shape and Surface Language
- Radius system:
  - Token base `--radius: 0.5rem`, but practical usage spans `rounded-md`, `rounded-lg`, `rounded-xl`, and many `rounded-2xl` cards/controls.
- Card/panel treatment:
  - Core primitive: bordered, lightly shadowed cards on neutral backgrounds.
  - Many domain pages reinforce this with explicit `bg-white shadow-md rounded-lg` wrappers.
- Borders:
  - Border-led separation is strong (`border`, `border-gray-200/300`, table row dividers).
- Shadows:
  - Soft elevation (`shadow-sm`, `shadow`, `shadow-md`), stronger only for overlays/dropdowns/hero cards.
- Layering:
  - Mostly flat layers with subtle elevation; occasional gradient hero strips and tinted callout cards.
- Depth character:
  - Boxed and structured, not glassy.

### 3.5 Interaction and Motion Style
- Motion philosophy: utilitarian micro-feedback, no theatrical animation.
- Common behaviors:
  - Color and shadow transitions on hover (`transition-colors`, `hover:bg-*`, `hover:shadow-*`).
  - Frequent spinner usage (`animate-spin`) for loading states.
  - Radix open/close animations (fade/zoom/slide) for dialogs, selects, sheets, toasts.
- Focus behavior:
  - Ring-based keyboard focus (`focus-visible:ring-*`) aligned with system tokens.
- State communication:
  - Clear immediate state changes via badges, button disabled opacity, and alert surfaces.

## 4. Repeating UI Objects
- KPI/summary cards:
  - Everywhere in dashboards.
  - Usually white cards, compact labels, large numeric values, optional semantic text/icon color.
  - Role: top-level situational awareness.
- Filter bars and control decks:
  - Date pickers, selects, search inputs, status filters grouped in card/panel tops.
  - Role: operational slicing and quick refresh.
- Data tables:
  - High recurrence across product, KPI, payments, monitoring, ticketing.
  - Patterns: sticky-like headers, dense rows, hover highlight, badges in cells, text truncation.
  - Role: primary decision surface.
- Status pills/badges:
  - Strongly repeated semantic chips for workflow state (open/in-progress/resolved, success/fail, etc.).
  - Often tinted backgrounds with matching border/text for quick scan.
- Action buttons:
  - Blue primary actions, outline secondary actions, destructive red actions.
  - Often grouped in top-right or card header contexts.
- Cards-within-cards:
  - Main section cards containing sub-cards or metric tiles.
  - Role: chunking complexity into operational units.
- Dialogs/modals:
  - Radix-based centered overlays, rounded, bordered, shadowed.
  - Role: focused edits/confirmations/details.
- Tabs:
  - Used for mode switching (views, user categories, workflow states) with compact tab lists.
- Side navigation/header structures:
  - Global top header: dark gradient, dropdown menu system.
  - Some modules add left sidebars for view switching.
- Charts:
  - Bar/line dominant, usually inside cards with compact legends/tooltips and neutral axes.
- Empty/loading states:
  - Dashed borders, muted text, spinner icons, simple guidance copy.

## 5. Screen Composition Patterns
- Page headers:
  - Title + short descriptive subtitle + right-aligned primary action(s).
- Action placement:
  - Primary actions in top bars or card headers; secondary actions as outline buttons near filters.
- Grouping:
  - Flow is typically: header -> filters -> KPI strip -> table/charts -> detail dialogs.
- Emphasis model:
  - Primary emphasis on counts, statuses, and row-level actionability.
  - Secondary emphasis on trends/charts.
- Layout direction:
  - Mostly top-down dashboards, with occasional side action rails or side nav in specific modules.
- Analytics pages:
  - Grid of KPI cards + chart cards + detailed table backstop.
- Settings/admin pages:
  - Card-based control planes with scrollable lists and editor/detail panes.
- Information density:
  - Medium-high; large datasets and control clusters are expected norms.

## 6. Distinctive Design Signatures
- Persistent “internal operations” aesthetic: neutral canvas + colored status semantics.
- Strong badge/pill grammar as a primary meaning carrier.
- Repeated blend of two stylistic layers:
  - shadcn tokenized components (`bg-background`, `text-muted-foreground`, Radix patterns)
  - direct Tailwind gray/blue utility styling (`bg-gray-50`, `bg-blue-600`, `rounded-xl shadow-md`)
- Frequent rounded-2xl cards in management areas, giving a soft modern shell over dense content.
- Dark gradient global header with blue brand marker and dropdown nav.
- Table-centric object model: many workflows converge to sortable, scannable, action-enabled tables.

## 7. What Should Carry Into New Projects
- Neutral-first surfaces with restrained blue accent strategy.
- Semantic status chips as first-class visual language.
- Card + filter + KPI + table composition rhythm.
- Dense-but-readable spacing tuned for operational throughput.
- Small/medium type scale with clear weight contrasts for scanability.
- Rounded corners and light elevation to keep heavy data UIs approachable.
- Consistent action hierarchy (primary blue, secondary outline, destructive red).
- Fast, subtle interaction feedback (hover/focus/loading) over decorative animation.

## 8. What Should Be Adapted, Not Copied
- Product-specific nav taxonomy and module naming.
- Hard-coded gradients and hero treatments used in specific pages (login, send-message, some sales panels).
- Exact table schemas/field labels and domain-specific metric cards.
- Literal color assignments for domain statuses where semantics may differ.
- Mixed legacy/custom styling inconsistencies (some pages are more bespoke than core system).
- Any one-off visual experiments (e.g., extra decorative sections) that are not repeated broadly.

## 9. Translation Rules for Future Projects
- Color guidance:
  - Keep base palette neutral (white/gray surfaces, dark neutral text).
  - Reserve saturated color for state/action only.
  - Use blue/indigo for primary action and informational emphasis.
- Typography guidance:
  - Use system-like sans with strong `text-sm`/`text-xs` utility scale.
  - Keep headings semibold, concise, and functional.
  - Use monospace for machine-like data (IDs, monetary totals, metrics).
- Spacing guidance:
  - Build with card modules (`p-4`/`p-6`) and consistent `gap-4` to `gap-6` rhythms.
  - Optimize for medium-high density; avoid oversized whitespace.
- Panel/card guidance:
  - Prefer bordered rounded cards with subtle shadows.
  - Use tinted sub-cards for alerts/summary callouts, not whole-page color flooding.
- Form/control guidance:
  - Compact control heights, inline icon affordances, grouped filter bars.
  - Keep control styling consistent across pages; preserve outline/primary hierarchy.
- Dashboard layout guidance:
  - Compose as: context header -> controls -> KPI band -> primary data surface.
  - Let tables drive the core workflow; charts are supportive context.
- Motion guidance:
  - Keep transitions short and functional; use loading spinners and state fades.
  - Avoid heavy motion choreography.
- Hierarchy guidance:
  - Make status and exceptions visually louder than descriptive copy.
  - Use badges/pills, color, and weight to guide triage-first reading.

## 10. Prompt-Ready Vibe Summary
Design an internal operations dashboard UI family with a neutral white/gray foundation, compact information-dense layouts, and a strong status-semantic language. Use rounded cards (mostly lg/xl/2xl), light borders, and subtle shadows. Structure screens as header + filter controls + KPI cards + table-centric core views, with charts as secondary context. Keep typography system-like and practical (small labels, semibold headings, monospace for metrics/IDs). Use blue/indigo as the primary action accent, and reserve green/amber/red/rose/purple for clear workflow states and risk signaling via pills/badges. Interaction should feel crisp and utilitarian: hover/focus clarity, short transitions, frequent loading indicators, and Radix-style modal/dropdown polish. Overall vibe: enterprise internal tool, modernized through soft corners and consistent component grammar, not flashy brand expression.
