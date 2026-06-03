# Product Development Structure Playbook

## Document Purpose

This document formalizes a reusable product development structure for turning a rough idea into a clear, implementation-ready product specification.

It is designed to be used with:
- ChatGPT or any GPT-style assistant
- founders and operators planning new projects
- designers and frontend engineers
- product builders who want a consistent way to think through product decisions

This document is not project-specific. It is a general framework that can be reused across many products.

Its main purpose is to define:
1. how to think about a new product from first principles
2. what should go into `requirements.md`
3. what should go into `frontend_ui_spec.md`
4. how these documents relate to each other
5. how to judge whether the documents are good enough to move forward

---

# 1. Core Philosophy

This structure exists because a lot of product work becomes messy when people jump too early into:
- screens
- features
- components
- flows
- visual polish
- engineering decisions

without first becoming clear on:
- what the product is
- why it exists
- who it is for
- what exact problem it solves
- what the primary workflow is
- what must be true for the product to feel good

The philosophy of this framework is:

> First define the product clearly. Then define the user experience clearly. Then implement.

In practice, this means:
- `requirements.md` defines the product
- `frontend_ui_spec.md` defines the frontend experience of that product

This avoids shallow UI design, confused scope, and bloated implementation.

---

# 2. The Development Sequence

The standard sequence should be:

1. Understand the idea
2. Create `requirements.md`
3. Review and refine the requirements
4. Create `frontend_ui_spec.md`
5. Review and refine the frontend spec
6. Move into design, engineering, or build planning

This order matters.

Do not write a frontend spec before the requirements are sufficiently clear.

The frontend spec should be a direct translation of the product requirements into:
- screens
- interaction patterns
- layout logic
- visual hierarchy
- UI behavior
- state handling

---

# 3. What This Structure Is Optimizing For

This framework is meant to optimize for:
- product clarity
- implementation clarity
- less ambiguity
- better UX thinking
- less rework
- easier delegation
- easier collaboration with GPT
- easier handoff to designers and engineers
- more reusable product reasoning across projects

It is especially useful when:
- the founder has the intent in their head but not in a structured form
- the product is operational, internal, or workflow-heavy
- the product needs high clarity and low bloat
- the builder wants a repeatable process for multiple future projects

---

# 4. The Role of `requirements.md`

## 4.1 What `requirements.md` is for

`requirements.md` is the product definition document.

Its job is to define:
- what the product is
- why it exists
- what problem it solves
- who the user is
- what the main workflows are
- what the product must feel like
- what is in scope and out of scope
- what good looks like

It is not meant to define:
- detailed UI layouts
- component-level design
- precise screen anatomy
- visual system decisions
- pixel-level structure

That belongs later, in `frontend_ui_spec.md`.

---

## 4.2 What questions `requirements.md` must answer

A good `requirements.md` should answer the following questions clearly:

### Product definition
- What is this product?
- What is it not?
- How should it be mentally framed?

### User and context
- Who is the user?
- What is their real-world context?
- What are they trying to accomplish?
- What pain or friction exists today?

### Problem and need
- Why does this product need to exist?
- What problem is being solved?
- What current workflow is broken, slow, confusing, or inefficient?

### Core workflows
- What is the primary workflow?
- What are the key actions the user performs?
- What sequence does the user naturally follow?

### Product principles
- What are the most important UX or product principles?
- What should the product optimize for?
- What should it avoid becoming?

### Functional expectations
- What functionality must exist?
- What states or conditions are expected?
- What must the product communicate clearly?

### Scope
- What is in scope for now?
- What may come later?
- What should intentionally be excluded?

### Quality bar
- What makes this product feel good?
- What makes it feel bad?
- What must be true before implementation begins?

---

## 4.3 What a strong `requirements.md` should contain

A strong `requirements.md` should usually include:
1. Project overview
2. Product summary
3. Core use case
4. User context
5. Current state or assumptions
6. Primary goal
7. Secondary goals
8. Non-goals
9. Core workflows
10. Key product principles
11. High-level information architecture
12. Important states and edge cases
13. Constraints
14. Scalability considerations
15. Success criteria
16. Next phase or what follows after this document

This is not a rigid template, but it is the minimum shape of a good product definition.

---

## 4.4 What `requirements.md` should sound like

