

# Expanded Token System for Product Image Scenes

## The Category Chicken-and-Egg Problem

**No extra call needed.** The current single AI vision call already detects the category. We expand that same call to also extract all relevant tokens in one pass. The AI model sees the image, determines "this is a fragrance," and simultaneously extracts `fragranceFamily`, `bottleType`, `liquidColorHex`, etc. One call, one result, cached forever in `analysis_json`.

The `analysis_json` column on `user_products` is a JSONB blob with no schema constraint — we simply store a richer object. Existing cached analyses keep working (they just have fewer fields); new analyses get the full token set.

## Architecture

```text
┌─────────────────────────────────────┐
│  analyze-product-category (edge fn) │
│  Single AI call extracts:           │
│  1. Global visual tokens (always)   │
│  2. Global semantic tokens (always) │
│  3. Category-specific tokens        │
│     (AI picks the right set based   │
│      on detected category)          │
└──────────────┬──────────────────────┘
               │ stored in analysis_json
               ▼
┌─────────────────────────────────────┐
│  resolveToken() in prompt builder   │
│  Maps {{tokenName}} → value from    │
│  analysis_json, with safe fallbacks │
└─────────────────────────────────────┘
```

## Changes

### 1. Update `ProductAnalysis` type (`src/components/app/product-images/types.ts`)
Expand the interface with all new global + category-specific fields as optional strings/booleans. Keep existing fields for backward compatibility.

### 2. Rewrite edge function AI prompt (`supabase/functions/analyze-product-category/index.ts`)
- Expand the system prompt to request all global tokens plus category-conditional tokens
- Use a single `classify_product` tool call with the full schema (all fields optional except globals)
- The AI naturally returns only relevant category fields (e.g., `fragranceFamily` only for fragrances)
- Switch model from `gemini-2.5-flash-lite` to `gemini-2.5-flash` for better structured extraction accuracy with the larger schema

### 3. Expand `resolveToken()` in prompt builder (`src/lib/productImagePromptBuilder.ts`)
- Add cases for every new `{{token}}` that reads from `analysis` object
- Each token returns the value directly from analysis or an empty string if absent
- No behavior change for existing tokens

### 4. Update admin token reference bar (`src/pages/AdminProductImageScenes.tsx`)
- Replace the flat `PROMPT_TOKENS` array with a structured object organized by group:
  - **Global Visual** (productCategory, productMainHex, etc.)
  - **Global Semantic** (ingredientFamilyPrimary, flowersRelated, etc.)
  - **Category-Specific** sections (Fashion, Beauty, Fragrance, Jewelry, etc.)
  - **System** (existing tokens like background, lightingDirective, etc.)
- Render as collapsible groups with descriptions in the token info bar
- Clicking a token inserts `{{tokenName}}` into the prompt template textarea

### 5. Invalidate stale analyses
- In `useProductAnalysis`, check for a version marker (e.g., `analysis.version !== 2`) to re-trigger analysis for products that only have the old slim schema
- This ensures existing products get the rich token data on next use

## Files Modified
- `src/components/app/product-images/types.ts` — expand `ProductAnalysis`
- `supabase/functions/analyze-product-category/index.ts` — richer AI extraction
- `src/lib/productImagePromptBuilder.ts` — new token resolution cases
- `src/pages/AdminProductImageScenes.tsx` — structured token reference UI
- `src/hooks/useProductAnalysis.ts` — version check for re-analysis

## No Database Migration Needed
`analysis_json` is already a JSONB column — richer objects store without schema changes.

