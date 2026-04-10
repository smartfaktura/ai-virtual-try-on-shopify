

# Simplify Dropzone + Add Details Accuracy Hint

## Changes

### 1. `ManualProductTab.tsx` — Remove angle hints from empty dropzone (lines 760-773)
Remove the "Add multiple angles for better AI results" block with the Back/Side/Inside/Package icons from the empty upload state. Keep just:
- Drop images, browse, or paste
- Each image creates a separate product · up to 10 at once

The extra angle upload slots already appear after the user uploads a main image (in the Collapsible section), so showing them pre-upload is redundant and confusing.

### 2. `ManualProductTab.tsx` — Add highlighted accuracy hint near Dimensions
After the Description/Dimensions row (around line 1022), add a subtle highlighted strip:
```
💡 Add details to improve accuracy
```
Styled as a small highlighted bar (e.g., `bg-primary/5 border border-primary/10 rounded-lg px-3 py-2`) with muted text, pointing users to fill in dimensions, more details, and extra angles. Only shown when `singleImage` exists (post-upload).

## Files
- `src/components/app/ManualProductTab.tsx` — 2 edits (~15 lines total)

