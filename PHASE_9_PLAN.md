# Phase 9: PNG Generation + Web Share + Download

## Objective

Deliver the core product promise: generate a real PNG from the locked Summary Card and make it shareable on WhatsApp.

After this phase, the worker should be able to:

```text
Preview Summary
Generate Image
Share on WhatsApp
Download Image
```

The target interaction:

```text
1. Worker opens Summary Preview.
2. Worker taps Generate Image.
3. Button changes to Generating...
4. Hidden 540px Summary Card DOM is captured with html2canvas at scale 2.
5. A 1080px-wide PNG File is created.
6. Thumbnail appears in the modal.
7. Share on WhatsApp and Download Image buttons appear.
8. Worker taps Share on WhatsApp.
9. Native share sheet opens with the PNG file attached when supported.
10. If file sharing is not supported, the PNG downloads and WhatsApp text fallback opens.
```

Phase 9 is the first phase where the app produces and shares the real artifact.

## Prerequisite

Phases 1, 2, 3, 4, 5, 6, 7, and 8 must be implemented before this phase is executed.

This plan assumes the app already has:

```text
src/components/primitives/Sheet.tsx
src/components/summary/SummaryModal.tsx
src/components/summary/SummaryCard.tsx
src/components/StickyActionBar.tsx
src/components/primitives/Toast.tsx
src/utils/format.ts
src/state/selectors.ts
```

If the implementation lives under `app/`, apply every source path in this plan under `app/src/...` and install dependencies from `app/`.

The current workspace has an `app/` implementation with earlier-phase source files and planning docs through Phase 8. Do not execute Phase 9 against `app/src` until Phases 4, 5, 6, 7, and 8 have actually landed there.

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

- `requirements.md` sections 20 and 21
- `frontend_ui_spec.md` sections 30.6, 31, 34.4, and 35
- `detailed_ui_ux_design.md` sections 5.3.2, 6.4, 7.4, 8.3, 8.4, 13, 14, 15.2, 15.3, 15.6, and 15.8
- `PHASE_ROADMAP.md` Phase 9
- `PHASE_1_PLAN.md` future dependency and HTTPS deployment boundaries
- `PHASE_5_PLAN.md` Toast reuse notes
- `PHASE_7_PLAN.md` app-level Toast and Sticky Action Bar handoff
- `PHASE_8_PLAN.md` Summary Modal, Summary Card, and Phase 9 handoff
- `production_entry.html` PNG/share implementation, as reference only
- `README.md` HTTPS deployment notes

## Estimated Output

Approximate size: 350-500 LOC plus dependency lockfile changes.

Expected dependency changes:

```text
package.json
package-lock.json
```

Expected files created:

```text
src/utils/png.ts
src/utils/share.ts
src/utils/textSummary.ts
src/components/summary/ShareActions.tsx
```

Optional files created if the implementation needs a small isolated host component:

```text
src/components/summary/SummaryCaptureHost.tsx
```

Expected files modified:

```text
src/components/summary/SummaryModal.tsx
src/components/summary/SummaryCard.tsx
src/components/primitives/Toast.tsx
src/styles/base.css
README.md
```

`README.md` only needs a small update if the implementation adds concrete deploy/share test instructions. Do not rewrite broader docs.

Do not modify `production_entry.html` except as a read-only reference. Do not remove or rewrite existing planning documents.

## Seamless Continuity Review

Phase 9 must preserve the Phase 8 rendering contract.

### From Phase 1

Phase 1 explicitly deferred:

```text
html2canvas
Web Share API
future share utilities
```

Phase 9 is the correct point to install `html2canvas`.

Do not add:

- service worker
- PWA install behavior
- offline caching

Those remain Phase 12.

### From Phase 5 And Phase 7

The app should already have a single Toast slot.

Phase 9 should reuse it for:

