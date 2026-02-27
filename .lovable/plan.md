

## Add "Keep Existing Furniture" Option for Interior Staging

### Problem
When generating interior staging, the AI completely replaces all furniture (e.g., turning an office with desk + sofa into a bedroom). Users want the option to keep their existing furniture layout and only change the styling/decor, or to fully restage with new furniture.

### Solution
Add a **Furniture Handling** selector with three options:
- **Keep & Restyle** -- Keep existing furniture in place, only change styling, colors, textures, and decor accessories
- **Replace All** -- Completely restage the room with new furniture (current behavior)
- **Keep Layout, Swap Style** -- Keep the same furniture arrangement/types but swap to the selected design style

### Changes

**File: `src/pages/Generate.tsx`**
- Add new state: `interiorFurnitureHandling` (default: `"Keep & Restyle"`)
- Add a new selector in the Room Details card, positioned before Furniture Style. This is a prominent choice since it fundamentally changes the output
- Pass `furniture_handling` in the generation payload
- When "Keep & Restyle" is selected, auto-set Furniture Style to disabled (grayed out) since existing furniture is preserved

**File: `supabase/functions/generate-workflow/index.ts`**
- Read the new `furniture_handling` field from the product payload
- Add conditional prompt logic in the interior block:
  - **Keep & Restyle**: Add instructions like "KEEP all existing furniture exactly as shown -- same pieces, same positions. Only update their styling, upholstery, colors, and textures to match the design style. Add appropriate decor and accessories."
  - **Replace All**: Current behavior (no change needed -- this is the default prompt)
  - **Keep Layout, Swap Style**: Add instructions like "Maintain the same furniture LAYOUT and types (e.g., desk stays a desk, sofa stays a sofa) but replace them with pieces in the selected design style. Keep the same spatial arrangement."

### UI Layout in Room Details Card

```text
Room Type:        [Bedroom / Office / ...]
Furniture:        [Keep & Restyle] [Replace All] [Keep Layout, Swap Style]
Wall Color:       [Keep Original / ...]    Flooring: [Keep Original / ...]
Furniture Style:  [Match Design Style / ...]  Lighting Mood: [Keep Original / ...]
```

The Furniture selector will use a radio-group style (3 buttons) for clear visibility since it's the most impactful choice.

### Files to Edit

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Add `interiorFurnitureHandling` state, UI selector, pass in payload |
| `supabase/functions/generate-workflow/index.ts` | Read `furniture_handling`, add conditional prompt blocks |

