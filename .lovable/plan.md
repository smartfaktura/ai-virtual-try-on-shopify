

# Fix Catalog Results Page Refresh + Improve Shot Prompts

## Issue 1: Results Page Refreshing

**Root cause**: `versionCheck.ts` runs on app mount. Every time code is deployed, `version.json` gets a new timestamp. The check detects a mismatch and calls `window.location.reload()`, which wipes all in-memory state (batch results, progress, generated images).

**Fix**: Skip the version check reload when the user is on the catalog generation page with an active batch. Add a guard in `versionCheck.ts` that checks if the current path is `/app/catalog` before reloading. This preserves generation results.

## Issue 2: Weak/Inconsistent Shot Prompts

The current prompt templates are generic and lack the precision needed for consistent, high-quality catalog output. Key problems:
- Ghost Mannequin adds shadow despite saying "no shadow" — needs stronger shadow suppression
- Flat Lay includes "minimal curated props" which causes random unrelated products to appear — must explicitly forbid extra items
- Many shots lack specific pose direction, leading to random/different results each time
- Product-only shots need stronger "ONLY this product, nothing else" directives

**Fix**: Rewrite all shot `promptTemplate` values in `catalogEngine.ts` with:

### Ghost Mannequin
Remove all shadow references. Add: `"absolutely no shadow, no drop shadow, no surface, pure white void background, invisible mannequin effect, product floating in pure white space"`

### Front Flat / Back Flat
Add: `"ONLY this single product, no other items, no accessories, no props"`

### Styled Flat Lay
Replace "minimal curated props" with: `"ONLY [HERO_PRODUCT] alone, NO other products, NO extra accessories, NO additional items, single product flat lay, clean negative space around product, top-down birds-eye perspective"`

### On Surface
Remove "marble or linen or wood" ambiguity — use: `"placed on a clean minimal surface, single product only, no other items or accessories in frame"`

### On-Model Shots (general improvements)
- Add more specific pose language (e.g., "weight on left leg, right hand relaxed at side" for front model)
- Add "confident neutral expression, looking directly at camera" to front-facing shots
- Add "same exact model in every shot" reinforcement
- Movement shot: add "slight fabric motion blur on garment edges only"
- Sitting: specify "on a simple stool or bench, minimal furniture"

### All product-only shots
Append universal suffix: `"IMPORTANT: Show ONLY the specified hero product. Do NOT add any other clothing, accessories, shoes, bags, or items that are not explicitly described."`

## Files to Change

1. **`src/lib/versionCheck.ts`** — Add path guard to skip reload on `/app/catalog`
2. **`src/lib/catalogEngine.ts`** — Rewrite all ~20 shot `promptTemplate` values with stronger, more specific directions

