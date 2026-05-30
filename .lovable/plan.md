## `/app/video` — clearer hub layout + uniform recent cards

All changes in `src/pages/VideoHub.tsx`. No backend, no hook changes.

### 1. Reorder + label sections so the page reads top-to-bottom

Current order is: PageHeader → In Progress → Completed Videos → workflow cards → Showcase. Users can't tell what the page is for. New order with titled sections:

1. **PageHeader** — keep existing copy.
2. **"Start a New Video"** — subtitle: *"Pick how you want to bring your visuals to life"*. Contains the existing `workflowCards` grid.
3. **"In Progress"** (only when `processingVideos.length > 0`) — subtitle: *"Your videos are rendering — feel free to keep working"*. Keep existing amber dot + count badge.
4. **"Recent Videos"** (only when `completedVideos.length > 0`) — subtitle: *"Your latest 8 generations"*. New uniform 4:5 grid (see §2). Drop the "Load More" button and the `/ totalCount` fraction.
5. **Showcase** — unchanged, still only when `!hasOwnVideos`.

Each section uses the same shell:

```tsx
<section className="space-y-4">
  <div>
    <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
    <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
  </div>
  {content}
</section>
```

Outer wrapper bumps from `space-y-8` to `space-y-12` for clearer separation.

### 2. Show only last 8 recent videos as 4:5 cards with ratio badge

In `VideoHub`, slice completed list: `completedVideos.slice(0, 8)`. Drop `loadMore`, `hasMore`, `isLoadingMore`, and the Load More button. Keep the Select / bulk-download flow but operate on the visible 8.

Update `RecentVideoCard`:

- Add prop `forceRatio?: string`. When provided, ignore the dynamic `naturalRatio` logic and use it directly. Hub passes `forceRatio="4/5"`. Animate-only / detail callers stay unaffected because they don't pass the prop.
- Image already uses `object-cover` — keep, so the thumb fills the 4:5 frame.
- Add a small ratio badge in the **top-left** (top-right is used by status/camera badges):
  ```tsx
  {video.aspect_ratio && (
    <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] bg-background/80 backdrop-blur-sm text-foreground">
      {video.aspect_ratio}
    </Badge>
  )}
  ```
  When `selectMode` is on, the select circle already lives at top-left — in that case render the ratio badge at `bottom-2 right-2` to avoid overlap (or simply hide it during select mode; we'll hide it during select mode for simplicity).

Skeleton (`isLoadingHistory`) also switches to `aspect-[4/5]` placeholders, 4 columns.

### Out of scope

- No changes to the workflow card component, the detail modal, the generation hook, or any DB/edge function.
- No changes to AnimateVideo / StartEndVideo pages.
- No new copy beyond the section titles/subtitles above.
