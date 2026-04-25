## Match /auth logo to footer wordmark

The `/auth` page currently renders the legacy logo: a rounded-square indigo badge with a "V" glyph next to small "VOVV.AI" text. The site footer (and the rest of the landing) uses a clean **wordmark only** — no glyph box.

### Fix
In `src/pages/Auth.tsx` (lines 405–413), replace the badge+text combo with the footer-style wordmark:

- Remove the `w-9 h-9 rounded-xl bg-primary` glyph box and the small "V"
- Render only `VOVV.AI` as a bold, tight-tracked wordmark (`text-2xl sm:text-[28px]`, `font-bold`, `tracking-tight`, `text-foreground`)
- Keep it as a button that navigates to `/` with a subtle `hover:opacity-70` transition
- Add `aria-label` for accessibility

This brings the auth screen in line with the footer and overall minimal monochrome identity. No other files change.

**Approve to apply.**