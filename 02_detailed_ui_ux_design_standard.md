# Detailed UI/UX Design Standard

This document defines the layer that sits after `frontend_ui_spec.md` and before phased implementation.

This is the missing middle layer that appears clearly in `OTPs/` and is implied in more complex form in `Antropi_WebDash/`.

Its job is:

> translate frontend behavior into literal visual execution before coding starts.

---

## 1. Why this document exists

`frontend_ui_spec.md` explains:
- what screens exist
- what they do
- how they behave

But that is still not enough to implement a 5,000-6,000 line HTML artifact cleanly.

There needs to be one deeper layer that defines:
- visual tokens
- layout anatomy
- component anatomy
- state styling
- copy direction
- screen-by-screen structural execution

That layer is `detailed_ui_ux_design.md`.

---

## 2. What this document should contain

A strong `detailed_ui_ux_design.md` should usually include:

1. document purpose
2. relationship to prior docs
3. global visual system
4. typography system
5. color palette
6. spacing / radius / shadow system
7. page shell rules
8. screen-by-screen execution
9. component anatomy
10. state anatomy
11. copy / label guidance
12. responsive rules
13. implementation notes

---

## 3. What level of detail it should reach

This document should be specific enough that someone can almost "code from English."

That means it should define things like:
- card shape language
- border treatment
- selected state treatment
- action bar state treatment
- status chip styling
- table row hierarchy
- exact section order on a screen
- what is primary, secondary, tertiary in each component

It does not need to be literal pixel-perfect CSS, but it should be implementation-grade.

---

## 4. Recommended structure

### 4.1 Document purpose
State that this file translates:
- `requirements.md`
- `frontend_ui_spec.md`

into precise visual execution.

### 4.2 Global visual system
Define:
- typography
- color system
- spacing rhythm
- shape language
- elevation rules
- motion philosophy

### 4.3 Shell rules
If relevant, define:
- left rail
- top bar
- content width
- sticky regions
- action zones
- system status areas

### 4.4 Screen breakdown
Go screen by screen and define:
- intended vibe
- layout order
- section anatomy
- component anatomy
- exact hierarchy
- state variants

### 4.5 Component behavior
For shared components define:
- default
- hover
- selected
- disabled
- loading
- success
- error

### 4.6 Copy direction
Define:
- headline tone
- button tone
- helper text tone
- error message tone

---

## 5. What it should not become

Do not let this document become:
- a backend spec
- a CSS dump
- a Figma replacement
- a vague design moodboard
- generic aesthetic language without structure

This document is only useful if it reduces implementation ambiguity.

---

## 6. Reusable template

```md
# Detailed UI/UX Design

## Document Purpose

## 1. Translation Goal
- what prior docs this file operationalizes

## 2. Global Visual System
### Typography
### Color Palette
### Spacing Rhythm
### Shape Language
### Elevation
### Motion

## 3. Global Shell Rules
### App shell
### Navigation
### Content widths
### Sticky regions

## 4. Screen Breakdown
### Screen 1 — [Name]
- Vibe
- Layout order
- Primary regions
- Section anatomy
- State notes

### Screen 2 — [Name]
- ...

## 5. Shared Components
### Card
### Table
### Status chip
### Action bar
### Empty state

## 6. Copy Guidance
- headlines
- buttons
- helper copy
- warnings

## 7. Responsive Notes

## 8. Implementation Notes
```

---

## 7. Quality bar

If someone reads this file, they should be able to say:

> I know exactly how this UI should be constructed and how it should feel before implementation begins.

If not, the file is still too shallow.
