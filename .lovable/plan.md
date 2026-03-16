

## Analysis: Should We Split Generate.tsx?

### Current State
`Generate.tsx` is **4,376 lines** — a single monolithic component handling every workflow type (Try-On, Product Listing, UGC, Flat Lay, Mirror Selfie, Staging, Upscaling). It declares **50+ useState hooks** and runs multiple database queries on mount regardless of which workflow is active.

### Does It Actually Cause Performance Problems?
**Not as much as you'd think**, because:
- The page is already **lazy-loaded** — its bundle only downloads when you navigate to `/app/generate`
- Most database queries use `enabled` flags (e.g., `previousUploads` only fires for Staging workflow)
- React doesn't re-render unused JSX branches

**But it does hurt** in two ways:
1. **Bundle size**: All 4,376 lines (+ imports for every workflow's UI components) ship as one chunk. Even if you open a simple Product Listing workflow, the browser parses/compiles code for Flat Lay aesthetics, UGC moods, Mirror Selfie phases, etc.
2. **Memory**: 50+ `useState` calls initialize state for features that aren't relevant to the current workflow

### Recommended Approach
Rather than creating separate routes (which would duplicate a lot of shared wizard logic), **extract workflow-specific panels into lazy-loaded sub-components** while keeping the shared wizard shell.

### Changes

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Slim down to ~800 lines: shared wizard shell (steps, navigation, product picker, results view) + dynamic import of workflow panel |
| `src/components/app/generate/TryOnPanel.tsx` | **New** — Extract Try-On specific state, model/pose pickers, UGC moods (~800 lines) |
| `src/components/app/generate/ProductListingPanel.tsx` | **New** — Extract scene selection, template picker, settings for product-only workflows (~600 lines) |
| `src/components/app/generate/FlatLayPanel.tsx` | **New** — Extract flat lay aesthetics, multi-product selector, surface/detail phases (~400 lines) |
| `src/components/app/generate/StagingPanel.tsx` | **New** — Extract room upload, style selector for Interior/Exterior (~300 lines) |
| `src/components/app/generate/UpscalePanel.tsx` | **New** — Extract upscale resolution picker, simple upload flow (~200 lines) |
| `src/components/app/generate/MirrorSelfiePanel.tsx` | **New** — Extract mirror selfie scene picker + model picker (~300 lines) |
| `src/components/app/generate/useGenerateSharedState.ts` | **New** — Custom hook for shared state (product, source, brand profile, aspect ratio, results) used by all panels |
| `src/components/app/generate/types.ts` | **New** — Shared types/interfaces for panel props |

### How It Works

```text
Generate.tsx (shell)
├── Shared: product picker, source selector, brand profile, results view
├── workflowId → lazy(() => import('./generate/TryOnPanel'))
├── workflowId → lazy(() => import('./generate/ProductListingPanel'))
├── workflowId → lazy(() => import('./generate/FlatLayPanel'))
└── ... etc
```

Each panel receives shared state via props (or a context) and manages only its own workflow-specific state internally. The shell handles step navigation, generation submission, and results display.

### Impact
- **~70% smaller initial parse** for any single workflow
- Each workflow panel loads only when that workflow is selected
- Shared logic (product picker, results, credits) stays in one place — no duplication
- No route changes needed — still `/app/generate?workflow=X`

### Risk
This is a large refactor touching the biggest file in the project. It should be done incrementally — start with one panel (e.g., `UpscalePanel` since it's the simplest), verify it works, then extract the others one at a time.

