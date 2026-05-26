# Improve /app/perspectives generation + results UX

Two frontend-only enhancements to `src/pages/Perspectives.tsx` (no backend changes).

## 1. Source thumbnail during "Creating More Angles…"

Right now the generating view only shows a `Layers` icon and text like *"Generating 2 angles of Uploaded Image"*. Users can't see *which* image they're generating angles from.

- Track the source image URL when generation starts. Add state `generatingSource: { imageUrl: string; title: string } | null`.
- Populate it inside `handleGenerate` from whichever source is active (scratch / first product / first library item).
- In the generating-view header, replace the standalone `Layers` icon tile with a small thumbnail (56×56 rounded square) of the source image, with a tiny `Layers` badge overlay in the bottom-right corner to keep visual identity. Falls back to the current icon tile if no URL is available.

## 2. Results screen after completion (not just a "View in Library" button)

Today, when all jobs complete, the user only sees a feedback card and a "View in Library" button. We'll render the generated images inline.

- Extend the polling fetch to also select the `result` column from `generation_queue` (column already exists, RLS already allows users to read their own rows). Result shape for perspectives is `{ images: [url] }`.
- Store per-job result URLs in new state `jobResults: Record<string, string>` (first image per job).
- When `genAllDone && genCompletedCount > 0`, replace the lone CTA with a **Results** section:
  - Heading: `Your new angles` + count chip.
  - Responsive grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4`), each card shows the image (using `getOptimizedUrl`, quality-only per the no-crop memory rule), the angle label as a small caption, and clicking opens `ImageLightbox`.
  - `ImageLightbox` wired with `onEdit` → `/app/freestyle?editImage=…&imageRole=edit` and `onGenerateAngles` → `/app/perspectives?source=…` (mirrors the Step 6 results pattern already in the codebase).
  - Keep the existing `ContextualFeedbackCard` above the grid.
  - Demote "View in Library" to a secondary ghost button below the grid; primary CTA becomes "Generate more" which resets the generating view.

## Out of scope

- No changes to `useGeneratePerspectives`, edge functions, DB schema, RLS, or the variation list.
- No changes to the step 1–4 builder UI.
- No changes to other pages.

## Files touched

- `src/pages/Perspectives.tsx` — state additions, polling tweak (select `result`), header thumbnail, results grid block.

## Technical notes

- Result URLs from `workflow-previews` bucket are public — render directly via `getOptimizedUrl` without re-signing.
- Reuse existing `ImageLightbox` component (already supports `onEdit` / `onGenerateAngles`).
- Brand-mark + no-terminal-period rules preserved in all new copy.
