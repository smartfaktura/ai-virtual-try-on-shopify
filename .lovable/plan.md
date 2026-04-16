

# Fix Feedback Pill — Match Platform's Branded Notification Style

## Problem
The feedback pill uses `bg-card/95 backdrop-blur-sm border border-border/50` (a pale, generic card style) while every other notification on the platform uses `bg-primary text-primary-foreground` (the branded dark pill). The icon, font weight, and button styling also don't match.

Compare:
- **Scene applied pill**: `bg-primary text-primary-foreground text-xs font-medium` with `Camera` icon at `w-3.5 h-3.5`
- **Feedback pill**: `bg-card/95 backdrop-blur-sm border` with `MessageSquare` icon at `w-3 h-3` — visually disconnected

## Changes — `src/components/app/ContextualFeedbackCard.tsx`

### Step 1 pill — match "Scene applied" exactly
- Background: `bg-primary text-primary-foreground` (replace `bg-card/95 backdrop-blur-sm border border-border/50`)
- Icon: `MessageSquare` at `w-3.5 h-3.5` (match Camera icon size)
- Question text: `text-xs font-medium` (match scene hint)
- Answer buttons: `border border-primary-foreground/30 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground` — monochrome but visible against the dark pill
- Dismiss X: `text-primary-foreground opacity-70 hover:opacity-100`
- Shadow: keep `shadow-lg`

### Success pill — same branded style
- Same `bg-primary text-primary-foreground` treatment
- Keep the brief auto-dismiss behavior

### Step 2 expanded panel — keep current card style
- The expanded panel with chips and textarea stays as `bg-card/95` since it's an interactive form, not a notification. This is the right contrast.

### No changes to Freestyle.tsx
- Positioning is already correct

## Single file change
| File | Lines affected |
|------|---------------|
| `src/components/app/ContextualFeedbackCard.tsx` | ~130-170 (step1 + success pill styling) |

