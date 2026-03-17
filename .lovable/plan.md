

## Changes

### 1. Reorder Ring outputs — Move "Model Portrait" to position 2

In the Ring showcase (lines 42-50), move `hero-ring-portrait.png` / "Model Portrait" from position 7 to position 2 (before "On the Hand"):

```
outputs: [
  { img: '...hero-ring-fabric.png', label: 'Linen Close-Up' },
  { img: '...hero-ring-portrait.png', label: 'Model Portrait' },   // moved up
  { img: '...hero-ring-hand.png', label: 'On the Hand' },
  { img: '...hero-ring-concrete.png', label: 'Concrete Block' },
  // ...rest unchanged
]
```

### 2. Replace product name pills with numbered dots/pills

Instead of showing "Crop Top", "Ring", "Headphones" text labels, switch to minimal numbered indicators (e.g., `1`, `2`, `3`) in small circular pills. This applies to both desktop (lines 413-432) and mobile (lines 364-378) scene switcher areas.

- Remove the `↑ Tap to switch product` hint text (line 430-432)
- Use small 28px circular buttons with just the number
- Active state keeps the primary fill, inactive keeps outline style

### Files to modify
- `src/components/landing/HeroSection.tsx`

