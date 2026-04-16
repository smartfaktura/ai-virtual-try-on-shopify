

# Tone Down Feedback Pill — Subtle Secondary Style

## Problem
The survey bar uses `bg-primary text-primary-foreground` — the same treatment as primary buttons and CTAs. This makes it visually dominant, competing with the actual page content ("Your visuals are ready", the generated images, action buttons). A feedback prompt should feel like a gentle nudge, not a main UI element.

## Solution
Switch from the bold primary background to a subtle muted style that reads as a secondary notification:

### Step 1 pill
- **Background**: `bg-muted/80 backdrop-blur-sm` — soft, recessive, blends with the page
- **Text**: `text-muted-foreground` — subdued, not demanding attention
- **Icon**: `text-muted-foreground/70` — even quieter
- **Buttons**: `border-border text-foreground/60 hover:bg-background hover:text-foreground` — subtle outline chips
- **Dismiss X**: `text-muted-foreground/50 hover:text-muted-foreground`
- **Shadow**: `shadow-sm` instead of `shadow-lg` — less elevation = less importance
- **Border**: `border border-border/50` — gentle definition

### Success pill
- Same muted treatment: `bg-muted/80 text-muted-foreground` — a quiet "thanks" that fades away

### Step 2 expanded panel
- Already uses `bg-card/95` which is fine — no change needed

## Result
The pill becomes a soft, secondary element that's noticeable but doesn't steal focus from the generated images and action buttons.

## File
| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Lines 131-167: Update Step 1 and Success pill classes from primary to muted styling |

