
## Problem

The current Style & Outfit section is confusing:
- Users don't understand what "Scene styled" means or how it differs from "Outfit set"
- No clear way to reset a single scene or all scenes
- "Customize & apply to all shots" is buried and unclear
- Quick Styles apply to all shots silently (no confirmation or indication)
- The flow doesn't guide users — it just dumps options

## Redesigned UX

### 1. Clearer section header with inline guidance

Replace the current header with a two-part layout:
- **Left**: "Model Styling" title with subtitle "Choose what the model wears in each shot"
- **Right**: Action buttons — "Apply style to all" (secondary) and "Reset all" (ghost, only when overrides exist)

### 2. Better per-scene status badges

Replace cryptic labels:
- **"Scene styled"** → **"Built-in look"** with a tooltip: "This scene has a curated outfit direction. Click to customize"
- **"Outfit set"** → **"Custom look"** with the outfit summary
- **"No outfit selected"** → **"Needs styling"** with a pulsing amber dot and helper text "Tap to choose"

### 3. Quick Styles with clear "Apply to all" confirmation

Move Quick Styles **above** the per-scene list. When a user clicks a style:
- Show a mini confirmation: "Apply [Minimal Premium] to all {N} shots?" with Apply / Cancel buttons
- This prevents accidental overwrites and makes the action explicit
- After applying, each scene card updates to show "Custom look · Minimal Premium"

### 4. Per-scene card improvements

Each scene card when expanded shows:
- If built-in: Show the curated direction text + "Override with custom outfit" button. Only when clicked does the ZaraOutfitPanel appear
- If custom: Show the ZaraOutfitPanel directly + "Reset to built-in look" link (if scene has outfit_hint) or "Clear outfit" (if no hint)
- If needs styling: Show Quick Style chips inline + ZaraOutfitPanel below

### 5. Remove "Customize & apply to all shots" editor

This full editor is rarely used and adds complexity. Replace with:
- Quick Styles already have the "apply to all" confirmation flow
- "Save current" remains for power users to save custom presets
- The per-scene expanded editor IS the customization tool

### 6. Visual hierarchy cleanup

- Quick Styles section gets a light background card with proper spacing
- Per-scene list gets numbered indicators (Shot 1, Shot 2...) for orientation
- Collapse "Custom styling note" into the Appearance collapsible to reduce noise

## Files to change

- **`src/components/app/product-images/ProductImagesStep3Refine.tsx`** — Restructure the outfit section: reorder Quick Styles above scene list, add confirmation flow for apply-to-all, improve badges, remove the "Customize & apply to all" editor, move custom note into Appearance collapsible
- **`src/components/app/product-images/OutfitPresetBar.tsx`** — Add onApplyToAll callback with confirmation UI (inline "Apply to all N shots?" prompt), track which preset was last applied for highlighting
