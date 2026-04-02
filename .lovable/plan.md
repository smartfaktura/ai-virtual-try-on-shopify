

# Fix Mismatched Image Count (14 vs 13)

## Root Cause

Line 339 in `CatalogGenerate.tsx`:
```typescript
const visibleTotal = Math.max(visibleJobs.length, batchState.totalJobs);
```

`batchState.totalJobs` sometimes includes the hidden `identity_anchor` job(s), giving 14. But `visibleJobs` correctly filters anchors out, giving 13. The `Math.max` picks 14, so the main progress says "0/14" while per-product cards (built from `visibleJobs`) say "0/13".

## Fix

**File: `src/pages/CatalogGenerate.tsx` — line 339**

Replace:
```typescript
const visibleTotal = Math.max(visibleJobs.length, batchState.totalJobs);
```
With:
```typescript
const visibleTotal = visibleJobs.length;
```

This ensures both the main progress display and the per-product breakdown use the same filtered count. The `Math.max` guard was originally there to handle placeholder expansion, but placeholders are already filtered in `visibleJobs`, so the guard is no longer needed and causes this mismatch.

Single line change, no other files affected.

