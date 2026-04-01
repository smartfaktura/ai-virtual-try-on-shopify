

# Fix: Prevent Accidental Generate Click Near Image Size Selector

## Problem
When selecting an image size, the "Select at least 1" validation alert disappears, causing a layout shift. The Generate button (directly below) jumps up into where the user just clicked, catching the click unintentionally.

## Root Cause
In `AspectRatioMultiSelector`, the validation message (`"Select at least 1 image size"`) is conditionally rendered. When the user clicks their first aspect ratio:
1. The ratio gets selected
2. The warning disappears (layout shrinks ~40px)
3. The Generate button shifts upward
4. If the user double-clicks or clicks fast, the second click lands on the now-shifted Generate button

## Solution — 2 changes

### 1. Reserve space for validation message (prevent layout shift)
**File: `src/components/app/AspectRatioPreview.tsx`**

Instead of conditionally rendering the validation alert, always render it but use `opacity-0` + `invisible` when sizes are selected. This keeps the space reserved and prevents the layout shift.

```tsx
// Before
{value.size === 0 && (
  <div className="flex items-center gap-2 ...">...</div>
)}

// After
<div className={cn(
  "flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium transition-opacity",
  value.size === 0 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
)}>
  <AlertCircle className="w-4 h-4 shrink-0" />
  Select at least 1 image size
</div>
```

### 2. Add `type="button"` to all aspect ratio buttons (defensive)
**File: `src/components/app/AspectRatioPreview.tsx`**

Add `type="button"` to both `AspectRatioMultiSelector` and `AspectRatioSelector` button elements as a defensive measure (prevents form submission if ever wrapped in a form in the future).

### Files modified
- `src/components/app/AspectRatioPreview.tsx` — layout shift fix + type="button"

