

# Replace Video Hover Cards with Static Image Hover Cards

## What changes
Replace the `<video>` element in `TeamAvatarHoverCard` with a static optimized `<img>`, removing all video-related logic (refs, play/pause callbacks, `onCanPlay`). This eliminates video downloads on hover across all 5 usage sites: SidebarTeamAvatar, OnboardingChecklist, About page, FinalCTA, and the landing StudioTeamSection.

## File: `src/components/landing/TeamAvatarHoverCard.tsx`
- Remove `useRef`, `useCallback` imports and all video refs/handlers (`videoRef`, `shouldPlayRef`, `handleOpenChange`, `handleCanPlay`)
- Remove the `onOpenChange` prop from `<HoverCard>`
- Replace the `<video>` element with a static `<img>` using `getOptimizedUrl(member.avatar, { width: 440, quality: 75 })` (440px = 220px card width x 2 for retina)
- Keep the same `aspect-[4/5]` container, info section with name/role/description — visual layout stays identical

The result is a lightweight image-only hover card. No changes needed in any consumer files since the component API (props) stays the same.

