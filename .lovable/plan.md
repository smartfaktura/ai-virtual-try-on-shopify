

# Dynamic Header + Premium Polish for Pricing Popup

## Problem
1. Header always says "You're out of credits" even when user has credits and is browsing voluntarily
2. Popup could feel more premium with subtle refinements

## Changes

### File: `src/components/app/BuyCreditsModal.tsx`

**1. Dynamic headline based on credit state (lines 134-140)**

Replace hardcoded text with conditional logic:

| Condition | Headline | Subtitle |
|-----------|----------|----------|
| `balance === 0` (free user) | You're out of credits | Pick a plan to keep creating |
| `balance === 0` (paid user) | You've used all your credits | Top up or upgrade your plan |
| `balance > 0` (free user) | Upgrade your creative power | Unlock faster generation and more credits |
| `balance > 0` (paid user) | Get more from VOVV | Top up credits or switch plans |

**2. Premium polish**
- Headline: `text-lg font-semibold tracking-tight` (slightly lighter weight than bold for luxury feel)
- Subtitle: `text-[13px] text-muted-foreground/80` (softer contrast)
- Card borders: `border-border/40` (subtler lines)
- Card padding: tighten inner spacing for cleaner density
- Growth highlight border: `border-primary/40` instead of heavy primary (quieter emphasis)
- "MOST POPULAR" badge: lowercase to `Most popular`, smaller rounded pill with `bg-primary/10 text-primary` (less shouty)
- Footer separator: make border even lighter `border-border/20`

### File: `src/components/app/NoCreditsModal.tsx`

**3. Same dynamic headline logic** — this modal always shows when credits = 0, so keep "You're out of credits" but apply the same premium styling refinements (font weights, border softness, badge styling).

## Summary

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | Dynamic headline by credit state, premium styling refinements |
| `NoCreditsModal.tsx` | Matching premium styling updates |

