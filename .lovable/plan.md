

# Upload 24 Bracelet Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `bracelets` category collection (currently empty — no existing scenes). Organized into 4 sub-categories (families).

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (6 each) |
|---|---|---|
| On-Wrist Editorial (01-06) | 1 | wrist-clean-portrait, wrist-collarbone, fingers-face-editorial, sleeve-wrist-detail, two-wrist-composition, bent-arm-beauty |
| Daily Wear UGC (07-12) | 2 | ugc-coffee-cup, ugc-desk-hand, ugc-phone-hand, ugc-book-journal, ugc-travel-wrist, ugc-mirror-wrist |
| Styled Surface Still Life (13-18) | 3 | still-stone-surface, still-silk-linen, still-box-tray, still-book-paper, still-glass-reflection, still-sculptural-object |
| Aesthetic Color Bracelet Stories (19-24) | 4 | color-wrist-editorial, color-desk-story, color-surface-still, color-reflection-story, color-fabric-mood, color-hero-campaign |

## Technical Details
- **sort_order**: starts at 2573 (current max is 2572)
- **category_collection**: `bracelets`
- **category_sort_order**: needs to be determined — will check existing collections and assign next available
- **trigger_blocks**: Scenes 1-12 use `personDetails`, scenes 13-18 are still life (no person), scenes 19-24 use `aestheticColor`
- **Aesthetic color scenes** (19-24): Each has a unique `suggested_colors`:
  - 19: Soft Rose Clay `#D7B6AE`
  - 20: Warm Stone Taupe `#B7A79A`
  - 21: Pistachio Smoke `#B9C3AE`
  - 22: Smoky Lilac Grey `#B8AFBF`
  - 23: Champagne Sand `#D9C8B2`
  - 24: Deep Olive Slate `#7D8774`
- **No outfit_hint** on any scene (jewelry category)
- Full prompt templates extracted from RTF

## Execution
1. Single batch INSERT of 24 rows with full prompt templates, trigger blocks, and suggested colors
2. No UPDATE needed (no existing bracelet scenes)

