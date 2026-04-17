
## Goal
Align Freestyle's inline low-credits banner text with the global `LowCreditsBanner` tone — minimum-touch fix.

## Change
**`src/pages/Freestyle.tsx:987`** — Replace banner text:
- From: `"Top up to keep creating with VOVV.AI"`
- To: `"Top up to keep creating premium, brand-ready visuals."`

## Why this works
Both banners now share the same value-focused phrasing ("premium, brand-ready visuals"), so a user running low on credits gets a consistent message whether they're on Workflows, Library, or Freestyle. No component refactor needed — just a string swap.

## Out of scope
- Replacing the custom Freestyle banner with `<LowCreditsBanner />` (option a)
- Video page changes (per your direction)

## Acceptance
- 1 string updated in 1 file
- Freestyle low-credits banner tone matches global banner
