

# Fix: Product Images page reloading during generation

## Problem
The `versionCheck.ts` auto-reload guard only excludes `/app/catalog` from forced page reloads on new builds. When a new version deploys while a user is on `/app/generate/product-images` (especially during Step 5 generation), the page reloads, losing all in-memory wizard state and dropping back to Step 1.

The session restore logic exists (persists job IDs to `sessionStorage`) but it cannot restore the full wizard context (selected products, scenes, detail settings, etc.) — only enough to resume polling. This means even if polling resumes, the user experience is broken.

## Solution
Extend the version check to also skip reloads on the product-images route, matching the existing catalog guard pattern.

## File Changed

### `src/lib/versionCheck.ts`
Add `/app/generate/product-images` to the reload exclusion list alongside `/app/catalog`:

```ts
// Don't reload while user is on catalog or product-images page
if (window.location.pathname.startsWith('/app/catalog')) return;
if (window.location.pathname.startsWith('/app/generate/product-images')) return;
```

One line addition. No other changes needed.

