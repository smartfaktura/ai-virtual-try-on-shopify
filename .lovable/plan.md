

## Plan: Add helper text to disabled Continue button in floating bar

The floating bottom bar on the Model step shows "Continue to Scene" (or "Continue to Settings") as a disabled grey button when no model is selected, but gives no indication why it's disabled.

### Changes

**File: `src/pages/Generate.tsx`** (~lines 2889-2906)

Add a small helper text next to the disabled button that appears only when `!selectedModel`:

1. Between the Back button and the Continue button, add a subtle hint text: `"Select a model to continue"` — shown only when `!selectedModel`
2. Style: `text-xs text-muted-foreground` — simple, not noisy
3. On mobile the bar is already compact, so use a `flex-1 text-center` wrapper for the hint to fill the gap naturally

**Before:**
```tsx
<Button variant="outline" ...>Back</Button>
<Button disabled={!selectedModel} ...>Continue to Scene</Button>
```

**After:**
```tsx
<Button variant="outline" ...>Back</Button>
{!selectedModel && (
  <span className="text-xs text-muted-foreground text-center flex-1">
    Select a model to continue
  </span>
)}
<Button disabled={!selectedModel} ...>Continue to Scene</Button>
```

This applies to all three button variants in the conditional (mirror selfie, UGC, and default try-on).

