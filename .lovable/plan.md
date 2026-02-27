

## Fix Image Display Ratio + Add Room Size Constraints

### Problem 1: Generated images cropped to 3:4
All generated images are forced into `aspect-[3/4] object-cover`, cutting off parts of the image. The actual aspect ratio is only visible when clicking to open the lightbox.

### Problem 2: Unrealistic furniture for small rooms
The AI places large furniture (e.g., king-size bed) in a small office room because there's no concept of room size in the prompt. A 6 sqm room cannot fit a double bed, but the AI doesn't know that.

---

### Fix 1: Show images in their natural aspect ratio

**File: `src/pages/Generate.tsx` (line 2616)**

Change the image class from `aspect-[3/4] object-cover` to `w-full object-contain` so images display at their native proportions. Add a background color so there's no awkward empty space.

### Fix 2: Add "Room Size" selector to Room Details

**File: `src/pages/Generate.tsx`**

Add a new **Room Size** dropdown to the Room Details card with these options:
- Small (under 10 sqm / 100 sqft)
- Medium (10-20 sqm / 100-200 sqft)
- Large (20-40 sqm / 200-400 sqft)
- Very Large (40+ sqm / 400+ sqft)

Default: "Medium"

This gets passed as `room_size` in the generation payload.

### Fix 3: Use room size in prompt to enforce realistic furniture

**File: `supabase/functions/generate-workflow/index.ts`**

Read `room_size` from the product payload and inject a size-aware constraint block:

- **Small**: "This is a SMALL room. Use ONLY compact, space-saving furniture. No king/queen beds, large sectionals, or oversized pieces. A single bed or small desk is the maximum. Leave ample walking space."
- **Medium**: "This is a MEDIUM-sized room. Use appropriately scaled furniture. Double bed maximum for bedrooms. Avoid oversized pieces."
- **Large/Very Large**: Standard furniture sizing is fine.

This block goes into the CRITICAL REQUIREMENTS section of the interior prompt to strongly guide the AI.

### Files to Edit

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Fix image display aspect ratio; add Room Size state + UI selector; pass in payload |
| `supabase/functions/generate-workflow/index.ts` | Read `room_size`, add size-constraint block to interior prompt |
