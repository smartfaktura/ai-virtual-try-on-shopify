

# Redesign NoCreditsModal — Plan-Aware Logic

## Summary
Completely rework the modal to show different content based on user's current plan, matching the wireframe layout. Free plan is never shown. The modal becomes a unified experience with plan-aware sections.

## Logic by Plan

| Current Plan | What Modal Shows |
|---|---|
| **Free** | 3 subscription cards (Starter, Growth, Pro) + billing toggle. No top-up packs. No free plan card. |
| **Starter** | Credit top-up packs + upgrade nudge to Growth (with plan card preview) |
| **Growth** | Credit top-up packs + upgrade nudge to Pro (with plan card preview) |
| **Pro** | Credit top-up packs + Enterprise contact CTA (no upgrade cards) |

## Header (all states)
Match wireframe: show credit balance in header (`{balance} credits remaining`), headline ("Choose a plan to keep creating with VOVV"), subline ("Create more visuals, faster — with better value on larger plans"), billing toggle (for free users).

## Layout per state

### Free users
- Billing toggle (Monthly / Annual -20%)
- 3-col grid: Starter → Growth (highlighted) → Pro
- Each card: Plan name, price/mo, credits, ~images, key differentiators (2-3 bullets), "Choose" CTA
- Footer: "Compare all features →" and "Contact Sales →"

### Starter/Growth users (has upgrade path)
- **Top section**: Credit top-up packs (3 cards, same as now)
- **Bottom section**: Upgrade nudge — but instead of just a text bar, show a compact plan card for the next tier with key stats (price, credits, ~images, 2 bullets) and "Upgrade to {Plan}" CTA
- Footer: "Compare all features →" and "Contact Sales →"

### Pro users (top tier)
- **Top section**: Credit top-up packs (3 cards)
- **Bottom section**: Enterprise CTA bar ("Need more? Talk to our team" + "Contact Sales" button linking to mailto:hello@vovv.ai)
- Footer: "Compare all features →" and "Contact Sales →"

## Files Changed

| File | Change |
|---|---|
| `src/components/app/NoCreditsModal.tsx` | Full rewrite of content sections with plan-aware logic, show balance in header, upgrade card for starter/growth, enterprise CTA for pro |

## Technical Details

- Use `balance` from `useCredits()` for the header line
- For starter/growth upgrade section: filter `subscribablePlans` to find the next plan using `PLAN_CONFIG[plan].nextPlanId`
- For pro: render a simple enterprise contact bar instead of upgrade nudge
- Free users: keep existing billing toggle + 3-plan grid (already excludes free plan)
- Remove the old `upgradeNudge` text-only bar, replace with richer upgrade card
- Mobile: Growth-first reorder stays for free users; for paid users top-up packs stack naturally

