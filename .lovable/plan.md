## Goal

Rework `ModelCard` in `/app/models` to use the same visual language as `SceneCard` in `/app/brand-scenes`: rounded-2xl card, taller 4:5 image with hover zoom, always-visible top-right delete pill, and a footer block with title + uppercase meta line + a single primary "Use in Visual Studio" pill button at the bottom — instead of today's hover-overlay CTA and tiny chips.

## Reference

`SceneCard` in `src/pages/BrandScenes.tsx` (lines 195–264) — the target aesthetic.

## Changes — `src/pages/BrandModels.tsx` (`ModelCard`, lines 1155–1227)

Rewrite the card markup; keep all rename + delete logic intact.

- Container: `<div className="group relative rounded-2xl overflow-hidden border border-border bg-card flex flex-col">` (drop shadcn `Card` wrapper to match brand-scenes exactly).
- Image well: `<div className="relative aspect-[4/5] bg-muted overflow-hidden">` with `<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />`. Aspect goes 3:4 → 4:5 to mirror scenes.
- Delete button: always visible, top-right pill matching scenes — `absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-colors`, icon `Trash2 w-3.5 h-3.5`.
- Remove the hover-only "Use in Visual Studio" overlay on the image.
- Footer: `<div className="p-3.5 flex flex-col gap-3">`
  - Title row preserves rename: `<div className="min-w-0 group/name flex items-center gap-1">` containing either the existing inline `<input>` (when `isEditing`) or `<h3 className="text-sm font-semibold tracking-tight truncate flex-1">{model.name}</h3>` + hover pencil button (`opacity-0 group-hover/name:opacity-100 ...`). The input keeps current styling but bumps to `text-sm`.
  - Meta line directly under title: `<p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1 truncate">` rendering `model.gender` and `model.ethnicity` joined with ` · ` (uppercased via CSS), falls back to `"BRAND MODEL"` when both are missing. Drop the existing chip pills.
  - Primary CTA — full-width on mobile, auto-width left-aligned on ≥sm, matching scenes:
    ```tsx
    <Button asChild size="sm" className="rounded-full gap-1.5 h-8 px-3 text-xs w-full sm:w-auto sm:self-start">
      <Link to={`/app/workflows?model=${model.id}`}>
        <Wand2 className="w-3.5 h-3.5" />
        Use in Visual Studio
      </Link>
    </Button>
    ```
- Imports: add `Wand2` to the lucide import (already imported elsewhere in file — verify and dedupe).

## Out of scope

- Brand Models page layout, grid breakpoints, upgrade hero, locked-state list — unchanged.
- No backend, no data shape change.