It should sound:
- clear
- high signal
- product-oriented
- thoughtful
- implementation-aware
- not overly technical
- not vague
- not decorative

It should feel like a strong product brief, not:
- random brainstorming notes
- a user story dump
- a feature wishlist
- a UI document disguised as product thinking

---

## 4.5 What should NOT go into `requirements.md`

Avoid putting these into `requirements.md` unless absolutely necessary:
- exact component names
- detailed screen-by-screen layouts
- spacing systems
- animation specs
- CTA placements
- pixel-level UI details
- CSS-level thinking
- design tokens
- implementation framework choices unless relevant at product level

These belong later.

---

## 4.6 The real job of `requirements.md`

The real job of `requirements.md` is to make sure that if someone reads it, they can say:

> I fully understand what product we are building, who it is for, how it should work, what matters most, and what it should feel like.

If that is not true, the document is incomplete.

---

# 5. The Role of `frontend_ui_spec.md`

## 5.1 What `frontend_ui_spec.md` is for

`frontend_ui_spec.md` is the frontend translation document.

Its job is to take the product intent from `requirements.md` and convert it into:
- screens
- layout structure
- navigation model
- UI hierarchy
- component behavior
- interaction logic
- empty states
- loading states
- success and failure states
- visual direction
- implementation-friendly screen breakdown

It is the bridge between:
- product thinking
and
- actual frontend implementation

---

## 5.2 What questions `frontend_ui_spec.md` must answer

A good `frontend_ui_spec.md` should answer:

### Screen structure
- What screens exist?
- Why does each screen exist?
- Which one is primary?
- Which ones are supporting?

### Navigation
- How does the user move around?
- What navigation model fits this product best?
- What should remain visible globally?

### Layout
- What is the structure of each screen?
- What are the major zones and sections?
- What is the hierarchy on the page?

### UI behavior
- What happens when the user interacts?
- How does selection work?
- How does feedback work?
- What should happen on success and failure?

### States
- What does loading look like?
- What does empty look like?
- What does error look like?
- What does disabled look like?
- What does success look like?

### Visual direction
- What should the interface feel like?
- What tone should the visual system have?
- What should it not feel like?

### Buildability
- Can an engineer understand what to build from this?
- Can a designer understand what to design from this?
- Are component responsibilities clear?

---

## 5.3 What a strong `frontend_ui_spec.md` should contain

A strong `frontend_ui_spec.md` should usually include:
1. Document purpose
2. Product summary
3. Design principles
4. Information architecture
5. Navigation model
6. Global app shell
7. Screen-by-screen breakdown
8. Per-screen goals
9. Per-screen layout structure
10. Section and component responsibilities
11. Interaction logic
12. State handling
13. Responsive behavior
14. Visual design system direction
15. Core component inventory
16. Feedback and copy rules
17. Implementation priorities
18. Acceptance criteria

---

## 5.4 What `frontend_ui_spec.md` should sound like

It should sound:
- concrete
- structured
- implementation-friendly
- visually aware
- UX-aware
- not fluffy
- not too abstract
- not just aesthetic commentary

It should feel like:

> This is what the frontend should be and how it should behave.

---

## 5.5 What should NOT go into `frontend_ui_spec.md`

Avoid making it:
- a backend architecture document
- a database schema document
- a general business strategy doc
- a random list of UI inspiration
- a vague “clean and modern” style note without structure
- a giant list of screens with no reasoning

Also avoid skipping the connection back to the product requirements.

If the frontend spec is not clearly derived from the product definition, it is weak.

---

## 5.6 The real job of `frontend_ui_spec.md`

The real job of this document is to make sure that if someone reads it, they can say:

> I understand the full frontend structure, the main screens, the UI behavior, the key states, and how this should feel when implemented.

If that is not true, the document is incomplete.

---

# 6. Relationship Between the Two Documents

## 6.1 `requirements.md` comes first

`requirements.md` should define:
- product intent
- user need
- workflow
- scope
- priorities

## 6.2 `frontend_ui_spec.md` comes second

`frontend_ui_spec.md` should define:
- how that intent becomes a frontend
- how the workflow becomes screens and interactions
- how clarity becomes hierarchy
- how product principles become actual UI decisions

## 6.3 The documents should not duplicate each other blindly

They should be related, but not repetitive in a lazy way.

### `requirements.md` says:
- what the product needs to do
- what matters
- why it matters

