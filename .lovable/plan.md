

# Fix: Prompt Helper Chip Placement

## Problem
On desktop, the Prompt Helper button is in the first chip row (Upload, Product, Model, Scene, **Prompt Helper**). When it doesn't fit, it wraps to its own line between the two rows, creating an awkward isolated line.

## Fix
Move `promptHelperButton` from the first row to the **end of the second row** (after Framing, Brand, Aspect, Camera, Quality). This way it flows naturally with the settings chips and never sits alone between groups.

## Change

**File**: `src/components/app/freestyle/FreestyleSettingsChips.tsx`

**Desktop layout (lines 325-369)**: Move `{promptHelperButton}` from the first `div` to the end of the second `div`:

```tsx
<div className="flex items-center gap-2 flex-wrap">
  {uploadButton}
  {productChip}
  {modelChip}
  {sceneChip}
  {/* promptHelperButton removed from here */}
</div>
<div className="flex items-center gap-2 flex-wrap">
  <FramingSelectorChip ... />
  {/* Brand chip */}
  {aspectRatioChip}
  {cameraStyleChip}
  {qualityChip}
  {promptHelperButton}  {/* moved here */}
</div>
```

One line change — move line 330 to after line 368.

