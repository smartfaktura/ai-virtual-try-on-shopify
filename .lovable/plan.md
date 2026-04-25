A modern, VOVV.AI-signature breadcrumb that feels considered — not Apple, not generic. The aesthetic system in the project is "luxury restraint": warm off-white surfaces (`#FAFAF8`), navy foreground, micro-uppercase labels, tasteful frosted pills. The crumb should feel like part of that family.

## The design

```text
   ●  Home  ─  AI Product Photography  ─  Footwear
```

- A small **navy dot indicator** (`●`, 4px, `bg-foreground`) before "Home" — VOVV's signature "you are here" mark, the same dot used for active states elsewhere in the system.
- **Em-dash separator** `—` (U+2014), not slash or chevron. Editorial, intentional, distinctly VOVV.
- Type: **12px** (`text-[12px]`), `font-medium`, `tracking-[-0.005em]`.
- Colors — uniform restraint:
  - Inactive links: `text-muted-foreground/60`
  - Current page: `text-foreground` (full navy, *no bold*) — the only weight cue is the color shift from grey to navy. Subtle, premium.
  - Separators: `text-muted-foreground/25` so the line reads as words, not symbols.
- **Hover micro-interaction**: link colors shift to `text-foreground` with a thin animated underline (`underline-offset-4 decoration-foreground/30`) — fades in over 200ms. Tactile, not loud.

## Layout

- No background, no border, no band — sits as a quiet line of type on the page surface.
- Container locked to the hero column: `max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12` so the crumb's left edge **shares the same vertical line as the H1**.
- Spacing:
  - Top: `pt-24 lg:pt-28` (clears the floating navbar pill).
  - Bottom: `pb-4 lg:pb-5`.
  - Hero top padding becomes `pt-0` so the crumb owns the top region.

## Why this feels VOVV-modern

1. **The dot indicator** ties to the rest of the system (active workflow steps, tab indicators) and gives the crumb a clear anchor point.
2. **Em-dash separators** are rare in nav UI — instantly distinct from "every other site that uses `/` or `›`".
3. **Color-only weight contrast** (grey → navy) is more refined than bold weight changes. Editorial.
4. **Locked alignment** to the H1 left edge → the crumb visually belongs to the hero block, not floating in chrome.
5. **No band, no border** — pure restraint. The page wrapper does the work.

## SEO unchanged

`<nav aria-label="Breadcrumb"><ol>` + `<a>` links + `aria-current="page"` on the last item. `BreadcrumbList` JSON-LD untouched. All three labels remain visible text.

## Files touched

- `src/components/seo/photography/category/CategoryBreadcrumbs.tsx` — full rewrite with the spec above.
- `src/components/seo/photography/category/CategoryHero.tsx` — drop the small top pad so the crumb owns the top region (`pt-0 pb-14 lg:pt-0 lg:pb-24`).
