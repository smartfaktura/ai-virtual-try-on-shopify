## Show full vertical scene image on mobile (no crop)

The mobile modal currently renders the hero with `aspect-[5/4]` + `object-cover`, which crops the head and feet off portrait scene images.

## Change

`src/components/library/SceneDetailModal.tsx` — hero block only:

- Mobile aspect ratio: `aspect-[5/4]` → `aspect-[3/4]` (portrait), `max-h-[42dvh]` → `max-h-[55dvh]` so a vertical image has room to fully fit
- Image fit on mobile: `object-cover` → `object-contain` so nothing is cropped; keep `md:object-cover` for the desktop split layout where the column itself is portrait
- Keep the blurred low-quality placeholder as `object-cover` (with stronger `blur-xl`) so it fills the letterbox bands behind the contained image — feels intentional, not empty
- Desktop layout (`md:`) unchanged

No content/copy changes; close button, badges, title, description, CTA all stay as-is.
