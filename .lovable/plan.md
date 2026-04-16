

# Inline Upgrade Card — Responsive Fix + Accent Color

## Problems from screenshots

1. **Headline text truncates** — "Your first f..." is cut off because `truncate` clips it and the chips + CTA compete for horizontal space
2. **Left accent line uses `primary/60` gradient** — fades to near-invisible; should be solid `primary` for brand presence
3. **Mobile layout breaks** — chips and CTA overflow on narrow screens; all 3 chips + button + X don't fit in one row
4. **No responsive breakpoint between phone and desktop** — jumps from stacked (< sm) to single row (≥ sm) with no intermediate

## Changes — `PostGenerationUpgradeCard.tsx`

### 1. Accent line → solid primary
Replace the gradient `from-primary/60 via-primary/20 to-primary/60` with a simple `bg-primary` for a clean, visible brand accent

### 2. Headline — allow wrapping on mobile, truncate only on desktop
- Mobile: remove `truncate`, let headline wrap to 2 lines with `line-clamp-2`
- Desktop (sm+): keep `truncate` for single-line compactness

### 3. Chips — hide on mobile, show from `md` up
- The 3 chips don't fit on small screens alongside the CTA. Hide them below `md` breakpoint entirely
- On mobile, the headline itself ("Your first fashion direction is ready") provides enough context
- Remove the duplicate mobile chips section completely

### 4. CTA row — always visible, right-aligned
- Mobile: headline on row 1, CTA button + X on row 2, right-aligned
- Desktop: everything in one row as designed

### 5. Button — ensure minimum touch target
- Keep `h-7 text-xs px-4` but add `whitespace-nowrap` to prevent button text from wrapping

### Layout structure after fix:

```text
Mobile (< md):
[accent] [avatar] [headline — wraps to 2 lines if needed]
         [                    ] [See Plans] [×]

Desktop (≥ md):
[accent] [avatar] [headline] [chip · chip · chip] ——— [See Plans] [×]
```

## No other files change
Parent wrappers in Freestyle, Generate, and TextToProduct remain as-is.

