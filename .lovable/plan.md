

## Fix: Allow Deleting Creative Drops + Show Empty State Correctly

### What's Happening

The drop record (status: `generating`, 40 images, 400 credits) still exists in the database. Only schedules have a delete action in the UI -- drops do not. So when you deleted schedules, the orphaned drop remained, keeping the stats ribbon visible with stale data.

### Changes

#### 1. `src/components/app/DropCard.tsx` -- Add delete action for drop cards

Add a delete mutation for drops (similar to the existing schedule delete) and a dropdown menu with a "Delete" option on each drop card. This includes:

- A `deleteDropMutation` that calls `supabase.from('creative_drops').delete().eq('id', dropId)` and invalidates `['creative-drops']`
- A three-dot menu (MoreVertical) on drop cards with a "Delete" option
- A confirmation dialog before deleting

#### 2. `src/pages/CreativeDrops.tsx` -- Invalidate drops when schedules change

When a schedule is deleted, any associated drops become orphaned. The `creative-drops` query should also be invalidated after schedule deletion to keep stats in sync. However, this is already handled because both queries refetch on mount. The real fix is just enabling drop deletion.

### Technical Details

**DropCard.tsx changes (drop card section, around line 276-367):**

- Add `deleteDropMutation` using `useMutation` targeting `creative_drops` table
- Add `deleteDropDialogOpen` state
- Add a dropdown menu button next to the status badge with "Delete" option
- Add `AlertDialog` for delete confirmation
- On success: invalidate `['creative-drops']` and show toast

**No database changes needed** -- the `creative_drops` table already has an RLS policy allowing users to delete their own drops.

### Result

After this change, you can delete the orphaned drop from the Drops tab. Once deleted, `drops.length` becomes 0 and `schedules.length` is already 0, so `hasStats` becomes false and the onboarding/first-time empty state will display instead of the stats ribbon.
