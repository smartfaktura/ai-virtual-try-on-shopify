

# Improve Freestyle Studio Card — Interactive Animations + Better Copy

## Problems
1. **Subtitle "Prompt + product + model + scene"** is too technical/listy — not compelling
2. **Model avatars** are empty gray circles instead of real faces
3. **Scene chips** just show text labels — no visual preview
4. **Chips feel static** — they show selected state but don't animate the *act of selecting* (tap/click feel)

## Changes

### 1. Better card title & subtitle
- **Title**: Keep "Freestyle Studio"
- **Subtitle**: Change to something like **"Create any visual you imagine"** — short, benefit-driven, aspirational

### 2. Real model face avatars
Use the team avatar URLs from `teamData.ts` (Sophia, Amara, Luna) as tiny face thumbnails inside the MiniAvatars component. These are already CDN-hosted. Show 3 small circular images instead of gray placeholder circles.

### 3. Tiny scene thumbnails
Add a small row of miniature scene preview squares (e.g., 16×16px rounded) that cycle/swap, using placeholder gradient squares with subtle scene-like colors (warm gold, cool blue, soft green) to represent different scenes. This gives a visual hint without needing actual scene image URLs.

### 4. "Selection" animation on chips
Instead of just cycling labels, animate chips to briefly show a **tap/select** effect:
- Chip briefly scales up + gets a checkmark flash + primary border pulse when cycling to a new value
- This simulates "the user is picking options" rather than just displaying them
- Stagger the selection animations across chips so they don't all fire at once

### 5. Aspect ratio chip cycles too
Make the ratio chip cycle through values (1:1 → 3:4 → 9:16) with the same select animation.

## File to Change

| File | Change |
|------|--------|
| `src/components/app/FreestylePromptCard.tsx` | Update MiniAvatars to use real avatar URLs from teamData; add selection pulse animation to CyclingChip; cycle aspect ratio values; update subtitle text |

## Visual Result
```
┌─────────────────────────────┐
│  ✧ FREESTYLE STUDIO         │
│                              │
│  [📦 ✓Skincare] [👩👩👩 Models]│  ← real faces, select flash
│  [🏔 ✓Beach]    [✓ 3:4]     │  ← cycling with pulse
│                              │
│  ┌─────────────────────┐    │
│  │ A luxury skincare... │    │
│  │ Describe anything  ✧│    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│  Freestyle Studio            │
│  Create any visual you       │
│  imagine                     │
│  [     Open Studio  →    ]   │
└─────────────────────────────┘
```

