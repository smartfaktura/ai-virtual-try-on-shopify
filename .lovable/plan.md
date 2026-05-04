
# Per-Scene Outfit Direction with Smart Defaults

## Problem

The Style & Outfit card has two different UIs depending on `outfit_hint` presence. Mixed selections are confusing. Users can't see or control outfit per scene.

## User experience

### Default state (zero clicks)

The card shows a vertical list of all on-model scenes. Each scene shows its current outfit source:

```text
Style & Outfit
Each shot has an outfit direction. Edit individually or apply one look to all.

[Apply one outfit to all shots]

  ┌──────────────────────────────────────────────┐
  │ [scene img]  Urban Street Walk               │
  │              Styled by AI · Coastal Minimal   │
  │                                     [Edit ▾]  │
  ├──────────────────────────────────────────────┤
  │ [scene img]  Shadowed Wall Evening            │
  │              Shot styled · Elegant draping,   │
  │              monochrome neutral palette…       │
  │                                     [Edit ▾]  │
  ├──────────────────────────────────────────────┤
  │ [scene img]  Sunlit Skin Hero                 │
  │              Shot styled · No additional       │
  │              clothing, sunlight and body only  │
  │                                     [Edit ▾]  │
  └──────────────────────────────────────────────┘
```

**Scenes without `outfit_hint`** show "Styled by AI" + the auto-picked preset name (e.g. "Coastal Minimal", "Summer Casual"). These are the existing `pickDefaultPreset` results.

**Scenes with `outfit_hint`** show "Shot styled" + a smart summary of the hint text. Since hints are long prompt-level briefs (e.g. 500+ chars about draping, accessories, hair), the UI extracts the first meaningful sentence and truncates to ~60 chars with ellipsis. The full hint is never shown raw — it's a prompt directive, not user copy.

The summary extraction logic:
1. Strip template tokens (`{{productName}}`, `[PRODUCT IMAGE]`)
2. Take the first sentence or line
3. Lowercase, truncate at ~60 chars
4. Example: "Build a cohesive premium activewear look..." becomes "Premium activewear look, minimal sport-forward styling..."
5. For very short hints like "No additional clothing. Shadow and body only." — show as-is

### Editing a single scene

Tapping "Edit" expands accordion-style:
- OutfitPresetBar (quick preset loading for that scene)
- ZaraOutfitPanel (full slot-by-slot editor)
- For "Shot styled" scenes: a "Reset to shot direction" link to restore the original hint
- Changes stored in `outfitConfigByScene[scene.id]`
- Source pill updates to "Custom" after editing

### Apply to all shots

"Apply one outfit to all shots" opens a single ZaraOutfitPanel. The configured outfit applies to every on-model scene. All rows update to show "Custom". A "Reset all to defaults" link restores AI picks and shot directions.

### Custom note

The "Custom styling note" textarea stays at the bottom, applied globally.

---

## Technical details

### 1. New type: `outfitConfigByScene`

**File: `src/components/app/product-images/types.ts`**

Add to `DetailSettings`:
```typescript
outfitConfigByScene?: Record<string, OutfitConfig>;
```

### 2. UI rewrite

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

**Remove:**
- The `allModelScenesHaveOutfitHint` ternary (lines ~2585-2701)
- The auto-enable `useEffect` for `outfitOverrideEnabled` (lines ~2191-2195)
- AI Stylist card (`AiStylistCard` usage) — Sienna card removed
- `customizeOpen` state
- `someModelScenesHaveOutfitHint` info banner and toggle

**Add:**
- `expandedOutfitSceneId` state for accordion
- `applyToAllOpen` state for the bulk editor
- Helper: `summarizeOutfitHint(hint: string): string` — strips tokens, extracts first sentence, truncates
- Scene list rendering: map `modelShots`, each row has 64x80 preview (`getOptimizedUrl(url, { quality: 65 })`), title, source pill + summary, Edit toggle
- Expanded row: ZaraOutfitPanel scoped to `outfitConfigByScene[scene.id]`

**Auto-pick initialization:**
- On mount, for scenes without `outfit_hint` and without existing config in `outfitConfigByScene`, run `pickDefaultPreset` and store result
- Scenes with `outfit_hint` get no entry — hint is the default

### 3. Generation job resolution

**File: `src/pages/ProductImages.tsx`** (~line 894)

New priority chain per job:
```
outfitConfigByScene[scene.id] > outfitConfigByProduct[product.id] > global outfitConfig
```

When `outfitConfigByScene[scene.id]` exists, set `outfitOverrideEnabled: true` in that job's `variationDetails` so the prompt builder bypasses the scene's `outfit_hint`. Without a per-scene override, `outfitOverrideEnabled` stays false and the hint is used naturally.

### 4. Prompt builder — zero changes

`resolveOutfitHintText` already has the correct logic: returns scene hint by default, returns `undefined` only when `outfitOverrideEnabled && hasUserDefinedOutfit`. The job loop sets these flags per-job.

### 5. Backward compatibility

- `outfitConfigByProduct` continues to work as fallback
- `outfitConfig` (global) is lowest priority
- Old localStorage state produces same results
