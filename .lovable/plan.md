
## Fix Missing Team Avatar Videos

### Problem
The security hardening made `generated-videos` private, and the code was updated to reference `landing-assets/team-videos/` -- but the video files were never actually copied there. The `landing-assets/team-videos/` folder is empty, so all 10 team avatar videos on the landing page are broken.

The videos still exist in the private `generated-videos` bucket at path `fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/<id>.mp4`.

### Solution
Create a one-time edge function that copies all 10 team video files from `generated-videos` to `landing-assets/team-videos/`, then call it once. After the copy completes, the existing code in `teamData.ts` will work since `landing-assets` is a public bucket.

### Steps

1. **Create edge function `copy-team-videos`** that:
   - Lists the 10 known video file IDs
   - Downloads each from `generated-videos/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/<id>.mp4` using the service role
   - Uploads each to `landing-assets/team-videos/<id>.mp4`
   - Returns a summary of what was copied

2. **Deploy and invoke the edge function** to perform the copy

3. **Delete the edge function** after successful copy (it's a one-time utility)

No frontend code changes needed -- `teamData.ts` already points to `landing-assets/team-videos/<id>.mp4` which is the correct destination.

### Technical Details

**Edge function** (`supabase/functions/copy-team-videos/index.ts`):
- Uses the Supabase service role client to bypass RLS on the private `generated-videos` bucket
- Downloads each video as a blob and re-uploads to the public `landing-assets` bucket
- Video IDs to copy:
  - 849395850555686932.mp4 (Sophia)
  - 849398236443574344.mp4 (Amara)
  - 849398707518439436.mp4 (Luna)
  - 849400657458757636.mp4 (Kenji)
  - 849398252540657664.mp4 (Yuki)
  - 849398684226822188.mp4 (Omar)
  - 849398695958937689.mp4 (Sienna)
  - 849399340514426899.mp4 (Max)
  - 849399354389184514.mp4 (Zara)
  - 849399365948022876.mp4 (Leo)
