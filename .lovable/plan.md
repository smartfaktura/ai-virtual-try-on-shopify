

# Upload 24 Earrings Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `jewellery-earrings` category collection (currently has 21 "Essential Shots"). Organized into 6 sub-categories. Update `category_sort_order` from 32 to 19 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (4 each) |
|---|---|---|
| Product Studio (01-04) | 1 | floating-pair-studio, torn-paper-studio, shadow-hero-studio, close-hero-detail |
| On-Ear Editorial (05-08) | 2 | side-profile-editorial, hair-tucked-ear, neckline-editorial, ear-stack-editorial |
| Beauty Lifestyle UGC (09-12) | 3 | sunlit-beauty-lifestyle, outdoor-beauty-ugc, relaxed-portrait-lifestyle, candid-beauty-closeup |
| Jewelry Still Life (13-16) | 4 | stone-sand-stilllife, window-shadow-stilllife, waterlight-stilllife, silk-paper-stilllife |
| Color Earring Stories (17-20) | 5 | aesthetic-color-still, aesthetic-floating-story, aesthetic-beauty-story, aesthetic-sculptural-set |
| Macro Campaign (21-24) | 6 | extreme-ear-campaign, sun-sculpted-campaign, water-ripple-campaign, iconic-campaign-finisher |

## Technical Details
- **sort_order**: RTF specifies 1901-1924 (will use those as-is since they're category-specific)
- **category_collection**: `jewellery-earrings` (existing collection name)
- **category_sort_order**: update all earrings scenes to `19` (currently 32)
- **Aesthetic color scenes** (17-20): `suggested_colors` = `[{"name":"Soft Lavender Mist","hex":"#C8C1D6"}]`
- **outfit_hint**: scenes 5-12 (on-ear/UGC), scene 19 (color beauty story), scenes 21-22, 24 (macro campaign) have outfit directions; scenes 1-4, 13-18, 20, 23 have no outfit hint
- **trigger_blocks**: mapped per scene from RTF
- Full prompt templates extracted from document

## Execution
1. UPDATE existing 21 earrings scenes: set `category_sort_order = 19`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, outfit hints, and suggested colors

