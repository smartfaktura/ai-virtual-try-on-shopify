

# Improve Model Selection UX in Short Film References

## Current Problem
The Model/Character section in the short film reference panel is just a dashed upload zone with "Drop images or browse" and an "All" button that opens a full-screen dialog. This is unintuitive — users don't realize they can pick from existing models inline. The product images step 3 has a much better UX with an inline grid of model cards.

## Changes

### 1. Add inline model preview grid (`ReferenceUploadPanel.tsx`)

Replace the bare Model/Character section with an inline grid showing the first 6-8 models from the library (prioritizing user's brand models). Each card uses the existing `ModelSelectorCard` component with click-to-select. A "View All" link opens the full modal for more options.

**Before**: Upload zone only, "All" button opens dialog
**After**: 
- Inline row of 6 model thumbnails (brand models first, then library)
- Click to add as reference, selected models show checkmark
- "View All →" link opens the full picker dialog
- Upload zone remains below for custom uploads

### 2. Show selected models prominently

Currently selected model references are shown as tiny 12px-wide thumbnails mixed with other refs. Improve to show them as proper cards with name labels, matching the product images pattern.

### 3. Preload model data eagerly

Currently `useCustomModels` and `useUserModels` are only fetched when `modelPickerOpen` is true. Change to always fetch (lightweight query) so the inline grid renders immediately without requiring the dialog to open first.

### 4. Fix: remove stale voice/audio references

Quick audit items to clean up:
- Verify `ShortFilmSettingsPanel.tsx` has no leftover voice picker references
- Ensure the `audioLayers` toggles in `FilmTypeSelector.tsx` correctly pass through to the hook

## Files Modified

| File | Change |
|------|--------|
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Add inline model grid with 6-8 cards, "View All" link, eager data loading, improved selected model display |

