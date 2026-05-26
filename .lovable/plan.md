## Goal

Make the first screen of `/app/models/new` (the "how do you want to create this model" chooser) look and feel like the first screen of `/app/brand-scenes/new` — same card aesthetic, same container width, same restrained type — instead of the current bespoke two big tiles with "01 / Generate", "Start" buttons, and 260px min-height.

## Reference (already in the codebase)

Brand Scenes wizard Step 0 (`src/features/brand-scenes/wizard/steps/Step0ChooseSource.tsx`) uses a 2-column grid of the shared `WizardCard` component (`src/features/brand-scenes/wizard/components/WizardCard.tsx`): icon tile → bold title → muted body, active state inverts to dark, no eyebrow, no inner CTA button. The wizard page itself is wrapped in `max-w-2xl mx-auto w-full`.

## Changes

### 1. `src/pages/BrandModelNew.tsx`
- Change wrapper width from `max-w-3xl` to `max-w-2xl` so the chooser sits in the same column width as `/app/brand-scenes/new`.
- Keep the existing back button + `h1` + subtitle (already matches the brand-scenes page pattern).

### 2. `src/pages/BrandModels.tsx` — `UnifiedGenerator` chooser block (lines ~933–991)
Replace the current chooser markup with the WizardCard aesthetic:

- Import `WizardCard` from `@/features/brand-scenes/wizard/components/WizardCard` and `UserCheck` from `lucide-react` (Wand2 already imported).
- Render:
  ```tsx
  <div className="pb-32">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <WizardCard
        onClick={() => setCreationMode('manual')}
        icon={<Wand2 className="w-5 h-5" />}
        title="Create a new model from scratch"
        body="Pick gender, age, and look — we generate it for you"
      />
      <WizardCard
        onClick={() => setCreationMode('reference')}
        icon={<UserCheck className="w-5 h-5" />}
        title="Generate from a reference photo"
        body="Upload a face — we build the model from it"
      />
    </div>
  </div>
  ```
- Drops the "01 / Generate", "02 / Reference photo" eyebrows, the inline `Start` pill buttons, and the `min-h-[260px] p-10` oversized tiles. No behavior change — clicking a card still advances to `manual` or `reference` exactly as today.

### Out of scope
- Inner steps after the chooser (manual config form, reference uploader, generated variations) — untouched.
- No backend, no validation, no copy beyond the two card titles/bodies above.
