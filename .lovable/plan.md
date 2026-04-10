

# Fix Paste + Add AI Auto-Analysis on Reference Image

## Problem
1. **Paste broken**: `onPaste` is on the drop zone div — requires clicking that tiny area first. Users expect Cmd+V anywhere in the product card.
2. **No AI analysis**: After pasting a reference image, title and specification stay empty. AI should auto-fill both.
3. **Title-aware analysis**: If the user already typed a title (e.g. "Running Shoes"), the AI should focus its analysis on that aspect of the image.

## Changes

### 1. Move paste handler to the Collapsible card wrapper
Move `onPaste` from the drop zone div to the outer `Card` element wrapping each product. This way pasting anywhere inside the card (title input, textarea, or empty area) captures clipboard images. Only intercept if clipboard contains an image and no reference image is already set.

### 2. Add AI auto-analysis after image paste/upload
After `handleReferenceImage` sets the file, automatically call `analyze-product-image` edge function:
- Convert file to base64
- Send to the existing edge function with the base64 as `imageUrl`
- If the user already typed a title, include it as context so the AI focuses on the relevant part of the image
- Auto-fill **title** (if empty) and **specification** (if empty or short) with AI response
- Show a `Loader2` spinner on the thumbnail during analysis
- Add `analyzingIds` state (`Set<string>`) to track in-progress analyses

### 3. Enhance analyze-product-image edge function
Update the AI prompt to also return a `specification` field — a detailed 30-50 word generation-ready description covering silhouette, materials, colors, finish, and construction. When a `title` hint is provided in the request body, instruct the AI to focus its analysis on that specific item in the image.

Updated request body: `{ imageUrl, title? }`
Updated response: `{ title, productType, description, specification }`

### 4. Wire analysis into handleReferenceImage
After setting the preview, fire-and-forget the analysis call. On success:
- If title is empty → fill with `data.title`
- If specification is empty or under 20 chars → fill with `data.specification`
- Show toast: "AI analyzed your reference image"

## Files Changed
| File | Change |
|------|--------|
| `src/pages/TextToProduct.tsx` | Move onPaste to Card level, add analyzingIds state, call analyze-product-image after image attach, auto-fill fields |
| `supabase/functions/analyze-product-image/index.ts` | Add optional `title` input for focused analysis, return `specification` field in response |

