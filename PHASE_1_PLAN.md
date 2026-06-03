# Phase 1: Foundation and Design Tokens

## Objective

Create the empty-but-correct working app foundation for the Production Entry Mobile App.

After this phase, the repository should be a Vite + React 18 + TypeScript + Tailwind CSS project that renders a mobile-first 480px-capped app shell with the correct global design tokens, safe-area behavior, and a sticky header showing:

```text
Production Entry
Tuesday - 05 May 2026
```

The date text is computed from `new Date()` for now. Phase 2 will connect it to reducer state.

## Planning Basis

This plan follows `05_phase_plan_template.md`, which says each executable phase plan must define:

- objective
- estimated output
- inputs
- what the phase adds
- what the phase does not do
- implementation steps
- acceptance criteria
- notes / rationale

It also follows `03_phase_roadmap_standard.md`, which requires every phase to be additive, demo-able, scoped, and tied to source documents rather than invented behavior.

## Estimated Output

Approximate size: 250 LOC across project config and 4 source files.

Expected files created or modified:

```text
package.json
package-lock.json
index.html
vite.config.ts
tailwind.config.ts
postcss.config.js
tsconfig.json
tsconfig.node.json
eslint.config.js
.prettierrc
public/manifest.webmanifest
src/main.tsx
src/App.tsx
src/components/Header.tsx
src/styles/tokens.css
src/styles/base.css
src/vite-env.d.ts
README.md
```

Do not delete or overwrite the existing planning documents. `production_entry.html` stays as a reference prototype.

## Inputs

Read in this order:

1. `requirements.md`
   - Confirms the product is mobile-first, simple, non-spreadsheet, and phone-priority.
2. `frontend_ui_spec.md` section 7
   - Defines global shell: max-width 480px, soft neutral background, card/touch/typography direction.
3. `detailed_ui_ux_design.md` sections 3 and 4
   - Defines typography, color, spacing, radius, shadow, motion, app container, safe areas, scroll behavior.
4. `PHASE_ROADMAP.md` Phase 1
   - Defines the exact scope and acceptance criteria for this phase.
5. `05_phase_plan_template.md`
   - Defines this handoff format.
6. `production_entry.html`
   - Reference only for already-proven token values and shell styling. Do not treat it as the target architecture.

## What This Phase Adds

- Vite React TypeScript project foundation.
- Tailwind CSS configured with app-specific design tokens.
- Global CSS variables in `src/styles/tokens.css`.
- Base app reset and typography rules in `src/styles/base.css`.
- Root React render path.
- 480px-capped app container.
- Safe-area-aware page shell.
- Sticky 56px header.
- Current-date subtitle formatted for the worker-facing header.
- PWA manifest stub.
- Linting and formatting baseline.
- README instructions for local development, build, preview, and deployment constraints.

## What This Phase Does NOT Do

- No `ProductionEntryState` yet.
- No `useReducer`, reducer actions, selectors, or persistence.
- No date picker.
- No shift control.
- No live totals strip.
- No CNC cards.
- No form inputs.
- No sticky bottom action bar.
- No summary modal.
- No PNG generation.
- No Web Share API.
- No service worker.
- No offline caching.
- No real PWA icons.
- No backend.
- No router.
- No global state library.
- No visual redesign beyond the documented shell and tokens.

## Implementation Steps

### Step 1: Preserve the existing docs root

The repository is currently a documentation root, not an existing Vite project. Before scaffolding:

- Confirm the current directory contains the planning documents.
- Do not remove or overwrite any `.md` files.
- Keep `production_entry.html` in place as a reference.

If `npm create vite@latest . -- --template react-ts` refuses to scaffold into the non-empty directory, use a temporary scaffold directory, then copy only the Vite project files into the repo root.

Recommended fallback:

```bash
npm create vite@latest phase1-vite-scaffold -- --template react-ts
```

Then copy the generated app files into the root while preserving all existing project docs.

### Step 2: Install core dependencies

Install the runtime and build dependencies required for Phase 1:

```bash
npm install
npm install -D tailwindcss postcss autoprefixer prettier eslint
```

