

# Fix: Product Images Page Slow Initial Load

## Root Cause

The `/app/generate/product-images` page is slow to load because:

1. **All 6 step components are eagerly imported** — the page imports `ProductImagesStep2Scenes`, `ProductImagesStep3Refine` (967 lines), `ProductImagesStep4Review`, `ProductImagesStep5Generating`, `ProductImagesStep6Results` at the top level. Only Step 1 (product grid) is needed initially.

2. **Model hooks run immediately** — `useUserModels()` and `useCustomModels()` fire DB queries on mount, but models aren't needed until Step 3 (Refine). These queries add latency to the initial render.

3. **Dev server recompilation** — recent heavy edits to Step 3 (967 lines) cause Vite to recompile a large chunk on every page load in dev mode. This is inherent to the dev environment but lazy-loading would reduce the impact.

## Plan

### 1. Lazy-load step components (biggest impact)

**File**: `src/pages/ProductImages.tsx`

Replace direct imports of steps 2-6 with `React.lazy()`:

```typescript
const ProductImagesStep2Scenes = lazy(() => import('./product-images/ProductImagesStep2Scenes'));
const ProductImagesStep3Refine = lazy(() => import('./product-images/ProductImagesStep3Refine'));
// ... etc for steps 4, 5, 6
```

Wrap each step render in a lightweight `<Suspense fallback={<StepSkeleton />}>` that shows a simple skeleton while the step chunk loads. Step 1 (product grid) stays inline since it's the landing view.

### 2. Defer model queries until Step 3

**File**: `src/pages/ProductImages.tsx`

Change the model hooks to only run when needed:

```typescript
const { asProfiles: userModelProfiles } = useUserModels({ enabled: step >= 3 });
const { asProfiles: globalModelProfiles } = useCustomModels({ enabled: step >= 3 });
```

This requires a small update to `useUserModels` and `useCustomModels` hooks to accept an `enabled` option that gets merged with the existing `!!user` check.

### 3. Add `enabled` option to model hooks

**Files**: `src/hooks/useUserModels.ts`, `src/hooks/useCustomModels.ts`

Add an optional `enabled` parameter:

```typescript
export function useUserModels(opts?: { enabled?: boolean }) {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['user-models', user?.id],
    queryFn: async () => { ... },
    enabled: !!user && (opts?.enabled !== false),
  });
  // ...
}
```

Same pattern for `useCustomModels`.

## Files to Update

| File | Change |
|------|--------|
| `src/pages/ProductImages.tsx` | Lazy-load steps 2-6, defer model hooks to step >= 3 |
| `src/hooks/useUserModels.ts` | Accept optional `enabled` param |
| `src/hooks/useCustomModels.ts` | Accept optional `enabled` param |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Add `export default` for lazy import |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Add `export default` for lazy import |
| `src/components/app/product-images/ProductImagesStep4Review.tsx` | Add `export default` for lazy import |
| `src/components/app/product-images/ProductImagesStep5Generating.tsx` | Add `export default` for lazy import |
| `src/components/app/product-images/ProductImagesStep6Results.tsx` | Add `export default` for lazy import |

## Expected Impact

- Step 1 renders immediately with just the product grid (small chunk)
- Steps 2-6 load on-demand when the user navigates to them
- Model DB queries don't run until the user reaches Step 3
- Total initial JS payload reduced significantly

