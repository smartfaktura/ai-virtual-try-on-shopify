# Brand Scenes — full audit

Holistic review of the brand scenes feature from UX, UI, functionality, data, and backend angles. Below is what works, what's risky, and a small set of recommended fixes.

## ✅ What's solid

**Data**
- `brand_scene_stock_products`: 49 rows total — every wizard sub_family (per `SUB_TYPES_BY_FAMILY`) has an exact match, plus one module-level fallback for safety. Resolution order in `useStockProductForScene` (exact → module → null) matches what's seeded.
- RLS: admin-only writes; `anon + authenticated` can read active rows. Correct since this is a global lookup table.

**Backend (`generate-brand-scene`)**
- Balance check + `deduct_credits` BEFORE Gemini call, full `refund_credits` only when all 3 slots fail. Partial success keeps the deduction (user got assets) — correct.
- Per-slot fallback: `gemini-3-pro-image-preview` → `gemini-3.1-flash-image-preview` matches project fallback memory.
- Stock product injected as the third inline image with a `[STOCK PRODUCT]` preamble explaining it's a swap-in placeholder. Won't leak into the saved prompt because save uses `injectReferenceTokens(directive)`.
- `Promise.allSettled` so one bad slot doesn't kill the others.

**Backend (`save-brand-scene`)**
- Anti-spoof check on `pickedVariationUrl` (must contain `/${user.id}/brand-scenes/`) ✓
- Save is free; credits already taken at generate time — clearly documented in code.
- Derives `trigger_blocks` (personDetails / outfit) + `outfit_hint` from cast answers so the saved scene plays correctly inside Product Images model picker + outfit system.
- `category_collection = sub_family` invariant respected — scene shows up in matching category in Freestyle / Product Visuals.

**UI / UX (`Step6PreviewAndPick`)**
- Clear two-phase model: generate (paid) → pick (free save).
- Stock-product hint copy explains the placeholder honestly ("your actual item replaces it").
- Variation grid + admin debug panel for compiled prompt and raw payload.
- Sidebar credit chip resync on success.

## ⚠️ Issues worth fixing

1. **`window.confirm` on regenerate** — uses native browser dialog, breaks premium aesthetic. Should use shadcn `AlertDialog`.
2. **Stock product preview hidden** — user only sees the label ("Front View Lingerie") in copy. They can't see the thumbnail being passed to Gemini, so they can't tell if it's a sensible reference. Add a small 48px square thumbnail next to the label.
3. **Double-click race on Generate** — button disables only via `phase` state. A fast double-click before React commits could fire two invocations and double-deduct. Add a `useRef` lock or `pending` ref.
4. **`auth.getUser(token)` instead of `auth.getClaims()`** — project memory states edge functions verify JWT via `getClaims`. Both work, but `getUser` makes an extra round-trip; `getClaims` is faster + the project standard.
5. **Orphaned variations** — when user generates 3 and saves 1, the other 2 stay in `scratch-uploads/{user}/brand-scenes/{runId}/` forever. Add cleanup in `save-brand-scene` (delete sibling files in the run folder that don't match the picked URL).
6. **Stock product table accessed via `as any` cast** — types regenerated but the hook still uses `from("brand_scene_stock_products" as any)`. Remove the cast so TS catches future column changes.

## 🔧 Recommended fix order

1. Stock product thumbnail in Step6 (visibility / trust)
2. Replace `window.confirm` with `AlertDialog`
3. Idempotency lock on Generate
4. Orphan cleanup in `save-brand-scene`
5. Switch to `auth.getClaims()` in both edge functions
6. Drop `as any` in `useStockProductForScene`

All changes are isolated to the brand scenes feature — no schema work, no taxonomy work, no impact on other workflows. Approve and I'll ship them.
