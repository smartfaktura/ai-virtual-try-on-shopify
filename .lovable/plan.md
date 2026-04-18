

## Restore /app/products subtitle to regular style

### Issue
Earlier I made the `/app/products` subtitle into a "rich JSX node" with headline + supporting detail + product count chip. User didn't ask for that — they want the standard plain muted subtitle like every other `/app/*` page, just as a single engaging statement with no period.

### Plan
1. Open `src/pages/Products.tsx`, find the `<PageHeader>` usage.
2. Replace the JSX `subtitle` node with a plain single-sentence string.
3. Remove any now-unused imports (count chip, icons, helpers introduced for the rich subtitle).

**Proposed copy:**
> `"Upload once and reuse across every Visual Type"`

One sentence, no period, matches the quiet muted style used on Models / Discover / etc.

### Acceptance
- `/app/products` subtitle renders as a single plain muted line (same visual weight as other app pages)
- No product count chip, no headline+detail rhythm, no extra JSX
- No trailing period
- No unused imports left behind

