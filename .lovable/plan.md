

## Polish Interior / Exterior Staging: Bug Fixes + Pro Improvements

### Bugs Found

**1. Missing fields in WorkflowRequest interface (backend)**
`furniture_style`, `lighting_mood`, `furniture_handling`, `room_size`, and `key_pieces` are sent from the frontend but NOT declared in the `WorkflowRequest` TypeScript interface. They still work at runtime (JSON parsing ignores types), but this is fragile and could break with stricter tooling.

**2. Credit costs shown incorrectly in Quality dropdown**
The settings step shows "Standard (4 credits/img)" and "High (10 credits/img)" but the actual cost calculation on line 927 uses `quality === 'high' ? 16 : 8`. Users see wrong prices.

**3. Room descriptions still conflict with key_pieces in "Replace All" mode**
When a user selects "Bedroom (Guest)" + "Replace All" + key_pieces ["Sofa Bed", "Small Desk"], the `ROOM_TYPE_DESCRIPTIONS` injects "queen/double bed" while `key_pieces` says "Sofa Bed." These conflicting signals confuse the AI. The key_pieces block should override the room description's furniture suggestions in ALL modes, not just Keep modes.

**4. Design Notes reset when room type changes**
Line 351-353 clears `interiorDesignNotes` when room type changes. Annoying if you type detailed notes then realize you picked the wrong room type.

**5. No single-select enforcement for interior design styles**
UI text says "Choose 1 design style" but nothing prevents selecting multiple. The "Select All" button is hidden, but clicking individual cards still allows multi-select.

---

### Improvements (Designer / Agent Perspective)

**6. Add "Empty Room" toggle**
Real estate agents often photograph completely empty rooms. When empty, "Keep & Restyle" and "Keep Layout" make no sense. Add a toggle: "Is this room currently empty?" When on, auto-set furniture handling to "Replace All" and disable the other options. Also adjusts the prompt to say "this is an empty room -- stage it from scratch."

**7. Add "Ceiling Height" selector**
Room size covers floor area but not vertical space. A low ceiling (e.g., basement, attic conversion) drastically changes what furniture fits. Options: Low (under 2.4m), Standard (2.4-2.7m), High (2.7m+), Double Height.

**8. Strengthen anti-hallucination prompt rules**
AI commonly: mirrors/flips the room, changes window sizes, adds walls, shifts perspective. Add explicit anti-hallucination instructions to the prompt.

**9. Add "Generate Another Style" button on results**
After seeing results, users want to try a different style without re-uploading. Add a button that goes back to the style selection step with the upload preserved.

---

### Files to Change

| File | Changes |
|------|---------|
| `src/pages/Generate.tsx` | Fix credit display, enforce single-select for interior styles, add Empty Room toggle, add Ceiling Height selector, stop clearing design notes on room change, add "Generate Another Style" on results |
| `supabase/functions/generate-workflow/index.ts` | Add missing fields to WorkflowRequest, fix room description vs key_pieces conflict, add ceiling height prompt, add empty room prompt, strengthen anti-hallucination rules |

---

### Technical Details

**Fix 1 -- WorkflowRequest interface:** Add `furniture_style`, `lighting_mood`, `furniture_handling`, `room_size`, `key_pieces` to the interface.

**Fix 2 -- Credit display:** Change the Quality dropdown labels for interior design to show correct costs (8/16 credits).

**Fix 3 -- Room description vs key_pieces:** When `key_pieces` is provided (any mode, including Replace All), neutralize the furniture items from `ROOM_TYPE_DESCRIPTIONS` so only `key_pieces` dictates furniture.

**Fix 4 -- Design notes:** Remove `setInteriorDesignNotes('')` from the room type change useEffect.

**Fix 5 -- Single-select enforcement:** For interior design, clicking a style card should replace the selection (set a new Set with just that index) instead of toggling into a multi-select Set.

**Feature 6 -- Empty Room toggle:**
- New state: `interiorIsEmptyRoom` (boolean, default false)
- When toggled on: force `interiorFurnitureHandling` to "Replace All" and disable the other options
- Backend: when `is_empty_room` is true, inject: "This room is CURRENTLY EMPTY with no furniture. Stage it completely from scratch with appropriate furniture for this room type."

**Feature 7 -- Ceiling Height:**
- New state: `interiorCeilingHeight` (string, default 'Standard')
- Options: Low, Standard, High, Double Height
- Backend: inject ceiling constraint for Low and Double Height (Standard needs no instruction)

**Feature 8 -- Anti-hallucination prompt additions:**
Add to CRITICAL REQUIREMENTS:
- "Do NOT mirror or flip the room horizontally"
- "Do NOT change the size, shape, or position of ANY window or door"
- "Do NOT add or remove walls, columns, or structural elements"
- "The perspective vanishing point must remain identical to the source photo"

**Feature 9 -- "Generate Another Style" button:**
On the results page, when `isInteriorDesign` is true, show a "Try Another Style" button that navigates back to the settings step (preserving upload and room details).