```text
Image ready.
Shared to WhatsApp.
Image downloaded.
Image saved to your phone. Share it manually in the group.
Couldn't generate image. Please try again.
```

Do not create a second toast system inside the modal.

### From Phase 8

Phase 8 created:

```text
SummaryModal
SummaryCard
Generate Image button
Edit Entry button
```

Phase 9 should not create a second summary renderer.

The visible preview and hidden capture source must both render:

```text
<SummaryCard ... />
```

The hidden capture source may pass a styling prop such as `mode="capture"` or `captureWidth={540}`, but the data/content component must be the same.

### From Phase 11 Boundary

Phase 9 should not add:

- persistence
- day rollover
- final validation pass
- per-card error borders
- card warning banners

Summary Card should continue to use the valid-entry filtering from Phase 8.

## Inputs

Read in this order before implementing:

1. `PHASE_8_PLAN.md` handoff notes
   - Confirms Summary Card exists and is locked.
   - Confirms Generate Image button exists but is not wired.
2. `PHASE_ROADMAP.md` Phase 9
   - Defines dependency, utility files, hidden capture container, ShareActions, thumbnail, fallbacks, and real-device test.
3. `requirements.md` section 20
   - Defines PNG generation requirements.
4. `requirements.md` section 21
   - Defines WhatsApp sharing requirement and fallback behavior.
5. `frontend_ui_spec.md` section 30.6
   - Defines Generate, Share, and Download action order.
6. `frontend_ui_spec.md` section 31
   - Defines client-side PNG capture, filename, and sharing fallback order.
7. `frontend_ui_spec.md` sections 34.4 and 35
   - Defines share failure and image success copy.
8. `detailed_ui_ux_design.md` section 5.3.2
   - Defines modal action states, thumbnail, and success/failure behavior.
9. `detailed_ui_ux_design.md` section 6.4
   - Defines exact PNG artifact dimensions and white-background rules.
10. `detailed_ui_ux_design.md` section 7.4
    - Defines Summary Preview state machine.
11. `detailed_ui_ux_design.md` section 13
    - Defines workflow choreography from Generate Image through fallback sharing.
12. `detailed_ui_ux_design.md` section 15.2
    - Defines `html2canvas` wrapper details.
13. `detailed_ui_ux_design.md` section 15.3
    - Defines Web Share API fallback implementation.
14. `detailed_ui_ux_design.md` section 15.6
    - Confirms PNG and share must be real, not simulated.
15. `detailed_ui_ux_design.md` section 15.8
    - Confirms HTTPS is required for Web Share API testing.
16. `production_entry.html`
    - Reference only for state transitions and fallback behavior.

## What This Phase Adds

- `html2canvas` dependency.
- PNG capture utility.
- Hidden 540px Summary Card capture source.
- 1080px-wide PNG output.
- Filename generation.
- Blob-to-File conversion.
- Summary thumbnail after generation.
- ShareActions state machine.
- Web Share API file sharing path.
- Download Image fallback.
- WhatsApp text fallback.
- Plain-text summary utility.
- Generation failure handling.
- Share/download success toasts.
- Real-device QA plan for Android Chrome over HTTPS.

## What This Phase Does NOT Do

- No Summary Card redesign.
- No separate PNG-only summary renderer.
- No persistence.
- No day-rollover prompt.
- No Add Person modal.
- No service worker.
- No offline shell cache.
- No backend.
- No Google Sheet integration.
- No final validation pass.
- No per-card warning banners.
- No changes to CNC calculations.
- No changes to Summary Modal open/close behavior except action stack state.

## Dependency Plan

Install:

```bash
npm install html2canvas
```

If the app lives under `app/`, run:

```bash
cd app
npm install html2canvas
```

Expected package changes:

```text
dependencies.html2canvas
package-lock.json
```

Do not install:

```text
dom-to-image-more
workbox
vite-plugin-pwa
```

