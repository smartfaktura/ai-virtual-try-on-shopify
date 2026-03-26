

# Improve Recent Videos Card UI

## Current Issues
- Once a video starts playing, there's **no way to stop/pause it** — no click-to-pause, no visible stop button
- Cards have borders + bottom text area with raw prompts that look cluttered
- "Done" badge is redundant for completed videos
- No hover-to-play — requires explicit click

## Changes to `src/pages/VideoHub.tsx` — RecentVideoCard

### Playback Controls
- **Click video to pause** — clicking a playing video pauses it and shows thumbnail again
- **Hover-to-play on desktop** — use `onMouseEnter`/`onMouseLeave` with a `ref` to auto-play/pause without state toggling
- **Pause icon overlay** — when video is playing, show a pause icon on hover so users know they can stop it
- **Mobile**: tap toggles play/pause

### Visual Cleanup
- Remove bottom text area (prompt + date) — keep cards image/video only
- Remove card border — use borderless with subtle `shadow-sm hover:shadow-md`
- Change aspect ratio from `aspect-square` to `aspect-[3/4]` for editorial feel
- Only show status badge for `processing`/`queued` — hide "Done" badge
- Add a small play triangle badge in corner for completed videos (not playing state)

### Grid
- Show up to 12 items instead of 8
- Use `gap-3` for tighter spacing

### Files Modified
- `src/pages/VideoHub.tsx` — redesign RecentVideoCard component

