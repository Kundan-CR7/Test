# Mini-Phase Protocol

This file formalizes the lighter reusable mini-phase protocol for frontend HTML visualization projects.

It is derived from:
- `THRD Communications/miniphase_protocol.md`
- `Antropi_WebDash/02_phases/miniphase_protocol.md`

The Antropi version is richer and repo-aware. This version keeps the same discipline but removes unnecessary complexity for faster frontend-only work.

---

## 1. What is a mini-phase

A mini-phase is a tightly scoped atomic unit of implementation.

Its governing rule is:

> code the feature in English before coding it in HTML/CSS/JS.

Mini-phases exist to prevent:
- on-the-fly design invention
- scope drift
- unstructured large-file editing
- visual inconsistency across screens

---

## 2. The mini-phase loop

Each mini-phase has 4 steps across 2 stages.

### Stage 1 — Planning Specification

#### Step 1: Macro Lens
Define:
- what the user is trying to do
- why this feature exists now
- where it sits in the larger workflow
- what surrounding screens or states it depends on

#### Step 2: Micro Lens
Define:
- layout structure
- UI hierarchy
- component anatomy
- state behavior
- interaction rules
- empty, loading, success, and error states

Output:
- `mpXX_feature_spec.md`

#### Step 3: Execution Handoff
Define:
- files to read first
- exact file to modify
- what to add
- what to preserve
- visual constraints
- success criteria
- things the implementation agent must not invent

Output:
- `mpXX_execution_prompt.md` or a tightly scoped phase plan section

### Stage 2 — Physical Integration

#### Step 4: Implementation + Audit
Implement the mini-phase in the target HTML file, then immediately record:
- what changed
- what states were added
- what still feels weak
- whether the result deviated from the spec

Output:
- `mpXX_audit.md` if the project needs strict traceability

---

## 3. What belongs in the Macro Lens

The Macro Lens should answer:
- what moment in the workflow this represents
- what the user needs from this screen or component
- what has to feel obvious
- what must be prevented
- what other screens or regions this affects

This section should stay product-aware, not purely visual.

---

## 4. What belongs in the Micro Lens

The Micro Lens should answer:
- what exact sections exist
- what order they appear in
- what their visual weight is
- how states change
- what JS behaviors are required
- what empty/error/disabled states look like

This is the "coding without coding" step.

---

## 5. Mini-phase template

```md
# Mini-Phase XX: [Title]

## 1. Objective
- one-sentence goal

## 2. Why this mini-phase exists now
- sequencing logic

## 3. Macro Lens
### User moment
### Workflow role
### Dependencies
### System impact

## 4. Micro Lens
### Layout structure
### Component anatomy
### Behavioral physics
### Validation / error gateways
### Visual states

## 5. Execution handoff
### Read first
### Modify
### Preserve
### Success criteria
### Do not invent
```

---

## 6. Rules for implementation

When implementing a mini-phase:
- follow the spec literally
- keep changes scoped
- do not redesign earlier work unless explicitly requested
- use additive section boundaries in the HTML when helpful
- avoid opportunistic cleanup
- keep dummy data consistent

---

## 7. When to use this protocol

Use the mini-phase protocol when:
- the roadmap has 8+ major steps
- the screens are heavy
- the product has multiple important states
- the file is expected to exceed ~4,000 lines
- visual consistency matters enough that improvisation becomes risky

If the project is simpler, a standard `PHASE_X_PLAN.md` flow is enough.
