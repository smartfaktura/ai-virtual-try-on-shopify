

## Sticky navigation bar for Scene selection step

### Problem
The "Back" and "Continue to Settings" buttons are at the bottom of the scene grid. With many scenes, users must scroll past the entire list to proceed.

### Change

**File: `src/pages/Generate.tsx`** (lines ~2926-2931)

Move the Back / Continue buttons out of the scrollable card content into a **sticky bottom bar** that stays visible regardless of scroll position:

1. Extract the navigation buttons from inside the `<CardContent>` into a sticky footer `<div>` positioned below the card
2. Apply `sticky bottom-0` with a background and border-top so it floats above content as the user scrolls
3. Add `z-10` and a subtle top shadow for visual separation

```tsx
{/* Close CardContent and Card before the sticky bar */}
</CardContent></Card>

{/* Sticky bottom navigation */}
<div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border px-5 py-3 flex justify-between -mx-0 rounded-b-lg">
  <Button variant="outline" onClick={() => setCurrentStep('model')}>Back</Button>
  <Button disabled={selectedPoses.size === 0} onClick={() => setCurrentStep('settings')}>
    Continue to Settings {selectedPoses.size > 0 && `(${selectedPoses.size} scene${selectedPoses.size > 1 ? 's' : ''})`}
  </Button>
</div>
```

This keeps the action buttons always visible while browsing scenes, eliminating the need to scroll to the bottom.

