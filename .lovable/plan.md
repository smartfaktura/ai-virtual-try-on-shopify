## Problem

On mobile, the Home page (`/`) and the Auth page (`/auth`) feel like they have a "never ending scroll" near the footer / on the auth screen. This is not a literal infinite list — it is **horizontal overflow** leaking out of a section, which on iOS/Android Safari makes the entire page feel taller and lets the user scroll/pan past the real content edge in both axes.

Two main culprits:

1. **Home page (`/`)** — Several sections render content wider than the viewport on mobile:
   - `HomeHero` marquee rows use `w-max` inside `overflow-hidden w-full`, but the `<section>` itself has no `overflow-x-clip`, so flex children (cards) can still spill at the edges on small screens.
   - `HomeTransformStrip` mobile category rail uses `-mx-6` (full-bleed) with internal `overflow-x-auto`. Combined with absolute edge fades, on narrow viewports the parent can still expose a few pixels of overflow.
   - The root `<div className="min-h-screen bg-[#FAFAF8]">` in `Home.tsx` has no `overflow-x-hidden`, so any leak from any child section bubbles up to the `<html>`/`<body>` scroll container and produces the "extra scroll" feeling — including past the footer.

2. **Auth page (`/auth`)** — The root container is `min-h-screen flex` with no `overflow-x-hidden`. The `AuthHeroGallery` is `hidden lg:block lg:w-1/2 xl:w-[55%]` so it's not visible on mobile, but the form column uses `xl:px-24` and is wrapped in a `flex-1` flex item. On mid-width phones the flex sizing can produce a >100vw layout when combined with absolute toast/portals or long words in error text. Result: the page can be panned horizontally and feels like it scrolls indefinitely.

## Fix

### 1. Lock horizontal overflow at page roots (primary fix)

Add `overflow-x-clip` to the root wrapper of both pages so any internal overflow can never escape to the page-level scroll container.

- `src/pages/Home.tsx`
  - Change root `<div className="min-h-screen bg-[#FAFAF8]">` → add `overflow-x-clip`.
- `src/pages/Auth.tsx`
  - Change root `<div className="min-h-screen flex bg-background">` → add `overflow-x-clip`.
  - Also clamp the form column with `min-w-0` so flex math can't push it wider than the viewport.

### 2. Reinforce overflow on the actual offending sections

Defensive `overflow-x-clip` on the parent of marquee / horizontal rails so animation transforms cannot bleed:

- `src/components/home/HomeHero.tsx` — wrap the `flex flex-col gap-3` marquee container in (or add to its `<section>`) `overflow-x-clip`.
- `src/components/home/HomeTransformStrip.tsx` — add `overflow-x-clip` to the `<section>` root (the negative-margin `-mx-6` rail then can't leak).
- `src/components/home/HomeEnvironments.tsx` and `src/components/home/HomeModels.tsx` — same treatment around the marquee wrappers (they reuse `EnvironmentsMarquee` / `ModelsMarquee`, which animate `w-max` strips).

### 3. Auth page form column min-width

In `src/pages/Auth.tsx`:
- Add `min-w-0 w-full` to the `flex-1` form column so the inner `max-w-md` content can't force a horizontal scroll on narrow phones.
- Ensure error/info text uses `break-words` where it renders raw email or error messages.

## Why this works

`overflow-x-clip` (preferred over `overflow-x-hidden` because it doesn't create a new scroll container or break sticky positioning) prevents any descendant — including animated `transform` marquee strips and absolutely-positioned helpers — from extending the page width. Once the page width is exactly the viewport, mobile browsers stop allowing pan-past-edge behavior, and the perceived "infinite scroll" past the footer / on auth disappears.

## Files to change

- `src/pages/Home.tsx` (root wrapper class)
- `src/pages/Auth.tsx` (root wrapper class + form column class)
- `src/components/home/HomeHero.tsx` (section overflow guard)
- `src/components/home/HomeTransformStrip.tsx` (section overflow guard)
- `src/components/home/HomeEnvironments.tsx` (section overflow guard)
- `src/components/home/HomeModels.tsx` (section overflow guard)

No logic, no copy, no design changes — only overflow / sizing utilities. Low risk.