`dom-to-image-more` is only a fallback candidate if real Android testing reveals unacceptable `html2canvas` text rendering issues. Do not add it preemptively.

## PNG Capture Utility

Create:

```text
src/utils/png.ts
```

Recommended public API:

```ts
type CaptureSummaryOptions = {
  node: HTMLElement;
  date: string;
  shift: Shift;
};

export async function captureSummary(
  options: CaptureSummaryOptions
): Promise<File>;
```

The roadmap shorthand says:

```text
captureSummary(node) -> File
```

The implementation needs `date` and `shift` to produce the required filename, so pass them as explicit options instead of reaching into global state.

### Capture Settings

Use `html2canvas`:

```ts
const canvas = await html2canvas(node, {
  scale: 2,
  backgroundColor: '#FFFFFF',
  useCORS: false,
  logging: false,
  windowWidth: 540,
});
```

Notes:

- Source DOM must be 540px wide.
- `scale: 2` creates a 1080px-wide PNG.
- `backgroundColor: '#FFFFFF'` prevents transparent artifacts.
- `useCORS: false` is acceptable because Summary Card should not contain external images.
- If future content introduces external images, revisit CORS in that future phase.

### Blob Conversion

Use a safe `toBlob` wrapper:

```ts
function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not create PNG blob.'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}
```

Do not assume `blob` is non-null.

### Filename

Required pattern:

```text
production-summary-YYYY-MM-DD-{shift}.png
```

Examples:

```text
production-summary-2026-05-05-morning.png
production-summary-2026-05-05-evening.png
```

Use lowercase shift slug:

```ts
shift === 'morning' ? 'morning' : 'evening'
```

### Optional Dimension Check

After capture, consider validating:

```text
canvas.width === 1080
```

If width is not 1080, throw a clear error so QA catches capture layout drift early.

Do not silently ship a viewport-width screenshot.

## Hidden Capture Source

The captured DOM should not be the scaled visible preview.

Use a hidden offscreen capture container:

```text
position absolute
top -10000px
left 0
width 540px
background white
pointer-events none
```

Important:

- Do not use `display: none`.
- Do not use `visibility: hidden`.
- Do not scale the capture source with CSS transforms.
- Do not capture the modal preview if it is responsive/scaled.

Mount this container only while generating, then unmount it after capture.

Recommended structure:

```tsx
{isGenerating && (
  <div className="summary-capture-host" aria-hidden="true">
    <SummaryCard
      state={state}
      generatedAt={generatedAt}
      mode="capture"
    />
  </div>
)}
```

If `SummaryCard` does not support a `mode` prop, add one only for layout sizing. Do not fork content rendering.

### Layout Readiness

Before capturing:

```text
mount capture host
wait for next animation frame
wait for document.fonts.ready when available
run captureSummary
```

Recommended:

```ts
await new Promise(requestAnimationFrame);
if ('fonts' in document) await document.fonts.ready;
```

The app uses system fonts, but waiting reduces layout race risk.

## Share Utility

Create:

```text
src/utils/share.ts
```

Recommended API:

```ts
export type ShareSummaryResult = 'shared' | 'downloaded' | 'failed';

export async function shareSummary(
  file: File,
  textFallback: string
): Promise<ShareSummaryResult>;

export function downloadFile(file: File): void;
```

### Native Share Path

Use the Web Share API with file support:

```ts
if (
  typeof navigator.share === 'function' &&
  typeof navigator.canShare === 'function' &&
  navigator.canShare({ files: [file] })
) {
  await navigator.share({
    files: [file],
    title: 'Production Summary',
    text: textFallback,
  });
  return 'shared';
}
```

Notes:

- Web Share with files requires HTTPS on real devices.
- It usually must run directly from a user gesture.
- Do not call this automatically after generation.
- Keep the Share button click as the user gesture.

### Abort Behavior

If the user cancels the native share sheet:

```text
DOMException name === AbortError
```

Recommended behavior:

