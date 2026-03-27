

# Fix: Save metadata fails on Discover presets

## Problem
When saving metadata in the Discover detail modal, the update fails with a 400 error because `discover_presets.prompt` has a NOT NULL constraint. The current code sends `null` when prompt is empty.

## Fix

### `src/components/app/DiscoverDetailModal.tsx` — line ~478
Change:
```typescript
prompt: editPrompt || null,
```
To:
```typescript
prompt: editPrompt ?? '',
```

One-line fix. Empty prompt sends `''` instead of `null`, satisfying the NOT NULL constraint.

