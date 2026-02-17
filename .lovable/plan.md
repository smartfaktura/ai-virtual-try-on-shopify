

## Add Freestyle Generations to Activity Feed

### Problem
The Activity Feed only shows three types of activity: generation jobs, product uploads, and brand profile creations. Freestyle generations are completely missing, making the feed repetitive (mostly "completed" workflow jobs) and not representative of actual user activity.

### Solution
Add freestyle generations as a fourth activity source in the `ActivityFeed` component, and assign them a distinct avatar/icon for visual variety.

### Changes

**File: `src/components/app/ActivityFeed.tsx`**

1. Import the `Sparkles` icon (for freestyle) alongside existing icons
2. Add a query for `freestyle_generations` table (similar to the existing query in `RecentCreationsGallery`), selecting `id`, `prompt`, `created_at`, limited to 3 recent items
3. Map each freestyle generation to an activity item with:
   - id: `freestyle-{id}`
   - icon: `Sparkles`
   - text: `Freestyle "{truncated prompt}" generated` (truncate prompt to ~30 chars)
   - time: relative timestamp
4. Update `getTeamAvatar` to handle `freestyle-` prefix, assigning a different team member avatar (e.g., a fourth avatar) for visual diversity
5. Increase the final slice from 6 to 8 items to accommodate the new source while still keeping the feed compact

### Result
The activity feed will show a healthy mix of workflow completions, freestyle creations, product uploads, and brand profile additions -- making it feel more dynamic and representative of actual usage.

