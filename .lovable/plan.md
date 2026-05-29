# Resolve canonical category for legacy products on /app/products

## Why it's still showing "Mini Dress" / "Pants"

These products were uploaded before the analyzer change. Their `analysis_json.userCategory` is empty, so my previous fallback dropped back to the raw `product_type` ("Mini Dress", "Pants", "Phone Case"). The analyzer fix only affects newly uploaded products.

## Fix — client-side regex resolver (zero DB writes)

Add a tiny browser-safe mirror of the server's `mapTitleToCategory` regex table at `src/lib/categoryResolver.ts`. Use it in `getDisplayCategory` so any legacy row gets mapped to a canonical id from `title + product_type` and rendered via `getCategoryLabel`.

```text
analysis_json.userCategory  →  client regex on title+product_type  →  raw product_type (last resort)
```

Result without touching the DB: "Mini Dress" → "Dresses", "Pants" → "Trousers", "Phone Case" → "Phone Cases".

## Changes

1. **New** `src/lib/categoryResolver.ts` — exports `mapTextToCategory(text: string): string | null`. Same patterns as `supabase/functions/_shared/category-mapper.ts` so server and client agree. Pure function, no deps.
2. **Edit** `src/pages/Products.tsx` — extend `getDisplayCategory`:
   ```ts
   const id = p.analysis_json?.userCategory
     ?? mapTextToCategory(`${p.title ?? ''} ${p.product_type ?? ''}`);
   const label = id ? getCategoryLabel(id) : '';
   return label || (raw product_type fallback unchanged);
   ```

## Safety

- Pure display change, no schema or query touched.
- If regex matches nothing, current behaviour (raw `product_type`) is preserved.
- Reusing the exact same regex order as the server keeps client/server in lockstep — no divergence risk.
- No effect on filtering/search (still `product_type` based).

## Optional follow-up (not in this plan)

Lazy backfill: when the user opens Edit Product, write the resolved id back into `analysis_json.userCategory`. Can do later if you want persistence; not needed for the display fix.

## Files

- `src/lib/categoryResolver.ts` (new)
- `src/pages/Products.tsx`
