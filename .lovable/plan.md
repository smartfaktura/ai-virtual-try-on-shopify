

## Fix Freestyle Section Layout Stability

The page jumps because two things change dimensions during the 8-second animation cycle:

1. **Prompt area** — text typing causes height changes as it wraps to new lines
2. **Results grid** — `min-h-[200px]` doesn't match the actual rendered height of the 4/5 aspect-ratio cards, so the section grows/shrinks each cycle

### Changes — `src/components/landing/FreestyleShowcaseSection.tsx`

1. **Fixed-height prompt area**: Change `min-h-[56px]` to a taller fixed `h-[72px]` (or `min-h-[72px]`) so the two-line prompt never causes reflow
2. **Use `visibility` instead of `opacity`** for the results grid: Replace `opacity-0 pointer-events-none` with `invisible` — this keeps the grid fully laid out and space-reserving at all times, eliminating any height difference
3. **Remove `min-h-[200px]`** from the wrapper since `invisible`/`visible` already reserves the exact correct space
4. **Keep card translate/scale animations** but use `visibility` + `opacity` combo so cards animate in smoothly without layout shift

