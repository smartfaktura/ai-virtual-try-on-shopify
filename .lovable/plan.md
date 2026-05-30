## `/app/generate/selfie-ugc-set` & `/app/generate/mirror-selfie-set` — product step polish

All in `src/pages/Generate.tsx` (the unified Visual Studio create page that powers both routes).

### 1. Simplify the step title + subtitle

Lines ~3006–3019: the heading / subtitle block branches on `isFlatLay`, `isMirrorSelfie`, `activeWorkflow?.uses_tryon`. Collapse the **selfie-ugc** and **mirror-selfie** branches to a single, simple pair:

- Title: **Select Product**
- Subtitle: **Choose the product to feature in this generation** (no "clothing item", no "try on a model" copy)

So the logic becomes:

```tsx
{isFlatLay ? 'Select Products for Flat Lay'
  : (isSelfieUgc || isMirrorSelfie) ? 'Select Product'
  : activeWorkflow?.uses_tryon ? 'Select Clothing Item(s)'
  : 'Select Product(s)'}
```

…and matching subtitle branch. Other workflows are untouched.

### 2. Better multi-factor search + rounded pill bar (try-on branch)

Lines ~3155–3220 (the `activeWorkflow?.uses_tryon` block — used by selfie-ugc, mirror-selfie, and any other try-on workflows).

- **Search input** (line ~3160): replace `className="h-8 text-xs pl-8"` with `className="h-10 text-sm pl-10 pr-4 rounded-full"`. Move the `<Search>` icon to `left-3.5` and bump it to `w-4 h-4` to match the larger bar. Placeholder becomes `"Search by name, type, color, SKU, tag…"`.
- **Filter logic** (lines ~3174–3177 in Select-All, and ~3217–3220 in the render closure): swap the two-field `includes` for a shared `matchesProductTokens(p, query)` helper declared just above the JSX. The helper joins `title, description, product_type, color, materials, sku, dimensions, weight, (tags||[]).join(' ')` into a lowercase haystack and requires every whitespace-split token to appear. Use it in both Select-All and the filter closure so they agree.

### 3. Apply the same to the non-try-on branch (defensive)

The second product picker (lines ~3341–3400) is the non-try-on copy of the same UI. Apply the same rounded-pill input styling and the same `matchesProductTokens` filter there so users get consistent behavior across every workflow — even though the user's specific request was the two selfie flows, both selfie flows route through the try-on branch above, and the cost of keeping the non-try-on copy consistent is one extra search + class swap.

### Out of scope

- No changes to view-mode toggle, Select-All / Clear button placement, max-batch cap, sample products, or generation logic.
- No changes to `currentStep` flow or the page header above the product step.
- No DB / backend / route changes.
