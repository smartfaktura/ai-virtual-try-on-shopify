# Brand Models — chooser pill CTAs + cleaner copy

Two small fixes.

## 1. Replace "START →" with proper pill CTAs

The minimalist uppercase "START →" reads as label text, not a button. Swap it for the project's standard pill `<Button>` so the cards have an unmistakable call to action.

**Implementation in `src/pages/BrandModels.tsx`:**

- Outer wrapper is no longer a `<button>` — convert to a `<div>` that's still clickable for the whole card area (keep `onClick`, `role="button"`, `tabIndex={0}`, key handler for Enter/Space). This lets us nest a real `<Button>` inside without nesting interactive elements.
- At the bottom (`mt-auto pt-10`), render:
  ```tsx
  <Button size="sm" variant="default" className="rounded-full self-start">
    Start
    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
  </Button>
  ```
- Card hover (bg/border/shadow) stays — the whole card is still the hit target, the pill is the visual affordance.

## 2. Drop "VOVV.AI" from card copy

User is already inside the app — saying the brand name is redundant.

**New copy:**

- Card 1
  - Eyebrow: `01 / Generate`
  - Title: `Create a new model from scratch`
  - Subtitle: `Pick gender, age, look — we'll generate it for you`
- Card 2
  - Eyebrow: `02 / Reference photo`
  - Title: `Generate a model from a real person`
  - Subtitle: `Upload a face — we'll build the model from it`

No terminal periods (core rule).

## Out of scope

Subtitle under the page H1 (`Choose how you want to create this model`) stays. Card frame, padding, min-height, and hover behavior stay.
