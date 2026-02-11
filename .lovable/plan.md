

## Convert Camera Style & Quality Toggles to Dropdown Selectors

### Overview
Replace the simple toggle buttons for **Camera Style** (Natural/Pro) and **Quality** (Standard/High) with dropdown popovers — matching the existing Aspect Ratio dropdown pattern. Each option will show a title, description, and credit cost so users can make an informed choice.

### What Changes

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`**

1. **Camera Style** (currently a toggle button, lines 207-228) becomes a Popover dropdown with two options:
   - **Pro** — Camera icon — "Studio-grade commercial look with polished lighting and color grading."
   - **Natural** — Smartphone icon — "Raw iPhone-style photo. Sharp details, true-to-life colors, no heavy editing."
   - Chip shows current selection with icon + label + chevron down arrow

2. **Quality** (currently a toggle button, lines 185-205) becomes a Popover dropdown with two options:
   - **Standard** — "Fast generation at standard resolution. 4 credits per image."
   - **High** — "Higher detail and resolution. 10 credits per image." with a sparkle indicator
   - Chip shows current selection with chevron down arrow

3. Both dropdowns follow the same visual pattern as the existing Aspect Ratio popover but with wider content (w-56) to fit the description text.

4. Remove `onQualityToggle` and `onCameraStyleToggle` props — replace with `onQualityChange(quality)` and `onCameraStyleChange(style)` setter-style props. This also requires updating the parent components that pass these props.

### Props Update

**File: `src/pages/Freestyle.tsx`** and **`src/components/app/freestyle/FreestylePromptPanel.tsx`**
- Change `onQualityToggle` to `onQualityChange: (q: 'standard' | 'high') => void`
- Change `onCameraStyleToggle` to `onCameraStyleChange: (s: 'pro' | 'natural') => void`

### UI Preview

Each dropdown option will look like:

```text
+------------------------------------------+
|  [icon]  Pro                        [check if selected]
|          Studio-grade commercial look
|          with polished lighting.
+------------------------------------------+
|  [icon]  Natural
|          Raw iPhone-style photo. Sharp
|          details, true-to-life colors.
+------------------------------------------+
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestyleSettingsChips.tsx` | Replace Quality toggle and Camera Style toggle with Popover dropdowns showing descriptions |
| `src/pages/Freestyle.tsx` | Update toggle handlers to setter-style (`onQualityChange`, `onCameraStyleChange`) |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Thread updated prop signatures |

