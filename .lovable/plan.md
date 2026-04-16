

# Fix Layer 1 CTA + Enrich Value Drawer

## Problems

1. **Layer 1 CTA "Compare Plans" is wrong** — User just created their first visual, they're excited. "Compare Plans" is cold and transactional. Should be warmer, action-oriented — something like "See Plans" or "Unlock More".

2. **Value Drawer is too flat** — We stripped too much. It went from overcrowded to bare. The header + 3 plan cards + compare link feels like a pricing table, not a conversion surface. Need to add back a light value message without going overboard.

## Files to Change

| File | Change |
|------|--------|
| `src/components/app/PostGenerationUpgradeCard.tsx` | Change CTA from "Compare Plans" to "See Plans" — shorter, softer, curiosity-driven |
| `src/components/app/UpgradeValueDrawer.tsx` | Add a compact value line between header and plan cards: the "1,000+ editorial shots · Monthly campaign drops" message as a subtle highlighted row. Also add a small "What's included" list (3 bullet points) below subline to give the drawer more substance without bloat |

## Detailed Changes

### PostGenerationUpgradeCard.tsx
- Line 107: `Compare Plans` → `See Plans`

### UpgradeValueDrawer.tsx
Between the header and "Choose your plan", add:

1. **Value highlight row** — a soft background row with the key selling points:
   - "1,000+ editorial shots · Monthly campaign drops · Priority generation"
   - Style: `rounded-xl bg-muted/20 border border-border/40 p-3`, single line of `text-xs text-muted-foreground`

2. **3 compact benefit lines** under the subline (inside header area):
   - "1,000+ personalized editorial shots"
   - "Monthly campaign drops for social and marketing"  
   - "Priority processing and batch generation"
   - Style: small check icons + `text-xs`, no cards, no borders — just clean icon+text rows with `space-y-1.5`

This adds ~80px of useful context without overwhelming the single-screen layout.

