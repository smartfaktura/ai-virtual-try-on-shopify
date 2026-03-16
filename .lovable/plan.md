

## Fix floating nav bar + add MissingRequestBanner to model step

### Root cause of sticky not working
The `sticky bottom-4` approach only works when there's enough scrollable content below the sticky element. In the model/scene steps, if the content doesn't overflow the viewport (e.g., few models visible), there's no scroll and the bar just sits inline at the bottom of the content — never "sticking."

### Solution: Switch to `fixed` positioning with floating design
Use `fixed` positioning (which always sticks to viewport) but keep the floating visual style. This is more reliable regardless of content height.

### Changes

**File: `src/pages/Generate.tsx`**

**1. Model step bar (~line 2884):** Replace sticky with fixed floating:
```tsx
// Before:
<div className="sticky bottom-4 z-50 max-w-3xl mx-auto">
  <div className="bg-background border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">

// After:
<div className="fixed bottom-4 left-0 right-0 lg:left-[var(--sidebar-offset)] z-50 px-4">
  <div className="max-w-3xl mx-auto bg-background border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
```

**2. Scene step bar (~line 2935):** Same change as above.

**3. Keep `pb-20` on both wrapper divs** (~lines 2865, 2908) to prevent the fixed bar from covering content at the bottom.

**4. Add MissingRequestBanner to model step** (~after line 2882, after the model grid closes):
```tsx
<MissingRequestBanner
  category="model"
  title="Missing a model? Tell us and we'll create it."
  placeholder="Describe the model you'd like us to create…"
/>
```
This goes inside the `<CardContent>` of the model selection card, after the model grid div — matching the same pattern already used in the scene step.

