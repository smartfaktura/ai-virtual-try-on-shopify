## Problem

On mobile, the landing footer accordion (Solutions / Product / Resources) feels cramped when opened:
- Links sit very close to each other (`space-y-2` + `leading-snug`) so SOLUTIONS expanded looks like a wall of text
- Subheadings (PLATFORMS, CATEGORIES, COMPARE) blend into the link list — no clear visual hierarchy
- The summary row is short (`py-3`) so tap targets feel narrow
- Brand block + accordion + bottom bar gaps are uneven on small screens

## Fix (file: `src/components/landing/LandingFooter.tsx`)

Mobile-only changes (everything `sm:` and above stays as-is).

**1. Roomier accordion rows**
- Summary row: `py-3` → `py-4`, slightly larger summary text
- Section dividers stay, but slightly stronger contrast between sections

**2. Clear hierarchy inside opened sections**
- Add more top space when opened: `mt-3` → `mt-4`, bottom padding `pb-1` → `pb-2`
- Group spacing inside Solutions/Resources: `space-y-4` → `space-y-6`
- Subheading: bump from `text-[10px]` to `text-[11px]`, add `mb-2.5`, slightly stronger color so PLATFORMS / CATEGORIES / COMPARE clearly anchor each block
- Add a subtle `pl-0.5` indent on grouped link lists so they read as children of the subheading

**3. Comfortable link spacing**
- Link list: `space-y-2` → `space-y-3`
- Link class on mobile: keep `text-sm` but switch from `leading-snug` to `leading-relaxed` and add `block py-0.5` so tap targets are ~32px tall

**4. Better outer rhythm on mobile**
- Brand → accordion gap: `mt-8` → `mt-10`
- Accordion → bottom bar: `mt-12` → `mt-10` on mobile, `sm:mt-12` preserved
- Bottom bar on mobile: stack with `gap-4` instead of `gap-3`, give the legal nav `gap-y-2`

**5. Safe-area + container padding**
- Add `pb-[env(safe-area-inset-bottom)]` to the footer wrapper so iOS home-indicator doesn't crowd the copyright row

## Out of scope
- No changes to desktop/tablet layout
- No changes to footer content (links, headings, social icons)
- No changes to `HomeFooter.tsx` (separate component, not the one in screenshot)
