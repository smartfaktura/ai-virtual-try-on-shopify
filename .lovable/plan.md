## Why this happens

On the Material Swap success page, the heading above the result grid shows `Re-render the EXACT product shown in [PR…` — that is the first 40 characters of an old generation **prompt**, not a real product title.

Source of the bug, in `src/pages/MaterialSwap.tsx`:

1. When building the library picker items (lines 135–193), each `freestyle_generations` row gets:
   ```ts
   const rawTitle = f.prompt?.slice(0, 40)?.trim();
   const title = rawTitle || 'Freestyle';
   ```
   So the item's `title` is literally a slice of the prompt text.
2. When the user picks that library image as the source product (line 280):
   ```ts
   setProductTitle(item.title || 'Library image');
   ```
   That prompt slice becomes `productTitle`.
3. The success view renders `productTitle` as the section heading (line 518):
   ```tsx
   <h3>{productTitle}</h3>
   ```

Result: the old generation prompt shows up as the product name on the new Material Swap result page. Nothing else (generation, files, library writes) is affected — it is purely a display label.

## Plan

Frontend-only fix in `src/pages/MaterialSwap.tsx`. No backend, no schema, no prompt/generation changes.

1. Stop using prompt text as the library item title for freestyle rows:
   - Replace `const rawTitle = f.prompt?.slice(0, 40)?.trim();` with a clean label that prefers `workflow_label`, then aspect ratio, then a generic `'Freestyle image'`. The prompt stays only in `searchHaystack` so search still works.
2. Harden the picker handler so a prompt-like title can never leak in from older cached data:
   - In the library `onSelect` (line 280), detect "promptish" titles (contains `[`, `]`, starts with `Re-render`, longer than ~32 chars with spaces, etc.) and fall back to `'Library image'`.
3. Also guard the success heading itself:
   - In the results section (line 516–522), if `productTitle` looks promptish, render `'Selected product'` instead so any stale state can't surface the prompt.

No changes to generation jobs query (line 155+) since that branch already prefers `user_products.title` / `product_name` and does not use the prompt.

## Out of scope

- No edits to `useMaterialSwap.ts`, edge functions, prompts, or the actual swap pipeline.
- No DB writes — existing freestyle rows keep their `prompt` field untouched.