- return `failed`
- do not download automatically
- do not show a scary error toast
- keep the modal in the ready state

This avoids punishing a deliberate cancel.

For non-abort share errors, fall back to download + WhatsApp text.

### Fallback Path

If native file sharing is not supported:

```text
download PNG
open whatsapp://send?text=<plain-text-summary>
return downloaded
```

Implementation:

```ts
downloadFile(file);
window.location.href = `whatsapp://send?text=${encodeURIComponent(textFallback)}`;
return 'downloaded';
```

### Download Helper

Use object URLs safely:

```ts
const url = URL.createObjectURL(file);
const a = document.createElement('a');
a.href = url;
a.download = file.name;
document.body.appendChild(a);
a.click();
a.remove();
window.setTimeout(() => URL.revokeObjectURL(url), 1000);
```

Do not leave object URLs unreleased.

## Text Summary Utility

Create:

```text
src/utils/textSummary.ts
```

Purpose:

```text
Produce the WhatsApp text fallback using the same state and selectors as SummaryCard.
```

Recommended API:

```ts
export function buildTextSummary(
  state: ProductionEntryState,
  generatedAt: Date
): string;
```

Content should mirror the Summary Card:

```text
Daily Production Summary
05 May 2026 - Morning Shift

CNC Production
1. Avinash - M1 - Hex 41 - Size 1/2 - Side 1
   Cycle 2m 26s - Count 193 - 7.83 hrs

Total CNC Hours: 7.83 hrs

Burma Production
Burma 1: 500
Burma 2: 700
Burma 3: 350
Total Burma: 1,550

Repair
Avinash - 20 pcs - Thread repair

Notes
Machine 2 setting took extra time.
```

Rules:

- Use valid CNC entries only.
- Use the same `format.ts` utilities as Summary Card.
- Omit Repair when blank.
- Omit Notes when blank.
- Include Burma even when all counts are zero.
- Keep text plain. No Markdown formatting needed.

## ShareActions Component

Create:

```text
src/components/summary/ShareActions.tsx
```

Purpose:

```text
Own the Summary Modal action-stack state for generation, thumbnail, share, and download.
```

Recommended props:

```ts
type ShareActionsProps = {
  state: ProductionEntryState;
  generatedAt: Date;
  captureNode: HTMLElement | null;
  onEdit: () => void;
  showToast: (toast: ToastInput) => void;
};
```

Adapt `ToastInput` to the actual toast API from Phase 7/8.

### State Machine

Use explicit state:

```ts
type ShareActionState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'ready'; file: File; thumbnailUrl: string }
  | { status: 'sharing'; file: File; thumbnailUrl: string };
```

You may also include:

```text
error
```

but generation errors can simply reset to `idle` and show the failure toast.

### Idle State

Visible:

```text
[ Generate Image ]
[ Edit Entry     ]
```

Generate Image:

- primary
- on click starts generation

Edit Entry:

- secondary or ghost per Phase 8
- closes modal

### Generating State

Visible:

```text
[ Generating... ] disabled
[ Edit Entry    ]
```

Show spinner if the app already has a spinner pattern or can implement a small CSS spinner. Keep it simple.

Generation should usually resolve in 150-700ms.

Make sure the UI paints the generating state before capture begins:

```ts
setStatus({ status: 'generating' });
await new Promise(requestAnimationFrame);
```

### Ready State

Visible:

```text
Image ready.
[thumbnail]
[ Share on WhatsApp ]
[ Download Image    ]
[ Edit Entry        ]
```

Rules:

- thumbnail width 180px
- centered
- soft border
- border radius 8
- shadow-sm
- success caption `Image ready.`
- Share button appears only after file exists
- Download button appears only after file exists

### Sharing State

Visible:

```text
[ Sharing... ] disabled
[ Download Image ]
[ Edit Entry ]
```

If native share resolves:

```text
toast "Shared to WhatsApp."
return to ready state
```

If fallback downloads:

```text
toast "Image saved to your phone. Share it manually in the group."
return to ready state
```

If user cancels native share:

```text
return to ready state
no toast required
```

### Download Button

On click:

```text
downloadFile(file)
toast "Image downloaded."
```

Do not close the modal automatically.

### Cleanup

When modal closes or generated file changes:

```text
URL.revokeObjectURL(thumbnailUrl)
```

Do not leak object URLs.

Reset state to `idle` when the modal opens with a new Summary Card or new `generatedAt`.

## SummaryModal Integration

Update:

```text
src/components/summary/SummaryModal.tsx
```

Replace the Phase 8 static action stack with:

```text
ShareActions
hidden capture host
```

Expected composition:

```tsx
<SummaryCard state={state} generatedAt={generatedAt} />

