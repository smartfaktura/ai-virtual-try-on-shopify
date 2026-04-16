

# Restyle Contextual Survey to Match FeedbackBanner Design

## Problem
The contextual survey (pill with "HELP US IMPROVE" + Yes/Almost/No) uses a different visual style than the FeedbackBanner at the bottom ("Help us improve VOVV.AI" + "Share feedback" button). The user wants them to match.

## Target Style (from FeedbackBanner)
- `bg-primary/5 border border-primary/20 rounded-xl px-4 py-3`
- Left side: icon + text in `text-muted-foreground`
- Right side: `Button variant="outline" size="sm" className="rounded-full"`
- Clean banner bar layout, not a floating pill

## Changes to `ContextualFeedbackCard.tsx`

### Step 1 — Restyle to banner bar
Replace the current muted pill with the FeedbackBanner's card style:
- Container: `bg-primary/5 border border-primary/20 rounded-xl px-4 py-3` (instead of `bg-muted/80 backdrop-blur-sm border-border/50 rounded-full`)
- Left: `MessageSquarePlus` icon (matching FeedbackBanner) + question text in `text-sm text-muted-foreground`
- Right: Yes/Almost/No buttons styled as outline pills matching the "Share feedback" button aesthetic
- Remove the floating centered layout (`flex justify-center`) — make it full-width like FeedbackBanner
- Remove the "HELP US IMPROVE" uppercase label (the banner style conveys this implicitly)
- Keep dismiss X button on the right

### Step 2 — Match banner style  
- Same `bg-primary/5 border border-primary/20 rounded-xl` container
- Chips and textarea inside, consistent with the banner aesthetic

### Success state
- Same banner container style with the thank you message

### Mobile
- Stack naturally within the banner card (question on top, buttons below) — same responsive pattern as current but with new colors

## File
| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Lines 130-252: Restyle all steps to use `bg-primary/5 border-primary/20 rounded-xl` banner style matching FeedbackBanner |

