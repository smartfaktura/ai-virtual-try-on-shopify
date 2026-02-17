

## Make Freestyle Grid Scroll Behind Floating Header on Mobile

### Desired Behavior

- **At rest**: Images start just below the floating header with a small gap matching the grid spacing
- **When scrolling**: Images slide up and disappear behind the floating header (the header stays on top, content scrolls underneath it)

### How It Works

The floating mobile header is `fixed` with `z-40`. Currently the freestyle container starts exactly below it. To get the overlap-on-scroll effect, the container needs to extend up into the header zone so its scrollable content can travel behind the header.

### Changes in `src/pages/Freestyle.tsx`

1. **Pull container up behind the header on mobile**: Change `-mt-4` to `-mt-24` on mobile (matching the AppShell's `pt-24`). This makes the freestyle container start at the very top of the viewport, behind the header.

2. **Set height to full viewport on mobile**: Change from `calc(100dvh - 5rem)` to `100dvh` since the container now starts at viewport top.

3. **Add top padding to scroll area**: Change `pt-1` to `pt-[5rem]` on mobile (80px, matching the header height). This ensures images initially appear just below the header. As you scroll, they travel up and behind the z-40 header.

### Result

- Initial view: images start right below the floating header with the grid gap
- Scrolling: images smoothly slide behind the semi-opaque header bar
- Desktop: no changes (sidebar layout is unaffected)

