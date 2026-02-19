
## Add "Upscale to PRO HD" Button in Library Detail Modal

### What You'll Get
When you click on any image in your Library, the detail modal will show a new **"Upscale to PRO HD"** button with a Sparkles icon. Clicking it sends your image to the AI for high-resolution reproduction. Once done, the original image is replaced with the upscaled version and a **"PRO HD"** badge appears next to the title.

### Cost
- **4 credits** per upscale (shown on the button)
- Already-upscaled images show a "PRO HD" badge instead of the button

### User Flow

```text
Library --> Click image --> Detail Modal
                              |
                     [Download]  [Upscale to PRO HD - 4 cr]  [Delete]
                                       |
                                   Click it
                                       |
                              Spinner while processing...
                                       |
                              Image replaced with upscaled version
                              "PRO HD" badge appears near title
                              Button disappears
```

### Implementation Details

#### 1. New Backend Function: `upscale-image`
**Create:** `supabase/functions/upscale-image/index.ts`

- Accepts `{ imageUrl, sourceType: 'freestyle' | 'generation', sourceId }` + auth
- Deducts 4 credits via `deduct_credits` RPC
- Sends the existing image to `google/gemini-3-pro-image-preview` with prompt: "Reproduce this exact image at the highest resolution possible. Preserve every detail, color, composition, lighting, and texture exactly. Ultra-sharp, no compression artifacts, maximum quality output."
- Labels the image as `[SOURCE IMAGE]:` before sending it (same labeled pattern we just added)
- Uploads the result to `tryon-images` storage bucket
- Updates the source record:
  - For freestyle: sets `freestyle_generations.image_url` to new URL and `quality` to `'upscaled'`
  - For generation: updates image URL in `generation_jobs.results` JSONB array
- Refunds credits on failure

#### 2. Database Migration
- Add an UPDATE policy on `freestyle_generations` so users can update their own rows (needed for the quality field update)

```sql
CREATE POLICY "Users can update own freestyle generations"
ON public.freestyle_generations FOR UPDATE
USING (auth.uid() = user_id);
```

#### 3. Frontend: LibraryDetailModal Changes
**Edit:** `src/components/app/LibraryDetailModal.tsx`

- Add `upscaling` state and `handleUpscale` async function
- New button between Download and Delete:
  - Shows **"Upscale to PRO HD -- 4 cr"** with a Sparkles icon when quality is not `'upscaled'`
  - Shows spinner + "Upscaling..." while in progress
  - Hidden when quality is `'upscaled'` -- replaced by a **"PRO HD"** badge near the title (next to existing HD badge area)
- On success: toast, invalidate library queries, update displayed image in-place
- On failure: toast error (credits refunded server-side)

#### 4. Config
- Register `[functions.upscale-image]` with `verify_jwt = false` in `supabase/config.toml`

### Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/functions/upscale-image/index.ts` | Create -- new backend function |
| `src/components/app/LibraryDetailModal.tsx` | Edit -- add upscale button + PRO HD badge |
| Database migration | Add UPDATE policy on `freestyle_generations` |
