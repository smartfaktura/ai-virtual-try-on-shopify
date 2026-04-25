## Goal
Make the final section of `/ai-product-photography` use the same dark primary background as other pages (matching `HomeFinalCTA` on `/home`).

## Change
Update `src/components/seo/photography/PhotographyFinalCTA.tsx` to mirror the `HomeFinalCTA` aesthetic:

- Section background: `bg-[#1a1a2e]` with the same soft blurred radial accents (`#475569` / `#64748b`) for depth.
- Add a tiny uppercase eyebrow label ("Get started") in `text-white/50`.
- Heading in white; subcopy in `text-[#9ca3af]`.
- Primary button: white pill with `text-[#1a1a2e]` → keeps the existing CTA copy ("Create your first visuals free") and links to `/app/generate/product-images`.
- Secondary button: outlined `border-white/20` white pill → keeps the "Explore categories" anchor to `#categories`.
- Preserve current spacing rhythm (`py-16 lg:py-32`) and full-width responsive button stack.

No other files affected. No new dependencies.