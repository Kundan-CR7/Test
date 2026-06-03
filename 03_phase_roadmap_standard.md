# Phase Roadmap Standard

This document defines how to convert the product-definition stack into a build roadmap.

It is based on two observed patterns:
- `OTPs/` uses a lean phase-by-phase additive roadmap for a single HTML file
- `Antropi_WebDash/` uses a more advanced mini-phase roadmap with explicit sizing logic and end-state reasoning

This standard combines both, but keeps the lighter HTML-visualization use case as default.

---

## 1. Purpose

`PHASE_ROADMAP.md` should answer:
- what order the product should be built in
- how much each phase should contain
- why that phase exists
- what must be true after each phase
- how the final artifact is reached without chaos

---

## 2. Inputs required before writing the roadmap

Do not write the roadmap until these exist:

1. `requirements.md`
2. `frontend_ui_spec.md`
3. `detailed_ui_ux_design.md`
4. optional `vibe.md` or visual direction note

The roadmap should not invent product behavior on its own.

---

## 3. Roadmap design principles

The roadmap should optimize for:
- visible progress at the end of every phase
- additive implementation
- minimal rework
- strong dependency order
- phase scopes that are meaningful, not arbitrary

Each phase should leave behind something that looks materially more complete.

---

## 4. Phase sizing logic

### 4.1 Default sizing rule

For single-file HTML visualization work:
- target roughly `300-500` lines of additive code per phase
- use fewer phases for simpler products
- use more phases when screens are structurally heavy or highly interactive

### 4.2 Estimation method

Estimate likely final code volume from:
- number of screens
- shell complexity
- amount of interactivity
- number of unique states
- number of shared components
- amount of dummy data

### 4.3 Suggested translation

Use this as a default starting heuristic:

| Estimated final size | Suggested roadmap size |
|---|---|
| 1,000-2,000 lines | 3-4 phases |
| 2,000-3,500 lines | 4-6 phases |
| 3,500-5,000 lines | 6-8 phases |
| 5,000-6,500 lines | 8-12 phases |
| 6,500-8,500 lines | 12-15 mini-phases |

For very heavy screens, split one screen across multiple phases.

---

## 5. Standard sequencing logic

The default order should usually be:

1. foundation / login / global setup
2. shell / navigation / app frame
3. hero or primary workflow surface
4. interaction layer for the primary surface
5. secondary screens
6. diagnostic / history / admin screens
7. edge states / polish / animation / demo controls

For more complex products, use:

1. shell foundation
2. first-impression screen
3. flagship flow start
4. flagship flow middle
5. flagship flow completion
6. post-action trust or detail surface
7. overview or operational home
8. cross-screen wiring and polish

---

## 6. What each roadmap phase should contain

Each phase entry should contain:

1. phase title
2. what is being built
3. why this phase exists now
4. inputs / source files
5. exact implementation scope
6. expected outcome
7. acceptance checklist
8. estimated implementation weight

This is the stable pattern across the example projects.

---

## 7. When to use phases vs mini-phases

Use standard phases when:
- the product is relatively compact
- one phase can reasonably contain one coherent chunk of work
- the implementation doc can directly drive coding

Use mini-phases when:
- the product has many screens
- multiple heavy states exist
- one phase would become too broad
- the visual system is complex enough to drift without tighter control

Antropi is mini-phase territory.
OTPs is standard-phase territory.

---

## 8. Reusable roadmap template

```md
# PHASE_ROADMAP

## Context
- final artifact
- build constraints
- source of truth
- estimated size

## Phase 1: [Title]
### What you're building
### Why this phase exists now
### Inputs
### What to implement
### Outcome
### Acceptance

## Phase 2: [Title]
...

## Final Build Summary
- total estimated lines
- total phase count
- expected end-state
```

---

## 9. Final rule

The roadmap is not just a task list.

It should explain the logic of sequencing.

Someone reading it should understand:
- why the implementation is broken up this way
- why this number of phases is correct
- what the artifact will look like after each phase
