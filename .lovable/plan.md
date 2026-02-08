

## Freestyle Studio -- Redesign Settings Chips into a Clean Toolbar

The current settings area has three problems visible in the screenshot:

1. **Awkward spacing** -- `justify-between` with three groups creates a huge gap between "Upload/Model/Scene" and "1:1/Standard", making them look disconnected
2. **Wrapping** -- The Polish chip drops to a second line unevenly, creating visual chaos
3. **No visual hierarchy** -- All 7 controls compete for attention at the same level with no grouping logic

---

### Design Approach

Replace the single messy row with a clean **single-row flowing toolbar** using subtle vertical dividers between logical groups. All chips stay on one line with consistent sizing and natural spacing. On very narrow screens, the row scrolls horizontally rather than wrapping chaotically.

The new layout uses three logical groups separated by thin vertical lines:

```text
[ + Upload | Model v | Scene v ]  |  [ 1:1 v | Standard | Polish ]  |  [ - 1 + ]
```

- **Group 1 (Inputs)**: Upload, Model, Scene -- what goes *into* the generation
- **Group 2 (Output)**: Aspect ratio, Quality, Polish -- *how* the output looks  
- **Group 3 (Count)**: Image count stepper -- *how many* to generate

Visual dividers (thin 16px-tall vertical lines in `border-border/30`) separate the groups while keeping everything in a single horizontal flow.

---

### Specific Changes

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`**

- Change outer container from `flex justify-between gap-2` to `flex items-center gap-1.5` with `overflow-x-auto` for mobile safety
- Remove the three separate `<div>` group wrappers with different justification
- Instead, render all chips in a flat row with thin vertical separator `<div>` elements between logical groups
- The separator is a simple `<div className="w-px h-4 bg-border/40 mx-1" />` 
- All chips get uniform height (`h-8`) and consistent padding (`px-3`)
- Remove `flex-wrap` entirely -- the row stays single-line and scrolls if needed
- Keep all existing tooltip logic for Quality and Polish

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`**

- Minor padding adjustments to the settings row container
- Ensure the upload button rendering matches the new chip style consistently (same `h-8 px-3 rounded-full` sizing)

**File: `src/components/app/freestyle/ModelSelectorChip.tsx`**

- Standardize trigger button height to `h-8` (currently uses `px-3.5 py-2` which may produce inconsistent height)

**File: `src/components/app/freestyle/SceneSelectorChip.tsx`**

- Standardize trigger button height to `h-8` (same fix as Model chip)

**No backend, routing, or page-level changes needed.**