{captureMounted && (
  <div ref={captureRef} className="summary-capture-host" aria-hidden="true">
    <SummaryCard state={state} generatedAt={generatedAt} mode="capture" />
  </div>
)}

<ShareActions
  state={state}
  generatedAt={generatedAt}
  captureNode={captureRef.current}
  onEdit={onClose}
  showToast={showToast}
/>
```

Implementation can invert ownership:

- `ShareActions` can own `captureMounted` and render the capture host via a render prop.
- `SummaryModal` can own it and pass node into `ShareActions`.

Choose the pattern that keeps state easiest to reason about.

Hard rule:

```text
capture the hidden 540px SummaryCard, not the visible modal preview
```

## SummaryCard Capture Mode

Modify:

```text
src/components/summary/SummaryCard.tsx
```

Only if needed, add:

```ts
type SummaryCardProps = {
  ...
  mode?: 'preview' | 'capture';
};
```

Preview mode:

```text
width min(540px, 100%)
responsive in modal
```

Capture mode:

```text
width 540px
padding 32px
background white
color text-primary
no responsive scaling
```

Do not branch content by mode.

## Toast Copy

Use these exact copies unless the implementation has already standardized equivalent strings:

Generation success caption:

```text
Image ready.
```

Share success toast:

```text
Shared to WhatsApp.
```

Download success toast:

```text
Image downloaded.
```

Fallback share toast:

```text
Image saved to your phone. Share it manually in the group.
```

Generation failure toast:

```text
Couldn't generate image. Please try again.
```

Share failure copy from frontend spec:

```text
Sharing did not work on this phone. Please download the image and share manually.
```

Use the shorter fallback toast above when fallback download succeeds. Use the share failure copy only when both native share and fallback cannot complete.

## Error Handling

### Generation Failure

Causes:

- `html2canvas` throws
- capture node is missing
- `toBlob` returns null
- canvas width is not expected

Behavior:

```text
status returns to idle
Generate Image button is enabled again
toast "Couldn't generate image. Please try again."
modal remains open
```

Do not close the modal.

### Native Share Unsupported

Behavior:

```text
download file
open whatsapp://send text fallback
toast fallback instruction
```

### Native Share Abort

Behavior:

```text
no fallback download
no failure toast
ready state remains
```

Reason:

The user may intentionally cancel the share sheet.

### Native Share Error

Behavior:

```text
attempt fallback download + WhatsApp text
if fallback works: toast fallback instruction
if fallback throws: toast share failure copy
```

### Download Failure

Rare, but handle:

```text
toast share failure copy
ready state remains
```

## Implementation Steps

## Step 1 - Confirm Phase 8 Baseline

Verify these exist:

```text
src/components/primitives/Sheet.tsx
src/components/summary/SummaryModal.tsx
src/components/summary/SummaryCard.tsx
src/utils/format.ts
```

Verify:

- Preview Summary opens modal.
- Summary Card renders the locked artifact.
- Generate Image button exists but does not generate yet.
- App-level Toast slot exists.

If these are missing, finish Phase 8 first.

## Step 2 - Install `html2canvas`

Run from the app directory:

```bash
npm install html2canvas
```

Then verify:

```bash
npm run build
```

Do not proceed if the dependency causes type/build errors.

## Step 3 - Create `png.ts`

Create:

```text
src/utils/png.ts
```

Implement:

- filename helper
- `captureSummary`
- `canvasToPngBlob`
- optional 1080px width assertion

Keep it independent from React.

## Step 4 - Create `textSummary.ts`

Create:

```text
src/utils/textSummary.ts
```

Use:

- `validCncEntries`
- `totalSummaryCncHours`
- `totalBurma`
- `hasRepairData`
- `hasNotes`
- format utilities

Do not query DOM text to build the fallback.

## Step 5 - Create `share.ts`

Create:

```text
src/utils/share.ts
```

Implement:

- `shareSummary`
- `downloadFile`
- AbortError handling
- fallback download + WhatsApp text intent
- object URL cleanup

Keep it independent from React.

## Step 6 - Add Capture Host Styling

Update:

```text
src/styles/base.css
```

Add a class similar to:

```css
.summary-capture-host {
  position: absolute;
  top: -10000px;
  left: 0;
  width: 540px;
  background: #fff;
  pointer-events: none;
}
```

Ensure it is not `display: none`.

## Step 7 - Add SummaryCard Capture Mode If Needed

Update:

```text
src/components/summary/SummaryCard.tsx
```

Add capture sizing without changing content.

Verify capture mode:

- width is exactly 540px
- background is white
- no responsive max-width changes
- no transform scaling

## Step 8 - Create `ShareActions`

Create:

```text
src/components/summary/ShareActions.tsx
```

Implement:

- idle state
- generating state
- ready state
- sharing state
- thumbnail object URL
- cleanup on unmount
- Generate Image button
- Share on WhatsApp button
- Download Image button
- Edit Entry button
- toasts

Keep state local to `ShareActions` or `SummaryModal`; do not put generated file in global production state.

## Step 9 - Wire `SummaryModal`

Update:

```text
src/components/summary/SummaryModal.tsx
```

Replace the placeholder Generate Image action stack with `ShareActions`.

Mount hidden capture source only while needed.

Reset ShareActions state when:

- modal opens with a new `generatedAt`
- modal closes
- Summary state changes while modal is open

Do not change modal open/close/focus-trap behavior from Phase 8.

## Step 10 - Verify PNG Locally

Manual local check:

1. Start dev server.
2. Fill one valid CNC entry and Burma count.
3. Open Summary Preview.
4. Tap Generate Image.
5. Confirm thumbnail appears.
6. Click Download Image.
7. Open downloaded PNG.
8. Confirm:
   - width is 1080px
   - background is white
   - text is readable
   - Summary Card content matches visible preview
   - filename matches pattern

Local dev is enough for download testing. It is not enough for final Web Share file testing.

## Step 11 - Verify Share Fallback Locally

On desktop browser without file sharing:

1. Generate image.
2. Click Share on WhatsApp.
3. Confirm PNG downloads.
4. Confirm browser attempts to open `whatsapp://send`.
5. Confirm fallback toast appears.

