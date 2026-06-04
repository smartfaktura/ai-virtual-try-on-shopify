## Goal
Make the Fresh Scenes preview modal fit on mobile screens — image, title, description, and CTAs all visible without clipping.

## File
`src/components/app/DashboardFreshScenes.tsx` (mobile styles only; desktop layout untouched)

## Changes

1. **Cap modal height tighter on mobile**
   - `DialogContent` and inner scroll wrapper: `max-h-[92dvh]` → `max-h-[85dvh]`

2. **Shrink image on mobile**
   - Replace mobile `aspect-[4/5]` with a capped `max-h-[42dvh]` + `object-cover`
   - Desktop keeps `md:aspect-[4/5] md:h-[80vh]`

3. **Tighten spacing + typography on mobile**
   - Container padding `p-5` → `p-4`
   - Gap `gap-5` → `gap-3`
   - Title `text-2xl` → `text-lg` (keep `md:text-3xl`)
   - Description `text-[15px]` → `text-[13px]` with tighter leading
   - Eyebrow label margin trimmed

4. **Compact CTA on mobile**
   - "Use this scene" button: `size="lg"` → default size on mobile, `lg` on `md+`
   - Reduces stacked footer height by ~12–16px

No data, logic, or desktop changes — purely mobile presentational sizing.
