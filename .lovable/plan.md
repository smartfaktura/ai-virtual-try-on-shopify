

# Revert Oversized Typography & Fix Footer

## Problem
The "premium" changes inflated font sizes (plan name `text-lg`, price `text-3xl`, "/mo" `text-lg`) beyond what matches the rest of the app. The footer "Cancel anytime" line uses uppercase tracking-wide which feels off. Need to restore proportional sizing and make footer feel clean but normal.

## Changes — `BuyCreditsModal.tsx`

### 1. Restore card typography to match app scale

| Element | Current | Fix |
|---------|---------|-----|
| Plan name (line 436) | `text-lg font-semibold` | `text-base font-semibold` |
| Price number (line 456) | `text-3xl font-bold` | `text-2xl font-bold` |
| "/mo" suffix (line 457) | `text-lg font-medium` | `text-sm font-normal` |
| "Free" text (line 449) | `text-3xl font-bold` | `text-2xl font-bold` |

### 2. Footer — normal, clean text (not uppercase)

| Element | Current | Fix |
|---------|---------|-----|
| "Cancel anytime" (line 511) | `text-xs text-muted-foreground/60 tracking-wide uppercase font-normal` | `text-xs text-muted-foreground font-medium` (normal case, no tracking) |
| "All paid plans include..." (line 514) | `text-[11px] text-muted-foreground/50` | `text-xs text-muted-foreground/70` (same size as above, slightly softer) |

### 3. Same changes in `NoCreditsModal.tsx`
Apply matching typography fixes to keep both modals consistent.

## Result
Card text scales proportionally with the rest of the app. Footer reads naturally without forced uppercase styling.

