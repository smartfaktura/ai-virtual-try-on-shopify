

# Improve Creative Drops UI/UX — Clean Up Drop Cards & Remove Redundant Filters

## Problems

1. **Double tab rows**: Main tabs (Drops / Scheduled / Calendar) sit directly above filter pills (All / Scheduled / Generating / Ready / Failed) — visually confusing and redundant. "Scheduled" appears in both rows.
2. **Inconsistent action buttons**: The drop card has a `ready` badge, a bordered download icon button, and a ghost dots menu — three different visual styles crammed together.
3. **Drop card layout is cluttered**: Status badge, download button, and menu dots all compete for attention. The "View Drop →" text link at the bottom is easy to miss.

## Changes

### File 1: `src/pages/CreativeDrops.tsx`

**Remove the filter pill bar entirely** (lines 323-355). The Drops tab already defaults to showing all drops — filtering by status adds complexity with very little value at this scale. Replace with a simple count + sort toggle row:
```
3 drops                                    Newest first
```

This eliminates the confusing second row of tabs.

### File 2: `src/components/app/DropCard.tsx` — Redesign drop card

**Simplify the drop card layout:**

1. **Remove the separate download icon button** (line 351-353) — it's redundant with "View Drop" which opens the full preview modal with download
2. **Remove the dots menu** for ready drops — the only option is "Delete" which can be accessed via the preview modal or a long-press/right-click pattern. Keep dots menu only if there are multiple actions.
3. **Replace badge + buttons row** with a single clean right-side area:
   - For `ready`: Show "View Drop →" as a subtle text button on the right (move from bottom to inline)
   - For `generating`: Show progress percentage inline
   - For `failed`: Show "Failed" text in red
4. **Remove the Zap icon** in the left circle — it adds visual noise. Use the first thumbnail image as the card avatar instead (or remove the icon entirely).
5. **Make the entire card clickable** for ready drops (already works) — remove the separate "View Drop →" bottom link since the card itself is the click target.

**New drop card structure:**
```text
┌──────────────────────────────────────────────────────┐
│  [thumb] [thumb] [thumb]   Drop — Mar 20, 2026       │
│                            1 image · 6 credits       │
│                            From: Winter Drop          │
│                                          View →  ⋮   │
└──────────────────────────────────────────────────────┘
```

- Thumbnails move to the left as the card identity
- Title and metadata on the right
- Single "View →" action + dots menu (only for delete)
- No separate download button, no status badge (status is clear from context — if it has images it's ready)

### Summary
- 2 files changed
- Remove filter pills row (redundant with tabs)
- Simplify drop card: remove download button, move thumbnails left, unify action styling
- Cleaner, less cluttered layout matching the luxury restraint aesthetic

