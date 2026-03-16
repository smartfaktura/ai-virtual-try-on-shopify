

## Fix: "Deselect All" button selects first N scenes instead of clearing

### Problem
In `WorkflowSettingsPanel.tsx` line 276, the toggle logic checks `if (selectedVariationIndices.size === currentMax)` to decide whether to deselect. So if a user has 1 scene selected and clicks "Deselect All", the condition is `false` (1 ≠ currentMax), causing it to fall into the `else` branch and select the first N scenes instead.

### Fix

**File: `src/components/app/generate/WorkflowSettingsPanel.tsx` (line 276)**

Change the condition from:
```typescript
if (selectedVariationIndices.size === currentMax) {
```
to:
```typescript
if (selectedVariationIndices.size > 0) {
```

This makes the button a proper toggle: any selections → clear all, no selections → select up to limit. The button label already uses `selectedVariationIndices.size > 0` (line 283), so this aligns the behavior with the label.

