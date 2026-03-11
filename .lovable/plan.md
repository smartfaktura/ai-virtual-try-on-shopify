

## Fix WorkflowActivityCard Mobile Layout

The current layout puts the icon, text, badges ("Pro Model", "Processing"), and cancel button all in a single horizontal `flex items-center` row. On a 390px screen this causes text to wrap vertically and badges to stack awkwardly.

### Active card (Processing/Queued) — changes

**Row 1**: Icon + title text + elapsed time (horizontal, text truncates)
**Row 2**: Inline badges ("Pro · Processing" or "Queued") + estimation text, all in a compact horizontal strip below the title

- Remove the separate "Pro Model" badge and "Processing" badge as two distinct elements
- Combine into a single compact badge: `Pro · Processing` or just `Processing`
- Move the estimation text (`est. ~60-120s per image`) into the same row as the badge, as regular muted text
- Cancel button stays in row 1 (top-right) only when stuck

**Structure**:
```text
┌─────────────────────────────────┐
│ ⟳  Workflow — Product    [Cancel]│
│    Generating… 1m 48s            │
│    ┌──────────────┐ ~60-120s/img │
│    │Pro·Processing│              │
│    └──────────────┘              │
│ ████████░░░░░░░░░  (if batch)   │
└─────────────────────────────────┘
```

### Completed card — changes

Same problem: icon + text + "Completed" badge + "View Results" button + dismiss X all in one row overflows on mobile.

**Fix**: Stack into two rows:
- **Row 1**: Icon + title text + dismiss X
- **Row 2**: "Completed" badge + "View Results" button, right-aligned

```text
┌─────────────────────────────────┐
│ ✓  Generation complete     [×]  │
│    · images ready                │
│    ┌─────────┐  View Results →  │
│    │Completed│                   │
│    └─────────┘                   │
└─────────────────────────────────┘
```

### Failed card — same treatment

- **Row 1**: Icon + title + dismiss X
- **Row 2**: "Failed" badge + "Retry" button

### File changed

**`src/components/app/WorkflowActivityCard.tsx`** — restructure all three card types to use a two-row stacked layout for compact mobile fit. Badges and action buttons move to a second row below the title/status text.

