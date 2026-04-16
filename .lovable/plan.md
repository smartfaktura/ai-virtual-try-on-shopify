

# Fix Feedback Pill — Remove Colors, Match Platform Aesthetic

## Problem
The Step 1 pill uses colored text for each button (green "Nailed it", amber "Almost", red "Not quite") which feels unbranded and not premium. The platform uses a monochrome, minimal aesthetic.

## Changes

### `src/components/app/ContextualFeedbackCard.tsx`

**Step 1 buttons** — Replace colored borders/text with uniform monochrome styling:
- All three buttons: `border-border/50 text-foreground/70 hover:bg-muted hover:text-foreground`
- No green, amber, or red — just subtle neutral borders matching the platform's muted chip style

**Step 2 panel** — Already uses `bg-primary` for selected chips which is fine (uses theme primary, not a raw color). No changes needed.

**Success pill** — Already monochrome. No changes needed.

### Files
| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Lines 154-158: replace per-key color classes with uniform neutral styling |

