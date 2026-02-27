

## Comprehensive Improvement Plan: Interior / Exterior Staging

After auditing every function, UI element, and prompt block, here are the improvements organized by category.

---

### 1. UI/UX Improvements

**A. Missing "Back" button context for Interior Design in Settings step**
The "Back" button on the settings/style page (line 2663-2668) navigates to brand-profile or upload/product, but for interior design it should always go back to "upload" since that's where Room Details live. Currently the logic doesn't account for `isInteriorDesign`.

**B. Results page says "Publishing to" for interior staging**
Line 2819 shows "Publishing to" or "Generated from uploaded image" — neither makes sense for room staging. Should say "Staged from your photo" for interior design.

**C. "Generating" screen text not contextual for interior**
Line 2781 says `Generating X variations of "Uploaded Room"`. Should say something like `Staging your ${interiorRoomType || 'room'} in ${selectedStyleName} style`.

**D. Scene selection counter says "scenes" for interior**
Line 2331-2333 says "Select at least 1 scene" and "X of Y scenes selected" — should say "styles" for interior design.

**E. Quality dropdown shows wrong credits for Flat Lay**
Line 2478 shows "4 credits/img" and "10 credits/img" for Flat Lay, but line 2613 shows "8 credits/img" and "16 credits/img" for the general settings. The Flat Lay credits are wrong (should be 8/16 like everything else since Pro model is used).

**F. No visual preview of selected Room Details before generating**
After completing Room Details and moving to Style selection, there's no summary showing what the user configured (room type, furniture handling, wall color, etc.). Users can't review their choices without going back.

---

### 2. Prompt Engineering Improvements

**A. Exterior prompt doesn't include Room Size constraint**
The exterior block (lines 360-369) includes `keyPiecesBlock` and `furnitureRealismBlock` but NOT `roomSizeBlock`. If a user selects "Small" area size for a balcony, the AI gets no scaling instruction for exterior.

**B. Exterior prompt missing ceiling height exclusion confirmation**
While the UI hides ceiling height for exterior, the backend still reads `ceiling_height` from the payload. If a stale value is sent (e.g., user switched from interior to exterior without resetting), it could inject a ceiling height block into an exterior prompt. The backend should explicitly skip it for exterior.

**C. No "Staging Purpose" context in the prompt for exterior**
The `stagingPurposeBlock` IS included in the exterior prompt (line 368), but it says things like "make the space look move-in ready" which is interior-focused language. The real estate purpose should say "maximize curb appeal" for exterior.

**D. Time of Day prompt is generic**
Line 347: `Render the scene as if photographed during ${timeOfDay}` -- this works but could be more specific for interior vs exterior. For exterior, golden hour should include "warm sunlight hitting the facade from a low angle" rather than just "adjust window light direction."

**E. Empty "Furniture Style" sent when "Match Design Style" is selected**
Line 381: The backend checks `furnitureStyle !== 'Match Design Style'` before injecting the style block, which is correct. However, the exterior block (line 364) does the same check. Both are fine but the exterior options like "Tropical" and "Mediterranean" don't get a descriptive expansion -- "Use Tropical outdoor furniture" is vague. Should expand to "Use Tropical outdoor furniture and design elements: rattan, teak, palm-inspired planters, lush greenery, vibrant cushion fabrics."

**F. Color Palette block is too brief**
Line 342: `Use a ${colorPalettePreference} color scheme throughout the room's furniture, textiles, and decor accessories.` -- This is thin. "Neutral / Earth Tones" should expand to specific colors the AI can reference (beige, taupe, warm brown, soft cream, terracotta accents).

---

### 3. Functional Gaps

**A. "Regenerate" button on results page is non-functional**
Line 2848: `handleRegenerate` just shows a toast "Regenerating variation... (this would cost 1 credit)" -- it doesn't actually regenerate. This is a stub.

**B. No aspect ratio detection from uploaded photo**
The UI says "Matches uploaded photo" for aspect ratio (line 2621-2623), but the backend just uses the workflow's default ratio. There's no actual detection of the uploaded photo's dimensions to pass the correct ratio.

---

### 4. Proposed Changes

| File | Change | Priority |
|------|--------|----------|
| `src/pages/Generate.tsx` | Fix "Back" button for interior design to go to 'upload' step | High |
| `src/pages/Generate.tsx` | Change "Publishing to" to "Staged from your photo" for interior | Medium |
| `src/pages/Generate.tsx` | Fix generating screen text to show room type and style name | Medium |
| `src/pages/Generate.tsx` | Change "scenes" to "styles" in selection counter for interior | Medium |
| `src/pages/Generate.tsx` | Fix Flat Lay credits display (4/10 should be 8/16) | High |
| `src/pages/Generate.tsx` | Add Room Details summary card before style selection | Low |
| `supabase/functions/generate-workflow/index.ts` | Add `roomSizeBlock` to exterior prompt | High |
| `supabase/functions/generate-workflow/index.ts` | Add exterior-specific staging purpose language | Medium |
| `supabase/functions/generate-workflow/index.ts` | Expand outdoor style descriptions (Tropical, Mediterranean, etc.) | Medium |
| `supabase/functions/generate-workflow/index.ts` | Expand color palette descriptions with specific colors | Medium |
| `supabase/functions/generate-workflow/index.ts` | Add exterior-specific time of day descriptions | Low |

Total: 2 files, 11 targeted improvements.

