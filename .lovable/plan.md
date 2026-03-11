

## Redesign: Buy Credits Modal (Plans Tab)

### Problems
1. The "You're on Pro — billed monthly / Switch to annual & save 20%" banner looks awkward — it's a flat, sparse row that doesn't feel cohesive
2. The billing toggle + banner + plan cards create too many separate visual layers with inconsistent spacing
3. On mobile (390px), the tab underline indicator is thin and the layout feels disconnected

### Design Changes

**1. Merge the billing status banner into a richer header block**
- Replace the flat border banner with a compact, visually cohesive card that integrates the current plan badge, billing interval, and the annual switch CTA into a single styled block
- Use a subtle gradient or tinted background (`bg-primary/5`) with the plan icon, making it feel like a status card rather than a generic row
- Format: `Pro Plan · Monthly billing` on the left, `Save 20% with annual →` as a pill-button on the right

**2. Simplify the billing toggle**
- Move the Monthly/Annual toggle into the merged header card (below the plan status line) to reduce vertical stacking
- This eliminates one entire visual section

**3. Improve the tab indicator**
- Change from a thin 2px bottom line to a filled pill-style active tab background (matching the landing page toggle style), making the active tab more obvious

**4. Tighten mobile spacing**
- Reduce gaps between sections from `space-y-5` to `space-y-4`
- Make plan cards slightly more compact on mobile with tighter padding

### Files Changed

**`src/components/app/BuyCreditsModal.tsx`**
- Redesign the Plans tab layout:
  - Replace lines 210-228 (billing status banner) and lines 230-258 (billing toggle) with a single combined status+toggle card
  - Update tab switcher (lines 114-131) to use pill-style active state instead of underline
  - Adjust spacing throughout

