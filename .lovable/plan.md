

# Add Credit Refund Info to Failed Activity Cards

## Problem
When images fail, credits are automatically refunded, but the UI doesn't communicate this — users have no way to know their credits were returned.

## Change — `src/components/app/WorkflowActivityCard.tsx`

In the failed groups section (lines 262-325), add a credit refund message below the existing failure text. The data is already available: each job has `credits_reserved` and we know `failedCount`.

### Update the failed group info text (line 284-289)

Add a line showing refunded credits, calculated from the failed jobs' `credits_reserved`:

```tsx
<div className="min-w-0">
  <p className="text-sm font-medium truncate">
    {group.workflow_name ?? 'Workflow generation'}
    {group.product_name ? ` — ${group.product_name}` : ''}
  </p>
  <p className="text-xs text-muted-foreground truncate">
    {group.totalCount > 1
      ? `${group.failedCount}/${group.totalCount} failed`
      : '1 image failed'}
    {group.jobs[0]?.error_message ? ` · ${group.jobs[0].error_message.slice(0, 50)}` : ''}
  </p>
  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
    {refundedCredits} credit{refundedCredits !== 1 ? 's' : ''} refunded
  </p>
</div>
```

Where `refundedCredits` is computed from the failed jobs in the group:
```tsx
const refundedCredits = group.jobs
  .filter(j => j.status === 'failed')
  .reduce((sum, j) => sum + (j.credits_reserved ?? 0), 0);
```

Also update the `QueuePositionIndicator.tsx` failed state (line 162) to be more explicit about per-image refunds, and the `ActivityFeed.tsx` failed job text to mention refund.

### Files changed
1. `src/components/app/WorkflowActivityCard.tsx` — add refund line to failed group cards
2. `src/components/app/QueuePositionIndicator.tsx` — already says "Credits have been refunded" (no change needed)
3. `src/components/app/ActivityFeed.tsx` — append "· credits refunded" to failed job text

