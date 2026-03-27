

# Fix: Show thumbnail for prompt-only scenes in workflow grid

## Change

**File: `src/pages/Generate.tsx`, line 450**

Replace:
```typescript
preview_url: s.promptOnly ? undefined : s.previewUrl,
```
With:
```typescript
preview_url: s.previewUrl,
```

This ensures "Skyline Laundry" (and any future prompt-only scenes) displays its thumbnail in the workflow scene grid, while still using only the prompt hint during generation.

