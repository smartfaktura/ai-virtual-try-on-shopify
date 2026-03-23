

# Fix Library Detail Modal: Better Naming + Remove HD

## Problems
1. **Redundant/unclear naming**: Shows "GENERATION" as small label and "Picture Perspectives — Right Side" as big heading. The heading includes both the workflow name and the variation — verbose and unclear.
2. **"HD" badge** shown unnecessarily (line 144-146).

## Changes

### `src/components/app/LibraryDetailModal.tsx`

**1. Improve the small label** (line 129-131):
- For freestyle: keep "Freestyle Generation"
- For workflow items: extract the workflow name from the label (e.g., "Picture Perspectives") and show it as the small label: `"Picture Perspectives"`
- For enhanced: keep "Enhanced"

**2. Improve the big heading** (line 132-138):
- For workflow items like "Picture Perspectives — Right Side": show only the variation part as the heading: **"Right Side"**
- For freestyle: show the dynamic label (model/scene name)
- For enhanced: show "Enhanced"

Logic: if `item.label` contains " — ", split it:
- Small label = part before " — " (e.g., "Picture Perspectives")  
- Heading = part after " — " (e.g., "Right Side")

If no " — ", use current behavior.

**3. Remove HD badge** (lines 144-146): Delete the `{item.quality === 'high' && ...}` block.

### Result

Before:
```
GENERATION
Picture Perspectives — Right Side
MAR 22 · HD
```

After:
```
PICTURE PERSPECTIVES
Right Side
MAR 22
```

One file, ~8 lines changed.

