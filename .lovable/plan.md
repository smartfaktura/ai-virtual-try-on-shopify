

# Admin Public Model: Generate 3 Variations with Selection Screen

## What
When an admin checks "Add as public model", clicking Generate will produce **3 portrait variations** instead of 1. A selection screen appears showing all 3 side-by-side. The admin picks the best one, clicks "Publish", and only then is it saved to `custom_models`.

## Changes

### 1. Edge Function: `supabase/functions/generate-user-model/index.ts`
- When `makePublic === true`, add a new parameter `count: 3` to signal multi-generation
- Run the AI image generation call **3 times in parallel** (`Promise.all`)
- Upload all 3 images to `scratch-uploads`
- Return `{ variations: [url1, url2, url3], metadata }` instead of inserting into `custom_models`
- Add a **new endpoint mode** `body.action === 'publish-public'` that accepts the chosen image URL + metadata and inserts into `custom_models` (admin-only)

### 2. Frontend: `src/pages/BrandModels.tsx`
- **New state**: `variations: string[]` and `pendingMetadata` to hold the 3 URLs and model info
- **Modified `handleGenerate`**: When `makePublic`, call the edge function, receive 3 variations, set them in state instead of finishing
- **New `VariationPicker` component**: Shows 3 images in a grid with radio selection + "Publish as Public Model" button
- On publish, calls the edge function again with `action: 'publish-public'` passing the selected URL
- Cancel button discards all variations (images stay in storage but model isn't created)

### 3. Flow
```text
Admin checks "public" → clicks Generate → loading screen (3 images generating)
→ VariationPicker shows 3 portraits → admin selects best → clicks Publish
→ edge function inserts into custom_models → success toast
```

### No database changes needed — uses existing `custom_models` table and `scratch-uploads` bucket.

