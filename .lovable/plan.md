

## Fix: Tablet prompt panel not centered (off to the left)

### Cause

In `src/pages/Freestyle.tsx` line 1102, the floating prompt wrapper has **asymmetric horizontal padding** at `md:` and up:

```
md:px-8 md:pr-20
```

`md:pr-20` (right: 5rem) overrides the `md:px-8` right side, so the inner `md:max-w-2xl md:mx-auto` container centers itself inside an off-center available area — visually pushing the panel ~3rem to the left of the true viewport center on tablet. Desktop ≥1024px also has this offset but the wider viewport masks it.

This `pr-20` was originally meant to clear something on desktop, but the AppShell already handles sidebar offset at the layout level — the prompt does not need extra right padding, and certainly not asymmetric padding inside a centered max-w container.

### Fix — single line edit

`src/pages/Freestyle.tsx` line 1102 — make horizontal padding symmetric:

**Before**
```
"px-0 sm:px-8 md:px-8 md:pt-2 md:pointer-events-none md:pr-20"
```

**After**
```
"px-0 sm:px-8 md:px-8 md:pt-2 md:pointer-events-none"
```

(Drop `md:pr-20`. `md:px-8` already provides equal left/right padding, and `md:max-w-2xl md:mx-auto` on the inner wrapper now centers correctly relative to the true viewport.)

### Validation

- **Tablet 820×1180 / 768×1024**: prompt panel sits perfectly centered, equal gap from left and right viewport edges.
- **Mobile <768px**: unaffected — none of the `md:` rules apply.
- **Desktop ≥1024px**: panel re-centers to true viewport center; gradient fade and floating behavior unchanged. Gallery behind it remains untouched.

### Untouched

Mobile chip grid, Advanced popover, Scene Look label, gallery, sidebar, all selectors, hooks, RLS.

