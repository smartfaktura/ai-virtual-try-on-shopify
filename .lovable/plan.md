

## Remove AI Room Detection + Add More Detail Options

### 1. Remove AI Auto-Detection for Room Uploads

The AI analysis takes too long and isn't reliable enough for rooms. Instead, use a simple generic name and let the user fill in details manually.

**File: `src/components/app/UploadSourceCard.tsx`**
- In `handleFile()` (line 80): Remove the `analyzeProduct()` call when `isRoom` is true. Only call it for product uploads.
- Set the default title to `"Uploaded Room"` for room variant (already using `"Untitled Room"`, just rename).
- Remove the `isAnalyzing` loading state display for room variant -- the "AI detecting room details..." spinner will no longer appear for rooms.
- Keep AI analysis working for regular product uploads (non-room).

### 2. Remove Room Name / Space Type / Description Fields from UploadSourceCard (for rooms)

Since the Room Details card below already has Room Type, Wall Color, and Flooring -- the UploadSourceCard's "Room Name", "Space Type", and "Description" fields are redundant for the room variant. 

**File: `src/components/app/UploadSourceCard.tsx`**
- When `isRoom`, hide the "Room Details" section (Room Name, Space Type, Description inputs) from the upload card. The user will fill details in the Room Details card below instead.
- Only show the uploaded image preview with the remove button.

### 3. Add More Detail Options for Better Results

Add two new optional fields to the Room Details card to give the AI more context:

**New fields:**
- **Furniture Style** (optional) -- e.g., "Modern Minimalist", "Mid-Century", "Scandinavian", "Industrial", "Traditional", "Bohemian", "Keep Default" (based on selected design style)
- **Lighting Mood** (optional) -- e.g., "Keep Original", "Warm & Cozy", "Bright & Airy", "Dramatic / Moody", "Natural Daylight", "Soft Evening"

**File: `src/pages/Generate.tsx`**
- Add two new state variables: `interiorFurnitureStyle` and `interiorLightingMood` (both defaulting to their "keep default" option)
- Add the two new Select dropdowns to the Room Details card (lines 1098-1149), below the existing Wall Color / Flooring row
- Pass these new fields in the generation payload (line 599-602): add `furniture_style` and `lighting_mood`

**File: `supabase/functions/generate-workflow/index.ts`**
- Read the new `furniture_style` and `lighting_mood` fields from the product object
- Add them to the interior prompt block (lines 267-272): append furniture style and lighting mood instructions when not set to defaults

### 4. Fix Continue Button Validation

**File: `src/pages/Generate.tsx`**
- Currently (line 1163) the Continue button requires `productInfo.title` and `productInfo.productType`. Since we're removing those fields for rooms, update the validation: for `isInteriorDesign`, only require that `scratchUpload` exists (the photo is uploaded). Room Type is already set via the Room Details card.

### Technical Details

**New state variables in Generate.tsx:**
```text
interiorFurnitureStyle: string (default: "Match Design Style")
interiorLightingMood: string (default: "Keep Original")
```

**Furniture Style options:**
Match Design Style, Modern Minimalist, Mid-Century Modern, Scandinavian, Industrial, Traditional / Classic, Bohemian / Eclectic, Art Deco, Japandi, Coastal / Hampton

**Lighting Mood options:**
Keep Original, Warm & Cozy, Bright & Airy, Dramatic / Moody, Natural Daylight, Soft Evening / Golden Hour

**Prompt additions in edge function:**
```text
FURNITURE STYLE: Use {furniture_style} furniture pieces...
LIGHTING MOOD: Apply {lighting_mood} lighting throughout...
```

### Files to Edit

| File | Change |
|------|--------|
| `src/components/app/UploadSourceCard.tsx` | Skip AI analysis for rooms, hide room detail fields for room variant |
| `src/pages/Generate.tsx` | Add furniture style + lighting mood state/UI, fix continue validation for rooms |
| `supabase/functions/generate-workflow/index.ts` | Read and use new furniture_style and lighting_mood in prompt |
