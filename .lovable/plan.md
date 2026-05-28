## Goal

Add a new sub-category **Phone Cases** (slug `phone-cases`) under the **Bags & Accessories** family. It should behave exactly like sibling slugs (`backpacks`, `wallets-cardholders`, `belts`, `scarves`) — pickable in onboarding, detected from product imports, available in the admin Product Visual Scenes list, supported in Brand Scenes wizard, and routed through the right photography/prompt logic.

## Why a sub-category (not a new top-level family)

The admin page rows in your screenshot (`Jackets`, `Activewear`, `Fragrance`, `Wedding Dress`, `bundle`…) are `category_collection` slugs — sub-families, not top-level families. Top-level families are fixed at 12 (`PRODUCT_CATEGORIES`). Adding `phone-cases` as a new slug under Bags & Accessories gives you a new row in the admin list without expanding the 12-family contract that Brand Scenes, onboarding chips, and headlines depend on.

## What changes (all frontend + edge-function constants — no DB schema changes)

### 1. Core taxonomy — register the slug

- `src/lib/sceneTaxonomy.ts`
  - Add `'phone-cases': 'Bags & Accessories'` to `CATEGORY_FAMILY_MAP`
  - Add `'phone-cases': 'Phone Cases'` to `SUB_FAMILY_LABEL_OVERRIDES`
  - Append `'phone-cases'` to `ONBOARDING_TO_COLLECTIONS_MAP['bags-accessories']` (and add a direct `phonecases / phone-cases / 'phone case'` alias key pointing to `['phone-cases']`)
- `src/lib/onboardingTaxonomy.ts`
  - Append `'phone-cases'` to `FAMILY_SUB_ORDER['Bags & Accessories']` (after `wallets-cardholders`)
  - Add `'phone-cases': 'case'` to `SUBTYPE_NOUN`
- `src/types/index.ts` — add `'phone-cases'` to the `TemplateCategory` union
- `src/lib/categoryConstants.ts` — add optional `SUBTYPE_HEADLINES['phone-cases']` + `_RETURNING` copy ("Create your first phone case campaign…")

### 2. Auto-detection from product imports (Shopify / CSV)

- `src/lib/categoryUtils.ts`
  - Add a new rule **before** the generic `tech` rule:
    `[['phone case','iphone case','airpods case','samsung case','silicone case','clear case','magsafe'], 'phone-cases']`
  - Add `'phone-cases': 'Phone Cases'` to `categoryLabels`
- `supabase/functions/analyze-product-category/index.ts`
  - Add `phone-cases` to the `VALID CATEGORIES` list (line ~196)
  - Add detection regex before the generic tech rule: `[/phone case|iphone case|airpods case|magsafe|silicone case|clear case/i, "phone-cases"]`
- `supabase/functions/backfill-discover-subcategories/index.ts`
  - Add `'phone-cases': ['phone case','iphone case','airpods case','magsafe','silicone case','clear case']`
  - Add to `bags-accessories: [...]` mapping

### 3. Admin pages — label + filter dropdowns

Add `{ value: 'phone-cases', label: 'Phone Cases' }` to the category arrays in:
- `src/pages/AdminProductImageScenes.tsx`
- `src/pages/AdminBulkPreviewUpload.tsx`
- `src/hooks/usePublicSceneLibrary.ts`
- `src/hooks/useProductImageScenes.ts`
- `src/components/app/AddToDiscoverModal.tsx` (alias `'phone case' → 'phone-cases'`)

### 4. Brand Scenes wizard support

- `src/features/brand-scenes/wizard/registry/categoryPresets.ts` — add a `"phone-cases"` entry under the `bags-accessories` module with preset background colors, surfaces, props (mirror the `wallets-cardholders` preset as a starting point)
- `src/features/brand-scenes/wizard/registry/settingsBySubfamily.ts` — add `"bags-accessories/phone-cases"` entry (camera, lighting, scale defaults — small handheld object, 50–85mm, soft top light)
- `src/features/brand-scenes/wizard/registry/storytellingBySubfamily.ts` — add `"bags-accessories/phone-cases"` story beats (in-hand, on-desk surface, paired with device, lifestyle pocket pull)

### 5. Product spec fields (for token system)

- `src/lib/productSpecFields.ts` — add a `'phone-cases'` block with relevant fields: `material` (silicone / TPU / leather / clear / aramid), `compatibility` (iPhone 15 Pro, Galaxy S24…), `finish` (matte / glossy / textured), `feature` (MagSafe / camera ring / kickstand)

### 6. Conversion / headline copy (optional polish)

- `src/lib/conversionCopy.ts` — map `'phone-cases'` into the `electronics` / `accessories` bucket so existing free-user conversion copy keeps working

### 7. Seed initial scenes (post-deploy, no code)

After the slug exists, you (admin) click **"+ New"** on the Bags & Accessories row in `/app/admin/product-image-scenes`, type `phone-cases` in the Category field and any sub-category name (e.g. "Essential Shots", "Editorial Still", "On Desk"). The page already supports creating new sub-category buckets via free-text — no migration required.

## Out of scope

- No DB migration. `category_collection` is a free-text column on `product_image_scenes`; the new slug is valid the moment the constants ship.
- No changes to `PRODUCT_CATEGORIES` (still 12 top-level families).
- No new Brand Scene module (Phone Cases lives inside the existing `bags-accessories` module).

## Verification

1. `/app/admin/product-image-scenes` — Bags & Accessories row shows `Phone Cases (0)` after first scene is created.
2. Onboarding Step 3 — under Bags & Accessories family, a `Phone Cases` chip appears.
3. Import a Shopify product titled "Clear iPhone 15 Case" → product auto-tagged with `phone-cases`.
4. Brand Scenes wizard → pick Bags & Accessories → Phone Cases sub-family loads its own preset surfaces/colors.
5. Discover filter pill `Bags & Accessories → Phone Cases` filters correctly.

## File touch count

~12 frontend files + 2 edge functions. No SQL. No new tables, no RLS changes.
