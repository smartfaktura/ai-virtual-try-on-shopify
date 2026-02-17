
## Fix "Failed to start generation" — Source Image Too Large for Queue Payload

### Root Cause

When a user uploads a product image (or selects one from the library), it gets converted to base64 (~2MB+) and stored in React state. When Generate is clicked, that entire base64 blob is embedded in the JSON body sent to `enqueue-generation`, which then stores it in the database `payload` JSONB column.

This fails because the edge function request body limit is ~2MB. A single high-res product image can exceed this, causing a network-level "Failed to fetch" error.

The backend logs confirm: all successful recent jobs had `hasSourceImage: false` — it's specifically jobs with a product source image that fail.

### Solution: Upload Image to Storage First, Pass URL in Payload

Instead of embedding raw base64 in the queue payload, upload the source image to a storage bucket before enqueueing, then pass only the public URL.

### Step 1: Create a storage bucket for temporary generation inputs

Create a `generation-inputs` bucket (if not already existing) for temporary image uploads used during generation.

### Step 2: Update `Freestyle.tsx` — upload source image before enqueue

Before calling `enqueue()`, upload the base64 source image to the `generation-inputs` bucket using the Supabase storage client. Replace the base64 blob in the payload with the resulting public URL.

```
// Pseudocode for the change:
// 1. If sourceImage is base64, upload to storage
// 2. Get public URL
// 3. Pass URL (not base64) in queuePayload.sourceImage
```

This keeps the payload small (a URL string instead of 2MB+ base64).

### Step 3: Update `generate-freestyle/index.ts` — handle URL source images

The generate-freestyle function already handles URLs (the `convertImageToBase64` utility returns URLs as-is if they're HTTPS). No changes should be needed here, but we'll verify the image fetch logic handles storage URLs correctly.

### Step 4: Apply same fix to model/scene images if needed

Check if `modelImage` and `sceneImage` have the same issue. Model images from the library may already be URLs, but we should ensure consistency.

### Technical Detail

| File | Change |
|---|---|
| Database migration | Create `generation-inputs` storage bucket with appropriate policies |
| `src/pages/Freestyle.tsx` | Upload source image to storage before enqueue; pass URL in payload instead of base64 |
| `supabase/functions/generate-freestyle/index.ts` | Verify storage URLs are handled correctly (likely no changes needed) |

### What This Fixes
- Eliminates "Failed to start generation" errors when a product image is attached
- Reduces database bloat (no more 2MB+ JSONB payloads)
- Makes the queue system more reliable for all image-heavy generations
