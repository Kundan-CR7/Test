# Production Entry Mobile App

Mobile-first Vite + React app for daily CNC, Burma, Repair, and Notes entry.
The V1 app has no backend; drafts and custom people live in `localStorage`, and
the production build is installable as a PWA after deployment to HTTPS.

## Local Development

```bash
cd app
npm ci
npm run dev
```

## Quality Checks

```bash
cd app
npm run format:check
npm run lint
npm run build
```

## Preview Production Build

```bash
cd app
npm run build
npm run preview -- --host 127.0.0.1 --port 5191
```

## Google Sheet sync (serverless)

The app **does not** call the Google Sheets API from the browser with service-account
secrets (anyone could steal them from the phone). Instead:

1. The **frontend** builds a JSON payload and `POST`s it after a successful WhatsApp share.
2. A **serverless** endpoint writes to **two tabs** in the same spreadsheet:
   - **Logs** — one new row per WhatsApp share (full audit trail)
   - **Daily** — one row per **production date + shift**; totals **add up** when multiple operators share the same day
   - **Default:** Vercel function at `/api/append-production` (see `api/`)
   - **Alternative:** Google Apps Script web app (`scripts/google-apps-script/`)

### Vercel setup (using `credentials.json`)

1. Enable **Google Sheets API** for project `punjab-cncs` (if not already).
2. Put `credentials.json` in the repo root **locally only** (it is gitignored).  
   **If this file was ever shared in chat or committed, create a new key in Google Cloud → IAM → Service Accounts → Keys, then delete the old key.**
3. Open your Google Sheet → **Share** → add as **Editor**:
   `main-service-account@punjab-cncs.iam.gserviceaccount.com`
4. Copy the spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/<GOOGLE_SHEETS_ID>/edit`
5. In Vercel → Project → **Environment Variables** (Production):

   | Name | Value |
   |------|--------|
   | `SUBMIT_API_KEY` | Long random string (you choose) |
   | `GOOGLE_SHEETS_ID` | From step 4 |
   | `GOOGLE_SHEET_LOG_TAB_NAME` | `Logs` (tab for every share) |
   | `GOOGLE_SHEET_DAILY_TAB_NAME` | `Daily` (tab for per-day totals) |
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` | From `credentials.json` |

   Create two tabs in the spreadsheet with those exact names (or match your env values).

6. For the **frontend build**, add the same Vercel env var:
   - `VITE_SUBMIT_API_KEY` = same as `SUBMIT_API_KEY`

7. Redeploy from the **repository root** (not only the `app/` folder).

**Daily tab behavior:** Key = `Production Date` + `Shift`. First share that day creates a row; later shares the same day **add** CNC hours, sides, Burma total, and entry counts, and increment `Submissions`.

### Local full-stack dev

```bash
npm ci
cd app && npm ci
vercel dev
```

In another terminal: `cd app && npm run dev` (Vite proxies `/api` to `vercel dev`).

### Apps Script–only (no Vercel function)

See `scripts/google-apps-script/AppendProduction.gs`. Point `VITE_SHEETS_SUBMIT_URL` at the deployed web app URL.

## Deployment Notes

- Deploy the static `app/dist/` output to an HTTPS host.
- For sheet sync on Vercel, deploy from the **repo root** so `api/` functions are included.
- HTTPS is required for service workers, Add to Home Screen, and native file sharing.
- The app is a no-backend V1. Drafts and custom people are stored in `localStorage` on the device.
- After the first successful online load, the service worker caches the app shell so the form, summary preview, PNG generation, and local draft persistence continue to work offline.
- When a new build is available, the app shows a compact "Update available" toast with a manual Refresh action.
- WhatsApp handoff still depends on the platform share sheet and available connectivity. Desktop/unsupported browsers fall back to image download and text sharing.

## Browser Support

- Primary: Android Chrome 90+.
- Supported: iOS Safari 15+ for entry, preview, local persistence, and download fallback. Native file sharing depends on iOS support.
- Desktop Chrome/Edge/Safari/Firefox are supported for entry and download fallback; native WhatsApp/file share depends on platform support.

## Summary Share Testing

After deploying to HTTPS, test the summary image flow on Android Chrome:

1. Fill production data and open Preview Summary.
2. Generate the image and confirm a thumbnail appears.
3. Tap Share on WhatsApp and confirm the native share sheet attaches the PNG.
4. Send to a test WhatsApp chat and confirm the received image remains readable.

## PWA/Offline Testing

1. Deploy to HTTPS or run `npm run preview` locally.
2. Open the app once while online and wait for the service worker to install.
3. Reload or relaunch the app.
4. Simulate offline mode, then confirm the app shell opens and draft editing still works.
5. On Android Chrome over HTTPS, install with Add to Home Screen and verify standalone launch.

---

# Front-End Development System

This folder formalizes the product-development system used for high-fidelity HTML UI visualization projects.

The target output of this system is usually:

- a single standalone HTML artifact
- roughly 5,000-6,000 lines of HTML/CSS/JS by the end of execution
- a believable, navigable product simulation with hardcoded demo data

This structure is derived from the working patterns visible in:

- `OTPs/`
- `Antropi_WebDash/`
- earlier mini-phase workflows such as `THRD Communications/`

## What this system is for

Use this folder when you want to go from:

1. rough product idea
2. product requirements
3. frontend UX structure
4. detailed UI/UX execution
5. phase roadmap
6. mini-phase execution
7. final HTML visualization

without having to reinvent the process every time.

## Recommended document stack

The canonical stack is:

1. `product_development_structure.md`
2. `01_project_context_packet.md`
3. `02_detailed_ui_ux_design_standard.md`
4. `03_phase_roadmap_standard.md`
5. `04_mini_phase_protocol.md`
6. `05_phase_plan_template.md`

## What each file does

### `product_development_structure.md`

Defines the foundational pair:

- `requirements.md`
- `frontend_ui_spec.md`

This remains the base philosophy and should be read first.

### `01_project_context_packet.md`

Defines what project input should be given before document generation starts.

### `02_detailed_ui_ux_design_standard.md`

Defines the "design in English" layer that sits between frontend spec and implementation.

### `03_phase_roadmap_standard.md`

Defines how to convert the docs into a phase roadmap, including phase sizing logic and line-of-code estimation logic.

### `04_mini_phase_protocol.md`

Defines the atomic mini-phase loop for controlled implementation.

### `05_phase_plan_template.md`

Defines the template for a single executable phase plan or mini-phase execution plan.

## Core workflow

The lightweight workflow for most HTML visualization projects should be:

1. Fill the project context packet.
2. Generate `requirements.md`.
3. Generate `frontend_ui_spec.md`.
4. Generate `detailed_ui_ux_design.md`.
5. Generate `PHASE_ROADMAP.md`.
6. Generate per-phase or per-mini-phase plans.
7. Build the HTML artifact phase by phase.

## Source-of-truth order

When documents conflict, use this order:

1. `requirements.md`
2. `frontend_ui_spec.md`
3. `detailed_ui_ux_design.md`
4. `PHASE_ROADMAP.md`
5. per-phase plan docs
6. prototype reference files
7. final implementation file

Prototype HTML files are references, not product truth.

## Why this structure exists

The repeated pattern across the example projects is:

- product clarity first
- frontend translation second
- visual execution third
- phased implementation fourth

The system breaks when implementation starts before those layers are stable.

This folder is meant to keep that from happening.
