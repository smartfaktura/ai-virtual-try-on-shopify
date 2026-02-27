

## Audit: Interior / Exterior Staging -- All Buttons, Functions, and Prompt Logic

### What's Working Correctly

- **Interior/Exterior Type Toggle**: Works. Resets room type, key pieces, color palette, time of day, empty room, and ceiling height on switch. 
- **Room Type selector**: Required field, blocks Continue when empty. Correct room types load per interior/exterior mode.
- **Empty Room Toggle**: Works. Forces "Replace All" via useEffect. Hidden for exterior (correct). Backend injects proper "stage from scratch" block.
- **Furniture Handling -- Keep & Restyle**: Works. Prompt tells AI to analyze and keep exact furniture types. Furniture Style dropdown correctly disabled in this mode.
- **Furniture Handling -- Keep Layout, Swap Style**: Works. Prompt tells AI to replace with same-type pieces in new style.
- **Furniture Handling -- Replace All**: Fixed in previous session. Now has explicit "COMPLETELY REMOVE" instruction.
- **Room Size**: All 4 options (Small/Medium/Large/Very Large) generate correct scaling constraints. Small gets strict "compact furniture only" rules.
- **Ceiling Height**: All 4 options work. Hidden for exterior (correct). Low ceiling gets "no tall bookcases" rules, Double Height gets "oversized art, dramatic pendants."
- **Wall Color / Flooring**: Hidden for exterior (correct). "Keep Original" generates no override instruction (correct).
- **Key Furniture Pieces**: Chips load per room type. When selected in ANY mode (including Replace All), room description is neutralized to prevent conflicting furniture lists.
- **Color Palette chips**: Toggle on/off works. Injected as a color scheme instruction.
- **Time of Day selector**: "As Photographed" sends nothing (correct). Other options inject natural light instruction.
- **Staging Purpose chips**: Toggle on/off works. "Personal Inspiration" intentionally injects nothing (by design). Real Estate/Portfolio/Airbnb each inject specific staging instructions.
- **Design Notes textarea**: Free text, NOT cleared when room type changes (fixed previously). Injected as "DESIGNER NOTES" block.
- **Single-select enforcement**: Style cards correctly use `new Set([i])` for interior design. "Select All" button hidden for interior.
- **Try Another Style button**: Correctly clears generated images, selected variations, and navigates back to settings while keeping upload.
- **Credit display**: Now correctly shows 8/16 credits per image.
- **Pro model forced**: Backend forces `gemini-3-pro-image-preview` for all interior staging regardless of quality setting. Users get best model.
- **Anti-hallucination rules**: All 12 critical requirements are present including no mirroring, no window changes, identical perspective.
- **Generate button text**: Shows "Generate 1 Image" for interior (correct since single-select enforced).

---

### Bugs Found

**1. Furniture Handling UI shown for Exterior mode**
The 3 buttons (Keep & Restyle / Replace All / Keep Layout) appear for exterior types like "Front Facade" or "Pool Area." But the backend exterior prompt block (lines 360-369) completely IGNORES `furnitureHandlingBlock`. So the user's selection does nothing for exterior, which is confusing.

**Fix**: Hide the Furniture Handling section when `interiorType === 'exterior'`.

**2. "Room Size" label wrong for Exterior**
The label says "Room Size" even when staging a "Front Facade" or "Backyard." Should adapt to context.

**Fix**: Change label to `interiorType === 'interior' ? 'Room Size' : 'Area Size'`.

**3. Furniture Style dropdown visible and active for Exterior**
The dropdown shows options like "Scandinavian" or "Art Deco" for exterior areas. While the backend does inject it for exterior ("Use ${furnitureStyle} outdoor furniture"), the label "Furniture Style" is misleading for a driveway or pool area.

**Fix**: Change label to `interiorType === 'interior' ? 'Furniture Style' : 'Outdoor Style'` and update options for exterior to more appropriate ones (e.g., "Modern", "Tropical", "Mediterranean", "Rustic", "Contemporary").

**4. Lighting Mood label fine but "Keep Original" default potentially confusing for Exterior**
The "Lighting Mood" selector shows the same options for interior and exterior. Options like "Warm & Cozy" make sense for a living room but not for a facade. Minor issue.

**Fix**: When exterior, show outdoor-relevant lighting options: "Keep Original", "Golden Hour Glow", "Bright Daylight", "Dramatic Twilight", "Soft Overcast", "Night / Uplighting".

---

### Prompt Conflict Analysis

I traced through every combination to check for conflicting AI instructions:

| Scenario | Conflict? | Notes |
|----------|-----------|-------|
| Replace All + Key Pieces selected | No conflict | Room description neutralized, key pieces override default furniture |
| Keep & Restyle + Key Pieces selected | No conflict | Room description neutralized, key pieces specify what to keep |
| Replace All + Empty Room on | No conflict | Both say "stage from scratch." Redundant but not contradictory |
| Replace All + Design Notes "no curtains" | No conflict | Replace All removes furniture, Design Notes adds constraints on new staging |
| Keep & Restyle + Furniture Style set | No conflict | Furniture Style dropdown is disabled in Keep & Restyle mode |
| Color Palette + Design Notes with conflicting colors | Possible | If user picks "Cool & Calming" palette but writes "warm tones" in notes. This is a user error, not a code issue |
| Time of Day + Lighting Mood | Possible | "Golden Hour" time + "Bright & Airy" lighting could conflict. But both are optional and AI handles blending reasonably |
| Staging Purpose "Real Estate" + Color Palette "Bold & Vibrant" | Minor tension | Real Estate says "neutral staging" while Bold says "vibrant colors." AI will blend, not crash |

No hard prompt conflicts exist. The prompt engineering is well-structured.

---

### Files to Change

| File | Changes |
|------|---------|
| `src/pages/Generate.tsx` | Hide Furniture Handling for exterior, rename labels for exterior context, add exterior-specific lighting options, rename "Room Size" for exterior |

One file, 4 small UI fixes. No backend changes needed -- the prompt logic is solid.

