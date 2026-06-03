# Phase Plan Template

This file defines the standard structure for a single executable phase plan.

Use it for:
- `PHASE_1_PLAN.md`
- `PHASE_2_PLAN.md`
- individual mini-phase execution plans

The OTPs project shows the most execution-friendly version of this pattern.

---

## 1. Purpose

A phase plan should convert the roadmap into something implementation-ready.

It should be precise enough that an implementation agent can execute the phase without guessing:
- what to read
- what to build
- where to insert it
- what must not change
- what success looks like

---

## 2. Recommended structure

### Phase title
Use a descriptive title tied to the visible output.

### Objective
State what will exist after this phase.

### Estimated output
State the rough implementation size if useful.

### Inputs
List source documents in priority order.

### What this phase adds
Summarize the visible surface area being introduced.

### What this phase does not do
Explicitly prevent scope drift.

### Implementation steps
Break the phase into concrete implementation moves.

### Acceptance criteria
Use a checklist.

### Notes / rationale
Record important design decisions or tradeoffs.

---

## 3. Reusable template

```md
# Phase [X]: [Title]

## Objective

## Estimated output

## Inputs
- `requirements.md`
- `frontend_ui_spec.md`
- `detailed_ui_ux_design.md`
- `PHASE_ROADMAP.md`
- reference prototype files if relevant

## What this phase adds

## What this phase does NOT do

## Implementation steps
### Step 1
### Step 2
### Step 3

## Acceptance
- [ ] ...
- [ ] ...
- [ ] ...

## Notes
```

---

## 4. Quality rule

If a phase plan still leaves major implementation choices ambiguous, it is not ready.

The plan should reduce guesswork, not merely restate the roadmap.
