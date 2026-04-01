

# Add 4 New Perspective Variations

## Current State
The "Picture Perspectives" workflow has 5 variations stored in the DB `workflows.generation_config.variation_strategy.variations`:
1. Close-up / Macro (detail)
2. Back Angle (angle)
3. Left Side (angle)
4. Right Side (angle)
5. Wide / Environment (context)

## New Variations to Add (4 total)

### 1. **Super Macro / Texture** (detail category)
An even tighter crop than Close-up / Macro — focusing on a single micro-detail like a thread, grain, clasp, or logo emboss. Think "product under a magnifying glass."

### 2. **45° Front-Left** (angle category)
Classic three-quarter angle from the front-left, showing depth and dimension — the most common e-commerce "hero angle."

### 3. **45° Front-Right** (angle category)
Mirror of front-left three-quarter angle. Gives variety for layouts and A/B testing.

### 4. **Top-Down / Flat Lay** (detail category)
Bird's-eye overhead shot looking straight down at the product. Great for accessories, shoes, bags, and small items.

## Changes

### 1. Database migration — update workflow `generation_config`
Update the `workflows` row for "Picture Perspectives" to append 4 new variation objects to `generation_config.variation_strategy.variations`. Each gets the same structure: `label`, `instruction`, `category`, `referenceUpload`.

Instructions will follow the same detailed style as existing ones (specific angle direction, environment matching, lighting consistency).

### 2. `src/pages/Perspectives.tsx` — update fallback + icons
- Add 4 new entries to `FALLBACK_VARIATIONS` array (used when DB config isn't loaded)
- Add 4 new entries to `VARIATION_ICONS` map with appropriate Lucide icons
- Import additional icons: `Focus`, `CornerUpLeft`, `CornerUpRight`, `ArrowDown` (or similar)

### 3. `src/hooks/useGeneratePerspectives.ts` — extend category detection
- Update `detectCategory()` to recognize "top" / "flat lay" / "overhead" as a new or existing category
- Add photography DNA for top-down shots in both `getProductOnlyPhotographyDNA` and `getOnModelPhotographyDNA`
- The "super macro" variation will use the existing `macro` category path — no changes needed there

## No other files affected
The variation data flows from the DB config → hook prompt builder → edge function. All other workflows, templates, and scenes are untouched.

