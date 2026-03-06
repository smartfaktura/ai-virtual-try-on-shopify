

## Fix Mobile Animation Lag in Freestyle Showcase

### Root causes

1. **Typewriter fires 30ms interval** -- ~90 characters = ~90 state updates + re-renders in 2.7 seconds. Each re-render repaints the entire component tree on mobile.
2. **`transition-all`** used on chips, generate button, result cards, and progress bar -- transitions every CSS property including expensive layout ones (padding, border, etc.).
3. **Progress bar animates `width`** -- triggers layout recalculation on each frame. Should use `transform: scaleX()` which is GPU-composited.
4. **`blur-3xl` background** -- 800px blurred circle is expensive to composite on low-end mobile GPUs.
5. **Result cards animate `translate-y` + `scale` + `opacity` simultaneously** with `transition-all`, causing redundant style recalcs.

### Fixes in `src/components/landing/FreestyleShowcaseSection.tsx`

**1. Batch typewriter updates** -- Change interval from 30ms to 50ms and type 2 characters per tick. Cuts state updates in half (~45 renders instead of ~90) with similar visual speed.

**2. Replace `transition-all` with specific properties everywhere:**
- Chips: `transition-[color,background-color,border-color,transform]`
- Generate button: `transition-[color,background-color,box-shadow,transform]`
- Result cards: `transition-[opacity,transform]`
- Results grid container: `transition-opacity`

**3. GPU-accelerate progress bar** -- Use `transform: scaleX()` with `origin-left` instead of animating `width`. Set full width always, animate scale.

**4. Reduce background blur on mobile** -- Change `blur-3xl` to `blur-2xl` and reduce the circle size to `w-[500px] h-[500px]` on mobile via responsive classes.

**5. Add `will-change` to result cards** -- Hint the browser to promote them to compositor layers before animation starts.

### Files changed
- `src/components/landing/FreestyleShowcaseSection.tsx`

