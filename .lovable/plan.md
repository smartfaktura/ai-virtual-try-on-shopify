

## Auto-Analyze Product Image on Upload

When a user uploads a clothing photo in the try-on flow, AI will automatically analyze the image and fill in the Product Title, Product Type, and Description fields -- just like it already does for models and scenes.

### Changes

#### 1. New Edge Function: `supabase/functions/analyze-product-image/index.ts`

A new backend function that sends the uploaded product image to the AI and returns structured product details. Follows the same pattern as `create-model-from-image`.

- Accepts `{ imageUrl }` (base64 data URL or HTTPS URL)
- Sends to Gemini 2.5 Flash with a prompt asking it to identify:
  - `title` -- a short product name (e.g., "Cream Ribbed Turtleneck Sweater")
  - `productType` -- one of the existing options: Leggings, Hoodie, T-Shirt, Sports Bra, Jacket, Tank Top, Joggers, Shorts, Dress, Sweater, Other
  - `description` -- a brief description of the garment's color, material, and key features
- Returns JSON with those three fields

#### 2. Update `src/components/app/UploadSourceCard.tsx`

After a file is uploaded and the preview is shown:
- Immediately call the new `analyze-product-image` edge function with the image (converted to base64)
- Show a loading indicator ("AI analyzing product...") while waiting
- Auto-fill the title, product type, and description fields with the AI response
- User can still edit all fields manually after auto-fill
- If analysis fails, show a subtle toast and let user fill in manually (same pattern as AddModelModal)

### Technical Details

**Edge function prompt:**
```text
Analyze this image of a clothing/fashion product. Return a JSON object:
- "title": Short product name (e.g. "Black High-Waist Yoga Leggings")
- "productType": One of: Leggings, Hoodie, T-Shirt, Sports Bra, Jacket, Tank Top, Joggers, Shorts, Dress, Sweater, Other
- "description": 10-20 word description of color, material, style, and key features
Return ONLY the JSON object.
```

**UploadSourceCard changes:**
```text
// After handleFile creates the ScratchUpload:
1. Convert the file to base64 using FileReader
2. Call analyze-product-image edge function
3. Show Loader2 + Sparkles spinner over the form fields
4. On success: call onUpdateProductInfo with AI-detected values
5. On failure: toast.error, let user fill manually
```

Two files total: one new edge function, one updated component.
