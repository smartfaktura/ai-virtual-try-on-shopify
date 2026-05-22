## Step 3-5 polish pass

Pure UI/copy fixes. No prompt-builder or schema changes.

### 1. Step labels & section headers

- BrandSceneWizard `META_WIZARD` step 3 title: `"Cast & product interaction"` → **"Who's in the scene"**, subtitle stays.
- Step 4 wizard title: drop the `· {sub-family}` suffix on Step 4 (Scene aesthetic). Title becomes just **"Scene & mood"** (subtitle: "Pick the world — everything below tunes to it"). The `· Clothing` appendix is what's breaking the line in the screenshot.
- Step 3 (cast) **keeps** the `· {sub-family}` suffix because the dials are family-aware; Step 5 keeps it.

### 2. Step 3 (Cast) field renames

In `Step4Cast.tsx`:
- `<Section label="Cast" required>` → **"Who's in the shot"**
- `<Section label="Vibe">` → **"Energy / vibe"**
- Gender section: keep "Gender" / "Gender mix"; rename **"Age feel" → "Age range"** and **"Age mix" → "Age range (mix)"**.
- Subtitle row under `Optional styling`: rephrase to a single line: **"Optional styling — skip and we'll pick smart defaults"** (drop the standalone "Pose energy" / extra paragraph confusion by collapsing the two-line header into one).

In `constants/cast.ts`:
- `{ value: "none", label: "No people — product hero" }` → **"No people"** (short).
- Hero/interaction label `{ value: "hero", label: "Hero — product only" }` → **"Product only"**.

### 3. Required-interaction chips ordering

In `Step4Cast.tsx` `visibleInteractions`, when the cast preset has interactions filtered by family, sort the resulting list so the family-tuned (recommended) options come first, falling back to the static order for the rest. Concretely: stable-sort by `resolved.interactions.indexOf(value)` ascending, with non-recommended pushed to the bottom.

### 4. EthnicityChips style alignment

`EthnicityChips.tsx` currently renders **bordered cards** with a two-line title+description grid — every other section uses pill `<Chip>`s. Rewrite the body as:
- Same `<Section>` wrapper (with the Info tooltip merged into the label via a small inline icon) for consistent spacing.
- Replace the card grid with a `flex flex-wrap gap-2` of pill `<Chip>`s using only the `label` text. Drop the `desc` line (move it into the chip's `title` attribute for hover).
- Keeps the same value contract (`onChange(string | undefined)`).

### 5. Step 4 (Scene aesthetic) copy fixes

In `Step3BaseAnswers.tsx`:
- Scene type section: drop the `hint="Pick the world — everything below tunes to it"` (it duplicates the page subtitle which we'll set in step 1 above).
- Setting / environment section:
  - Label stays **"Setting / environment"**.
  - When no `sceneType` is picked: replace the empty-state placeholder text inside `SettingPicker` ("Pick a scene type first to see tailored settings") with a muted helper line above the picker reading **"Pick a scene type above first"** and hide the picker entirely until a scene type exists. This kills the duplicated "Pick a scene type..." appearing twice.
- "Optional fine-tuning" header (line 343-352): collapse the two-line title+paragraph into one row: **"Optional fine-tuning — skip and we'll pick smart defaults"**. Mirror the same wording for Step 3 cast's "Optional styling" block so they read identically.

### 6. Sticky bottom Back / Next bar

`WizardLayout.tsx` currently puts Back/Next inline at the end of the page. Match the workflows page pattern (sticky footer):

- Wrap the Back/Next row in a `<div className="sticky bottom-0 z-20 -mx-* px-* py-4 bg-background/95 backdrop-blur border-t border-border">` so it stays visible while scrolling long steps. Keep the existing `nextDisabledReason` pill rendering right above it inside the sticky area so the reason travels with the button.
- Use the same horizontal padding as the surrounding `max-w-3xl mx-auto` container so the bar visually spans the page.
- Reference style: same as `/app/workflows` bottom action bar.

### 7. "Pick how the cast interacts with the product" disabled-reason copy

In `BrandSceneWizard.tsx`, swap the reason string to a friendlier line: **"Pick how the cast holds, wears, or stands next to the product"** — short, plain English, and rephrase the other reasons in the same block:
- `"Pick a cast option"` → `"Choose who's in the shot"`
- `"Pick a product scale"` → `"Pick a product scale"` (unchanged — still clear)
- `"Answer the required category questions"` → `"Fill in the remaining required details"`

### Out of scope
- No changes to prompt builder, schema, validation logic, or saved-scene shape.
- Step ordering, gating, and the Phase 7r/7t cleanups stay as-is.

### Files touched
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`
- `src/features/brand-scenes/wizard/WizardLayout.tsx`
- `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx`
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
- `src/features/brand-scenes/wizard/components/EthnicityChips.tsx`
- `src/features/brand-scenes/wizard/constants/cast.ts`
