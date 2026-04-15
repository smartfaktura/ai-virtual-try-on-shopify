

# Upload 24 Scarves Editorial Scenes

## Summary
Insert 24 new editorial scenes for the `scarves` category collection (currently has 21 scenes with `category_sort_order: 16`). Organized into 6 sub-categories (4 scenes each). Update `category_sort_order` from 16 to 20 per RTF spec.

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (4 each) |
|---|---|---|
| Editorial Headscarf Portraits (01-04) | 1 | scarf-editorial-headscarf-portrait, scarf-sunglasses-headscarf-closeup, scarf-window-shadow-headscarf, scarf-side-profile-headwrap |
| Neck Knot & Tailored Styling (05-08) | 2 | scarf-neck-bow-editorial, scarf-soft-knot-collarbone, scarf-open-blazer-tailored, scarf-hand-adjusting-knot |
| Movement & Fabric Gesture (09-12) | 3 | scarf-floating-windowlight, scarf-arm-drape-studio, scarf-hand-toss-motion, scarf-windlift-outdoor-fashion |
| Social-Luxury Scarf Moments (13-16) | 4 | scarf-city-selfie-luxury, scarf-coastal-headscarf-getaway, scarf-coffee-run-overhead, scarf-courtyard-luxury-selfportrait |
| Styled Scarf Still Life (17-20) | 5 | scarf-folded-color-stack, scarf-perfume-tray-stilllife, scarf-packaging-unboxing-luxury, scarf-bag-handle-accessory-style |
| Color Story & Campaign Statements (21-24) | 6 | scarf-aesthetic-color-portrait, scarf-aesthetic-color-stilllife, scarf-dark-campaign-portrait, scarf-iconic-hero-finale |

## Technical Details
- **sort_order**: starts at 2813 (current global max is 2812)
- **category_collection**: `scarves`
- **category_sort_order**: update all scarves scenes from `16` to `20` per RTF
- **Scenes 1-4**: `personDetails` + `stylingDetails` + `visualDirection` + `layout` + `detailFocus`; scene 3 swaps `stylingDetails` for `sceneEnvironment`; outfit_hint for all 4
- **Scenes 5-8**: `personDetails` + `stylingDetails` + `visualDirection` + `layout` + `detailFocus`; outfit_hint for all 4
- **Scenes 9-12**: scene 9 is product-only (`sceneEnvironment, visualDirection, layout, detailFocus, motionCue` — no personDetails, no outfit_hint); scenes 10-12 have `personDetails` + outfit_hint; scenes 11-12 include `sceneEnvironment` + `motionCue`; scene 10 has no `sceneEnvironment`
- **Scenes 13-16**: lifestyle; `personDetails` + `sceneEnvironment` + `stylingDetails` + `visualDirection` + `layout`; outfit_hint for all 4
- **Scenes 17-20**: still life, no `personDetails`, no `outfit_hint`; scenes 17-19 use `sceneEnvironment, visualDirection, layout, detailFocus`; scene 20 adds `stylingDetails`
- **Scenes 21-22**: `aestheticColor` trigger; scene 21 has `personDetails` + outfit_hint; scene 22 is still life (no personDetails); `suggested_colors` = `[{"name":"Pale Sage","hex":"#A8B5A1"}]`
- **Scenes 23-24**: campaign; scene 23 has `personDetails, visualDirection, layout, detailFocus` + outfit_hint; scene 24 has `personDetails, sceneEnvironment, stylingDetails, visualDirection, layout, detailFocus` + outfit_hint
- Scene types: editorial (1-12, 21), lifestyle (13-16), stilllife (17-20), campaign (23-24)
- Full prompt templates extracted from RTF

## Execution
1. UPDATE existing 21 scarves scenes: set `category_sort_order = 20`
2. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, outfit hints, and suggested colors

