

## Standalone Video Generation Page with Kling AI

Create a dedicated "Video" page in the dashboard where users can upload or provide an image and generate animated videos using Kling AI's Image-to-Video API. This is completely separate from the existing image generation flow.

### Secrets Required First

Before building, two API keys need to be added from your Kling AI developer console (https://app.klingai.com/global/dev/api-key):

- **KLING_ACCESS_KEY** -- your Kling API access key
- **KLING_SECRET_KEY** -- your Kling API secret key

### What Gets Built

**1. New sidebar nav item: "Video"**

A new "Video" entry in the sidebar navigation (under Main section), using the Video/Film icon, linking to `/app/video`.

**2. New page: Video Generator (`/app/video`)**

A clean, standalone page with:

- **Image input area** -- drag-and-drop upload or paste an image URL. Shows a preview of the selected image
- **Motion prompt** -- text input describing the desired animation (e.g., "gentle breeze, fabric flowing naturally, subtle camera push-in")
- **Configuration options:**
  - Model quality: Standard (kling-v2.1-standard, faster/cheaper) or Pro (kling-v2.1-pro, higher quality)
  - Duration: 5 seconds or 10 seconds
  - Aspect ratio: 1:1, 16:9, 9:16
- **"Generate Video" button** -- kicks off the generation
- **Progress state** -- shows elapsed time and a pulsing indicator while Kling processes (typically 1-3 minutes)
- **Result area** -- video player with the finished MP4, plus a Download button

**3. Edge Function: `generate-video`**

A backend function handling the Kling AI workflow:

- **`action=create`**: Generates a JWT (HS256 signed with KLING_SECRET_KEY), submits an image-to-video task to Kling AI, returns the task ID
- **`action=status`**: Polls the task status and returns the video URL when complete
- Validates the user's auth token
- Full error handling for rate limits, expired tasks, and API failures

**4. React Hook: `useGenerateVideo`**

Manages the full lifecycle:
- Sends the image + prompt to the edge function
- Polls for status every 8 seconds
- Exposes `status` (idle/creating/processing/complete/error), `videoUrl`, `error`, and `startGeneration()`
- Cleans up polling on unmount

### User Flow

1. Click "Video" in the sidebar
2. Upload an image (drag-and-drop or file picker) or paste a URL
3. Type a motion prompt describing the animation you want
4. Pick quality (Standard/Pro), duration (5s/10s), and aspect ratio
5. Click "Generate Video"
6. Wait 1-3 minutes with a progress indicator
7. Preview the video inline, download as MP4

### Files

**New files:**
- `supabase/functions/generate-video/index.ts` -- Kling AI edge function with JWT auth and task polling
- `src/pages/VideoGenerate.tsx` -- standalone video generation page
- `src/hooks/useGenerateVideo.ts` -- hook for video generation state and polling

**Modified files:**
- `src/App.tsx` -- add `/app/video` route
- `src/components/app/AppShell.tsx` -- add "Video" nav item to sidebar
- `supabase/config.toml` -- register `generate-video` function

### Technical Details

**Kling AI JWT (generated server-side in Deno):**
- Header: `{ alg: "HS256", typ: "JWT" }`
- Payload: `{ iss: KLING_ACCESS_KEY, exp: now + 1800, iat: now }`
- Signed with: KLING_SECRET_KEY

**Kling API endpoints:**
- Create task: `POST https://api-singapore.klingai.com/v1/videos/image2video`
- Check status: `GET https://api-singapore.klingai.com/v1/videos/image2video/{task_id}`

**Task statuses:** submitted -> processing -> succeed / failed

**Polling strategy:**
- Poll every 8 seconds via the edge function
- Maximum ~50 polls (about 7 minutes timeout)
- Show elapsed time to the user during processing

**Edge function auth:**
- `verify_jwt = false` in config.toml
- Validates JWT via `getClaims()` in code for both create and status actions
- User ID extracted from token for logging

**Image handling:**
- Uploaded images go through the existing `useFileUpload` hook to the `product-uploads` bucket
- The signed URL is passed to Kling AI (they need a publicly accessible image URL)
- Alternatively, users can paste any public image URL directly

