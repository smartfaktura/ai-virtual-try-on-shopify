

# Fix: Add Confirm Button for New Sub-Category Input

## Problem
When creating a new sub-category in the scene edit form, the text input only shows an **X** (cancel) button. There's no **✓** (confirm) button to accept the typed name and return to the normal select view. Users expect a way to "save" the new sub-category value.

## Fix

**`src/pages/AdminProductImageScenes.tsx`** — In the `SceneForm` component (~line 695-706), add a checkmark confirm button next to the X cancel button:

```tsx
// Current: only X button
<Button variant="ghost" size="sm" onClick={() => setCreatingSubCat(false)}>
  <X className="w-3.5 h-3.5" />
</Button>

// After: add ✓ confirm button before the X
<Button 
  variant="ghost" size="sm"
  disabled={!draft.sub_category?.trim()}
  onClick={() => setCreatingSubCat(false)}
>
  <Check className="w-3.5 h-3.5 text-green-600" />
</Button>
<Button variant="ghost" size="sm" onClick={() => { set('sub_category', null); setCreatingSubCat(false); }}>
  <X className="w-3.5 h-3.5" />
</Button>
```

- **Check button**: confirms the typed value and switches back to dropdown view (value already stored in draft)
- **X button**: clears the value AND switches back to dropdown view (true cancel)
- Add `Check` to the lucide-react import

One file changed, ~5 lines modified.

