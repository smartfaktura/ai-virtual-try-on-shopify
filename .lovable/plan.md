

## Fix Freestyle Activity Avatars in Recent Activity

### Problem
Freestyle activities in the Recent Activity feed show no avatar because they reference `avatar-liam.jpg`, which does not exist. The actual team avatars are: sophia, amara, luna, kenji, yuki, omar, sienna, max, zara, and leo.

### Solution
Replace the single non-existent "Liam" avatar with a rotation of real team avatars for freestyle activities, giving visual variety similar to how other activity types show different team members.

### Changes

**File: `src/components/app/ActivityFeed.tsx`**

1. Create an array of team avatars designated for freestyle activities (e.g., Yuki, Luna, Amara, Kenji)
2. Update the `getTeamAvatar` function so that when the activity ID starts with `freestyle-`, it picks an avatar from this array based on a simple hash of the activity ID -- this ensures the same freestyle item always gets the same avatar, but different items get different ones
3. Remove the non-existent "Liam" reference

The avatar selection logic will use a deterministic approach (character code sum of the ID modulo array length) so avatars stay consistent across re-renders without randomness.

### Result
Each freestyle generation in the Activity Feed will display a real team member avatar (rotating between several members), matching the polished look of workflow and product activities.

