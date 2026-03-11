

## Fix Try-On: Product Name in Downloads + Resolution

### Issues Found

**1. Product name missing from library download filename**
In `src/hooks/useLibraryItems.ts` (line 52), the library label is: `workflowName || productTitle || 'Generated'`. When a try-on job has a workflow attached, the workflow name takes priority and the product title is hidden. The download filename in `LibraryDetailModal.tsx` (line 62) uses this label: `${item.label}-${item.id.slice(0,8)}.png`, producing `virtual-try-on-set-b33cf702.png` instead of including the product name.

**Fix**: Include product title in the label alongside workflow name: `workflowName ? \`${workflowName} — ${productTitle}\` : productTitle || 'Generated'`. Also update the library item type to carry a separate `productTitle` field so the download filename can always include it.

**2. Images not generating at 2K resolution**
The `image_config: { imageSize: "2K" }` parameter is being passed to the Lovable AI Gateway, but the gateway is an OpenAI-compatible API that only supports `model`, `messages`, `modalities`, and standard OpenAI parameters. The `image_config` is silently ignored — Gemini-specific config objects are not forwarded.

**Fix**: Add explicit resolution instructions to the prompt text itself. Add a line like `"OUTPUT RESOLUTION: Generate this image at 2048 pixels on the longest edge (2K resolution). The final image must be high-resolution and print-ready."` to the prompt in `generate-tryon/index.ts`. This is the only reliable way to influence output size through the gateway.

### Changes

**`src/hooks/useLibraryItems.ts`**
- Line 52: Change label to include both workflow name and product title when both exist
- Add `productTitle` field to the raw item so it's available for downloads

**`src/components/app/LibraryDetailModal.tsx`**
- Line 62: Update download filename to prefer product title when available: use `item.productTitle` if present, otherwise fall back to `item.label`

**`src/components/app/LibraryImageCard.tsx`** (type update)
- Add optional `productTitle` field to `LibraryItem` interface

**`supabase/functions/generate-tryon/index.ts`**
- In `buildPrompt()`: Add explicit resolution instruction to the prompt text: `"OUTPUT RESOLUTION: Generate at 2048px on the longest edge (2K). Ultra-high-resolution, print-ready output."`
- Keep `image_config` as-is (harmless if ignored, beneficial if gateway adds support later)

**`supabase/functions/generate-freestyle/index.ts`**
- Same approach: add resolution instruction to the prompt based on selected resolution (1K=1024px, 2K=2048px, 4K=4096px)

**`supabase/functions/generate-workflow/index.ts`**
- Same: add 2K resolution instruction to prompt text

### Files: 6 files modified

