

## Polish Interior / Exterior Staging -- Professional-Grade Improvements

### Overview
Improvements designed from the perspective of real estate agents and interior designers who use staging tools daily. Focuses on UX clarity, preventing common mistakes, and adding professional features.

### Changes

---

#### 1. Fix: Room Type defaults to blank (must be selected)

**Problem:** `interiorRoomType` initializes to `'Living Room'`, so users can skip past it without thinking.

**Fix in `src/pages/Generate.tsx`:**
- Change initial state to `''` (empty string)
- Update the `useEffect` that resets on interior/exterior toggle to also set `''` instead of a default
- Add a placeholder to the Room Type `Select`: "Select room type..."
- Disable the Continue button on the upload step if `interiorRoomType` is empty (already has a disable check -- just add `|| !interiorRoomType`)

---

#### 2. Add "Design Notes" free-text field (optional)

**Why:** Interior designers often have specific instructions like "client wants warm Japandi feel" or "no curtains, shutters only." A free-text field gives power users control.

**In `src/pages/Generate.tsx`:**
- Add `interiorDesignNotes` state (string, default `''`)
- Render a `Textarea` below the Key Furniture section: "Design Notes (optional)" with placeholder "e.g. client prefers warm tones, no curtains, maximize natural light..."
- Pass `design_notes` in the generation payload

**In `supabase/functions/generate-workflow/index.ts`:**
- Read `design_notes` from the product payload
- Inject into prompt as: `\nDESIGNER NOTES: {notes}` after the room context block

---

#### 3. Add "Color Palette" quick chips (optional)

**Why:** Real estate photographers and designers work with specific color schemes. This is faster than typing notes.

**In `src/pages/Generate.tsx`:**
- Add `interiorColorPalette` state (string, default `''`)
- Render a chip selector after Wall Color/Flooring with options: `Neutral / Earth Tones`, `Cool & Calming`, `Warm & Inviting`, `Monochrome`, `Bold & Vibrant`, `Pastel Soft`
- Pass `color_palette_preference` in payload

**In `supabase/functions/generate-workflow/index.ts`:**
- When provided, inject: `\nCOLOR PALETTE: Use a ${palette} color scheme throughout the room's furniture, textiles, and decor accessories.`

---

#### 4. Add "Time of Day / Natural Light" selector

**Why:** Real estate photos are dramatically affected by time of day. Morning light vs golden hour vs twilight creates completely different moods. This is separate from the "Lighting Mood" (which controls artificial light style).

**In `src/pages/Generate.tsx`:**
- Add `interiorTimeOfDay` state (string, default `'As Photographed'`)
- Render a Select dropdown with: `As Photographed`, `Morning Light`, `Midday Bright`, `Golden Hour`, `Blue Hour / Twilight`, `Overcast Soft`
- Pass `time_of_day` in payload

**In `supabase/functions/generate-workflow/index.ts`:**
- When not "As Photographed", inject: `\nNATURAL LIGHT: Render the scene as if photographed during ${timeOfDay}. Adjust window light direction, shadow angles, and ambient light color accordingly.`

---

#### 5. Add "Staging Purpose" selector

**Why:** A real estate listing photo has different requirements than an interior design portfolio shot or an Airbnb listing.

**In `src/pages/Generate.tsx`:**
- Add `interiorPurpose` state (string, default `''`)
- Render as chip buttons above Room Type: `Real Estate Listing`, `Interior Design Portfolio`, `Airbnb / Rental`, `Personal Inspiration`
- Pass `staging_purpose` in payload

**In `supabase/functions/generate-workflow/index.ts`:**
- Inject purpose-specific instructions:
  - Real Estate: "Bright, clean, spacious feel. Decluttered. Neutral staging to appeal to broadest audience."
  - Design Portfolio: "Showcase design details, textures, and curated accessories. Editorial quality."
  - Airbnb: "Warm, welcoming, lived-in feel. Show amenities clearly (towels, pillows, books)."
  - Personal: no extra constraint

---

#### 6. Improve upload step help text based on context

**In `src/pages/Generate.tsx`:**
- Add contextual tips below the upload area depending on `interiorType`:
  - Interior: "Best results: well-lit photos, shoot from a corner to capture two walls, avoid extreme wide-angle distortion"
  - Exterior: "Best results: shoot straight-on or at 30-degree angle, include full facade, daytime photos work best"

---

### Files to Change

| File | Changes |
|------|---------|
| `src/pages/Generate.tsx` | Blank default room type, design notes textarea, color palette chips, time of day selector, staging purpose chips, contextual upload tips |
| `supabase/functions/generate-workflow/index.ts` | Read and inject design_notes, color_palette_preference, time_of_day, staging_purpose into prompt |

### Technical Notes

- All new fields are optional -- empty/unselected = current behavior, zero regression
- Room type blank default requires adding `!interiorRoomType` to the Continue button disabled check on the upload step
- New state variables: `interiorDesignNotes`, `interiorColorPalette`, `interiorTimeOfDay`, `interiorPurpose`
- Reset all interior-specific state when `isInteriorDesign` changes or interior/exterior type toggles

