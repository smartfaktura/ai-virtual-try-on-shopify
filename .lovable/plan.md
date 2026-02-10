

## Hide "Featured" Badge for Non-Admin Users

### What Changes

In `src/components/app/DiscoverCard.tsx`, the "Featured" text badge (lines 77-82) currently shows for non-admin visitors. We will remove this block so that:

- **Admins** still see the star toggle button to manage featured status
- **Visitors** see no "Featured" label at all — featured items simply appear at the top of the grid naturally

### File to Modify

| File | Change |
|------|--------|
| `src/components/app/DiscoverCard.tsx` | Remove the "Featured badge (non-admin)" block (lines 77-82) |

This is a 6-line deletion. Featured items will still sort to the top of the grid (that logic lives in `Discover.tsx`), but visitors won't see any label calling it out.
