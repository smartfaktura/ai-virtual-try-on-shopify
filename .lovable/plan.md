

## Generate Happy Sophia Video + Save Videos to Platform

### Part 1: Generate New Video with Happy Vibe Prompt

We'll trigger a new Kling AI video generation for the Sophia avatar using a descriptive text prompt that conveys a happy, energetic brand vibe. The prompt will describe Sophia's personality as a creative AI photographer who's excited about helping brands create stunning visuals.

**Prompt to use:**
> "A warm, confident smile spreading across her face, gentle head tilt, eyes sparkling with creative energy. Soft natural lighting, subtle hair movement as if a gentle breeze. She looks welcoming and enthusiastic, embodying the spirit of a passionate AI photography professional ready to bring brands to life. Smooth, cinematic motion."

**Settings:**
- Model: V2.1 (best quality)
- Duration: 5 seconds
- Aspect ratio: 1:1 (matches avatar cards)
- Source: The already-uploaded Sophia avatar from `scratch-uploads/test/avatar-sophia.jpg`

### Part 2: Save Generated Videos to the Platform

Currently, generated videos exist only as temporary Kling AI URLs that expire. We need a proper system to persist and display them.

#### Step 1 -- Create a `generated_videos` database table

A new table to store video generation history:

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid | Owner (linked to auth) |
| source_image_url | text | The original image used |
| prompt | text | The motion prompt used |
| video_url | text | Permanent URL to stored video |
| kling_task_id | text | Kling API task reference |
| model_name | text | Which model was used |
| duration | text | 5 or 10 seconds |
| aspect_ratio | text | 1:1, 16:9, or 9:16 |
| status | text | queued, processing, complete, failed |
| created_at | timestamptz | When it was created |

RLS policies will ensure users can only see/manage their own videos.

#### Step 2 -- Create a `generated-videos` storage bucket

A new public storage bucket to permanently store the MP4 files downloaded from Kling AI's temporary URLs.

#### Step 3 -- Update the edge function to auto-save

When the status poll detects a completed video (`succeed`), the edge function will:
1. Download the MP4 from Kling's temporary URL
2. Upload it to the `generated-videos` storage bucket
3. Save the permanent URL + metadata to the `generated_videos` table
4. Return the permanent URL to the frontend

#### Step 4 -- Update the Video Generator page

- After generation completes, show the video player with the permanent URL
- Add a **"Video History"** section below the generator showing all previously generated videos in a grid
- Each history card shows: thumbnail (first frame), prompt snippet, date, duration, and a play/download button

#### Step 5 -- Update the hook

Modify `useGenerateVideo` to:
- Accept an optional `onComplete` callback
- Return the saved video record from the database after completion

### Technical Details

**Files to create:**
- Database migration for `generated_videos` table + `generated-videos` bucket + RLS policies

**Files to modify:**
- `supabase/functions/generate-video/index.ts` -- Add save logic (download MP4 from Kling, upload to bucket, insert DB record)
- `src/hooks/useGenerateVideo.ts` -- Return saved video data, add history fetching
- `src/pages/VideoGenerate.tsx` -- Add video history grid below the generator
- `src/integrations/supabase/types.ts` -- Will auto-update with new table types

**Flow diagram:**

1. User clicks Generate with prompt
2. Edge function creates Kling task, inserts DB row (status: processing)
3. Frontend polls for status
4. On completion: edge function downloads MP4 from Kling, uploads to permanent bucket, updates DB row with final URL
5. Frontend receives permanent URL, displays video, refreshes history grid

