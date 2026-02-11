
## Redesign Bottom Action Bar and Buy Credits Modal

### 1. Bottom Action Bar (FreestylePromptPanel.tsx)

**Current**: Two equal buttons "Upgrade" and "Buy Credits" side by side.
**New layout**:
- **Right side**: "Upgrade Plan" as the primary, prominent button (matches Generate button style with primary color)
- **Left side**: The amber warning message stays, but "Buy Credits" becomes a subtle text link that opens the modal to the Top Up tab
- This makes the upgrade path the clear primary CTA, with top-up as a secondary option

### 2. Buy Credits Modal -- Complete Redesign (BuyCreditsModal.tsx)

Redesign for a spacious, Apple-inspired feel:

**Overall changes:**
- Increase modal width from `max-w-xl` to `max-w-2xl`
- More generous padding and spacing throughout
- Cleaner typography hierarchy
- Remove the balance bar from the top (it clutters the modal -- users already see it in the sidebar)

**Upgrade Plan tab (default for all users):**
- Each plan gets its own clean card in a vertical stack
- Each card shows:
  - Plan name (large, bold) + price prominently (`$79/mo`)
  - Monthly credits clearly stated
  - Top 3-4 features as checkmark list with good spacing
  - "Select Plan" or "Current Plan" button
- Current plan card is subtly dimmed with "Current Plan" label
- Recommended plan has a highlight border and "Recommended" badge
- Enterprise stays as a minimal "Contact Sales" row at bottom
- Generous `gap-4` between cards, `p-6` padding inside cards

**Top Up tab:**
- Keep the 3-column credit pack grid
- Make cards taller with more breathing room (`p-6` instead of `p-4`)
- Larger credit numbers and price display
- Cleaner "Buy" buttons with proper sizing

### Technical Details

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Swap button priority: "Upgrade Plan" becomes primary right button, "Buy Credits" becomes text link |
| `src/components/app/BuyCreditsModal.tsx` | Full redesign: wider modal, remove balance bar, spacious plan cards with clear pricing/features, Apple-clean styling |
