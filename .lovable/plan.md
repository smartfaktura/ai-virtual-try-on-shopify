## What's actually wrong

The 5 pages I styled don't match the rest of the app. The **real in-app pattern** (used by Dashboard, Products, Workflows, BrandModels, VideoHub, Discover, etc.) is:

- AppShell already provides: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-8 pb-4 sm:pb-6 lg:pb-8`
- Pages render inside that — **no full-bleed `-mx-` breakouts, no off-white backgrounds**
- Header uses `<PageHeader title subtitle>` → `text-2xl sm:text-3xl font-bold tracking-tight`
- Background is the default app background (the page just sits in the shell)

What I did instead on the 5 pages:
1. `-mx-4 sm:-mx-6 lg:-mx-8 -mt-24 lg:-mt-8` to break out of AppShell
2. Painted the whole area `bg-[#FAFAF8]` (off-white)
3. Constrained to `max-w-2xl` or `max-w-3xl` (random widths)
4. Used `text-3xl sm:text-4xl lg:text-5xl` headlines (marketing scale)
5. Added uppercase eyebrows like a landing page

That's why nothing matches — they look like 5 different micro-sites embedded in the app instead of 5 in-app pages.

## The fix: align to the real app pattern

All 5 pages adopt the **standard in-app shell** like Dashboard / Products / BrandModels:

- **Remove** the `-mx-4 sm:-mx-6 lg:-mx-8 -mt-24 lg:-mt-8 -mb-4 sm:-mb-6 lg:-mb-8` breakouts
- **Remove** the `bg-[#FAFAF8]` full-page paint (let AppShell's default bg show through)
- **Remove** the `max-w-2xl/3xl mx-auto` containers + extra `px-5 sm:px-8 lg:px-12 pt-24 lg:pt-16` (AppShell already does padding)
- **Use `<PageHeader>`** for title + subtitle on all 5 pages (same as Dashboard, Products, BrandModels)
- **Drop the marketing eyebrows** ("Bug Bounty", "Support", "Learn") — PageHeader doesn't use eyebrows; nothing else in-app does either
- **Cards**: keep `rounded-2xl border border-border bg-card shadow-sm` — but switch from the hard-coded `border-[#f0efed]` and `bg-white` to the design tokens already used by Dashboard/Products. This makes them theme-correct and consistent
- **Content max-width inside PageHeader**: for text-heavy reading pages (BugBounty, AppHelp, Learn), wrap inner content in `<div className="max-w-3xl">` — left-aligned within the wide AppShell container, so the page feels in-app but the long-form content stays readable

## Per-page changes

### `src/pages/AppHelp.tsx`
- Drop the wrapper `<div className="-mx-4 ... bg-[#FAFAF8]">`
- Replace handwritten header (avatars + eyebrow + h1 + subtitle) with `<PageHeader title="Help" subtitle="Real humans, real fast — we usually reply within a few hours">`
- Move the avatar trio into a small intro block above the form (not the page header)
- Wrap children in `<div className="max-w-3xl space-y-6">`
- Cards: `bg-white border-[#f0efed]` → `bg-card border-border` (semantic tokens)

### `src/pages/BugBounty.tsx`
- Drop the wrapper `<div className="-mx-4 ... bg-[#FAFAF8]">` and the `pt-24 lg:pt-16` (AppShell handles top padding — that's why "starts from far away")
- Replace marketing-style hero (eyebrow + 5xl headline + subtitle) with `<PageHeader title="Bug Bounty" subtitle="Find a real platform bug, report it, and earn credits when we confirm it">`
- Wrap children in `<div className="max-w-3xl space-y-6">`
- Cards: `border-[#f0efed] bg-white` → `border-border bg-card`
- Reward tier list, "How it works" steps, qualifies/doesn't qualify all keep their internal layouts — only the wrapping shell changes

### `src/pages/Learn.tsx`
- Drop the wrapper breakout + off-white paint
- Replace marketing eyebrow + 5xl "Learn" with `<PageHeader title="Learn" subtitle="Short, focused guides for getting more out of VOVV.AI">`
- Wrap content in `<div className="max-w-3xl space-y-6">`
- Video iframe stays `rounded-2xl`, but border/bg → semantic tokens
- Search input: keep pill style but use `bg-card border-border` instead of hard-coded white/`#f0efed`
- Track list cards: `bg-white border-[#f0efed]` → `bg-card border-border`

### `src/pages/Settings.tsx`
- Drop the wrapper `<div className="-mx-4 ... bg-[#FAFAF8]">` — keep the inner `<PageHeader title="Settings">` exactly as it is (it's already the standard pattern)
- Cards: `rounded-2xl border-[#f0efed] bg-white shadow-sm` → `rounded-2xl border-border bg-card shadow-sm` (preserve the radius bump from earlier — Settings cards looked OK at 2xl)
- Save button stays small `size="pill"` (already done)

### `src/pages/BrandProfiles.tsx`
- Drop the wrapper breakout + off-white paint — already uses `<PageHeader>`, just needs the shell removed so it sits inside AppShell normally
- BrandModelsBanner: `border-[#f0efed] bg-white` → `border-border bg-card`
- Skeleton: `border-[#f0efed]` → `border-border`

## Net result

All 5 pages will:
- Sit inside the same `max-w-7xl` AppShell container as every other in-app page
- Start at the same vertical position (no extra `pt-24` stacking on top of AppShell's `pt-8`)
- Use the same `<PageHeader>` title scale as Dashboard / Products / BrandModels
- Use semantic card tokens (`bg-card`, `border-border`) so they react to the theme
- Have a `max-w-3xl` inner wrapper for long-form pages (Help / Bug Bounty / Learn) so reading width stays sane on wide screens, but left-aligned within the app container

## Files

- `src/pages/AppHelp.tsx`
- `src/pages/BugBounty.tsx`
- `src/pages/Learn.tsx`
- `src/pages/Settings.tsx`
- `src/pages/BrandProfiles.tsx`

No content/copy changes. No shared components touched. No new dependencies.
