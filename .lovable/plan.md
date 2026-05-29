## Goal

Add a brand-new `trousers` category that mirrors `jeans` (38 scenes) but is named/worded for trousers. Jeans stays as-is. Auto-classifier routes pants/chinos/slacks/dress pants/cargos/joggers → `trousers`.

## 1. Database — duplicate scenes into a new collection

Insert one new row per existing jeans scene with `owner_user_id IS NULL`:

- `scene_id` = original with `jeans` → `trousers` (e.g. `jeans-wall-lean-ugc` → `trousers-wall-lean-ugc`). Fallback: prefix `trousers-` if the original has no "jeans".
- `category_collection = 'trousers'`
- `category_sort_order = 22` (slots `trousers` right after `jeans` (21) in Fashion family)
- Keep `sub_category`, `sub_category_sort_order`, `sort_order`, `scene_type`, `mood`, `setting`, `shot_style`, `filter_tags`, `subject`, `requires_extra_reference`, `use_scene_reference`, `outfit_hint`, `suggested_colors`.
- `preview_image_url = NULL`, `is_active = true` (user re-generates previews themselves).
- `title`, `description`, `prompt_template`: copy from jeans, then string-replace (case-insensitive, whole-word) `jeans → trousers`, `Jeans → Trousers`, `Denim → Trouser`, `denim → trouser` so titles like "Denim Set", "Denim Icon", "Color Denim" become "Trouser Set", "Trouser Icon", "Color Trouser". Sub-category labels containing "Denim" stay as new strings: `Campaign Denim Statements → Campaign Trouser Statements`, `Folded / Stack / Product Still` (unchanged), `Aesthetic Color Denim Styling → Aesthetic Color Trouser Styling`. (Done in the same SQL via `regexp_replace`.)
- `trigger_blocks`: copy unchanged (they're behavioural).

I'll run this as one `INSERT … SELECT … FROM product_image_scenes WHERE category_collection='jeans' AND owner_user_id IS NULL` so all 38 land in one shot. No update to existing jeans rows.

## 2. Auto-classifier (`supabase/functions/analyze-product-category/index.ts`)

- Add `trousers` to `VALID_CATEGORIES` list (line 13) and to the AI prompt's `VALID CATEGORIES` line.
- New `TROUSERS GUIDANCE` block in the AI prompt: "Any non-sport trouser-like garment — chinos, slacks, dress pants, cargo pants, trousers, joggers (non-sport), leggings (non-sport) — MUST be categorised as `trousers`. Use `jeans` only when the title or description clearly indicates denim/jeans. Never tag 'Dress Pants', 'Dress Shirt', etc. as `dresses`."
- New regex rule **before** the `\bdress\b` rule (line 38):
  ```
  [/\b(trouser|trousers|chino|chinos|slack|slacks|dress\s+pants?|cargo\s+pants?|cargo|jogger|joggers|sweatpants|track\s+pants?)\b/i, "trousers"]
  ```
  Tighten the dress regex so adjective use can't fire: `/\bdress(?!\s+(pants?|shirts?|shorts?|shoes?|socks?|code))\b|\bdresses\b|gown|maxi dress|midi dress|sundress|cocktail dress/i`.
- `SPECIFICITY_OVERRIDES`: add `["garments", /trousers|chino|slack|cargo|jogger|sweatpants/i, "trousers"]` and `["dresses", /trousers|chino|slack|cargo|dress\s+pants?/i, "trousers"]` (rescues already-mis-tagged rows on next analysis).
- `GARMENTS_REFINEMENT_PATTERNS`: add `[/trousers|chino|slack|cargo|jogger|sweatpants|track\s+pants?/i, "trousers"]` above the dresses line.
- Leave `jeans`/`denim` rules untouched so denim still goes to `jeans`.

## 3. Frontend taxonomy

Add `trousers` everywhere `jeans` is enumerated, treated as a Fashion sibling:

- `src/lib/sceneTaxonomy.ts` — `CATEGORY_FAMILY_MAP`: `'trousers': 'Fashion'`; fashion array gets `'trousers'`.
- `src/hooks/usePublicSceneLibrary.ts` — `COLLECTION_LABEL`: `'trousers': 'Trousers'`.
- `src/lib/categoryUtils.ts`, `src/lib/onboardingTaxonomy.ts`, `src/data/demoProducts.ts`, `src/types/index.ts` — add `trousers` next to `jeans` so onboarding, filters, and TS types accept it.
- `src/lib/productSpecFields.ts`, `src/lib/outfitVocabulary.ts`, `src/lib/outfitConflictResolver.ts`, `src/features/brand-scenes/wizard/constants/outfit.ts`, `src/lib/productImagePromptBuilder.ts`, `src/lib/catalogEngine.ts`, `src/lib/conversionCopy.ts`, `src/components/app/product-images/{types,constants,ProductImagesStep2Scenes,ProductImagesStep3Refine}.tsx`, `src/pages/{Generate,Freestyle,AdminProductImageScenes}.tsx`, `src/components/app/AddToDiscoverModal.tsx` — wherever `'jeans'` appears in a switch/list/map, add the same handling for `'trousers'` (alias to the jeans branch for outfit/prompt logic so generation behaves identically). I'll grep each file and add a one-line alias rather than rewriting blocks.

## 4. Memory update

Add a short note to `mem://tech-stack/product-category-normalization` so future work knows trousers exists alongside jeans.

## Not touched

- Existing jeans scenes, titles, prompts, previews
- RLS, auth, storage
- Image generation pipeline behaviour (trousers reuses jeans' prompt logic via alias)
- Other categories

## Open question

The existing user product `e5c570a0-…` (`Light Gray Slim Fit Dress Pants` currently tagged `dresses`) — want me to backfill its `analysis_json.category` to `trousers` in the same pass, or leave it for the user to re-analyse?