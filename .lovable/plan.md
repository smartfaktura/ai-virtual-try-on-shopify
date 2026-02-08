

## Freestyle Studio -- Clean Up Control Panel Layout

The current prompt panel has messy alignment: the upload button, textarea, and generate button are all crammed into one row, and the settings chips below wrap awkwardly with no visual grouping. This redesign creates a clear visual hierarchy with proper spacing.

---

### New Layout Structure

The panel will be reorganized into three clear rows inside the rounded card:

**Row 1 -- Prompt Input (full width)**
A clean, full-width textarea spanning the entire card width. No buttons competing for space on this row. Larger text, generous padding.

**Row 2 -- Settings Chips (horizontally organized)**
All settings in a single row with logical grouping:
- Left group: Upload image button, Model chip, Scene chip
- Center group: Aspect ratio, Quality, Polish toggle
- Right group: Image count stepper

A subtle visual separator (or just extra spacing) between groups keeps things tidy.

**Row 3 -- Action Bar**
The Generate button sits on its own row, right-aligned and visually prominent. Full-width on mobile for easy tapping. This gives it breathing room and makes it unmissable.

---

### Technical Details

**File: `src/pages/Freestyle.tsx`**

Changes to the prompt bar JSX (both empty state and has-images versions):
- Move the textarea to its own full-width row at the top of the card
- Move the upload image button out of the textarea row and into the settings chips row
- Move the Generate button to its own row below settings, right-aligned
- Add `items-center` and proper `gap` spacing
- Increase textarea to `rows={3}` with proper min-height for a more spacious input feel
- Add a subtle `border-b border-border/40` divider between the prompt row and settings row

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`**

Changes to accept and render the upload button inline:
- Add props for the upload button element (or render the upload button inside this component)
- Alternative: Keep upload button in Freestyle.tsx but render it as the first item in the settings row
- Ensure all chips use consistent sizing (`h-9` or `h-8` uniformly)
- Add `justify-between` on the settings row so items spread nicely with the image count stepper pushed to the right

**No other files need changes.**

### Visual Result

```text
+--------------------------------------------------+
|                                                  |
|  Describe what you want to create...             |
|                                                  |
|                                                  |
|--------------------------------------------------|
|  + Upload  | Model v | Scene v | 1:1 | Std | Polish  |  - 1 + |
|--------------------------------------------------|
|                              [ * Generate (1) ]  |
+--------------------------------------------------+
```

Clean rows, clear hierarchy, prominent CTA, no cramped elements.
