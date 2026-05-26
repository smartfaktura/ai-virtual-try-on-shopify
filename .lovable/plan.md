## Scope
Two presentation-only edits. No logic, routing, auth, or backend touched.

### 1. Restyle the "Want scenes unique to your brand?" trigger banner
File: `src/components/app/product-images/BrandScenesPromoCard.tsx`

Mirror the structure and weight of the `Help us improve VOVV.AI` feedback banner (reference screenshot):
- `rounded-2xl` container, `p-5 sm:p-6`, light tinted background `bg-primary/[0.04]`, border `border-primary/20` (replaces current dashed border + small padding).
- Flex layout: icon chip on the left, title + subtitle stacked in the middle, dark pill CTA on the right with `Wand2` icon.
- Title: `text-sm font-semibold text-foreground leading-snug` → "Want scenes unique to your brand?"
- Subtitle: `text-xs text-muted-foreground mt-1` → "Generate your own Brand Scenes from a reference or brief"
- Icon chip: `w-10 h-10 rounded-full bg-primary/10` with `Wand2` `w-4 h-4 text-primary`.
- Primary CTA on right: solid `bg-foreground text-background` pill, `h-10 rounded-full px-5 text-sm font-semibold gap-1.5`, label "Learn more" with `ArrowRight` icon (matches the dark "Share feedback" pill in the reference).
- Mobile: stacks like the feedback banner (`flex-col sm:flex-row sm:items-center sm:justify-between`).
- Keep the existing `onClick` behavior — the whole card no longer needs to be a button; only the CTA opens the modal. Card itself stays a `<div>`. Container can also be clickable as a fallback but CTA is the visible action.

### 2. Re-align `BrandScenesInfoModal` typography with the app aesthetic (not the lighter editorial I shipped)
File: `src/components/app/product-images/BrandScenesInfoModal.tsx`

The product-images page uses bolder weights (title `text-2xl/3xl font-bold tracking-tight`, section titles `text-lg font-semibold tracking-tight`, body `text-sm/text-base text-muted-foreground`). The current modal uses `font-light 24px` which feels off-brand. Update to match:

- Eyebrow stays `BRAND SCENES` uppercase muted, but moved back inline with the existing pattern (no hairline divider rule).
- Title: `text-2xl font-bold tracking-tight text-foreground` (was `font-light text-[24px]`). Keeps single line wrap on small widths.
- Subtitle: `text-sm text-muted-foreground` (was `text-[12.5px] font-light`). Same copy.
- Icon chip: keep `w-11 h-11 rounded-full bg-primary/10` with `Wand2 w-4 h-4 text-primary` (mirrors the trigger banner — visual continuity).
- Feature list rows: drop the `font-light` body. Use `text-sm text-foreground/90` for label, `text-xs font-medium text-primary/70` for the `01/02/03` numerals so they read as accents, not muted ghosts. Keep `border-border/50` hairlines, `py-3.5` rows.
- Primary CTA: `Button` `h-11 rounded-full bg-foreground text-background text-sm font-semibold gap-1.5`. Label `Create Brand Scene` / `Upgrade plan`, ArrowRight slides on hover.
- "Maybe later": back to a soft ghost link — `text-xs text-muted-foreground hover:text-foreground` (was uppercase-tracked, too distant). Easier dismiss read.
- Footer hint when locked: `text-xs text-muted-foreground text-center mt-2` "Brand Scenes are available on Growth and above" (was uppercase tracked — also too distant).
- Container: `max-w-sm w-[calc(100%-2rem)] p-6 sm:p-7 rounded-3xl` (slightly less padding, snappier).

## Out of scope
- `FreeSceneBanner` removal (already done last turn).
- `FreeLimitToast`, scene selection logic, generation, RLS — untouched.
- No new files, no new dependencies, no semantic-token additions.

## Verification
- Visual check via preview at `/app/generate/product-images` → Shots step → trigger card + opened modal.
- No type changes, no behavior changes.
