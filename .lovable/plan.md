

# Animate Image: Premium Results + Safer Object Grounding

## Overview
Two major improvements: (1) redesign the video results panel for a premium feel with better correction flows, and (2) add structured object grounding logic to prevent the AI from inventing products/props that aren't in the source image.

---

## 1. Premium Results Panel Redesign

**File: `src/components/app/video/VideoResultsPanel.tsx`**

- Replace the harsh `bg-black/95` player background with a softer `bg-muted/30` or subtle gradient that adapts to aspect ratio
- Make the video/image fill the container better using `object-cover` with aspect-ratio-aware sizing instead of forcing `aspect-video` on all ratios
- Move the Video/Original toggle from inside the black bar to above the player as a clean pill toggle in the card header area
- Add new correction-focused quick variation presets:
  - `keep_closer` — "Keep closer to original" (high preservation, low intensity)
  - `stronger_fidelity` — "Stronger subject fidelity" (preserve identity + outfit + product)
  - `no_added_objects` — "No added objects" (adds negative prompt for invented objects)
  - `cleaner_motion_v2` — "Cleaner motion" (static camera, low intensity)
  - `more_realistic_v2` — "More realistic" (ultra_realistic realism level)
  - `remove_objects` — "Remove added objects" (rebuilds with strict preserve-visible-only)
  - `strict_preservation` — "Rebuild with stricter preservation" (all preservation flags on, low intensity)
- Strengthen action button hierarchy: primary = "Download Video", secondary = "Adjust Motion", ghost = "Start New Video"

**File: `src/pages/video/AnimateVideo.tsx`**

- Update `handleQuickVariation` to handle new preset change keys (negative prompt additions, preservation overrides)
- Pass aspect ratio to VideoResultsPanel so it can size the player correctly

---

## 2. Structured Object Grounding

### 2a. Extend analysis schema to detect visible objects

**File: `supabase/functions/analyze-video-input/index.ts`**

Add new fields to the tool schema:
- `visible_product_detected` (boolean) — is a product/object clearly visible in the image?
- `visible_object_list` (string array) — list of objects actually visible (e.g. ["perfume bottle", "car steering wheel"])
- `product_interaction_visible` (boolean) — is someone interacting with a product?

Update the system prompt to instruct the AI to distinguish between "what is visible" vs "what the category implies."

### 2b. Add grounding logic to strategy resolver

**File: `src/lib/videoStrategyResolver.ts`**

Add a new `ObjectGrounding` interface and compute it from analysis:
```text
visible_product_detected: boolean
visible_object_list: string[]
allow_new_objects: boolean (false by default)
allow_new_products: boolean (false by default)
preserve_visible_objects_only: boolean (true by default)
product_context_source: 'image_detected' | 'user_added' | 'library_selected' | 'none'
scene_expansion_mode: 'restricted' | 'guided' | 'flexible'
```

Rules:
- If no product visible AND no user-provided product context → `allow_new_objects = false`, `allow_new_products = false`
- If product visible → `preserve_visible_objects_only = true`
- If user explicitly added product context → `allow_new_products = true` with that source only
- Category alone never sets `allow_new_objects = true`

Add `object_grounding` to `VideoStrategy` interface.

### 2c. Update prompt builder with grounding clauses

**File: `src/lib/videoPromptTemplates.ts`**

- Add a `buildObjectGroundingClause()` function that generates grounding instructions based on the strategy's `object_grounding`:
  - When `preserve_visible_objects_only`: "Only animate objects visible in the source image. Do not introduce new products, props, bottles, accessories, or handheld items."
  - When product detected: "Preserve the identity and appearance of the visible [object_list]. Do not replace or swap it."
  - When no product and none added: "No product or prop is present — do not invent or add one."
- Inject this clause into all category assemblers after the core motion instruction
- Strengthen negative prompts with: `"invented objects, added props, swapped products, hallucinated packaging, unexplained handheld items"`

### 2d. UI grounding note before generation

**File: `src/pages/video/AnimateVideo.tsx`**

- After the "Specific Motion Note" textarea and before the Generate button, if the motion goal or category implies product interaction BUT `analysisResult` shows no visible product and no user-provided product context, show a neutral info banner:
  > "No product was explicitly provided. VOVV will keep the video grounded to the visible subject and scene."
- Use a subtle `bg-muted/30` banner with an info icon — not blocking, just informational

---

## 3. Edge Function Deployment

Redeploy `analyze-video-input` after schema changes.

---

## Technical Details

- **Files modified**: 
  - `src/components/app/video/VideoResultsPanel.tsx` — redesigned player + new presets
  - `src/pages/video/AnimateVideo.tsx` — grounding banner + new variation handling + aspect ratio pass-through
  - `src/lib/videoStrategyResolver.ts` — `ObjectGrounding` interface + computation
  - `src/lib/videoPromptTemplates.ts` — grounding clauses + stronger negatives
  - `supabase/functions/analyze-video-input/index.ts` — new analysis fields
- **No database migrations needed**
- **Edge function redeployment**: `analyze-video-input`

