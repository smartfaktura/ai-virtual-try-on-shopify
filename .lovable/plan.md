

## Fix Scene Card Opacity

### Problem
Unselected scene cards in the workflow wizard have `opacity-70` applied, making the product images look faded and hard to see. This affects visual clarity and makes the selection UI feel unclear.

### Fix
In `src/pages/Generate.tsx` (line 1619), remove `opacity-70` and `hover:opacity-100` from unselected scene cards. Instead, rely on the existing border styling to indicate selection state -- unselected cards keep their `border-border` and selected cards get `border-primary ring-2`.

### Change

**`src/pages/Generate.tsx` (~line 1619)**:
- Before: `"border-border opacity-70 hover:opacity-100 hover:border-primary/40 hover:scale-[1.02]"`
- After: `"border-border hover:border-primary/40 hover:scale-[1.02]"`

This keeps the hover scale and border highlight for interactivity cues, but all cards display at full opacity so images are crisp and clearly visible.

