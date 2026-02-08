

## Generate Seamless Looping Sophia Video

### The Trick: Same Image as Start and End Frame

The Kling AI API supports an `image_tail` parameter (end frame control). By passing the **same Sophia avatar image** as both the start frame (`image`) and the end frame (`image_tail`), the AI generates motion that naturally returns to the original position -- creating a perfect, never-ending loop.

This is a well-documented technique: "Use the same image for start and end to auto-create a smooth loop."

### Loop-Optimized Prompt

The prompt describes symmetrical motion -- movement that goes out and comes back:

> "A warm smile slowly spreading across her face, gentle head tilt to one side then gracefully returning to center, soft natural lighting, subtle hair movement as if a light breeze passes then settles. Eyes sparkling with creative energy. Smooth, cinematic motion with gentle return to starting pose."

### Generation Settings

| Setting | Value |
|---------|-------|
| Model | kling-v2-1 |
| Duration | 5 seconds |
| Aspect ratio | 1:1 (matches avatar cards) |
| Mode | std |
| Source image | `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/scratch-uploads/test/avatar-sophia.jpg` |
| Tail image | Same URL as source (forces return to original position) |

### Changes Required

#### 1. Edge Function -- Add `image_tail` support

Update `supabase/functions/generate-video/index.ts` to accept and forward the `image_tail` parameter to the Kling API. This is a non-breaking addition -- existing calls without `image_tail` continue to work as before.

```text
// Add image_tail to destructuring
const { image_url, image_tail, prompt, duration, model_name, mode, aspect_ratio } = body;

// Pass to Kling body when provided
if (image_tail) klingBody.image_tail = image_tail;
```

#### 2. Hook -- Add `imageTailUrl` parameter

Update `src/hooks/useGenerateVideo.ts` to accept an optional `imageTailUrl` in the `startGeneration` params, and pass it as `image_tail` to the edge function.

#### 3. Video Generator Page -- Add Loop Mode toggle

Update `src/pages/VideoGenerate.tsx` to add a "Loop Mode" switch in the configuration panel. When enabled, the same source image is automatically used as both start and end frame. A small info note explains: "Uses same image as start + end frame for seamless looping."

#### 4. Trigger the Generation

After deploying the edge function update, trigger a new video generation with Sophia's avatar using the loop-optimized prompt and `image_tail` set to the same source URL.

#### 5. Update Landing Page

Once the new looping video completes, update `src/components/landing/StudioTeamSection.tsx` to point Sophia's `videoUrl` to the new seamless-loop version.

### Files Modified

| File | Change |
|------|--------|
| `supabase/functions/generate-video/index.ts` | Accept and forward `image_tail` parameter to Kling API |
| `src/hooks/useGenerateVideo.ts` | Add optional `imageTailUrl` to generation params |
| `src/pages/VideoGenerate.tsx` | Add Loop Mode toggle switch in config section |
| `src/components/landing/StudioTeamSection.tsx` | Update Sophia's video URL after new video completes |

