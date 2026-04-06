

# Improve Scene Card Discoverability + Add Quick Background Control

## Problems

1. **Scene cards don't look clickable** — the chevron is small, the truncated "Background..." text is confusing, and users don't realize they can tap to expand and change settings.

2. **No quick way to change background across scenes** — many scenes share solid backgrounds (Clean Studio, Marketplace, Side Profile, Back View, Top-Down, etc.) but users must open each card individually to find the background control.

## Changes

### 1. Make scene cards visually interactive

- Add a subtle hover effect and a "Tap to customize" hint on the card when NOT expanded
- Replace the tiny truncated "Background..." label with clearer action text: show configurable block count as a pill, e.g. `⚙ 3 settings` instead of truncated labels
- Add a subtle dashed bottom border or "expand" affordance (like a small down-arrow indicator at the card bottom center) to signal expandability

### 2. Add "Background" quick-action button in scenes header

Between "Your scenes" header and the scene grid, add a small inline action strip for cross-cutting controls:

```text
Your scenes  7 selected — tap to fine-tune     ✨ Auto (Recommended)
┌──────────────────────────────────────────────────────────────┐
│ 🎨 Background: [Pure White] [Light Gray] [Warm] [Cool] ... │
│     Applies to: [thumb][thumb][thumb][thumb][thumb] 5 scenes│
└──────────────────────────────────────────────────────────────┘
```

- This strip only appears when 2+ selected scenes have `{{background}}` in their `promptTemplate`
- Shows the background tone ChipSelector (same as the existing `backgroundTone` field)
- Below the chips, show mini thumbnails of scenes this applies to
- Changing the value updates `details.backgroundTone` which is already used by all those scenes
- The strip is collapsible (starts open) so it doesn't overwhelm

### 3. Scene card label improvements

- Instead of truncated "Background..." show a clean pill: `⚙ 2 settings` or `⚙ Lighting, Shadow` (max 2 labels, no truncation)
- When expanded, hide this pill (the full controls are visible)

## Files to Update

| File | Changes |
|------|---------|
| `ProductImagesStep3Refine.tsx` | (1) Add `scenesWithBackground` computation — filter `selectedScenes` where `promptTemplate` includes `{{background}}`. (2) Render a "Background" quick-action strip between header and grid when `scenesWithBackground.length >= 2`, with `ChipSelector` for `backgroundTone` + mini scene thumbs. (3) Improve scene card hover/cursor styles and replace truncated block labels with a clean settings count pill. (4) Add subtle visual expand affordance to cards. |

