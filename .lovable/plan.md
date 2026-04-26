Plan to fix the homepage model section on mobile:

1. Remove the animated two-row marquee behavior on mobile
   - Keep the desktop/tablet marquee if desired, but mobile will no longer use horizontally translating rows.
   - This prevents the “looping rows”, off-screen movement, and cut/cropped tile visibility shown in the screenshots.

2. Add a stable mobile-only model layout
   - Render a clean, non-animated 2-row grid/list of model cards on phones.
   - Show a controlled set of models plus the “Brand Models” CTA.
   - Keep all cards fully inside the viewport with consistent spacing and no partial off-screen cards.

3. Tune mobile card sizing and section height
   - Use fixed mobile card dimensions that fit the 440px-wide viewport cleanly.
   - Reduce the large empty vertical gap currently appearing below the carousel.
   - Ensure model names are not clipped.

4. Keep image loading reliable
   - Keep the direct `<img>` loading approach from the previous fix.
   - Use eager but low-priority loading for these small cards so they appear immediately without blocking the hero.

Technical details:
- Update `src/components/landing/ModelShowcaseSection.tsx`.
- Add a `MobileModelGrid`/mobile branch inside `ModelsMarquee` or hide/show variants with responsive classes.
- Use a non-animated layout for mobile, e.g. a 4-column-style horizontal-fit grid or two centered rows depending on available width.
- Desktop can continue using `MarqueeRow`, but mobile will bypass the marquee keyframes entirely.