

## Fix Room Name Auto-Detection

### Problem
When uploading a room photo for Interior/Exterior Staging, the Room Name field shows the raw filename (e.g., "1772206416817 vvsdct") instead of something useful. This happens because:
1. The filename often contains timestamps and random IDs
2. AI image analysis is deliberately skipped for room uploads (`if (!isRoom)`)

### Solution
Enable AI analysis for room uploads too, so the Room Name, Space Type, and Description are auto-detected from the photo. The existing `analyze-product-image` edge function can analyze rooms as well as products.

### Changes

**File: `src/components/app/UploadSourceCard.tsx`**
- Remove the `if (!isRoom)` guard on line 80 so `analyzeProduct()` runs for both product and room uploads
- Set a better default title while AI is analyzing: use `"Untitled Room"` for room variant and keep the cleaned filename for products
- Update the analyzing text to show "AI detecting room details..." for rooms

**File: `src/pages/Generate.tsx` (~line 1079)**
- For reused previous uploads, set the default title to `"Untitled Room"` instead of the cleaned filename, since these filenames are always timestamp-based garbage

**File: `supabase/functions/analyze-product-image/index.ts`**
- Check the current prompt to ensure it can handle room/space images. If it only asks about "product", update the prompt to also detect room type, space name, and description when the image is of a room or building.

These changes mean:
- Fresh uploads get AI-detected room names (e.g., "Modern Living Room")
- While AI is analyzing, the field shows "Untitled Room" instead of gibberish
- Reused uploads also start with "Untitled Room" for the user to fill in
- The AI analysis function handles both product and room images
