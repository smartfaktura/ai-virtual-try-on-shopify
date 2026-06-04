## Plan — Refine Fresh Scenes preview modal (right panel)

File: `src/components/app/DashboardFreshScenes.tsx` (the modal opened from /app dashboard Fresh Scenes grid).

### Problem
On desktop the right column has only an eyebrow, title, one-line description, then ~500px of empty space before two stacked CTAs. It feels unfinished.

### New right-panel structure (desktop)

```
WEDDING DRESS                    ← uppercase eyebrow, tracking-wider (unchanged)

Lake Column Bride                ← H2 (unchanged)

Use this look as the visual      ← subtitle, slightly larger, single sentence,
reference for your next            no period (per brand memory)
product shoot

─────────────────────────────    ← thin hr-border divider

What you get                     ← small uppercase section label
• On-brand scene composition
• Lighting + color preserved
• Your product seamlessly placed
• 2K PNG output

─────────────────────────────

CATEGORY      Wedding Dress      ← two-column meta rows, muted labels
COLLECTION    Fashion
ADDED         3 days ago         ← from created_at via Intl.RelativeTimeFormat

                                 ← spacer (mt-auto pushes CTA down)

[ ✨ Use this scene ]            ← primary, full width (unchanged)
Close                            ← ghost link-style, smaller, centered
```

### Specifics
- Padding: bump from `p-6 md:p-8` to `p-8 md:p-10` for breathing room on the right column only.
- Typography: title stays `text-2xl font-bold`; subtitle `text-[15px] leading-relaxed text-muted-foreground`.
- Section labels: `text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium` (matches existing eyebrow pattern).
- Bullets: simple `•` glyph, no icons. `text-sm text-foreground/85 leading-relaxed`.
- Meta rows: `grid grid-cols-[100px_1fr] gap-y-2 text-sm`, label muted, value `text-foreground`.
- "Added" derives from `preview.created_at` via a small `formatRelative()` helper inline in the file.
- Divider: `border-t border-border/60`.
- Close: change from full-width `<Button variant="ghost" size="lg">` to a slimmer `text-sm text-muted-foreground hover:text-foreground` centered button so the primary CTA dominates.
- Keep the X close affordance already on the dialog; the new bottom Close stays for clarity.

### Untouched
- Left image column, dialog container, `max-w-5xl`, query/data flow, navigation handler.
- Mobile layout (single column) — these additions still render cleanly stacked; padding bump applies via `md:` only.
- No DB, no taxonomy, no other modal.

### Risk
None. Pure presentation in one component. Falls back gracefully if `created_at` is missing (hides the row).