### `frontend_ui_spec.md` says:
- how the frontend should express that
- how the user should navigate it
- how the interface should behave

The second should be grounded in the first, not disconnected from it.

---

# 7. What You Are Usually Looking For in `requirements.md`

Usually, when asking for `requirements.md`, the real expectation is:

## 7.1 Product clarity
You want the assistant to clearly understand:
- the product
- its purpose
- its boundaries
- its core logic
- the user's actual workflow

## 7.2 First-principles reasoning
You want the assistant to think deeply instead of jumping into generic SaaS answers.

That means:
- understanding the real behavior of the user
- understanding operational realities
- separating essential from non-essential features
- identifying what truly drives value in the product

## 7.3 Strong framing
You want the product to be framed correctly.

For example:
- not “a messaging app”
- but “an OTP dispatch console”
- not “a dashboard”
- but “a live control screen”
- not “an app with many tabs”
- but “a single-screen-first operational flow”

This kind of correct framing is extremely important.

## 7.4 Workflow clarity
You want the product to be defined around actual use:
- what happens first
- what happens next
- what decision the user makes
- what the critical points of confidence are
- what must be fast
- what must be obvious

## 7.5 Product principles
You want the document to surface the invisible rules such as:
- reduce decision friction
- maximize confidence
- prioritize clarity over decoration
- optimize for speed over bloat
- repeat critical information when it prevents mistakes

These principles shape the product more than features do.

## 7.6 Scope discipline
You want the document to prevent unnecessary expansion.

A strong requirements doc should distinguish:
- what is needed now
- what is optional later
- what is intentionally excluded

This is essential for product quality.

## 7.7 A usable artifact
You want the result to be a reusable working document, not just a nice conversation.

That means it should be:
- structured
- complete
- readable
- specific
- reusable in future implementation conversations

---

# 8. What You Are Usually Looking For in `frontend_ui_spec.md`

Usually, when asking for `frontend_ui_spec.md`, the real expectation is:

## 8.1 Screen-by-screen thinking
You want the assistant to take the product and convert it into actual screens:
- what screens exist
- why they exist
- what each screen does
- how they relate to one another

## 8.2 Detailed UX reasoning
You want the assistant to think beyond generic UI language and define:
- how the workflow becomes interaction
- where controls should live
- what should remain visible
- how selection should work
- how the user receives feedback
- how the user avoids mistakes

## 8.3 High-quality UI principles
You want the UI to feel:
- great
- aesthetic
- functional
- understandable
- not bloated
- polished

But you do not want shallow visual fluff.

You want:
- good hierarchy
- good spacing logic
- good information design
- good action placement
- good state design
- good behavioral clarity

## 8.4 Buildability
You want the spec to be detailed enough that someone else can actually implement it.

That means:
- screen goals are clear
- layouts are clear
- sections are clear
- states are clear
- component roles are clear
- copy direction is clear

## 8.5 Product fidelity
You want the assistant to preserve the actual product logic from `requirements.md`.

The frontend spec should not drift into a generic dashboard template.

It should remain deeply faithful to:
- the workflow
- the priorities
- the tone
- the operational context

---

# 9. Quality Standard for Both Documents

A good document in this framework should be:
- clear
- structured
- high signal
- deeply reasoned
- specific
- implementation-relevant
- reusable
- understandable without prior conversation context

A weak document is one that is:
- vague
- repetitive
- generic
- overly abstract
- UI-only without product logic
- product-only without actionable detail
- full of buzzwords
- missing workflow clarity

---

# 10. Recommended Workflow When Using GPT

## 10.1 Step 1 — Give the project idea
Start by explaining:
- what the product is
- what problem it solves
- what the user does
- what the intended workflow is
- any constraints
- any taste or quality preferences

At this stage, raw context is okay.

## 10.2 Step 2 — Create `requirements.md`
Ask the assistant to:
- understand the idea from first principles
- frame the product correctly
- define workflows
- define goals and non-goals
- create a high-quality requirements doc

Do not move on until this feels right.

## 10.3 Step 3 — Refine the requirements
Review and refine:
- missing workflows
- incorrect assumptions
- scope issues
- unclear product principles
- wrong framing

Once the requirements feel strong, move ahead.

