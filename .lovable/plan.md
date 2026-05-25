## Goal

Restyle the `/app/models` empty/upgrade screen to match the calmer, editorial vibe of the `/app/brand-scenes` upgrade state (left-aligned panel, soft icon tile, vertical bullet list, divider, single rounded CTA).

## Scope

- File: `src/pages/BrandModels.tsx` -> component `UpgradeHero` (lines ~36–74) only.
- No changes to logic, gating, routes, copy meaning, or any other component.

## New layout (mirrors `BrandScenes` `UpgradeState`)

Single rounded panel `rounded-2xl border border-border bg-card p-8 sm:p-12 max-w-3xl`, left-aligned:

1. Soft icon tile `w-12 h-12 rounded-xl bg-primary/10` containing `Users` icon.
2. H2 `text-xl sm:text-2xl font-bold tracking-tight` - "Brand Models is on Growth and Pro".
3. Subtitle `text-base text-muted-foreground mt-3 leading-relaxed` - "Unlimited custom AI models built to match your brand. Any gender, age, ethnicity, or body type".
4. Vertical bullet list `mt-8 space-y-3`, each row = small `w-7 h-7 rounded-lg bg-primary/10` icon tile + sentence, using 3 benefits:
   - `UserCheck` - Brand consistency: same model across every campaign
   - `Globe` - Any ethnicity and age: represent your diverse audience
   - `Palette` - Custom looks: upload a reference or describe from scratch
5. Divider + CTA: `mt-8 pt-6 border-t border-border`, then `<Button>` rounded-full with `Crown` icon -> "Upgrade to Growth" (keeps existing `openBuyModal()` handler).

Remove the "GROWTH & PRO" pill chip and the 2x2 card grid entirely.

## Copy notes
- No long em dashes (—) in any user-facing copy.
- No trailing period on single-sentence subtitle.

## Out of scope
- `BrandModels` populated state, generator UI, all other pages.
- Copy in shared brand model marketing.

## Verification
- Reload `/app/models` while on Starter plan (gated): panel renders left-aligned, single CTA, matches Brand Scenes visually.
- Sidebar, credits, and Upgrade modal trigger still work.