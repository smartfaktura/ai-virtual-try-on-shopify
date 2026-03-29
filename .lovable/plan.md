

# Make Video Generation Status Clearer in Global Bar

## Problem
When a video is being generated, the bar says "Leo is animating…" which is vague — it could mean any animation. It should clearly indicate it's a **video** being created.

## Changes

**File: `src/components/app/GlobalGenerationBar.tsx`**

1. **Pill text** (line 42): Change `'animating'` → `'creating your video'` in `getActionVerb()`

2. **Expanded panel title** (line 281): Change `"${member.name} is animating"` → `"${member.name} is creating your video"`

3. **Completed "View" button** (lines 343-352): For video jobs, navigate to `/app/video` instead of `/app/library`, and label the button "View in Videos" instead of just "View"

4. **Leo's status message** in `src/data/teamData.ts` (line 125): Change `'Animating the sequence...'` → `'Creating your video...'` so the rotating quote footer also reflects video context

