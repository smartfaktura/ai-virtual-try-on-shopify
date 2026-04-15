

# Improve First-Time User Experience on Product Images Step 1

## Changes

### 1. Simplify visible stepper to 4 steps
**File: `src/pages/ProductImages.tsx` (lines 45-52)**

Replace `STEP_DEFS` with only 4 visible steps:
```
{ number: 1, label: 'Product',  icon: Package }
{ number: 2, label: 'Shots',    icon: Layers }
{ number: 3, label: 'Setup',    icon: Paintbrush }
{ number: 4, label: 'Generate', icon: Sparkles }
```

Hide stepper when `step >= 5` (already hidden at `step <= 4`, which stays correct). Internal PIStep 1-6 continues to work — only the visual stepper changes.

**File: `src/components/app/product-images/ProductImagesStickyBar.tsx`**

Update `STEP_LABELS` to match: `{1: 'Product', 2: 'Shots', 3: 'Setup', 4: 'Generate'}` and set `TOTAL_STEPS = 4`.

### 2. Hide empty-state toolbar controls
**File: `src/pages/ProductImages.tsx` (lines 1003-1022)**

Wrap the Search/Select All/Clear toolbar in a condition: only render when `userProducts.length > 0`. First-time users with zero products won't see useless controls.

### 3. Update empty state copy & design
**File: `src/pages/ProductImages.tsx` (lines 1033-1061)**

Replace the empty state block:
- Icon: keep `Package` but bump to `w-12 h-12`
- Heading: **"Start with your first product"** → `text-base font-semibold`
- Subtext: **"Upload a product photo to create clean, brand-ready visuals."** → `text-sm` (slightly larger)
- Primary CTA: **"Upload product photo"** (single prominent button, `size="default"`)
- Remove the separate "Add Product" button from empty state (keep modal accessible elsewhere)
- Paste hint: platform-aware — detect Mac via `navigator.platform`, show `⌘ V` or `Ctrl + V`
- Add helper text: "You can also paste an image from your clipboard" with the shortcut badge

### 4. Platform-aware paste shortcut
**File: `src/pages/ProductImages.tsx`**

Add a small memo/const:
```tsx
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const pasteShortcut = isMac ? '⌘ V' : 'Ctrl + V';
```

Render as: `"You can also paste an image from your clipboard"` with `pasteShortcut` in a `<kbd>` styled badge.

## Files changed
- `src/pages/ProductImages.tsx` — stepper defs, toolbar visibility, empty state redesign
- `src/components/app/product-images/ProductImagesStickyBar.tsx` — labels + step count

## What stays unchanged
- All internal step logic (PIStep 1-6), Review step (4), Generate step (5), Results step (6)
- CatalogStepper component itself — no changes needed
- All generation, navigation, and back/next logic

