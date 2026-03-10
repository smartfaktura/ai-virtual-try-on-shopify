

## Make "Share Feedback" Look Like a Clickable Button

The trigger is currently styled as plain text (`text-xs font-semibold text-primary`). Change it to a small outlined button with border, padding, and hover state so it reads as interactive.

### Change

**`src/components/app/FeedbackBanner.tsx`** — Replace the plain text trigger with a styled button:

```tsx
// Before (line ~72)
<button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
  Share feedback
</button>

// After
<Button variant="outline" size="sm" className="rounded-full text-xs font-semibold px-4 h-8">
  Share feedback
</Button>
```

Uses the existing `Button` component (already imported) with `variant="outline"` and `rounded-full` to make it clearly clickable while staying compact.

