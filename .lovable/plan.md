

# Add Dark Blue Accent Colors to TryShot Page

## Changes

### File: `src/pages/TryShot.tsx`

Apply the brand's dark navy blue (`primary` = `hsl(217, 33%, 17%)`) as accent touches throughout:

1. **Typewriter rotating word**: Change from `text-muted-foreground` to `text-primary` — makes the dynamic word pop in dark navy blue instead of grey

2. **Submit button inside input**: Change from `bg-muted-foreground/20` to `bg-primary text-white hover:bg-primary/90` — dark navy circle button, much more visible and branded

3. **Hero showcase image border**: Add `ring-2 ring-primary/10` for a subtle dark blue glow around the rotating image card

4. **"Get started" nav button**: Already dark, keep as-is

5. **Section heading "Works with most products"**: Keep black but add a small dark blue decorative line below: add a `<div className="w-12 h-0.5 bg-primary mx-auto mt-3" />` after the heading

6. **Category pill labels**: Change from `bg-white/90 text-foreground` to `bg-primary text-white` — dark navy pills over category images for stronger brand presence

7. **Footer "VOVV.AI" link**: Change from `text-foreground` to `text-primary` for brand consistency

8. **Progress indicator dot**: Already `bg-primary` — no change needed

## Summary
- 1 file, ~8 small class changes
- Dark navy blue accents on: rotating word, submit button, image ring, category pills, section divider, footer link
- No new colors introduced — uses existing `primary` token throughout

