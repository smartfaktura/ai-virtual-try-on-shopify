## Plan — Mobile: prioritize image, hide details, keep title + CTA

On mobile (< md), the Fresh Scenes preview modal should feel image-first: large image, eyebrow + title + one-line subtitle, primary "Use this scene" CTA, Close link. Hide the "What you get" bullets, the divider above it, and the meta `dl` (Collection / Added). Desktop layout stays exactly as it is today.

### File — `src/components/app/DashboardFreshScenes.tsx`

1. **Image (line 205)** — let the image breathe again. Change `max-h-[42vh] md:max-h-none` → `max-h-[62vh] md:max-h-none`, and switch `object-cover` → `object-contain md:object-cover` so nothing is cropped on a portrait mobile screen. Add `bg-muted` already present on the wrapper handles the letterbox.
2. **"What you get" block (lines 221-233)** — wrap the divider + section in `hidden md:block` so it only renders ≥ md.
3. **Meta `dl` block (lines 235-246)** — wrap the divider + `dl` in `hidden md:grid` (use a `<div className="hidden md:contents">` wrapper, or simpler: add `hidden md:block` to the divider and `hidden md:grid` to the `dl`).
4. **Right column padding/gap (line 208)** — keep `gap-5 md:gap-6 p-5 md:p-10`; no change.
5. **CTA group (line 248)** — remove `mt-auto` since on mobile the column is short now and `mt-auto` would push the buttons against an empty space; replace with plain `flex flex-col gap-3 pt-1 md:mt-auto md:pt-2`.

### Result

- **Mobile**: image (up to 62vh, no crop) → eyebrow → title → 1-line subtitle → "Use this scene" → Close. Fits inside the 92dvh modal without scrolling on standard phones.
- **Desktop**: unchanged — full structured right panel with bullets, meta, CTAs.

### Out of scope

No data, query, or routing changes. Same Dialog wrapper and scroll container as the previous fix.

### Risk

None — Tailwind responsive utility toggles only.