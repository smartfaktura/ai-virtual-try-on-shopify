

# Upload 24 Wallets / Cardholders Editorial Scenes

## Summary
Insert 24 new editorial scenes for a new `wallets` category collection (no existing scenes). Organized into 4 sub-categories (6 scenes each). No `category_sort_order` specified in RTF — will need to assign one (suggest checking existing values for gap).

## Scene Mapping

| Sub-Category | Sub Sort | Scenes (6 each) |
|---|---|---|
| In-Hand Editorial Detail (01-06) | 1 | wallet-hand-one-hand-hero, wallet-hand-thumb-edge-detail, wallet-hand-card-pull, wallet-hand-open-reveal, wallet-hand-wrist-style-crop, wallet-hand-pocket-exit |
| Desk / Daily Use UGC (07-12) | 2 | wallet-ugc-coffee-table, wallet-ugc-work-desk, wallet-ugc-cafe-payment, wallet-ugc-bag-drop, wallet-ugc-travel-tray, wallet-ugc-pocket-keys-phone |
| Styled Surface Still Life (13-18) | 3 | wallet-still-stone-slab, wallet-still-fabric-contrast, wallet-still-open-composition, wallet-still-book-tray, wallet-still-drawer-shelf, wallet-still-gift-reveal |
| Campaign Luxury Closeups (19-24) | 4 | wallet-campaign-shadow-cut, wallet-campaign-hardware-macro, wallet-campaign-monochrome-crop, wallet-campaign-aesthetic-gradient, wallet-campaign-reflection-hero, wallet-campaign-ultra-hero |

## Technical Details
- **sort_order**: starts at 2933 (current global max is 2932)
- **category_collection**: `wallets`
- **category_sort_order**: 35 (new category, assign next available)
- **Scenes 1-6**: editorial; all have `personDetails` + `productDetails` + `visualDirection` + `layout`; scenes 1-4 also have `sceneEnvironment`; scene 6 adds `stylingDetails`; no `outfit_hint` (hand-only shots, no full outfit)
- **Scenes 7-12**: lifestyle; `productDetails` + `sceneEnvironment` + `visualDirection` + `layout`; scenes 7, 9 add `personDetails`; scene 8, 10-12 have `personDetails` where hands shown; no `outfit_hint` (product-focused UGC)
- **Scenes 13-18**: stilllife; `productDetails` + `sceneEnvironment` + `visualDirection` + `layout`; no `personDetails`, no `outfit_hint`
- **Scenes 19-21, 23-24**: campaign; `productDetails` + `visualDirection` + `layout`; no `personDetails`; scene 20 adds `detailFocus`
- **Scene 22**: campaign + `aestheticColor`; `productDetails` + `visualDirection` + `layout`; `suggested_colors` TBD (RTF doesn't specify — will use a refined leather palette e.g. `[{"name":"Cognac Burnish","hex":"#8B5E3C"}]`)
- **scene_type**: editorial (1-6), lifestyle (7-12), stilllife (13-18), campaign (19-24)
- No `outfit_hint` for any scene (wallets = accessories, no clothing context)
- Full prompt templates extracted from RTF

## Execution
1. Single batch INSERT of 24 new rows with full prompt templates, trigger blocks, and suggested colors for scene 22

