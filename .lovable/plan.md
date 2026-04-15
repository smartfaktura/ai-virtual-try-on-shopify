

# Fix Overlapping Badge Pills

## Problem
Badge pills overlap on Product Visuals, Virtual Try-On, and Product Listing cards (only 8% gap between `bottom: 26%` and `bottom: 18%`). Picture Perspectives and Catalog Studio also need more spacing between their pills.

## Changes in `src/components/app/workflowAnimationData.tsx`

**Product Visuals, Virtual Try-On, Product Listing** (lines 88/92, 110/114, 128/132):
- First badge: `bottom: '26%'` → `bottom: '28%'` 
- Second badge: `bottom: '18%'` → `bottom: '16%'`
- Gap increases from 8% to 12%

**Selfie / UGC** — same fix pattern for its two bottom elements

**Picture Perspectives** (lines 253/257) and **Catalog Studio** (lines 282/286) — use matching positions with more space:
- First badge: `bottom: '20%'`
- Second badge: `bottom: '8%'`
- Gap increases from 10% to 12%, same positions on both cards

## Impact
- 1 file, position value tweaks across 6 workflow scenes
- Consistent non-overlapping pill layout

