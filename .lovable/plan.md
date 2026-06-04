# Add "Socks" as a Supported Category

Customer asked for sock scenes. Today socks fall through to `garments`/`other`, so the analyzer misclassifies them and there's no Socks tab anywhere. This plan registers socks as a first-class category so that once you (admin) add socks scenes manually via the admin scene tools, they appear automatically in Visual Studio, the Visual Library, and the product form.

## What changes for the user

- Upload socks → analyzer returns `socks` instead of "garments / other".
- `/app/generate/product-images` Step 2 will show a **Socks** tab under the Fashion family once scenes with `category_collection='socks'` exist.
- `/product-visual-library` exposes the **Socks** collection via `?family=fashion&collection=socks`.
- Add Product form lists **Socks** as a subcategory under Fashion & Apparel.

## 1. Canonical taxonomy (frontend)

- `src/lib/productCategories.ts` — add `socks: 'Socks'` to `CATEGORY_LABELS`; add `'socks'` to the **Fashion & Apparel** super-group.
- Register `socks` alongside sibling apparel ids in:
  `src/lib/categoryConstants.ts`, `src/lib/categoryResolver.ts`, `src/lib/categoryUtils.ts`, `src/lib/onboardingTaxonomy.ts`, `src/lib/sceneTaxonomy.ts`, `src/lib/outfitVocabulary.ts`, `src/lib/productSpecFields.ts`, `src/lib/productImagePromptBuilder.ts`.
- `src/lib/outfitConflictResolver.ts` — special-case: when product is `socks`, do **not** null the footwear slot (socks coexist with shoes).
- `src/types/index.ts` and `src/components/app/product-images/{constants,types}.ts` — extend category enums/lists.

## 2. Analyzer (backend)

- `supabase/functions/_shared/category-mapper.ts`:
  - Add `"socks"` to `VALID_CATEGORIES`.
  - Insert regex **before** the generic `garments` rule:
    ```
    [/\bsocks?\b|crew sock|ankle sock|no[- ]?show sock|knee[- ]?high|tube sock|athletic sock|dress sock|wool sock|compression sock/i, "socks"]
    ```
- `supabase/functions/analyze-product-category/index.ts` and `analyze-product-image/index.ts` — add `socks` to the enum sent to Gemini.
- `supabase/functions/backfill-discover-subcategories/index.ts` — include `socks` in its mapping.

## 3. Visual Library deep-link

- `src/lib/visualLibraryDeepLink.ts` — add `'socks': { family: 'fashion', collection: 'socks' }`.
- `src/hooks/usePublicSceneLibrary.ts` — ensure `socks` is grouped under the `fashion` family in the family→collections map.

## 4. Product Images Step 2 (no component changes)

`ProductImagesStep2Scenes.tsx` + `useProductImageScenes.ts` already group by `category_collection`. Once you create socks scenes with `category_collection='socks'`, a Socks tab appears automatically — no UI work needed.

## 5. Brand Scenes wizard (lightweight route)

- `src/features/brand-scenes/wizard/registry/categoryPresets.ts` — route socks through the existing **fashion** module with a new `socks` subfamily (no new module folder).
- Add `socks` entries to `settingsBySubfamily.ts`, `storytellingBySubfamily.ts`, `subfamilyGuides.ts` so the wizard has appropriate framing/setting copy for socks.

## 6. QA after build

- Upload a real sock photo → analyzer returns `socks`.
- Open admin scene editor → "Socks" is selectable as `category_collection`.
- Add Product modal shows Socks under Fashion & Apparel.
- `/product-visual-library?family=fashion&collection=socks` opens the (empty until you add scenes) Socks collection.

## Out of scope

- Creating the actual sock scenes (you'll add them manually via the admin tools with your own prompts).
- Prompt-builder safeguards for socks (your per-scene prompts will handle correctness).
- Dedicated `/ai-product-photography/socks` SEO landing page.
- Sock-specific Short Film presets.

## Safety & risk

- **No schema changes**, no RLS edits, no data inserts.
- **Additive taxonomy only** — can't break existing categories; uncategorized socks today fall to `garments`/`other` and will start routing correctly.
- Analyzer regex is placed before the generic `garments` rule and uses sock-specific words, so it cannot steal matches from other apparel.
- **Reversible** — single PR revert.
- Risk level: **low**.

## Effort

One short build session: ~10 file edits across frontend taxonomy + 3 edge functions. No migrations, no edge function signature changes, no scene seeding.
