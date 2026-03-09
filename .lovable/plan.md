

## Allow Admin to Delete Discover Presets

**Problem**: The `discover_presets` table has no DELETE RLS policy, so admins cannot remove images from the Discover feed.

### Changes

| Area | Change |
|------|--------|
| **Database migration** | Add DELETE RLS policy for admins on `discover_presets`: `has_role(auth.uid(), 'admin'::app_role)` |
| **`src/components/app/DiscoverDetailModal.tsx`** | Add a delete button (trash icon) visible only to admins, with a confirmation dialog. On confirm, delete the row from `discover_presets` and invalidate the query cache. |
| **`src/pages/Discover.tsx`** | Pass an `onDelete` callback to the modal that closes it and refreshes the feed after deletion. |

### UI
- In the detail modal, admins see a red trash icon button next to the existing admin controls (feature toggle).
- Clicking it shows a confirmation alert dialog: "Delete this item from Discover?"
- On confirm: deletes the preset row, closes the modal, and refreshes the feed via `queryClient.invalidateQueries`.

