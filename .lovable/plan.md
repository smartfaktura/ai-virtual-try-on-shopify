

## Allow Multi-Select for Interior/Exterior Staging Styles

### Problem
The Interior/Exterior Staging workflow forces single-select for design styles (line 2492-2494), while all other workflows allow multi-select with free/paid caps (1 for free, 3 for paid).

### Change — `src/pages/Generate.tsx` (line 2492-2495)

Remove the `isInteriorDesign` single-select override so it falls through to the standard multi-select logic with the same free/paid caps.

**Before:**
```tsx
if (isInteriorDesign) {
  return prev.has(i) ? new Set() : new Set([i]);
}
```

**After:** Remove these 3 lines entirely. The existing free-user cap (`FREE_SCENE_LIMIT = 1`) already enforces single-select for free users, and paid users will be able to select up to `PAID_SCENE_LIMIT = 3` styles — identical to how scenes work in other workflows.

### Files changed — 1
- `src/pages/Generate.tsx` — Remove interior design single-select override

