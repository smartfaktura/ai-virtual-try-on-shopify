

# Enhance Pre-Upload Extra Angles Info

## Problem
The current tip "💡 You can add back, side & packaging views after uploading" is a single 10px muted line — too subtle to communicate the value of multi-angle uploads.

## Proposed Change

Replace the single tip line with a small visual info strip below the dropzone text, still inside the dropzone area:

```text
┌──────────────────────────────────────┐
│           📷                         │
│   Drop images, browse, or paste     │
│   Each image creates a product      │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 📐  Add multiple angles for   │  │
│  │     better AI results          │  │
│  │  ↺ Back  → Side  📦 Package   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

This is a subtle rounded chip/strip (not disabled boxes) with:
- A small header: "Add multiple angles for better AI results"
- Three inline icon+label pairs: `↺ Back · → Side · 📦 Package`
- Muted styling: `bg-muted/30 rounded-lg px-3 py-2 mt-3`
- Text at 10-11px, icons at 12px — informative but not dominant

## File
- `src/components/app/ManualProductTab.tsx` — Replace lines 750-752 (the single tip `<p>`) with the new info strip (~12 lines)

## What stays the same
- Dropzone functionality, upload logic, post-upload reference slots, collapsible behavior

