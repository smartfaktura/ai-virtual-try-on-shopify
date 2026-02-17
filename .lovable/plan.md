

## Style "Pro Model" Badge with Brand Colors

### What Changes

Update the "PRO MODEL" badge in the workflow activity cards to use the VOVV.AI brand primary color (dark blue) instead of the current violet/purple styling.

### File to Change

| File | What |
|------|------|
| `src/components/app/WorkflowActivityCard.tsx` | Change badge color classes from `bg-violet-100 text-violet-700 hover:bg-violet-100` to `bg-primary/10 text-primary hover:bg-primary/10` on line 126 |

### Technical Detail

The brand primary color is defined as `--primary: 217 33% 17%` (a refined dark blue). Switching to `bg-primary/10 text-primary` keeps it consistent with how the Pro Model chip is already styled in the Freestyle settings panel (`border-primary/30 bg-primary/10 text-primary`), creating a unified brand look across the app.

