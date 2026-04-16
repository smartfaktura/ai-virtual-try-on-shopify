

# Fix Value Drawer + Update All Copy

## 3 Problems to Fix

1. **Value Drawer doesn't fit** — too much content for a single view. The 4 sections (header, unlock grid, why upgrade, plan cards) push below the fold.
2. **"What you can create next" is weak** — generic chips like "Studio", "On-Model" don't convey the scale. Should reference 1,000+ personalized shots and monthly campaign drops.
3. **Price label says `¢/img` but should say `¢/cr`** — it's per credit, not per image.

## Additional: Full Copy Update

Update all L1 headlines, sublines, value block titles, and L3 headlines per the provided category-specific copy.

## Files to Change

| File | Change |
|------|--------|
| `src/lib/conversionCopy.ts` | Update all L1 headlines/sublines/value block titles per new copy. Update L3 headlines. Replace L2 unlock section with stronger messaging about 1,000+ shots + campaign drops. |
| `src/components/app/UpgradeValueDrawer.tsx` | Fix `¢/img` → `¢/cr`. Make drawer scrollable and more compact — tighten spacing, reduce plan card padding, collapse "Why brands upgrade" into 2×2 grid instead of 4 rows. Replace "What you can create next" chips with a stronger 2-line message about 1,000+ personalized editorial shots + monthly campaign drops. |
| `src/pages/AdminConversion.tsx` | Update reference table to reflect new copy |

## Detailed Changes

### Copy Updates (conversionCopy.ts)

**L1 per category** (removing "Nice —" prefix, updating sublines and value block titles):

| Cat | Headline | Subline | Value Blocks |
|-----|----------|---------|--------------|
| fashion | Your first fashion direction is ready | Keep creating with more credits, better value, and faster workflows | More Looks · Better Value · Faster Launches |
| beauty | Your first beauty visual is ready | Create more skincare content with stronger value and faster production | More Placements · Better Value · Faster Campaigns |
| jewelry | Your first jewelry visual is ready | Scale into more angles, more assets, and better production value | More Angles · Better Value · Faster Output |
| fragrances | Your first fragrance visual is ready | Create more concepts with better value and faster campaign production | More Concepts · Better Value · Faster Campaigns |
| food | Your first food visual is ready | Create more content for menus, ads, and social with better efficiency | More Content · Better Value · Faster Refreshes |
| electronics | Your first product visual is ready | Create more launch-ready assets with better value and faster workflows | More Assets · Better Value · Faster Launches |
| home | Your first home visual is ready | Create more room and catalog content with better value and speed | More Scenes · Better Value · Faster Refreshes |
| accessories | Your first accessory visual is ready | Create more variations with better value and faster brand production | More Variations · Better Value · Faster Output |
| fallback | Your first visual is ready | Keep creating with more credits, better value, and faster workflows | More Content · Better Value · Faster Workflow |

**L3 headlines**: "Build your full [category] visual set" (e.g., "Build your full fashion visual set").

**L2 "What you can create next"**: Replace the 6-chip grid with a stronger text block:
- Primary: "Select from 1,000+ personalized editorial shots"
- Secondary: "Plus monthly campaign drops for your social and marketing"
- Keep the category-specific chips below as a compact supporting row (not the headline)

### Drawer Layout Fix (UpgradeValueDrawer.tsx)

- Fix all `¢/img` → `¢/cr` in PLAN_CARDS
- Replace "What you can create next" section: strong headline about 1,000+ shots, keep chips as a subtle supporting grid
- Tighten section spacing from `space-y-5` to `space-y-4`
- Reduce plan card internal padding from `p-4` to `p-3.5`
- "Why brands upgrade" — compact into tighter rows with less vertical gap

### Value Block Detail Text Update

Each `makeValueBlocks` call currently uses generic detail text. The detail text will update to match the new titles (e.g., "More Looks" with detail "Monthly credits to keep creating fashion looks").

