

## Fix Duplicate Checkmarks in Product Multi-Select

### Problem
When a product is selected, two indicators appear: a `Checkbox` (top-left) and a `CheckCircle` icon (top-right). This is redundant and visually confusing.

### Solution
Remove the separate `CheckCircle` icon. Keep only the `Checkbox` in the top-left corner but make the selected state more obvious through the card styling itself:

- **Remove** line 87: the `CheckCircle` icon on top-right
- **Improve selected card styling**: stronger border + colored overlay on the image corner
- **Move checkbox** to overlay on the image (top-left corner with a semi-transparent dark background pill) so it's clearly visible against any image

### Updated card design (selected state):
- `border-primary` border (keep existing)
- `bg-primary/5` background (keep existing)  
- Checkbox stays top-left with a small `bg-white/90 rounded shadow-sm` backing so it's visible on any image
- No second checkmark anywhere

### Files changed — 1

**`src/components/app/ProductMultiSelect.tsx`**
- Remove line 87 (`CheckCircle` icon)
- Remove `CheckCircle` from imports
- Add a subtle white backing behind the checkbox for better visibility on images

