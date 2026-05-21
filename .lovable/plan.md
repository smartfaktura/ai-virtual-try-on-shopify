# Brand Models — chooser cards full-width + spacious

Two tweaks on top of v2.

## 1. Full container width

Drop the `max-w-2xl mx-auto` constraint. The cards should span the same width as the page header ("New brand model" / subtitle) — edge to edge of the page container.

## 2. More spacious, square-ish cards

Right now the cards are short and wide. Make them feel like generous tap zones:

- Bump padding from `p-6` → `p-10` (more breathing room on all sides).
- Add a minimum height so each card reads as a confident square-ish block: `min-h-[260px]`.
- Increase grid gap back to `gap-4`.
- Title size up to `text-base` so it has presence inside the larger card.
- Bottom spacing for "START →" via `mt-auto pt-10` so it sits comfortably at the floor.

Net effect: two big square-ish panels filling the full content width, each clearly a decisive button.

## Out of scope

Everything else stays — copy, hover behavior, subtitle, eyebrow style.
