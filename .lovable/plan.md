Three small, focused changes — all visual, all in the hero block.

## 1. Breadcrumb — pure minimalist 2026

Strip everything to the essentials:

```text
Home   AI Product Photography   Footwear
```

- **No separators at all** — no slash, no em-dash, no chevron, no dot. Whitespace separates the items.
- **No anchor mark** — drop the navy dot.
- Spacing: `gap-5` between items so the air carries the rhythm.
- Type: `text-[11.5px]`, `font-medium`, `tracking-[-0.005em]`.
- Inactive links: `text-muted-foreground/45` (very quiet).
- Current page: `text-foreground` (full navy, no bold) — the only contrast cue.
- Hover: thin animated underline grows from left (`underline-offset-4 decoration-foreground/30`), no color shift.
- Container & alignment unchanged (locked to hero column).

Accessibility / SEO preserved:
- `<nav aria-label="Breadcrumb"><ol>` with `<a>` + `aria-current="page"`.
- Visually-hidden `›` between items for screen readers (`<span className="sr-only">›</span>`) so non-sighted users hear correct hierarchy.
- `BreadcrumbList` JSON-LD untouched.

## 2. Move the eyebrow `FOOTWEAR · SNEAKERS · BOOTS` below the H1

Right now the eyebrow stacks directly under the breadcrumb — two label-style lines competing. Move it BELOW the H1, just above the subheadline, as an editorial kicker:

```text
Home   AI Product Photography   Footwear   ← breadcrumb (line 1)

AI Product Photography                     ← H1
for Footwear Brands

— FOOTWEAR · SNEAKERS · BOOTS              ← eyebrow becomes kicker
Upload one shoe photo and create…          ← sub
```

- Add a thin 24px hairline before the eyebrow (`before:content-[''] before:w-6 before:h-px before:bg-foreground/25 before:mr-3`) so it reads as a hand-set kicker, not a duplicate label.
- Spacing: `mt-0 mb-3` (sits right above the sub).

## 3. Bigger trust microcopy

Currently `text-xs text-muted-foreground/70` — reads as a footnote.

Bump to:
- `text-sm` (14px)
- `text-muted-foreground` (full muted, drop the /70 opacity)
- `mt-6` from the CTA row

Just text, no dot, no icon. Cleaner, properly weighted within the hero block.

## Files touched

- `src/components/seo/photography/category/CategoryBreadcrumbs.tsx` — strip separators, gap-spaced layout, animated underline.
- `src/components/seo/photography/category/CategoryHero.tsx` — move eyebrow below H1 with hairline kicker; bump trust microcopy size.
