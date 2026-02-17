

## Fix Freestyle Mobile Layout Issues

### Problems Found

1. **Gallery scrolls under floating header**: The scroll area inside the Freestyle container has no top padding, so images start directly behind the floating mobile header (which sits at ~80px height).

2. **Prompt bar not at viewport bottom**: The prompt bar and gradient use `bottom-16` (64px offset) on mobile, but there is no bottom tab bar in the app -- so the prompt bar floats 64px above the actual bottom, cut off or mispositioned.

3. **Images not centered / gap on right**: The `-mx-4` negative margin breaks out of AppShell padding, but combined with the scrollable container, creates asymmetric spacing.

4. **Gap between header and first image too large**: The scroll area top padding doesn't match the tight `gap-1` (4px) spacing used in the masonry grid.

5. **Customer support chat icon visible on mobile freestyle**: The `StudioChat` component only hides on the Creative Drops route, not on Freestyle.

### Changes

**File: `src/pages/Freestyle.tsx`**

- Add `pt-20` to the scrollable `div` on mobile (matches the `pt-24` minus the `-mt-4` offset, clearing the 80px floating header). Use `lg:pt-0` so desktop is unaffected.
- Change prompt bar and gradient positioning from `bottom-16 lg:bottom-0` to just `bottom-0` everywhere -- there is no bottom tab bar.
- Reduce the mobile bottom padding on the scroll area from `pb-80` to `pb-72` since the prompt bar is now at the true bottom.

**File: `src/components/app/StudioChat.tsx`**

- Extend the mobile hide logic to also hide on `/app/freestyle`:
  ```
  const hideOnMobile = isMobile && (
    location.pathname === '/app/creative-drops' ||
    location.pathname === '/app/freestyle'
  );
  ```

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

- Remove `pt-3` from the masonry grid container (line 452) so the first row of images sits flush against whatever top padding the parent provides, avoiding double spacing.
- In the few-items layout (line 426), also remove `pt-3` for the same reason.

**File: `src/pages/Freestyle.tsx` (continued)**

- On the `QueuePositionIndicator` wrapper (line 542), change `pt-3` to `pt-1` so the gap between header and queue bar matches the `gap-1` of the grid.
- For the scrollable area, ensure `pt-20 lg:pt-1` so on mobile content clears the floating header and has a minimal gap matching the grid, while desktop has the tight spacing.

### Summary of Visual Effect

- On mobile: content starts just below the floating header with a small gap matching the image grid spacing. The prompt bar sits flush at the bottom of the screen. No customer support icon blocking the view.
- On desktop: no changes.
