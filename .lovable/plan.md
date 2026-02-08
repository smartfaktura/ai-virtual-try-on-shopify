

## StudioTeamSection Improvements

Three changes to the landing page Studio Team carousel:

### 1. Reorder Team: Move Luna Before Kenji
Luna (Retouch Specialist, currently position 7) will be moved to position 3 in the array, right before Kenji (Campaign Art Director). The new order will be:
Sophia, Amara, **Luna**, Kenji, Yuki, Omar, Sienna, Max, Zara, Leo

### 2. Remove Scrollbar
The carousel currently shows a visible scrollbar at the bottom (seen in the screenshot). This will be hidden by:
- Removing the `scrollbar-thin` class and the `scrollbarColor` inline style
- Adding `scrollbar-width: none` and `-ms-overflow-style: none` CSS to fully hide the scrollbar (matching the approach already used in `DashboardTeamCarousel.tsx`)

### 3. Add Slow Auto-Rotate
The carousel will automatically scroll through team members at a slow, continuous pace:
- Uses a `setInterval` that scrolls the container by a small pixel amount (e.g., 1px) every ~30ms for a smooth, continuous drift
- Pauses auto-scroll when the user hovers over the carousel or manually interacts with the navigation arrows
- Resumes auto-scroll when the user stops hovering
- Wraps back to the start when reaching the end

---

### Technical Details

**File: `src/components/landing/StudioTeamSection.tsx`**

- **TEAM array reorder**: Move the Luna object from index 6 to index 2 (before Kenji at current index 2)
- **State additions**: Add `isHovered` state ref and `intervalRef` for the auto-scroll timer
- **useEffect hook**: Set up the auto-scroll interval that scrolls the container rightward by ~1px every 30ms. When it reaches the end, it resets to the beginning. Cleans up on unmount.
- **Event handlers**: Add `onMouseEnter`/`onMouseLeave` on the carousel container to pause/resume the auto-scroll. Also pause when arrow buttons are clicked.
- **Scrollbar removal**: Replace `className="... scrollbar-thin"` with hidden scrollbar styles: `scrollbarWidth: 'none', msOverflowStyle: 'none'` and remove the `scrollbarColor` style

No changes needed to `DashboardTeamCarousel.tsx` for this request (it already has hidden scrollbar and a different layout).

