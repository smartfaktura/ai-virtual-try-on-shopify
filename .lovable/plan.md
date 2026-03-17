

## Clean Up Settings "Current Plan" Card

The card currently stacks too many text rows vertically — plan name, badges, price line, switch-to-annual link, separator, credits label, credits bar, reset date, and billing button — making it feel cluttered.

### Changes (single file: `src/pages/Settings.tsx`)

1. **Combine plan header row** — put plan name, badges, AND the price/credits/renewal info on fewer lines using a tighter layout:
   - Row 1: "Current Plan" + badges inline
   - Row 2: `$39/mo • 500 credits/month • Renews Apr 17, 2026` (keep as-is, this is fine)
   - Row 3: "Switch to annual" link (keep, but only when applicable)

2. **Merge credits section into a single compact row** — instead of stacking label, bar, and reset date vertically:
   - Single row: "Credits Remaining" label on left, `500 / 500` on right, with the progress bar below
   - Move the reset/access date to a subtle inline note next to the credits count or below the bar (single line, not a separate block)

3. **Remove the extra `<Separator />`** between plan info and credits — use spacing alone to visually separate, reducing visual clutter

4. **Tighten vertical spacing** — reduce `space-y-4` to `space-y-3` on the card content, and reduce inner gaps

The result will be a more compact card that shows the same information without feeling like a wall of text rows.

