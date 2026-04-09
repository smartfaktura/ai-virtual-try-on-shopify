

# Fix: Make Reference Angle Slots Clearly Visible

## Problem
The reference angle slots (Back view, Side view, Packaging) are invisible until after uploading the main image. Even post-upload, they're small 72px slots pushed to the right side — easy to miss. The empty dropzone only has a barely-visible 10px text mentioning angles.

## Changes

### ManualProductTab.tsx — 3 fixes

**1. Show 3 placeholder reference slots BELOW the dropzone even before upload**
Add a row of 3 disabled/greyed-out reference slot placeholders (Back view, Side view, Packaging) directly below the dropzone in the empty state. Each shows the directional icon + label. They're visually muted with a "Upload main image first" tooltip. This makes users aware of the feature before they even upload.

**2. After upload: move reference slots BELOW the main image instead of beside it**
The current side-by-side layout pushes refs to a narrow column that's hard to see. Instead, place the main image full-width (still max 280px) and put the 3 reference slots in a horizontal row directly below it. This gives them more visual weight and makes the layout cleaner.

Layout after upload:
```text
┌─────────────────────────┐
│     Main Image          │
│     (max-w-[280px])     │
└─────────────────────────┘
  Reference Angles (optional)
  Helps AI render accurate scenes
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Back    │ │ Side    │ │ Package │
│ view    │ │ view    │ │         │
└─────────┘ └─────────┘ └─────────┘
```

**3. Increase slot size from 72px to 80px and improve contrast**
Make labels slightly larger (10px → 11px), icons more visible (opacity 30% → 50%), and add a subtle hover glow effect.

### Files
- `src/components/app/ManualProductTab.tsx` — All 3 changes (~40 lines modified)

### What stays the same
- StoreImportTab role cycling (already improved)
- HoverCard previews on filled slots (already working)
- Edit mode behavior
- Submit/upload logic

