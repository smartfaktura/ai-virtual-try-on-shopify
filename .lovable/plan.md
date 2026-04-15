

# Import 24 Beauty & Skincare Scenes into product_image_scenes

## What This Does
Insert 24 new skincare scenes into `product_image_scenes`, mapped to `category_collection = 'beauty-skincare'` (already has 18 existing scenes with `category_sort_order = 2`). New scenes use `category_sort_order = 18` as specified in the RTF. The TITLE_MAP already has `beauty-skincare` mapped to "Beauty & Skincare".

For the 6 Aesthetic Color scenes (19-24), hardcoded "Mineral Sage Mist (#A8B7A1)" references will be replaced with `{{aestheticColor}}` token, and `suggested_colors` set to `[{"hex":"#A8B7A1","label":"Mineral Sage Mist"}]`.

## Scene Summary (24 scenes)

### Sub-Cat 1: Editorial Skincare Product Studio (sub_category_sort_order = 0)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 1 | skincare-editorial-floating-hero | Floating Skincare Hero | editorial | 1801 |
| 2 | skincare-editorial-shadow-surface | Shadow Surface Hero | editorial | 1802 |
| 3 | skincare-editorial-formula-detail | Formula and Packaging Detail | editorial | 1803 |
| 4 | skincare-editorial-formula-smear | Formula Smear Editorial | editorial | 1804 |
| 5 | skincare-editorial-reflection-glass | Reflection Glass Skincare Still | editorial | 1805 |
| 6 | skincare-editorial-grouping-story | Skincare Grouping Story | editorial | 1806 |

### Sub-Cat 2: On-Skin Editorial Rituals (sub_category_sort_order = 1)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 7 | skincare-onskin-cheek-application | Cheek Application Editorial | editorial | 1807 |
| 8 | skincare-dropper-skin-ritual | Dropper Skin Ritual | editorial | 1808 |
| 9 | skincare-neck-shoulder-glow | Neck and Shoulder Glow | editorial | 1809 |
| 10 | skincare-hand-product-beauty | Hand and Product Beauty Detail | editorial | 1810 |
| 11 | skincare-clean-face-portrait | Clean Face Skincare Portrait | editorial | 1811 |
| 12 | skincare-water-skin-ritual | Water and Skin Ritual | editorial | 1812 |

### Sub-Cat 3: Daily Routine / Vanity UGC (sub_category_sort_order = 2)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 13 | skincare-vanity-mirror-routine | Vanity Mirror Routine | lifestyle | 1813 |
| 14 | skincare-sinkside-daily-use | Sinkside Daily Use | lifestyle | 1814 |
| 15 | skincare-bedside-evening-ritual | Bedside Evening Ritual | lifestyle | 1815 |
| 16 | skincare-travel-routine-lifestyle | Travel Skincare Routine | lifestyle | 1816 |
| 17 | skincare-flatlay-routine-essentials | Routine Essentials Flat Lay | lifestyle | 1817 |
| 18 | skincare-spa-counter-lifestyle | Spa Counter Lifestyle | lifestyle | 1818 |

### Sub-Cat 4: Aesthetic Color Skincare Stories (sub_category_sort_order = 3)
| # | scene_id | Title | Type | Sort |
|---|----------|-------|------|------|
| 19 | skincare-color-surface-still | Color Surface Skincare Still | editorial | 1819 |
| 20 | skincare-color-water-ritual | Color Water Ritual Story | editorial | 1820 |
| 21 | skincare-color-beauty-portrait | Color Beauty Portrait | editorial | 1821 |
| 22 | skincare-color-sculptural-set | Color Sculptural Skincare Set | editorial | 1822 |
| 23 | skincare-color-soft-ritual-lifestyle | Color Soft Ritual Lifestyle | lifestyle | 1823 |
| 24 | skincare-color-hero-campaign | Color Hero Skincare Campaign | campaign | 1824 |

## Aesthetic Color Handling (Scenes 19-24)
- All hardcoded "Mineral Sage Mist (#A8B7A1)" and "Mineral Sage Mist" in prompt templates replaced with `{{aestheticColor}}`
- `= Mineral Sage Mist (#A8B7A1)` assignment pattern removed (token stays dynamic)
- `suggested_colors` set to `[{"hex":"#A8B7A1","label":"Mineral Sage Mist"}]`

## Outfit Hints
- On-Skin Editorial Rituals (7-12): "Minimal beauty styling with bare or clean skin focus, soft robe or towel only if contextual, no heavy makeup or distracting accessories."
- Daily Routine / Vanity UGC (13-18): "Relaxed premium self-care styling with clean basics, soft robe or towel, natural hair, and nothing that distracts from the skincare ritual."
- Aesthetic Color scenes with model (20, 21, 23, 24): "Minimal beauty styling with {{aestheticColor}} accents in the environment only — robe, towel, or backdrop tones."
- Editorial Product Studio (1-6) and still-life color scenes (19, 22): No outfit hint (NULL)

## Key Fields (all 24 rows)
- `category_collection = 'beauty-skincare'`, `category_sort_order = 18`
- Full `prompt_template`, `trigger_blocks` from RTF
- `is_active = true`, `requires_extra_reference = false`, `use_scene_reference = false`

## Implementation
Single batch INSERT via the database insert tool with all 24 rows. No code changes needed.

