# Estimate + "safe to leave" treatment — Step 5 generating

Scope: `src/components/app/product-images/ProductImagesStep5Generating.tsx` only. Replace the chunky `Info` icon + long sentence at the bottom with a quieter, premium two-line block.

## Current state
- Thumbnails: already shown across all phases (sparkle dropped — keep as is).
- Bottom row today: `Info` icon + `About X–Y minutes for your batch. Safe to leave — results appear in your library` — feels heavy, repeats progress info, and crowds the card.

## New treatment

A single, centered, ultra-quiet block under the team chat bubble (and per-product progress when present):

```text
                Estimated ~3–5 min
        Safe to leave — we'll save results to your library
```

- **Line 1 — estimate**
  - `text-xs text-muted-foreground tracking-wide`
  - Multi-image batch: `Estimated ~{lowMin}–{highMin} min`
  - When `lowMin === highMin`: `Estimated ~{lowMin} min`
  - Single image: `Estimated under a minute`
  - Reuses existing `lowMin` / `highMin` math (10–15s per image) — no logic change.
  - No icon, no period (single-sentence subtitle rule).

- **Line 2 — reassurance (delayed)**
  - `text-[11px] text-muted-foreground/70`
  - Copy: `Safe to leave — we'll save results to your library`
  - Only renders once `elapsed >= 20s` so the initial state stays clean and the line earns its place only when the user might actually consider walking away.

- **Container**
  - Plain `<div className="text-center space-y-1">` — no border, no background, no icon.

## Out of scope
- No changes to thumbnails, phase logic, progress math, team chat, per-product progress, slow warning, view-results button, or any other page.