The `whatsapp://` intent may show a browser prompt or do nothing if WhatsApp is not installed. That is acceptable for desktop fallback testing.

## Step 12 - HTTPS Device Test

Deploy a preview build to an HTTPS static host.

Examples:

```text
Vercel
Netlify
Cloudflare Pages
GitHub Pages
```

Test on a real Android phone with Chrome:

1. Open deployed HTTPS URL.
2. Fill real-ish production data.
3. Preview Summary.
4. Generate Image.
5. Tap Share on WhatsApp.
6. Confirm native share sheet opens.
7. Choose WhatsApp.
8. Choose a test group/contact.
9. Confirm PNG arrives attached.
10. Confirm image is readable after WhatsApp compression.

This test is required for Phase 9 acceptance. The Web Share API path cannot be trusted from desktop-only testing.

## Step 13 - Optional iOS/Safari Test

If an iPhone is available:

1. Open HTTPS URL in Safari.
2. Generate image.
3. Tap Share.
4. Confirm either:
   - file share works, or
   - fallback download/text path works.

Document observed behavior in implementation notes.

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

Also run a production preview if possible:

```bash
npm run preview
```

## Data Flow

Generate:

```text
Generate Image click
-> mount hidden 540px SummaryCard
-> wait for layout
-> captureSummary(captureNode)
-> File production-summary-YYYY-MM-DD-shift.png
-> create thumbnail object URL
-> ready action state
```

