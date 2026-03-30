

# Replace Video with Static Image in TeamAvatarHoverCard

## What changes
Replace the `<video>` element with a static `<img>` in the hover card, and remove all video-related logic (refs, play/pause handlers, canPlay callback).

## File: `src/components/landing/TeamAvatarHoverCard.tsx`

- Remove `useRef`, `useCallback` imports (keep only what's needed)
- Remove `videoRef`, `shouldPlayRef`, `handleOpenChange`, `handleCanPlay`
- Remove `onOpenChange` from `<HoverCard>`
- Replace the `<video>` tag with an `<img>` using `getOptimizedUrl(member.avatar, { quality: 75 })` — same poster image, just rendered directly
- Keep the info section (name, badge, description) unchanged

The hover card will show the optimized avatar image instead of loading and playing a video on every hover.

