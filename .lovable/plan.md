In `src/components/app/DashboardFreshScenes.tsx` (modal preview, line ~201), change the mobile image container so it's height-driven with a locked 4:5 ratio instead of full-width with a capped height (which currently breaks the ratio).

- Wrapper (line 201): replace mobile `w-full max-h-[48dvh] aspect-[4/5]` with `h-[60dvh] w-auto aspect-[4/5] mx-auto`. Keep desktop classes (`md:aspect-[4/5] md:h-[80vh] md:w-auto`) unchanged.
- `<img>` (line 206 area): keep `object-cover` + `w-full h-full` so it fills the now-correctly-proportioned wrapper.

Result: on any mobile screen the preview is a true 4:5 image, naturally narrower than the viewport — no more wide squished frame. Desktop behavior unchanged.