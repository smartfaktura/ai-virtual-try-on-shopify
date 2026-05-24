
# Brand Scene Preview — Stock Product Reference

## Problem

In `/app/brand-scenes/new` Step 6, the live preview generates an empty environment. Users see "a scene" but not how a product would sit inside it. The `[PRODUCT IMAGE]` token only gets injected at *save time* via `injectReferenceTokens`, so the preview never has a stand-in.

## Goal

For the **preview only**, pass a category-matched stock product image into Gemini alongside the existing reference + model images. The saved `prompt_template` stays token-based and unchanged, so when end users later apply the scene to *their own* product, the existing `generate-workflow` substitution keeps working.

## Scope (safe, additive)

Only the preview path is touched. No changes to:
- The saved scene `prompt_template` format
- `injectReferenceTokens` behavior
- Downstream `generate-workflow` substitution
- Credit costs, RLS, or auth

## Plan

### 1. Stock product registry (DB-backed, admin-swappable)

New table `brand_scene_stock_products`:
- `module` (text, matches `BrandSceneModule`)
- `sub_family` (text, nullable — matches the wizard sub-family key)
- `image_url` (text)
- `label` (text — internal name, e.g. "Activewear Ghost Mannequin Tank")
- `sort_order` (int)
- `is_active` (bool)

RLS:
- `anon + authenticated` SELECT where `is_active = true`
- Admin-only insert/update/delete (via `has_role(auth.uid(), 'admin')`)

Seed ~1-3 rows per active sub-family. Source images from existing `product_image_scenes.preview_image_url` for canonical ghost-mannequin / packshot scenes per category (Activewear → Ghost Mannequin, Footwear → 3/4 hero shot, Eyewear → front packshot, Fragrance → bottle packshot, etc.). Where no good canonical exists yet, leave the sub_family unseeded — code falls back to module-level row, then to no-product (current behavior).

### 2. Lookup hook

New `src/features/brand-scenes/wizard/hooks/useStockProductForScene.ts`:
- Args: `{ module, sub_family }`
- Returns: `{ url, label } | null`
- Order: exact `(module, sub_family)` → first `(module, sub_family = null)` → null
- React Query, 10 min `staleTime`

### 3. Edge function: `generate-brand-scene`

Add `productImageUrl?: string` to body. When present:
- Fetch via existing `urlToInlineData`
- Push as a *third* `inlineData` part, ordered: model → reference → **product** → text
- Prepend a small system line to the prompt:

  > `[STOCK PRODUCT] is a placeholder showing how a representative product sits in this scene. Render the scene with a hero product in this position, exact silhouette / materials of the placeholder. End users will swap their own product in later — do not invent labels or branding.`

This is preview-only; saved prompt is untouched.

### 4. Frontend wiring

`src/features/brand-scenes/api/brandSceneApi.ts`:
- Add `productImageUrl?: string` to `generateBrandScene` args, pass through.

`src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`:
- Call `useStockProductForScene(module, sub_family)`
- Pass `productImageUrl` to `generateBrandScene`
- Show a small disclosure under the "Ready to generate" card:
  > "Preview uses a representative `{label}` so you can see scale and placement. When you apply this scene to your products, your actual item replaces it."
- If lookup returns null, fall back silently to current behavior.

### 5. Save path — unchanged

`save-brand-scene` still runs `injectReferenceTokens`, which produces `[PRODUCT IMAGE]` tokens in the stored template. No behavior change for end users applying the scene.

## Out of scope

- User-uploaded custom placeholders (future "Advanced" option)
- Admin UI for the new table (seed via migration; CRUD UI later if needed)
- Changes to non-wizard generation paths

## Files touched

```
NEW  supabase/migrations/{ts}_brand_scene_stock_products.sql
NEW  src/features/brand-scenes/wizard/hooks/useStockProductForScene.ts
EDIT supabase/functions/generate-brand-scene/index.ts
EDIT src/features/brand-scenes/api/brandSceneApi.ts
EDIT src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx
```

## Risks & mitigations

- **Wrong placeholder picked** → Sub-family granularity + admin-swappable rows + silent fallback to no-product.
- **Gemini fuses placeholder into the saved look** → Preview-only; saved template never references the stock image. Explicit "placeholder, swap later" wording in the preview prompt.
- **Extra image cost** → Same Gemini call, +1 inlineData part. No extra credits charged.

Approve and I'll ship the migration + seed first, then the edge function, then the wizard wiring.
