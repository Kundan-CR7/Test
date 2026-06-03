# Project Context Packet Standard

This file defines the input packet that should be given before asking the model to generate product-development documents.

Its role is simple:

> give the model enough context to frame the product correctly before `requirements.md` is written.

This is lighter than Antropi's full exploration/context system. It is meant for faster HTML product visualization work.

---

## 1. Purpose

Before generating product documents, the model should know:
- what the product is
- what kind of UI is being visualized
- who the user is
- what the main workflow is
- what the UI should feel like
- what the implementation format is

Without this, the generated docs drift toward generic SaaS output.

---

## 2. Required Inputs

Every new project should provide the following:

### 2.1 Product framing
- What is the product?
- What is it not?
- What is the shortest correct framing?

Example:
- not "a dashboard"
- but "a live OTP dispatch console"

### 2.2 User
- Who is the main user?
- What real-world environment are they in?
- Are they operating quickly, carefully, repeatedly, occasionally, or under pressure?

### 2.3 Core workflow
- What happens first?
- What decision happens next?
- What is the main action?
- What result confirms success?

### 2.4 Product goal
- What should the product make easier?
- What friction should disappear?
- What should the user feel after using it?

### 2.5 Visual direction / vibe
- Calm vs intense
- Premium vs utilitarian
- Dense vs airy
- Enterprise vs consumer
- Light mode only or not
- Any strong references to follow or avoid

### 2.6 Scope boundary
- What must be included now?
- What can come later?
- What should explicitly not be designed yet?

### 2.7 Build format
- Single HTML file or multi-file
- Desktop-first or mobile-first
- Mock data only or not
- Vanilla JS / Tailwind CDN / other constraints

---

## 3. Optional Inputs

These are useful but not required:
- sample data
- screen ideas
- rough information architecture
- existing prototypes
- competitor references
- notes on what felt bad in previous attempts
- design tokens if already known

---

## 4. Output this packet should enable

Once this packet is clear, the model should be able to generate:

1. `requirements.md`
2. `frontend_ui_spec.md`
3. `detailed_ui_ux_design.md`
4. `PHASE_ROADMAP.md`

That is the intended handoff path.

---

## 5. Recommended Prompting Rule

When starting a new project, the model should be told:

- think from first principles
- frame the product correctly
- optimize for a believable HTML product visualization
- avoid generic dashboard patterns unless the workflow actually demands them
- preserve the stated vibe and scope

---

## 6. Reusable Template

Copy this block into a new project if needed:

```md
# Project Context Packet

## Product Framing
- Product:
- Not:
- Best framing:

## User
- Primary user:
- Operating context:
- Frequency / pressure level:

## Core Workflow
1.
2.
3.
4.

## Product Goal
- Primary goal:
- Secondary goals:
- Main friction to remove:

## Vibe / Visual Direction
- Mode:
- Density:
- Tone:
- References to follow:
- Things to avoid:

## Scope
- In scope now:
- Later:
- Explicit non-goals:

## Build Constraints
- Artifact:
- Tech:
- Data:
- Platform:
```