If the Vite template already provides some dependencies, do not duplicate them.

Do not install `html2canvas`, `dom-to-image-more`, Workbox, or `vite-plugin-pwa` in this phase. Those belong to later phases.

### Step 3: Configure Tailwind

Create or update `tailwind.config.ts`.

The Tailwind theme must mirror the design tokens from `detailed_ui_ux_design.md` section 3.

Required color tokens:

```text
bg-app
bg-card
bg-sunken
bg-overlay
text-primary
text-secondary
text-muted
text-disabled
text-inverse
accent-50
accent-600
accent-700
success-50
success-600
warning-50
warning-600
danger-50
danger-600
border-soft
border-strong
border-focus
```

Use CSS variables as the value source, for example:

```ts
colors: {
  "bg-app": "var(--bg-app)",
  "text-primary": "var(--text-primary)",
  "accent-600": "var(--accent-600)"
}
```

Required spacing tokens:

```text
0: 0
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
8: 32px
10: 40px
14: 56px
```

Required radius tokens:

```text
input: 12px
button: 14px
card: 16px
sheet: 20px
pill: 999px
```

Required shadow tokens:

```text
sm
md
lg
```

Required font size tokens:

```text
display-xl
display-lg
heading-lg
heading-md
heading-sm
body-lg
body-md
body-sm
caption
micro
```

The `micro` token should include uppercase styling via a utility class in CSS if Tailwind config cannot encode all text-transform needs cleanly.

### Step 4: Create CSS token source

Create `src/styles/tokens.css`.

This file is the source of truth for CSS variables. Include:

- surfaces
- text colors
- accent colors
- semantic colors
- line colors
- shadow variables
- motion variables if useful

Use the exact values from `detailed_ui_ux_design.md` section 3.2 and section 3.5.

Do not add dark mode variables. Dark mode is out of scope for V1.

### Step 5: Create base CSS

Create `src/styles/base.css`.

It should include:

- Tailwind layers:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- global box sizing
- body reset
- system font stack
- app background
- default text color
- antialiasing
- `font-variant-numeric: tabular-nums` helper class
- focus-visible baseline if needed
- reduced-motion baseline for later animations

Keep this file light. Do not create component styles that belong to later phases.

### Step 6: Wire React entry

Create `src/main.tsx`.

Requirements:

- Import React and ReactDOM.
- Import `src/styles/tokens.css`.
- Import `src/styles/base.css`.
- Render `<App />` into `#root`.
- Leave strict mode enabled.

### Step 7: Build the shell in `App.tsx`

Create `src/App.tsx`.

The app should render:

```text
body background: bg-app
centered app column
max-width: 480px
min-height: 100dvh
safe-area-aware top and bottom spacing
Header
empty content area
```

Recommended structure:

```tsx
export default function App() {
  return (
    <main className="mx-auto min-h-dvh max-w-[480px] bg-bg-app px-4 pb-[calc(env(safe-area-inset-bottom)+96px)]">
      <Header />
      <section aria-label="Production entry content" className="pt-4" />
    </main>
  );
}
```

Adjust class names to match the final Tailwind setup.

Do not add placeholder cards. The visual demo for this phase is the app shell and header only.

### Step 8: Build `Header.tsx`

Create `src/components/Header.tsx`.

Behavior:

- Computes the date on render from `new Date()`.
- Formats it like `Tuesday - 05 May 2026`.
- Renders title `Production Entry`.
- Renders date subtitle underneath.

Visual rules:

- Height: 56px.
- Sticky top.
- Background: `bg-app`.
- Safe-area-aware top padding.
- Left aligned.
- Title uses `heading-lg`.
- Subtitle uses `caption` and muted text.
- No menu, avatar, settings, or extra controls.

Use a local formatter function in this file for Phase 1. Move shared format utilities later when Phase 8 introduces `src/utils/format.ts`.

### Step 9: Add manifest stub

Create `public/manifest.webmanifest`.

Minimum content:

```json
{
  "name": "Production Entry",
  "short_name": "Production Entry",
  "description": "Daily CNC and Burma production entry.",
  "start_url": ".",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#F4F5F7",
  "background_color": "#F4F5F7"
}
```

