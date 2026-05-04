## Bug

When a preset is applied to all shots via the top-level bar, `handleApplyToAll` stores each scene's config in `outfitConfigByScene`. But the per-scene `ZaraOutfitPanel` receives `globalPresetName={perSceneCfg ? undefined : appliedPresetName}` — since `perSceneCfg` is now truthy (it was just set), the preset name is always `undefined`, so Quick Styles pills never highlight.

## Fix

**`src/components/app/product-images/ProductImagesStep3Refine.tsx`** (line 2906)

Change:
```
globalPresetName={perSceneCfg ? undefined : (details as any).appliedPresetName}
```
To:
```
globalPresetName={(details as any).appliedPresetName || undefined}
```

Always pass the global preset name regardless of whether `perSceneCfg` exists — the config was set from that preset. When the user manually edits a slot, `ZaraOutfitPanel` already clears `singlePresetName` internally.
