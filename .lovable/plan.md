

## Truncate Prompt Text in Discover Detail Modals

Add a 4-line clamp with "Show more / Show less" toggle to the prompt section in both detail modals.

### Changes

**1. `src/components/app/DiscoverDetailModal.tsx` (lines 230-239)**
- Replace the plain `<p>` rendering the prompt with a stateful truncated version
- Add `promptExpanded` state (default `false`)
- Apply `line-clamp-4` when collapsed, full text when expanded
- Add a small "Show more" / "Show less" text button below

**2. `src/components/app/PublicDiscoverDetailModal.tsx` (lines 112-119)**
- Same treatment: `line-clamp-4` with expand toggle
- Add `promptExpanded` state

### Result
- Prompt is truncated to ~4 lines by default, keeping the panel compact
- Users can expand to read the full prompt if needed

