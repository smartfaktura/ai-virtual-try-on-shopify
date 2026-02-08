
# Upgrade-Focused Credit & Plan Experience in /app

## What Changes

### 1. Redesigned Sidebar Credit Indicator with "Upgrade" CTA

The current sidebar credit area only shows the balance and a "+" button. We will enhance it to also show:
- The current plan name (e.g., "Growth Plan")
- A prominent "Upgrade" button that links to `/app/settings` (plans section)
- The progress bar scaled to the plan's actual credit quota (e.g., out of 2,500 for Growth)

When the sidebar is collapsed, a small upgrade icon will remain visible.

### 2. Redesigned Buy Credits Modal (on "+" click)

The current modal is generic and doesn't reflect the platform's context well. The new modal will have two tabs:

**Tab 1 - "Top Up" (default):**
- Current balance with progress bar showing usage against plan quota
- Current plan badge (e.g., "Growth - 2,500 credits/month")
- The 3 credit packs with better context: show how many standard images each pack equals (e.g., "500 credits = ~125 images")
- "after purchase" total

**Tab 2 - "Upgrade Plan":**
- Show the next tier up from the current plan (e.g., if on Growth, show Pro)
- Highlight the savings vs buying top-ups: "Pro gives you 6,000 credits/month for $179 vs buying 6,000 credits as top-ups for $234"
- Quick upgrade button
- Link to full plan comparison on Settings page

### 3. Current Plan Context in Key Areas

- The `CreditIndicator` component in the sidebar will display the plan name and an upgrade arrow
- The `BuyCreditsModal` will show which plan the user is on and what they unlock by upgrading

---

## Technical Details

### File: `src/components/app/CreditIndicator.tsx`
- Add current plan name display (hardcoded as "Growth" for now, matching Settings page)
- Add "Upgrade" button that navigates to `/app/settings#plans`
- Update progress bar to scale against plan credits (2,500) instead of hardcoded 300
- In collapsed state, show a small crown/arrow-up icon that links to settings

### File: `src/components/app/BuyCreditsModal.tsx`
Full redesign:
- Add Tabs component with "Top Up" and "Upgrade Plan" tabs
- **Top Up tab**: Keep credit packs but add context like "~125 images" per pack, show plan name and usage bar
- **Upgrade Plan tab**: Show current plan vs next plan comparison card. For Growth users, show Pro plan benefits. Highlight cost savings of upgrading vs top-ups. Include "Upgrade Now" button and "Compare all plans" link to settings
- Update the bottom CTA from generic "Need more credits regularly?" to show a calculated savings message

### File: `src/components/app/NoCreditsModal.tsx`
- Update the "Upgrade to Growth Plan" text to show dynamic plan info
- Change "500 credits/month" to correct "2,500 credits/month" for Growth

### File: `src/components/app/AppShell.tsx`
- Import `useNavigate` is already available
- Pass navigation capability to `CreditIndicator` for the upgrade button

No new dependencies needed. All changes use existing UI components (Tabs, Badge, Button, Progress, Separator).
