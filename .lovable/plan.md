

# Fix Admin Metadata Editor: Add Workflow Selector + Fix Select Dropdown Closing Modal

## Problems
1. **Missing workflow selector** — The admin can't set which workflow (or Freestyle) was used to create the image. The `discover_presets` table already has `workflow_name` and `workflow_slug` columns.
2. **Select dropdown flashes/closes** — When clicking a model or scene option, the Radix `SelectContent` renders in a portal outside the right panel. The click event reaches the outer backdrop div's `onClick={onClose}`, closing the entire modal before the selection registers.

## Changes

### `src/components/app/DiscoverDetailModal.tsx`

**1. Fix dropdown closing the modal**
Add `pointer-events-none` to the outer backdrop div and move `onClick={onClose}` only to the actual backdrop `<div>` and the left image area — OR simpler: add `onPointerDownOutside` prevention on the `SelectContent` components. Actually the simplest fix: change the outer div's `onClick` to only close if the click target IS the backdrop itself, not a portal element. Best approach: move `onClick={onClose}` from the outermost wrapper to just the backdrop div and the left image panel.

**2. Add Workflow selector**
- Fetch workflows from `supabase.from('workflows').select('id, name, slug').order('sort_order')` using `useQuery`.
- Add `editWorkflowSlug` state (initialized from `item.data.workflow_slug`), with "Freestyle" as a special `__freestyle__` value (meaning `workflow_name=null, workflow_slug=null`).
- Add a 4th dropdown in the admin grid (`grid-cols-4` or `grid-cols-2 gap-2` with two rows).
- On save, include `workflow_name` and `workflow_slug` in the update payload.

**3. Layout change**
Change from `grid-cols-3` to `grid-cols-2` (4 selectors in 2 rows of 2) for better readability with the additional dropdown.

### Summary
| Change | Detail |
|--------|--------|
| Fix select closing modal | Move `onClick={onClose}` from outer wrapper to backdrop + image area only |
| Add workflow dropdown | Fetch from DB, add state + selector, include in save |
| Layout | `grid-cols-3` → `grid-cols-2` for 4 selectors |

One file changed.