Share:

```text
Share on WhatsApp click
-> buildTextSummary(state, generatedAt)
-> shareSummary(file, textFallback)
-> native file share OR download + whatsapp text fallback
-> toast result
```

Download:

```text
Download Image click
-> downloadFile(file)
-> toast Image downloaded.
```

Cleanup:

```text
modal closes or generated file replaced
-> revoke thumbnail object URL
-> unmount capture host
```

## Visual Details

Generating button:

```text
primary button
disabled
label "Generating..."
optional small spinner
```

Ready caption:

```text
Image ready.
success-600
body-sm
font 600
centered above thumbnail
```

Thumbnail:

```text
width 180px
centered
border border-soft
radius 8
shadow-sm
```

Ready buttons:

```text
Share on WhatsApp   primary
Download Image      secondary
Edit Entry          secondary/ghost from Phase 8
```

Do not use a separate WhatsApp-green button unless the existing design system already chose that. The documented button catalog treats Share on WhatsApp as a primary action.

## Edge Cases

### Capture Node Missing

Expected:

```text
toast generation failure
return to idle
modal remains open
```

### Empty But Previewable Burma Summary

State:

```text
zero valid CNC entries
Burma total > 0
```

Expected:

```text
PNG contains No CNC entries
PNG contains Burma counts
share/download works
```

### Long Summary

State:

```text
13+ CNC entries
long notes
```

Expected:

```text
SummaryCard grows vertically
PNG height grows dynamically
width remains 1080px
compact CNC mode from Phase 8 is preserved
```

### User Clicks Generate Twice

Expected:

```text
second click impossible while generating
no duplicate captures
```

### User Closes Modal During Generation

Expected:

```text
no React state update warning
object URLs cleaned up
capture host unmounted
```

Use a cancellation flag or mounted ref if needed.

### User Cancels Native Share Sheet

Expected:

```text
modal remains ready
no automatic download
no failure toast required
```

### Native Share Unsupported

Expected:

```text
download starts
whatsapp://send text opens
fallback toast appears
```

### Download Button After Share

Expected:

```text
still works
modal remains open
```

## Tests / Verification

If the project has tests by Phase 9, add focused tests for pure utilities.

`textSummary.ts` tests:

- [ ] includes date and shift.
- [ ] includes valid CNC entries.
- [ ] excludes incomplete CNC entries.
- [ ] includes Total CNC Hours.
- [ ] includes Burma rows and total.
- [ ] omits blank Repair.
- [ ] omits blank Notes.
- [ ] preserves Notes line breaks.

`share.ts` tests can be light because browser APIs are hard to unit-test without mocks:

- [ ] calls native share when `navigator.canShare({ files })` is true.
- [ ] falls back to download when file share is unsupported.
- [ ] treats AbortError as failed/cancelled without throwing.

Manual QA checklist:

