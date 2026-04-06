

# Refine Step — Comprehensive UI/UX Polish

## Summary
Remove the connector line, add fashion style presets, reduce text on scene cards, equalize card sizes, fix preset color swatches, and address minor UX issues.

---

## 1. Remove connector line between card and panel

**File:** `ProductImagesStep3Refine.tsx` (~line 1692-1697)

Remove the `w-px h-3 bg-primary/30` div entirely. The expanded panel already has `border-primary/30` which visually associates it with the active card.

---

## 2. Add fashion style presets to outfit presets

Currently only 3 generic presets exist (Studio Standard, Editorial, Minimal). Add 2 more clothing-specific presets inspired by the catalog feature's fashion styles:

**File:** `ProductImagesStep3Refine.tsx` (`getBuiltInPresets` function, ~line 899-920)

Add presets:
- **Streetwear** — dark tones, oversized fit, sneakers
- **Luxury Soft** — cream/camel tones, tailored fits, silk/cashmere materials

Keep preset names short (no descriptions needed — the color swatch communicates the vibe).

---

## 3. Fix PresetColorDots — colors render as named strings, not hex

**File:** `ProductImagesStep3Refine.tsx` (~line 834-842)

The `PresetColorDots` component uses `config.top?.color` directly as `backgroundColor`, but these are color *names* like `"white"`, `"black"`, `"cream"` — not hex values. CSS interprets `"white"` and `"black"` correctly but fails on `"cream"`, `"beige"`, `"camel"`, `"navy"`, `"charcoal"`, etc.

Fix: resolve each color through the existing `COLOR_HEX` map before rendering. Change `style={{ backgroundColor: c }}` to `style={{ backgroundColor: COLOR_HEX[c] || c }}`.

Also increase swatch size from `w-5 h-5` to `w-6 h-6` for better visibility.

---

## 4. Reduce text on scene cards — make all cards same height

**File:** `ProductImagesStep3Refine.tsx` (~line 1560-1603, `renderSceneCardButton`)

Current issues:
- Some cards show long subtitle text ("Packaging, Lighting…", "Background & Composition, Lighting…") making them taller than others
- The "needs model" / "customized" / hover text adds variable height

Fixes:
- Remove the `controlPreviewNames` subtitle text entirely (lines 1586-1588). The settings icon already signals expandability.
- Remove the hover "→ Customize" text (lines 1589-1591). The cursor + icon are sufficient affordances.
- Add `min-h-[72px]` to the card button to enforce uniform height across all cards
- Keep only: title + BG badge + status indicator (needs model / customized dot)

---

## 5. Minor UX improvements found during analysis

### 5a. "View all models" link — add icon for clarity
Add a `ChevronRight` icon after the text to make it feel more like a navigation action.

### 5b. Background strip section — tighten heading
The "All N scenes" badge is redundant when there's only one product shot group. Keep it but make it more subtle.

### 5c. Expanded panel animation — smoother entry
Change `slide-in-from-top-2` to `fade-in` for a calmer, less distracting transition on the expanded settings panel (~line 1615).

### 5d. Model-needed banner — remove scene thumbnails on mobile
On mobile, the tiny 5x5 thumbnails are too small to be useful. Hide them with `hidden sm:flex`.

### 5e. Outfit section — auto-expand when model IS selected
Currently `outfitOpen` defaults to `needsModel`. When a model is already selected, the outfit section starts collapsed, hiding the outfit presets. Change to always default open when person scenes exist.

---

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | All 5 changes above: remove connector, add presets, fix color hex, reduce card text, minor UX tweaks |

