

## Goal
Make truncated workflow card descriptions on `/app/workflows` fully readable without breaking the grid's vertical alignment.

## Problem
`WorkflowCardCompact.tsx:153` uses `line-clamp-2` on descriptions. Many descriptions exceed 2 lines and get cut off mid-word with no tooltip, no expand, no hover reveal — users physically cannot read them.

## Recommended fix (minimal, safest)

**`src/components/app/WorkflowCardCompact.tsx:153`** — Replace `line-clamp-2` with `line-clamp-3` and add a native `title={workflow.description}` attribute on the `<p>`.

- **Why line-clamp-3**: Reviewing typical descriptions in the data, 3 lines fits ~95% of them in full at the current card width. Cards stay grid-aligned because the container uses `flex-1` + `mt-auto` on the button.
- **Why `title` attribute**: Free, native browser tooltip — hover reveals full text for the rare 4-line description. Zero new components, zero layout risk.

## Alternative (heavier — only if you want it)
Replace `<p>` with a shadcn `<Tooltip>` showing the full description on hover. More polish, more moving parts. Skip unless desired.

## Out of scope
- Rewriting/shortening descriptions in DB (could be follow-up audit)
- `mobileRow` / `comingSoon` / `modalCompact` variants (already fine — row has no description, comingSoon already has line-clamp-2 which is acceptable for that compact tile)

## Acceptance
- Workflow cards on `/app/workflows` show up to 3 lines of description
- Hovering a card reveals the complete description via native tooltip
- Card heights remain consistent across the grid (button stays bottom-aligned)
- 1 line changed in 1 file

