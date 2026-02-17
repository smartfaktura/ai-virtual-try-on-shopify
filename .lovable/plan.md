

## Add Dismiss "X" Buttons to Activity Cards

### What Changes

Add a small "X" close button to **completed** and **failed** activity cards in the Workflows page, so you can dismiss notifications you've already seen.

Dismissed items are stored in browser local storage so they stay hidden even after page refresh.

### Changes

| File | What |
|------|------|
| `src/components/app/WorkflowActivityCard.tsx` | Add an `onDismiss` callback prop. Render a small X button on each completed and failed card row. |
| `src/pages/Workflows.tsx` | Track dismissed job IDs in state backed by `localStorage`. Filter out dismissed IDs from `completedGroups` and `failedGroups` before passing to `WorkflowActivityCard`. Provide the dismiss handler. |

### Technical Details

**WorkflowActivityCard.tsx**
- New optional prop: `onDismiss?: (groupKey: string) => void`
- On completed and failed cards, add an icon-only ghost button with an `X` icon at the far right
- Clicking it calls `onDismiss(group.key)`

**Workflows.tsx**
- On mount, load `dismissed-activity` from localStorage into a `Set<string>` state
- `handleDismiss(key)` adds the key to the set and persists to localStorage
- Filter `completedGroups` and `failedGroups` to exclude dismissed keys before rendering
- Active/processing groups are never dismissible (they need attention)

