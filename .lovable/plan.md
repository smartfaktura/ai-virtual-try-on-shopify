

## Add Sophia's Animated Video to the Landing Page and Dashboard

### What Changes

Replace Sophia's static image with her animated "happy vibe" video in two places:
1. **Landing Page Team Section** (the large carousel cards)
2. **Dashboard Team Carousel** (the small avatar strip)

All other 9 team members remain as static images.

### Performance Strategy (No Slowdown)

The video will NOT impact page load speed because of these safeguards:

- **`preload="none"`** -- The browser won't download a single byte of video until it's needed
- **`poster` attribute** -- Sophia's static JPG image is shown immediately as a placeholder while the video loads
- **`loading="lazy"` equivalent** -- The video sits below the fold (after the hero), so it won't compete with initial page resources
- **`autoPlay` + `muted` + `loop` + `playsInline`** -- Required for silent autoplay on all browsers including Safari/iOS
- **Single video only** -- One 5-second MP4 (roughly 1-3 MB) among 9 static images is negligible

If all 10 members were animated in the future, we'd add Intersection Observer to only load videos when they scroll into view, but for a single video this is unnecessary.

### Technical Changes

**1. `src/components/landing/StudioTeamSection.tsx`**

- Add optional `videoUrl` field to the `TeamMember` interface
- Set Sophia's `videoUrl` to the permanent storage URL
- Replace the `<img>` render logic with a conditional: if `videoUrl` exists, render a `<video>` element with the static image as `poster`; otherwise render `<img>` as before
- Video attributes: `autoPlay`, `muted`, `loop`, `playsInline`, `preload="none"`, `poster={member.avatar}`

**2. `src/components/app/DashboardTeamCarousel.tsx`**

- Add optional `videoUrl` field to the team data
- Same conditional rendering: `<video>` for Sophia, `<img>` for everyone else
- Smaller container (80x80px) so the video file loads quickly at this size

### Data

The permanent video URL from storage:
```
https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/generated-videos/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/849393075369279549.mp4
```

### Files Modified

| File | Change |
|------|--------|
| `src/components/landing/StudioTeamSection.tsx` | Add `videoUrl` to interface and Sophia's data; conditional video/image rendering |
| `src/components/app/DashboardTeamCarousel.tsx` | Add `videoUrl` to Sophia's data; conditional video/image rendering |

No new files, no database changes, no edge function changes.

