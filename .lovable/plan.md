

## Fix Sidebar Team Avatar Hover Card

Two issues from the screenshots:

1. **Video not playing** — `preload="none"` means the video isn't loaded when the card opens. The `onOpenChange` callback tries to play immediately but the video hasn't loaded yet. Fix: change `preload` to `"metadata"` and add an `onCanPlay` handler to auto-play when ready.

2. **Hover card overlaps sidebar** — `side="top"` causes the card to appear above and overlap the menu. Change to `side="right"` so it appears outside the sidebar, on the main page area. The previous attempt used `"right"` but it was changed to `"top"` — the real fix is `side="right"` combined with enough `sideOffset` to clear the sidebar edge.

### Changes

**`src/components/landing/TeamAvatarHoverCard.tsx`**
- Change `preload="none"` → `preload="metadata"` so video is ready to play on hover
- Add `autoPlay` attribute triggered via the `onOpenChange` callback with a small delay to ensure the video source is loaded
- Use `video.load()` before `video.play()` as fallback

**`src/components/app/SidebarTeamAvatar.tsx`**
- Change both `side="top"` → `side="right"` so the hover card appears to the right of the sidebar, on the page content area
- Add `sideOffset={16}` to give breathing room from the sidebar edge

