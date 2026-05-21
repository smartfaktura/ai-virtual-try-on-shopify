# Brand Models — chooser polish

Three fixes for the mode-selection step.

## 1. Page subtitle is wrong on the chooser step

Right now the page header always reads "Describe the person you want VOVV.AI to create" — but at the chooser step the user hasn't even picked a creation method yet, so that subtitle is premature and confusing.

**Fix:** Remove the static subtitle from `src/pages/BrandModelNew.tsx`. The H1 "New brand model" + the chooser cards explain the step on their own. After the user picks Generate or Reference, the panel that loads already has its own headings.

## 2. Cards look like flat panels, not buttons

On the full-width page, two side-by-side cards at `w-full` stretch ~370px each and feel like static info boxes.

**Fix in `src/pages/BrandModels.tsx`** (chooser block ~lines 907-942):

- Constrain the grid: `max-w-2xl mx-auto` so cards are ~300px wide each — clearly tap targets, not page sections. Since we're removing the misaligned subtitle above, the centered grid no longer clashes with a left-aligned header — the whole chooser becomes a centered intentional moment.
- Stronger button affordance per card:
  - hover background: `hover:bg-muted/40`
  - hover border: `hover:border-foreground/50`
  - subtle shadow on hover: `hover:shadow-sm`
  - cursor-pointer is already implicit on `<button>` — keep
  - "Start →" gains a tighter group-hover state and translates 1px on hover (`group-hover:translate-x-0.5 transition-transform`)
- Add `cursor-pointer` explicitly for safety.
- Reduce vertical bottom-padding (`mb-4` instead of `mb-6`) so cards feel less hollow.

## 3. Rephrase the Reference card

Current copy ("Use your own person from a photo / Upload a face — we re-photograph that exact person") sounds literal and a bit off. It also doesn't make clear that AI generates a NEW model based on the photo.

**New copy:**

- Eyebrow: `02 / Reference photo`
- Title: `Generate a model from a real person`
- Subtitle: `Upload a face — VOVV.AI creates the model based on it`

Card 1 (Generate) stays as last edit:
- `01 / Generate`
- `Let VOVV.AI create a new model for you`
- `Pick gender, age, look — we generate from scratch`

No terminal periods on any line (core memory).

## Out of scope

Everything past the chooser — reference panel, manual panel, consent, generation, variation picker — stays untouched.
