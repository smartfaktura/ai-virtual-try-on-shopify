## Goal

Two small homepage changes:

1. **Remove the laggy video** from the hero marquee on `/` — replace it with another dress image so the hero strip is 100% images.
2. **Add a new Video Showcase section** right after the "Explore AI product photography by category" strip, autoplaying 8 short product videos.

All work is frontend-only. No backend, no database, no payments, no auth — nothing risky.

---

## What you'll see

**Hero (top of homepage):** still the same scrolling dress marquee, but the one tile that played a video is now a dress image. Smoother on every device.

**New section** (between the category strip and the "Models" section):
- Heading: **"Motion that sells, from a still"**
- Subheading: **"Turn any product visual into a short, on-brand video"**
- Grid of 8 short looping product videos (autoplay, muted, no controls), arranged 2 columns on mobile, 3 on tablet, 4 on desktop, 4:5 portrait cards with rounded corners — same look as the in-app showcase
- A subtle "Create a video →" link below the grid that goes to `/auth`

---

## Files touched

1. **`src/components/home/HomeHero.tsx`** — replace the single `{ label: 'Video', isVideo: true, ... }` card with another dress preview tile (re-using an existing dress scene preview URL already in the file). Remove the now-unused `productVideoLoop` import and the `LazyVideo` import. Simplify `MarqueeCard` to drop the video branch. The `!c.isVideo` filter on row 2 stays as a harmless safety net.

2. **`src/components/home/HomeVideoShowcase.tsx`** *(new file)* — section with the heading, subheading, 8-video grid, and CTA link. Uses the existing `LazyVideo` component (videos only start loading + autoplaying once the section scrolls into view, so the homepage stays fast). Cards use `muted loop playsInline preload="metadata"`. Fade-in on viewport, Inter font, Lovable design tokens, no terminal periods on the headers — consistent with the rest of the homepage.

3. **`src/pages/Home.tsx`** — add one import and mount `<HomeVideoShowcase />` between `<HomeTransformStrip />` and `<HomeModels />`.

Source videos are already shipped: `/public/videos/showcase/showcase-1.mp4` … `showcase-8.mp4`. **No new uploads, no new assets, no Stripe/Supabase/edge-function changes.**

---

## Why this is safe

- Pure presentation change — zero business logic, zero data flow
- New section is **additive and isolated** in its own file; if anything ever looked off, deleting the one line in `Home.tsx` reverts it instantly
- Videos are **lazy-loaded** via the existing `LazyVideo` component already used elsewhere on the homepage — off-screen videos don't fetch, so no performance regression
- The 8 video files already exist in the project, already shipped to production via `/public/videos/showcase/`
- Hero change is just swapping one tile in an array — the rest of the marquee, animations, layout, and timing are untouched
- No backend, no database, no auth, no payments touched
- Fully reversible in one commit if you ever want to undo

---

## Acceptance check (I will verify after building)

- Homepage `/` loads, hero scrolls smoothly with no video card visible
- New "Motion that sells, from a still" section appears directly after the category strip
- All 8 videos autoplay silently, looping, in the grid
- Section is responsive (2 / 3 / 4 columns)
- No console errors, no broken images
- The rest of the homepage (Models, How It Works, Why Switch, On Brand, Environments, FAQ, Final CTA, Footer) is unchanged

Approve and I'll build it.