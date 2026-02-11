

## Fix: Remove Dead Video References

Two small cleanups to remove leftover `video` references that are now unreachable.

### Change 1: Remove `video` from frontend type union

**File**: `src/hooks/useGenerationQueue.ts`

Remove `'video'` from the `jobType` union in `EnqueueParams` since the backend no longer accepts it.

```typescript
// Before
jobType: 'product' | 'tryon' | 'freestyle' | 'workflow' | 'video';

// After
jobType: 'product' | 'tryon' | 'freestyle' | 'workflow';
```

### Change 2: Remove dead video branch in credit cost calculation

**File**: `supabase/functions/enqueue-generation/index.ts`

Remove the `if (jobType === "video")` branch from `calculateCreditCost` since video jobs are rejected before this function is ever called.

```typescript
// Before
function calculateCreditCost(jobType: string, imageCount: number, quality: string): number {
  if (jobType === "video") return imageCount * 30;
  if (jobType === "tryon") return imageCount * 8;
  return imageCount * (quality === "high" ? 10 : 4);
}

// After
function calculateCreditCost(jobType: string, imageCount: number, quality: string): number {
  if (jobType === "tryon") return imageCount * 8;
  return imageCount * (quality === "high" ? 10 : 4);
}
```

