

## Fix Key Pieces Specificity + Add Optional Room Dimensions

### Problem 1: "Single Bed" generates a Double Bed

**Root cause**: The `keyPiecesBlock` prompt (line 357) says:
> "This room MUST contain EXACTLY these pieces: Single Bed"

But it never says what NOT to place. The AI sees "Guest Bedroom" context, knows guest bedrooms typically have double beds, and upgrades the single bed. The "Replace All" block also says "stage from scratch with furniture appropriate for this room type" -- reinforcing the AI's default assumption.

**Fix**: Strengthen the key pieces prompt with explicit negative constraints. When specific bed types are selected, add anti-substitution rules. Also, when key pieces are provided in "Replace All" mode, remove the phrase "appropriate for this room type" (which invites defaults) and replace with "using ONLY the specified key pieces as major furniture."

Changes to `supabase/functions/generate-workflow/index.ts`:

1. **Key pieces block** (line 356-358): Add negative constraints -- "Do NOT substitute, upgrade, or resize any specified piece. A 'Single Bed' means a narrow single bed, NOT a double, queen, or king. A 'Small Desk' means a compact desk, NOT a full office desk."

2. **Replace All block** (line 297-298): When `hasKeyPieces` is true, change wording from "furniture appropriate for this room type" to "using ONLY the key pieces specified below as major furniture items."

3. **Room description for Replace All + key pieces**: Currently `roomDesc` is neutralized to "a bedroom (guest) space" -- good. But the Replace All block still says "appropriate for this room type" which re-introduces defaults. This gets fixed by change #2 above.

---

### Problem 2: No Room Dimensions Input

**Feature**: Add optional room dimensions (length x width in meters or feet) so the AI can better judge furniture scale.

Changes to `src/pages/Generate.tsx`:
- Add two optional number inputs: `interiorRoomLength` and `interiorRoomWidth` (in meters, with placeholder text showing "e.g. 4.5")
- Add a unit toggle (meters / feet) stored as `interiorDimensionUnit`
- Pass `room_dimensions` to the backend as a string like "4.5m x 3.2m"
- Reset on room type change

Changes to `supabase/functions/generate-workflow/index.ts`:
- Read `room_dimensions` from the product payload
- If provided, inject: "ROOM DIMENSIONS: This room measures {dimensions}. Scale ALL furniture to fit realistically within these exact dimensions. A single bed in a 3m x 2.5m room should leave walking space on at least one side."
- This block takes priority over the generic "Room Size" block when both are present

---

### Files to Change

| File | Changes |
|------|---------|
| `supabase/functions/generate-workflow/index.ts` | Strengthen key pieces prompt with negative constraints; modify Replace All wording when key pieces present; add room dimensions prompt block |
| `src/pages/Generate.tsx` | Add optional room dimensions inputs (length, width, unit toggle); pass to backend; reset on room type change |

---

### Technical Details

**Key pieces prompt fix** (edge function, ~line 356-358):
```
Current: "MUST contain EXACTLY these pieces: Single Bed"
New:     "MUST contain EXACTLY these pieces: Single Bed.
          Do NOT substitute, upgrade, or resize ANY specified piece.
          'Single Bed' = narrow single bed (90cm wide), NOT a double, queen, or king.
          'Small Desk' = compact desk, NOT a full-size office desk.
          'Sofa Bed' = a sofa that converts to a bed, NOT a regular sofa or a standalone bed.
          If the specified piece has a size qualifier (single, small, compact, twin), that size is MANDATORY."
```

**Replace All + key pieces** (edge function, ~line 297-298):
When `hasKeyPieces` is true, append to the Replace All block:
"Use ONLY the key pieces specified in the REQUIRED FURNITURE section as major furniture. Do NOT add other large furniture items beyond what is listed."

**Room dimensions UI** (Generate.tsx):
- Two `<Input type="number">` fields side by side with a small unit toggle (m/ft)
- Placed after Room Size selector
- Label: "Room Dimensions (optional)"
- Converts feet to meters internally if user selects feet

**Room dimensions prompt** (edge function):
"ROOM DIMENSIONS: This room measures {length} x {width} {unit}. Scale ALL furniture to fit realistically. Ensure walking paths of at least 60cm (2ft) remain between furniture pieces and walls."

