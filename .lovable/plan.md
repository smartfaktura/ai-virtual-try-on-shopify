## Two fixes

### 1. `/contact` page — match the homepage / `/home` premium aesthetic

The current page uses a primary-colored pill badge, generic shadcn cards, and a default tinted submit button — it does not match the editorial, off-white-cream, foreground-on-background style of the rest of the marketing site (Home, Product Visual Library, etc.).

Edit `src/pages/Contact.tsx`:

- **Hero section:** swap the colored "Contact Us" pill for a small uppercase eyebrow (`text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground`) like Home / Library. Title stays "Get in touch" but use the same tighter editorial sizing (`text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08] font-semibold tracking-[-0.03em]`). Centered, with generous top padding (`pt-24 sm:pt-28 lg:pt-32`).
- **Section background:** wrap hero in `bg-[#FAFAF8]` (cream) like other landing sections; form section gets `bg-background`.
- **Form card:** drop the shadcn `Card` chrome. Use a single editorial container `rounded-3xl border border-foreground/10 bg-background p-6 sm:p-10` with subtle shadow.
- **Inputs:** keep the existing `Input/Textarea/Select` components but add a uniform `rounded-xl` and slightly larger height (`h-11`) for inputs/select trigger to feel more premium.
- **Submit button:** match the `SceneDetailModal` / discover CTA — full-width on mobile, auto on desktop, `h-[3.25rem] rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold`.
- **Side cards (Email Us / Response Time):** convert to plain editorial blocks (no Card chrome) with a small icon in a soft circle, label uppercase eyebrow, then the value. Same off-white surface treatment.
- **Spacing:** match Home — section paddings `py-16 sm:py-20 lg:py-24` instead of the current `py-20 sm:py-28`.

No logic / submit handler changes.

### 2. Models marquee — fix the "zoomed-in" model thumbnails

Cause: `src/components/landing/ModelShowcaseSection.tsx` calls `getOptimizedUrl(url, { width: 320, quality: 55, resize: 'cover' })`. Per the helper's own warning (`imageOptimization.ts` line 48-53), passing `width` without `height` makes Supabase's `/render/image/` endpoint crop the image — exactly the "zoomed in heads only" effect shown in the screenshot.

Fix: pass both width and height in the card's natural 3:4 aspect ratio so Supabase resizes-to-cover at the correct frame instead of cropping.

```tsx
src={getOptimizedUrl(model.previewUrl, { width: 320, height: 426, quality: 55, resize: 'cover' })}
```

That's a one-line change inside `ModelCardItem`. The 320×426 box is ~2× the largest rendered card (`lg:w-36 lg:h-44` = 144×176) so it stays sharp on retina without downloading the full 300 KB original.

## Files

- `src/pages/Contact.tsx` — restyle the page only.
- `src/components/landing/ModelShowcaseSection.tsx` — add `height: 426` to the optimized URL.
