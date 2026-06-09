## Why

On `/app/perspectives` the results view shows only **Generate more** and **View in Library** — there's no one-click way to grab every angle of the current generation. Users have to open each image individually.

## Change

Add a **Download All (N)** button next to the existing two CTAs in the results action row (`src/pages/Perspectives.tsx`, around lines 741–765).

### Behavior
- Visible only when `resultEntries.length > 0` (already the condition for the grid).
- Single image → uses `saveOrShareImage` (mobile-friendly: native share / save-to-photos).
- Multiple images → uses `downloadDropAsZip` to bundle into one ZIP named `Perspectives_<source-product-or-date>.zip`.
- Shows progress `0–100%` while zipping (mirrors `WorkflowPreviewModal` pattern) and disables itself during download.
- Filenames inside the ZIP use the variation label (e.g. `45_Front-Right.png`), sanitized.

### Technical

- Reuse existing helpers — no new dependencies:
  - `downloadDropAsZip` from `@/lib/dropDownload`
  - `saveOrShareImage` from `@/lib/mobileImageSave`
  - `toast` from `@/lib/brandedToast`
  - `Download` / `Loader2` / `Archive` icons (already imported elsewhere; verify and add to the existing `lucide-react` import in this file).
- Add local state: `downloading: boolean`, `downloadPct: number`.
- Map `resultEntries` → `DropImage[]` with `{ url, workflow_name: 'Perspectives', scene_name: entry.job.variationLabel }`.
- Place the new button as the **middle** action (Generate more · Download All · View in Library), `variant="outline"`, `size="pill"` to match.

### Out of scope
- No change to grid, lightbox, library, or per-image hover download.
- No change to the "View in Library" / "Generate more" flows.
