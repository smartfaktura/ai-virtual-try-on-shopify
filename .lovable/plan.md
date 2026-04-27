## Redesign 404 Page — VOVV.AI Branded

The current 404 (`src/pages/NotFound.tsx`) is a bare-bones unstyled page on a grey `bg-muted` with a raw text link. It doesn't match the VOVV.AI aesthetic at all. I'll rebuild it as a polished, on-brand experience.

### What you'll get

A premium, branded 404 page with:

1. **Brand presence** — VOVV.AI wordmark/logo at the top, consistent with the landing nav.
2. **Editorial hero** — Oversized "404" display number with refined typography (tracking-tight, font-bold), paired with a clear headline ("This page took a wrong turn") and a friendly subline.
3. **Pill action buttons** (matching the rest of the app):
   - **Primary** — "Back to Home" → `/` (rounded-full, `bg-sidebar-foreground text-sidebar`, h-11, px-6)
   - **Secondary** — "Go to App" → `/app` (rounded-full outline variant)
   - **Tertiary text link** — "Go back" using `navigate(-1)` for browser history
4. **Helpful navigation grid** — 3–4 small "Popular destinations" cards (rounded-2xl, border, hover-lift) linking to high-value pages: Product Images, Video Studio, Pricing, Explore. Helps users recover instead of bouncing.
5. **Subtle decorative background** — Soft radial gradient / faint grid pattern in brand tones (no harsh grey), respecting light/dark theme via `bg-background` and `text-foreground`.
6. **Path echo** — Display the broken path they tried (e.g. `/start`) in a muted mono pill so they understand what happened.
7. **Responsive + accessible** — Centered layout, proper heading hierarchy (`h1`), keyboard-focusable buttons, sufficient contrast, mobile-stacked buttons.
8. **SEO** — Keep `<SEOHead noindex>` and preserve the existing `console.error` logging for debugging.

### Visual recipe (matching app conventions)

- Container: `min-h-screen bg-background flex items-center justify-center px-6`
- Card: `max-w-2xl w-full text-center space-y-8`
- 404 numeral: `text-[140px] md:text-[180px] font-bold tracking-tighter leading-none bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent`
- Buttons: `rounded-full` pills, matching `LandingNav` style
- Quick-links grid: `grid grid-cols-2 md:grid-cols-4 gap-3`, each tile `rounded-2xl border bg-card p-4 hover:bg-accent transition`

### Files changed

- `src/pages/NotFound.tsx` — full rewrite

No routing, no backend, no new dependencies. Single-file change.