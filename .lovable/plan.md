
## Improve Buy Credits Modal UX

### Issues Found

**Top Up Tab:**
1. No price anchoring -- users can't quickly compare value across packs
2. "Buy" CTA is too generic and doesn't reinforce what they're getting
3. No visual hierarchy beyond the "Best Value" badge -- all cards feel equal
4. Missing savings indicator on the larger pack vs. the smallest

**Plans Tab:**
5. "Downgrade" CTA on lower plans feels negative and discouraging -- users on Growth see "Downgrade" on Free and Starter which is off-putting
6. The Growth card shows two prices ($79/mo crossed out style + $63/mo annual) but the annual price hierarchy is confusing -- the monthly price appears first at the top
7. No crossed-out monthly price when annual is selected to anchor the savings
8. Feature lists start with "Everything in X" which wastes a line on redundant info in a compact modal
9. Free plan shows "$0/mo" which looks odd -- better as "Free" or "Free forever"
10. No urgency or social proof element

### Proposed Changes

**File: `src/components/app/BuyCreditsModal.tsx`**

**Top Up tab improvements:**
- Add per-credit cost under each pack (e.g., "7.5c/credit", "5.8c/credit", "4.6c/credit") so users can compare value
- Show a "Save X%" label on the 500 and 1500 packs relative to the smallest pack
- Change "Buy" CTA to "Buy 200 credits", "Buy 500 credits", etc. for clarity
- Add a subtle "Most popular with creators" note under the Best Value pack

**Plans tab improvements:**
- When annual billing is selected, show the monthly price crossed out above the annual-equivalent price to anchor the savings (e.g., ~~$79~~ $63/mo)
- Replace "Downgrade" label on lower plans with just the plan name ("Get Free", "Get Starter") to reduce negative friction -- the PlanChangeDialog already handles the downgrade confirmation
- For the Free plan, display "Free" instead of "$0/mo"
- Replace "Everything in X" feature lines with the actual distinguishing feature to maximize information density (e.g., Starter's first feature becomes "Try-On mode" instead of "Everything in Free")
- Add a small "billed annually" or "billed monthly" note under the price

**File: `src/data/mockData.ts`**

- Update feature lists to remove "Everything in X" entries and replace with actual differentiating features:
  - Starter: "Try-On mode", "3 Brand Profiles", "Up to 10 products", "High quality images"
  - Growth: "Priority queue", "10 Brand Profiles", "Up to 100 products", "All workflows"
  - Pro: "Video Generation", "Creative Drops", "Unlimited profiles", "Unlimited products"

### Technical Details

All changes are UI-only in two files:
- `src/components/app/BuyCreditsModal.tsx` -- rendering logic for price anchoring, CTA labels, savings badges
- `src/data/mockData.ts` -- updated feature arrays for plan cards

No new dependencies, no database changes, no new components needed.

### Files Modified
- `src/components/app/BuyCreditsModal.tsx` -- price anchoring, smarter CTAs, savings indicators
- `src/data/mockData.ts` -- feature list improvements
