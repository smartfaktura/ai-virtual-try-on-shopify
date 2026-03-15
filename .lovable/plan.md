

## Fix: Library not loading all images / missing "Load More" button

### Root Cause

The current pagination is fundamentally broken. Here's why:

**Page 1** (pageParam=0): Fetches jobs 0-59 and freestyle 0-19, expands jobs into ~80+ individual images, merges, sorts, then **trims to 20**. The remaining ~60+ items are discarded.

**Page 2** (pageParam=1): Fetches jobs 60-119 and freestyle 20-39 — completely **new ranges**. The ~60 items trimmed from page 1 are permanently lost. They were fetched, discarded, and never fetched again.

Additionally, if page 2 returns fewer than 20 combined items after trimming, `hasMore` becomes `false` and the "Load More" button disappears — even though dozens of items were skipped.

### Fix: Cursor-based pagination

Instead of offset-based `.range()`, use the `createdAt` timestamp of the last item returned as a cursor for the next page.

**`src/hooks/useLibraryItems.ts`**

1. Change `pageParam` from a page number to a cursor object: `{ jobCursor?: string; fsCursor?: string }` (ISO timestamps)
2. Replace `.range()` with `.lt('created_at', cursor)` (or `.gt` for oldest-first) + `.limit()`
3. Return the last timestamps from each source as the next cursor
4. `hasMore` = true when either source returned a full batch

```text
Page 1:  jobs WHERE created_at < NOW  LIMIT 60  →  expand → merge with freestyle LIMIT 20  →  trim to 20
         Return cursor = { jobCursor: lastJobTime, fsCursor: lastFsTime }

Page 2:  jobs WHERE created_at < jobCursor  LIMIT 60  →  expand → merge with freestyle WHERE < fsCursor  →  trim to 20
         No items lost between pages
```

### Key changes

| Area | Change |
|---|---|
| `pageParam` type | `number` → `{ jobCursor?: string; fsCursor?: string }` |
| Query filters | `.range(from, to)` → `.lt('created_at', cursor).limit(N)` (flip to `.gt` for oldest-first) |
| `getNextPageParam` | Return cursor timestamps from last items of each source |
| `hasMore` logic | `true` if either query returned its full limit |
| `initialPageParam` | `0` → `{}` |

### Files modified
| File | Change |
|---|---|
| `src/hooks/useLibraryItems.ts` | Switch from offset to cursor-based pagination |