## 10.4 Step 4 — Create `frontend_ui_spec.md`
Ask the assistant to:
- derive the frontend structure from the requirements
- go screen by screen
- specify layout, interaction, and behavior
- include states and visual logic
- make it implementation-friendly

## 10.5 Step 5 — Refine the frontend spec
Review:
- whether the screens fit the workflow
- whether the main action is frictionless
- whether the UI feels bloated or lean
- whether the hierarchy is right
- whether the screen count is correct
- whether supporting screens are necessary

## 10.6 Step 6 — Move into implementation
Once both docs are solid, the next documents can include:
- wireframes
- component specs
- engineering architecture
- frontend task breakdown
- React/Tailwind implementation plan
- API or backend spec if needed

---

# 11. Recommended Prompting Standard

When using GPT to produce these documents, the assistant should be instructed to do the following:

## 11.1 For `requirements.md`
- think from first principles
- understand the product deeply
- identify the actual user workflow
- define the product clearly
- separate scope from future possibilities
- make it reusable and complete
- ensure someone without prior context can understand it

## 11.2 For `frontend_ui_spec.md`
- derive it from the requirements
- go screen by screen
- think about usability and aesthetics together
- think about hierarchy, states, and edge cases
- make it implementable
- make it faithful to the product, not generic

---

# 12. Review Checklist for `requirements.md`

## 12.1 Product clarity
- Is the product clearly defined?
- Is it correctly framed?
- Does the document explain what it is and what it is not?

## 12.2 User and workflow clarity
- Is the user clearly understood?
- Is the primary workflow obvious?
- Does the sequence of use make sense?

## 12.3 Principle clarity
- Are product principles explicit?
- Do they help guide future decisions?

## 12.4 Scope clarity
- Is current scope clear?
- Are non-goals defined?
- Does the document avoid unnecessary expansion?

## 12.5 Reusability
- Can someone new read this and understand the project?
- Is it a usable artifact, not just a conversation summary?

---

# 13. Review Checklist for `frontend_ui_spec.md`

## 13.1 Screen clarity
- Are the screens clearly defined?
- Does each screen have a clear purpose?

## 13.2 Workflow fidelity
- Does the screen structure truly reflect the product workflow?
- Does the UI preserve the priorities from the requirements?

## 13.3 UX quality
- Is the primary flow frictionless?
- Are important states clear?
- Is selection, confirmation, and feedback well designed?

## 13.4 Buildability
- Can a designer or frontend engineer implement from this?
- Are sections, behaviors, and responsibilities defined clearly?

## 13.5 Aesthetic and functional balance
- Does it aim for a great UI without becoming vague or decorative?
- Does it remain usable and practical?

---

# 14. Recommended Extensions to This Structure

For larger or more complex products, the workflow can extend beyond these two documents.

Possible next documents:
1. `backend_architecture.md`
2. `engineering_spec.md`
3. `api_spec.md`
4. `component_spec.md`
5. `interaction_spec.md`
6. `task_breakdown.md`
7. `design_system.md`
8. `qa_checklist.md`

But the first two core documents should remain:
- `requirements.md`
- `frontend_ui_spec.md`

These are the foundational pair.

---

# 15. Canonical Summary

The reusable structure is:

## Step 1 — Define the product
Create `requirements.md` to formalize:
- what is being built
- why it matters
- how it works
- who it is for
- what matters most
- what is in scope

## Step 2 — Define the frontend
Create `frontend_ui_spec.md` to formalize:
- the screens
- the layout
- the interaction model
- the UI behavior
- the states
- the visual direction
- the implementation-friendly frontend structure

This creates a strong and repeatable product-development pipeline.

---

# 16. Final Principle

The most important rule in this framework is:

> Do not let implementation detail replace product thinking, and do not let product thinking remain too abstract to implement.

`requirements.md` provides the product thinking.
`frontend_ui_spec.md` provides the frontend implementation translation.

Together, they create a usable, repeatable foundation for building new products well.

---

# 17. Recommended Use of This Document

This document can be given to GPT as a permanent instruction or context file when starting new product ideas.

The user can then provide:
- the idea
- the problem
- the intended workflow
- constraints
- preferences

and ask the assistant to:
1. create `requirements.md` using this structure
2. refine it
3. create `frontend_ui_spec.md` using this structure
4. refine it
5. continue into implementation planning

This makes product development faster, more consistent, and less dependent on reconstructing the same thinking every time.