Full icon set is Phase 12. Do not block Phase 1 on final icons.

Link the manifest from `index.html`.

### Step 10: Configure linting and formatting

Create:

```text
eslint.config.js
.prettierrc
```

Minimum expectations:

- TypeScript and React linting work.
- Prettier can format TS, TSX, CSS, JSON, and MD.
- Add package scripts:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

If the Vite template uses a different TypeScript build script, keep it if it is equivalent.

### Step 11: Update README

Update `README.md` carefully. It currently describes the document system, so do not erase that context.

Add a new section near the top or after the current overview:

```text
## Production Entry App

### Local development
npm install
npm run dev

### Build
npm run build

### Preview production build
npm run preview

### Deployment notes
- Static HTTPS hosting required.
- Web Share with files and service workers require HTTPS.
- PWA/offline support lands in Phase 12.
```

Keep the document-stack explanation intact because it remains useful project context.

### Step 12: Verify locally

Run:

```bash
npm run lint
npm run build
```

Then start:

```bash
npm run dev
```

Open the local dev URL in a browser and verify:

- app loads
- no console errors
- centered 480px shell appears
- header is visible
- date text is formatted correctly
- desktop background outside the shell is the same soft app background

If a dev server is already running on the default Vite port, use the next available port.

## Acceptance Criteria

- [ ] Existing markdown docs and `production_entry.html` are preserved.
- [ ] `npm install` completes.
- [ ] `npm run dev` boots the Vite app.
- [ ] `npm run build` produces a static `dist/` without warnings.
- [ ] `npm run lint` passes.
- [ ] App shell is centered at `max-width: 480px`.
- [ ] Shell uses `min-height: 100dvh`.
- [ ] Body and app background use `--bg-app`.
- [ ] Header is sticky at top and 56px tall.
- [ ] Header title reads `Production Entry`.
- [ ] Header subtitle shows the current date in worker-readable format.
- [ ] Safe-area top and bottom insets are accounted for.
- [ ] Tailwind color tokens resolve for surfaces, text, accent, semantic, and border roles.
- [ ] Tailwind spacing, radius, shadow, and font-size tokens resolve.
- [ ] Input text scale is defined at 17px for future iOS no-zoom behavior.
- [ ] PWA manifest stub is linked from `index.html`.
- [ ] README includes run/build/preview/deploy notes.
- [ ] On 375x667 viewport, shell fits without horizontal scroll.
- [ ] On 1440x900 viewport, app remains centered and capped at 480px.
- [ ] No form, CNC, Burma, repair, notes, summary, sharing, persistence, or offline functionality is introduced yet.

## Manual QA Checklist

Use browser devtools device emulation:

- [ ] iPhone SE, 375x667.
- [ ] Small Android, 360x640.
- [ ] Desktop, 1440x900.

For each viewport:

- [ ] No horizontal scroll.
- [ ] Header remains at the top while scrolling.
- [ ] Empty content area does not look broken.
- [ ] Background color is consistent inside and outside the app column.
- [ ] Text remains readable and aligned.

Optional if Lighthouse is available:

- [ ] Production preview Performance >= 95.
- [ ] Production preview Accessibility >= 95.
- [ ] PWA installability is not expected yet.

## Risks and Guardrails

- The root directory is non-empty. Scaffolding must preserve existing docs.
- `production_entry.html` includes useful token values, but the app target is React/Tailwind, not vanilla JS.
- Do not introduce Phase 2 state early. The header date can be local-only for now.
- Do not install future dependencies early. `html2canvas`, share utilities, persistence, and service worker packages belong later.
- Avoid inventing colors, shadows, or typography outside `detailed_ui_ux_design.md` section 3.
- Avoid decorative layout. This phase should feel intentionally empty, not unfinished.

## Handoff Notes For Phase 2

Phase 2 should be able to start from:

- stable Vite project
- stable Tailwind token map
- stable `Header` component
- stable shell dimensions and safe-area behavior
- no existing state architecture to migrate

The only expected Phase 2 change to Phase 1 work is wiring the header subtitle to `state.date` instead of local `new Date()`.
