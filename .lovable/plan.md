

## Freestyle Studio -- Sticky Prompt Bar and Full-Screen Gallery

Two changes to make the Freestyle page feel immersive and professional:

---

### 1. Sticky Prompt Bar (Always Visible)

The prompt panel currently lives inside the scrollable content area, so it scrolls off-screen when the gallery grows. The fix is to make the Freestyle page use a proper split layout:

- The page becomes a flex column filling the full available height
- The **gallery area** gets `flex-1 overflow-y-auto` so only the gallery scrolls
- The **prompt panel** sits below the gallery with `flex-shrink-0`, always pinned at the bottom of the viewport
- This way, scrolling the gallery never moves the prompt bar

### 2. Full-Screen Edge-to-Edge Gallery

Currently the images are constrained by:
- AppShell's `max-w-7xl mx-auto p-4 sm:p-6 lg:p-8` wrapper (adds side padding + limits width)
- Gallery's own `p-4 sm:p-6` padding
- Grid's `rounded-xl` and `gap-[2px]`

The fix:
- Freestyle page uses negative margins to break out of AppShell's padding container, filling the full content width
- Gallery removes its own internal padding
- Images go edge-to-edge with minimal 1-2px gaps between them
- Remove `rounded-xl` on the grid container for a clean, full-bleed look

---

### Technical Changes

**File: `src/pages/Freestyle.tsx`**

- Add negative margins to cancel AppShell's padding: `-mx-4 sm:-mx-6 lg:-mx-8 -mb-4 sm:-mb-6 lg:-mb-8`
- Adjust the height calculation to account for the removed vertical padding
- Keep the current flex column structure (gallery scrolls, prompt bar stays at bottom)
- Remove the extra `p-4 sm:p-6` padding from the gallery scroll container
- Add a subtle top gradient/shadow on the prompt bar area so it visually separates from gallery content when scrolling

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

- Remove `rounded-xl` from the grid container (images go full-bleed)
- Keep the minimal `gap-[2px]` between images for visual separation
- Images remain at `aspect-[3/4]` with hover effects intact

**No changes to AppShell, FreestylePromptPanel, or any other files.**

### Visual Result

```text
+-----------------------------------------------------------+
|  [Header bar]                                   [User v]  |
+-----------------------------------------------------------+
|          |                                                 |
| Sidebar  |  [img] [img] [img]  <-- edge to edge, no      |
|          |  [img] [img] [img]      padding, scrollable    |
|          |  [img] [img]                                    |
|          |                                                 |
|          |-------------------------------------------------|
|          |  Describe what you want...          <-- STICKY  |
|          |  [Upload | Model | Scene] | [1:1 | Std | ...]  |
|          |                           [ Generate (1) ]      |
+-----------------------------------------------------------+
```

The prompt bar stays visible at all times. The gallery scrolls independently behind it.
