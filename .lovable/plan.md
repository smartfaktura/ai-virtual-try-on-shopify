

# Add Social Tag Promo Card to Library Detail Modal

## Placement Strategy

The best spot is **right after the "Share to Discover" card** (line 285) in `LibraryDetailModal.tsx`. This is strategic because:
- Users have just downloaded their image — they're primed to share it
- It sits alongside the existing "Share to Discover" card, creating a natural social sharing zone
- It's visible without scrolling on desktop (right panel), and appears after the action buttons on mobile
- It doesn't compete with primary actions (Download, Enhance, Perspectives)

## Design

A styled card matching the existing "Share to Discover" aesthetic but with a distinct gradient (e.g., a warm amber/gold tone to differentiate). Content:

```
Icon: Instagram/hashtag icon
Title: Tag Us, Win a Free Year
Body: Post your creation on social media with @vovv.ai and #vovvai — 
      we pick winners every month for a full year of free access.
```

No button needed — it's purely informational/inspirational. Keeps it lightweight and non-intrusive.

## Changes

### `src/components/app/LibraryDetailModal.tsx`

1. Import `Instagram` icon from lucide-react (or use `AtSign` / `Hash` for a more generic look)
2. Add a new promo card between the "Share to Discover" card (line 285) and the Admin actions section (line 287):

```tsx
{/* Social tag promo */}
<div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-2">
  <div className="flex items-center gap-2.5">
    <AtSign className="w-5 h-5 text-amber-500" />
    <h3 className="text-base font-semibold text-foreground">Tag Us, Win a Free Year</h3>
  </div>
  <p className="text-sm text-muted-foreground leading-relaxed">
    Post your creation on social media with <span className="font-semibold text-foreground">@vovv.ai</span> and <span className="font-semibold text-foreground">#vovvai</span> — we pick winners every month for a full year of free access.
  </p>
</div>
```

Single file change. Matches existing card styling conventions.

