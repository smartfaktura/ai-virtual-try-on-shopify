

## Plan: Fix Freestyle gallery layout for early generations on mobile

The issue is in the `count <= 3` branch (line 569-586) of `FreestyleGallery`. When there are few images (1-3), it renders a horizontal flex row with `natural` mode images that have no width constraint — only `max-h-[calc(100vh-400px)]`. On mobile, a single image can overflow horizontally or appear disproportionately large.

### Changes

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

1. **Wrap the `count <= 3` layout to be responsive**: On mobile, stack items vertically instead of horizontal flex. On desktop, keep the current centered horizontal layout.

2. **Constrain natural image width on mobile**: In the `ImageCard` natural variant (~line 412), add `max-w-full` and on mobile limit `max-h` to something reasonable like `max-h-[50vh]` instead of `calc(100vh-400px)`.

3. **Fix the wrapper divs**: Change the `count <= 3` container from:
   ```tsx
   <div className="flex items-stretch justify-center gap-2 px-3 lg:px-1">
   ```
   to:
   ```tsx
   <div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-center gap-2 px-3 lg:px-1">
   ```
   This stacks images vertically on mobile and keeps them side-by-side on desktop.

4. **Add max-width per item in the ≤3 layout**: Wrap each generating/blocked/failed/image card in a container with `max-w-full sm:max-w-[45%]` to prevent any single card from being too wide on desktop while allowing full width on mobile.

5. **Cap the natural image max-height on mobile**: Change the `max-h-[calc(100vh-400px)]` class on the `<img>` in natural mode to `max-h-[50vh] sm:max-h-[calc(100vh-400px)]` so it doesn't dominate the mobile screen.

