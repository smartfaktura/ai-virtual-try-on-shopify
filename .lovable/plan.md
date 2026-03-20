

# Fix: Add "Do Not Repeat" Option + Show Exact Date in Schedule Card

## Problems

1. **No "Do not repeat" option in scheduled mode**: When user picks "Schedule" delivery, they're forced to choose Weekly/Biweekly/Monthly. There's no option to schedule a one-time future run without repeating.

2. **Schedule card doesn't show the exact execution date**: The card shows "in 6 days" (relative time) but not the actual date (e.g., "Mar 27"). User wants to see the specific date.

3. **Privacy/RLS check**: All tables (`creative_schedules`, `creative_drops`, `workflows`) have proper RLS policies scoped to `user_id = auth.uid()`. Workflows are system-level read-only. No conflicts found.

## Changes

### File 1: `src/components/app/CreativeDropWizard.tsx`

**A. Add "Do Not Repeat" to frequency options** (line 1678)

Add a new option to the frequency selector array:
```
{ id: 'none', label: 'Do Not Repeat' },
{ id: 'weekly', label: 'Weekly' },
{ id: 'biweekly', label: 'Every 2 Weeks' },
{ id: 'monthly', label: 'Monthly' },
```

**B. Update save logic** (line 518)

When `deliveryMode === 'scheduled'` and `frequency === 'none'`, store `frequency: 'one-time'` and set `next_run_at` to the selected `startDate` (same as current one-time behavior but scheduled for a future date).

### File 2: `src/components/app/DropCard.tsx`

**C. Show exact date alongside relative time** (line 250-254)

Change the "Next run" display to show both the date and relative time:
- Currently: `in 6 days`
- After: `Mar 27 (in 6 days)`

```tsx
{isOneTime ? 'One-time' : schedule.next_run_at
  ? `${format(new Date(schedule.next_run_at), 'MMM d')} (${formatDistanceToNow(new Date(schedule.next_run_at), { addSuffix: true })})`
  : isPaused ? 'Paused' : 'Not scheduled'}
```

Add `import { format } from 'date-fns'` (already imports `formatDistanceToNow` from date-fns).

## Summary
- 2 files changed, ~10 lines modified
- Users can schedule a future one-time drop without forced repetition
- Schedule cards show exact date + relative time (e.g., "Mar 27 (in 6 days)")
- RLS policies verified — no privacy or dependency conflicts

