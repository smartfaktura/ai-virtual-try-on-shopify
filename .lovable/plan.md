## Fix mobile overflow on hero typewriter

**Problem:** `whitespace-nowrap` on the typewriter span clips long phrases like "For E-commerce Brands." on narrow viewports.

**Fix in `src/components/home/HomeHero.tsx`:**

1. Remove `whitespace-nowrap` so text wraps naturally on mobile; keep `nowrap` only at `sm:` and up where there's room.
2. Scale the H1 down a notch on mobile (`text-[2rem]` at base → `text-[2.5rem]` at sm → unchanged from sm up) so the longest phrase fits cleanly on one line.
3. Shorten 1–2 typewriter phrases that are too long for narrow widths:
   - `For E-commerce Brands.` → `For E-commerce.`
   - `From One Product Photo.` → `From One Photo.`
   - Keep `Product Page Ready.`, `Ads That Convert.`, `Every Scene. Every Angle.`, `No Photoshoot Needed.`
4. Reserve vertical space for 2 lines on mobile (`min-h-[2.3em] sm:min-h-[1.15em]`) so when a phrase wraps the layout doesn't jump.

That keeps the /home aesthetic and SEO intent while making the hero render cleanly down to 320px.
