

## Match `/app/video` section headings to dashboard rhythm

### Issue
On `/app/video` (VideoHub), section headings ("Showcase", "In Progress", "Completed Videos") use `text-lg font-semibold` with `text-sm` subtitles — much smaller than the dashboard `/app` standard (`text-2xl sm:text-3xl font-bold tracking-tight` + `text-base mt-1.5` subtitle, wrapped in `space-y-4`).

### Change
**File: `src/pages/VideoHub.tsx`**

For each section block, swap heading classes to match dashboard:

1. **Showcase** (line 238-242)
   - Wrapper: `space-y-3` → `space-y-4`
   - h2: `text-lg font-semibold text-foreground` → `text-2xl sm:text-3xl font-bold text-foreground tracking-tight`
   - p: `text-sm text-muted-foreground` → `text-base text-muted-foreground mt-1.5`

2. **In Progress** (line 267-274) — inline heading with badge
   - Wrapper: `space-y-3` → `space-y-4`
   - h2: `text-lg font-semibold` → `text-2xl sm:text-3xl font-bold tracking-tight`
   - (No subtitle here; keep dot + badge inline.)

3. **Completed Videos** (line 291-306)
   - Wrapper already `space-y-4` ✓
   - h2: `text-lg font-semibold` → `text-2xl sm:text-3xl font-bold tracking-tight`

### Also check: Create Video section above (lines ~190-235)
Confirm the "Create Video" section heading also matches. If it currently uses `text-lg`, bump it to the same standard so the whole page is consistent.

### Acceptance
- Section titles on `/app/video` visually match `/app` dashboard ("Your Products, In Motion" size).
- Subtitles use `text-base` with `mt-1.5`.
- 16px gap (`space-y-4`) between heading block and content.
- No regression to badges or inline controls.