- [ ] `html2canvas` is installed in dependencies.
- [ ] Generate Image enters generating state.
- [ ] Generate Image is disabled while generating.
- [ ] Thumbnail appears after successful generation.
- [ ] Success caption says `Image ready.`
- [ ] Share on WhatsApp appears only after generation.
- [ ] Download Image appears only after generation.
- [ ] Edit Entry remains available.
- [ ] Downloaded PNG filename matches `production-summary-YYYY-MM-DD-{shift}.png`.
- [ ] Downloaded PNG width is 1080px.
- [ ] Downloaded PNG background is white.
- [ ] Downloaded PNG content matches the visible Summary Card.
- [ ] Downloaded PNG includes valid CNC entries.
- [ ] Downloaded PNG excludes incomplete CNC entries.
- [ ] Downloaded PNG includes Burma totals.
- [ ] Downloaded PNG omits blank Repair.
- [ ] Downloaded PNG omits blank Notes.
- [ ] 13+ valid CNC entries use compact rows in PNG.
- [ ] Desktop fallback downloads PNG and opens WhatsApp text intent.
- [ ] Fallback toast appears after fallback share path.
- [ ] Download button shows `Image downloaded.`
- [ ] Generation failure resets button and shows failure toast.
- [ ] Closing modal after generation revokes thumbnail URL without console errors.
- [ ] Android Chrome over HTTPS opens native share sheet with PNG file attached.
- [ ] WhatsApp receives the image from a real device.
- [ ] Received WhatsApp image is readable.

## Acceptance Criteria

- [ ] Phase 8 Summary Modal and Summary Card behavior remain intact.
- [ ] `html2canvas` is installed and imported only in `src/utils/png.ts`.
- [ ] `captureSummary` captures live Summary Card state.
- [ ] Capture source is hidden offscreen, 540px wide, and not `display: none`.
- [ ] Generated PNG is 1080px wide regardless of source viewport.
- [ ] Generated PNG has white background and no transparency artifacts.
- [ ] Filename matches `production-summary-YYYY-MM-DD-{shift}.png`.
- [ ] Generate Image shows a generating state.
- [ ] Generate Image cannot be double-clicked into duplicate captures.
- [ ] Thumbnail appears after successful generation.
- [ ] Share on WhatsApp appears after successful generation.
- [ ] Download Image appears after successful generation.
- [ ] Share on Android Chrome over HTTPS opens native share sheet with attached file.
- [ ] Desktop/no-file-share fallback downloads PNG and opens `whatsapp://send` text fallback.
- [ ] Download Image downloads the generated PNG.
- [ ] Share success toast says `Shared to WhatsApp.`
- [ ] Download success toast says `Image downloaded.`
- [ ] Fallback share toast says `Image saved to your phone. Share it manually in the group.`
- [ ] Generation failure toast says `Couldn't generate image. Please try again.`
- [ ] Generation failure resets the action stack to idle.
- [ ] Object URLs are revoked when no longer needed.
- [ ] Real-device test confirms image arrives in WhatsApp and remains readable.
- [ ] No persistence, PWA/service worker, Add Person modal, backend, or validation-pass behavior is introduced.

## Handoff Notes For Phase 10

Phase 10 should be able to start from:

- working Summary Modal
- working Summary Card
- working PNG generation
- generated thumbnail
- Share on WhatsApp path
- Download Image path
- app-level Toast system with share/download messages
- reusable `Sheet` primitive
- no people persistence yet

Expected Phase 10 changes:

- create Add Person modal using `Sheet`
- wire OperatorSelect Add Person button
- add people persistence for custom names
- dedupe people case-insensitively
- show `Added [name].` toast
- do not alter PNG/share pipeline

## Rationale

Phase 9 is intentionally isolated around export and delivery.

The Summary Card was locked in Phase 8 so this phase can focus on the hard browser work: rendering a real 1080px PNG, creating a real File, dealing with Web Share API differences, and proving the result on a real phone over HTTPS.

The important architecture rule is that there is one Summary Card component. The visible preview and the hidden capture source both render that same component. If Phase 9 creates a separate PNG-only summary renderer, the preview and shared artifact will drift.

The important product rule is that this phase is not done until the image lands in WhatsApp from a real device and remains readable after compression.
