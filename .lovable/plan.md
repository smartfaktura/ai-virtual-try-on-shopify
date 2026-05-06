# Bundle Prompt Engineering Fixes

## Problem
The bundle generation prompt has 4 issues that degrade multi-product image quality:
1. No per-product identity enforcement in CRITICAL REQUIREMENTS for bundles
2. Generic/weak reference image labels for additional products
3. Conflicting single-product PRODUCT DETAILS block confuses the AI
4. Missing product count enforcement in the high-weight CRITICAL REQUIREMENTS section

## Changes

### Edge function (`supabase/functions/generate-workflow/index.ts`)

**A. Line 617 — Add per-product identity + count enforcement for bundles**

Currently for bundles, only the hero gets "MUST look EXACTLY like [PRODUCT IMAGE]". Add bundle-specific lines:
```
Product 2 MUST look EXACTLY like [PRODUCT IMAGE 2] — same shape, colors, branding.
Product 3 MUST look EXACTLY like [PRODUCT IMAGE 3] — same shape, colors, branding.
...
PRODUCT COUNT: This image MUST contain EXACTLY N distinct products.
```

**B. Lines 600-606 — Skip PRODUCT DETAILS block for bundles**

The bundle prompt instruction already contains a comprehensive `BUNDLE COMPOSITION — N PRODUCTS` block with scale calibration. The redundant single-product `PRODUCT DETAILS` block confuses the AI into over-focusing on hero only. Skip it when `isBundle`.

**C. Lines 769-772 — Strengthen IMAGE_LABEL_MAP for product references**

Change generic labels:
```
// Before:
product_2: '[PRODUCT IMAGE 2] Additional product reference:'

// After:
product_2: '[PRODUCT IMAGE 2] Additional product — reproduce EXACTLY (shape, colors, labels, branding). IGNORE background:'
```

Apply same pattern for product_3, product_4, and add product_5 (bundles support up to 5 products).

**D. Deploy edge function**

## Safety
- All changes gated by `if (isBundle)` — only active when `is_bundle: true` flag is present in variation
- Only `BundleVisuals.tsx` sends this flag — no other workflow affected
- IMAGE_LABEL_MAP wording improvement is additive and benefits existing flat-lay flows too (slightly stronger identity text)
- No frontend changes needed
