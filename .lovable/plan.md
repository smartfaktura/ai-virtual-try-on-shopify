

# Premium "Style & Outfit" Section Redesign

## Problem
The current Style & Outfit section has several issues for a cold user:
1. **Style preset cards are visually empty** — just a name and thin accent bar, no mood/personality
2. **"Locked across all on-model scenes"** with a lock icon feels alarming, not helpful
3. **Outfit details / Appearance collapsibles** feel disconnected — side-by-side triggers look like navigation, not settings; no preview of current values
4. **Appearance panel dumps 8 fields at once** — overwhelming without grouping context
5. **No feedback loop** — selecting a preset doesn't visually indicate what changed inside outfit/appearance
6. **Too much text everywhere** — descriptions on presets, section subtitles, uppercase sub-headers

## Changes

### File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

### 1. Style preset cards — add mood gradient backgrounds
Replace the plain `bg-muted/40` cards with subtle gradient tints that convey each style's mood. Remove the thin 3px accent bar, use a full-card soft gradient instead:

- **Studio Standard**: `bg-gradient-to-b from-slate-100 to-slate-50` (clean neutral)
- **Editorial**: `bg-gradient-to-b from-zinc-200 to-zinc-100` (sharp, cool)
- **Minimal**: `bg-gradient-to-b from-stone-50 to-white` (airy, light)
- **Streetwear**: `bg-gradient-to-b from-neutral-200 to-neutral-100` (darker, urban)
- **Luxury Soft**: `bg-gradient-to-b from-amber-50 to-orange-50/30` (warm, refined)

Active state: gradient + `ring-2 ring-primary` + name in `text-primary`.
Card size stays `130px` wide. Remove `PRESET_DESCRIPTIONS` display entirely (already done). Remove `PRESET_ACCENT` bar.

### 2. Replace lock icon + jargon with softer inline note
Replace `<Lock>` icon + "Locked across all on-model scenes." with a simpler, friendlier note:
```
<p className="text-[11px] text-muted-foreground/70">
  Applies to all on-model shots.
</p>
```
No icon, no "locked" language. Place it right under the section title, merge with subtitle.

### 3. Redesign section header — compact, single line
Change from:
```
Style & Outfit
Set the look — presets apply to outfit and appearance automatically.
🔒 Locked across all on-model scenes.
```
To:
```
Style & Outfit
Pick a direction — applies to all on-model shots.
```
One subtitle line, no lock icon, no extra paragraph.

### 4. Collapsible triggers — show current values inline
Replace the two side-by-side bordered trigger buttons with stacked, minimal triggers that show a summary of current values:

```text
┌─────────────────────────────────────────────┐
│  ▸ Outfit    White shirt · Black pants · ...│
│  ▸ Appearance    Auto · 25-35 · Soft smile  │
└─────────────────────────────────────────────┘
```

- Stack vertically (not side-by-side) for clarity
- Remove border from triggers, use subtle `hover:bg-muted/30` only
- Show condensed current values as `text-muted-foreground text-[11px]` after the trigger label
- This gives users immediate feedback on what a preset changed

### 5. Simplify Appearance fields — group into 2 rows with less chrome
Inside `InlinePersonDetails`:
- Remove the uppercase "APPEARANCE" and "ACCESSORIES & STYLING" sub-headers
- Use a single flat grid `grid-cols-4` for the first 4 fields (Presentation, Age, Skin Tone, Expression)
- Second row for accessories: Hand Style, Nails, Jewelry, Accessories — also `grid-cols-4`
- Separate with just `mt-3` gap, no labels between rows
- This reduces the visual noise significantly

### 6. Build outfit/appearance summary helpers
Add two small utility functions:
- `getOutfitSummary(config: OutfitConfig)` → returns string like "White shirt · Black pants · Sneakers"
- `getAppearanceSummary(details: DetailSettings)` → returns string like "Feminine · 25-35 · Light · Soft smile"

These are used in the collapsible triggers (change 4).

## Result
A calmer, more premium section where style presets have visual personality through gradient tints, the lock/jargon is gone, and collapsible triggers show what's currently configured without needing to expand. Fewer labels, less text, more breathing room.

### Files modified
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`

