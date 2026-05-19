## Polish Summary card

Refine the Summary section in `src/pages/BrandModels.tsx` (lines ~827-895) for a cleaner, calmer look.

### Visual: replace the `Users` icon placeholder

When no reference image is uploaded, render a small overlapped trio of the same `mockModels.slice(0, 3)` previews already used in the empty state — keeps the aesthetic consistent and makes the card feel populated.

- Container: `flex items-end -space-x-2` (subtle overlap, no scale tricks).
- Each: `w-9 h-12 rounded-md object-cover ring-2 ring-background shadow-sm`, middle one `z-10` so the stack reads cleanly.
- When `previewUrl` exists (user uploaded a reference), show a single `w-12 h-12 rounded-lg` thumbnail instead — same as today.

### Drop the `Sparkles` icon

The cost row reads cleaner without the decorative icon. Plain text only.

### Tighten the layout

- Header row: thumbnail + title block aligned with `items-center gap-3`. Title `text-sm font-medium`, sublabel removed (the "3 variations" info is already in the cost line below — no duplication).
- Trait chips: smaller gap (`gap-1.5`), `mt-3.5`. Drop `morphology` ("average") from the chips when it's the default value to reduce noise — keep `gender`, `age`, `ethnicity`, plus `hairColor` when set.
- Divider: keep `h-px bg-border/50 my-4`.
- Cost row: `flex items-center justify-between text-xs`.
  - Left: `<span className="font-medium text-foreground">3 variations</span><span className="text-muted-foreground"> · 20 credits</span>` (or "Free" when public).
  - Right: `text-muted-foreground` → `Balance {balance}`.
- Validation error stays as the small destructive line beneath.

### Out of scope
- No changes outside the Summary block.
- No new imports beyond `mockModels` (already imported).
- `Sparkles` import stays (still used elsewhere in file — verify with grep before removing).