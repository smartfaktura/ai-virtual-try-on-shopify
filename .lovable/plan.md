

# Improve Role Assignment UX for URL-Imported Images

## Problem
The current "click to cycle" interaction is confusing:
1. Users don't understand what "cycle its role" means — it's a non-standard interaction pattern
2. The cycling order (Main → Back → Side → Pack → unassigned) is error-prone — one wrong click and you have to cycle through all states again
3. The separate manual upload slots below add visual noise when images are already available

## Solution: Direct Role Assignment via Dropdown/Tap

Replace the cycling mechanic with a **direct role picker**. When a user clicks an unassigned image, show a small popover/menu with the available roles (Back, Side, Pack). Clicking an already-assigned image lets them change or clear the role.

### New Layout
```text
Click any image to cycle its role: Main → Back → Side → Pack    ← DELETE THIS

  [img1]    [img2]    [img3]    [img4]    [img5]
  MAIN ✓    ← tap →   ← tap →  ← tap →  ← tap →

  When tapped, show role menu:
  ┌─────────┐
  │ ✓ Main  │
  │   Back  │
  │   Side  │
  │   Pack  │
  │ — None  │
  └─────────┘
```

### Interaction
- Tap any image → opens a small **Popover** with role options
- Already-taken roles show as disabled or with "swap" hint
- Assigned images show their role badge (as now) — no change
- Instruction text changes to: **"Tap any image to assign its role"**

### Manual upload slots
Keep the manual upload slots but only for roles that have NO image assigned (from cycling OR from the detected images). This covers the single-image case too.

## Changes

### `src/components/app/StoreImportTab.tsx`

1. **Replace `cycleRole` with a Popover-based role picker** (~40 lines)
   - Import `Popover, PopoverTrigger, PopoverContent` from UI
   - Each image button becomes a `PopoverTrigger`
   - PopoverContent shows 5 options: Main, Back, Side, Pack, None
   - Selecting a role updates the corresponding state index directly
   - If the role is already assigned to another image, swap them

2. **Update instruction text** (1 line)
   - Change to: `"Tap an image to set its role"`

3. **Keep manual upload slots** as-is for unassigned roles — no changes needed there

## Files
- `src/components/app/StoreImportTab.tsx` — ~40 lines modified in the image gallery section (lines 368-445)

