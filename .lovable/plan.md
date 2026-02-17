

## Make Video Generation "Coming Soon" for Non-Admin Users

### Changes

**1. `src/components/app/AppShell.tsx` -- Sidebar Video Nav Item**
- Add a "Coming Soon" badge next to the Video nav label for non-admin users
- For non-admin users, clicking Video will show a toast ("Coming soon!") instead of navigating
- Admin users keep full access as before
- Uses the existing `useIsAdmin` hook already imported in the file

**2. `src/pages/VideoGenerate.tsx` -- Full Page Gate**
- Add a check at the top: if user is not admin, render a "Coming Soon" placeholder page instead of the video generator
- The placeholder shows a Film icon, "Video Generation" title, "Coming Soon" badge, and a brief message
- Admin users see the full video generation UI as before

**3. `src/data/mockData.ts` -- Plan Feature Lists**
- Change "Video Generation" to "Video Generation (coming soon)" in Starter, Growth, and Pro plan feature lists

### Technical Details

- Import `useIsAdmin` in `VideoGenerate.tsx` and check `isAdmin` to gate access
- In `AppShell.tsx`, the `NavItemButton` component will be updated to accept an optional `comingSoon` prop; when true and user is not admin, it shows a badge and prevents navigation
- No database or backend changes needed

