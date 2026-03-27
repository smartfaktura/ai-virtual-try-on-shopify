

# Add floating bottom bar to the Product selection step

## What changes

**File: `src/pages/Generate.tsx`**

The model step (line ~3560) and scene/pose step (line ~3616) both use a fixed floating bar at the bottom of the screen with Back/Continue buttons. The product step currently has the Continue button inline inside the card (around line 3318). We'll move it to a matching floating bar.

### Changes

1. **Remove the inline button group** at the end of the product step (the `<div className="flex justify-end">` block around lines 3275–3321 containing the Continue button).

2. **Add a fixed floating bar** right after the closing `</Card>` of the product step (before the `)}` that closes the `currentStep === 'product'` block). Use the same pattern as the model/scene steps:

```tsx
<div className="fixed bottom-4 left-0 right-0 lg:left-[var(--sidebar-offset)] z-50 px-4">
  <div className="max-w-3xl mx-auto bg-background border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
    <Button variant="outline" onClick={() => setCurrentStep('source')}>Back</Button>
    {selectedProductIds.size === 0 && (
      <span className="text-xs text-muted-foreground text-center flex-1">Select a product to continue</span>
    )}
    <Button disabled={selectedProductIds.size === 0} onClick={/* existing continue logic */}>
      {/* existing dynamic label */}
    </Button>
  </div>
</div>
```

3. The Continue button's `onClick` handler and label text will be preserved exactly as-is — just relocated into the floating bar.

This gives the product step the same polished fixed-bottom navigation as models and scenes, keeping the UI consistent across all workflow steps.

