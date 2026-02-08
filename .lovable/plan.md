

## Fix: Always-Visible Prompt Bar

The prompt bar should be pinned to the bottom of the Freestyle page in **all states** (empty, few images, many images) so the Generate button is never cut off or scrolled out of view.

---

### Problem

Currently there are 3 different layout modes:
1. **Empty state**: Prompt bar is inline, centered vertically -- works fine
2. **1-3 images**: Prompt bar is part of scrollable content -- **breaks** because it scrolls off-screen
3. **4+ images**: Prompt bar is floating/absolute at bottom -- works fine

### Solution

Unify the layout so the prompt bar is **always pinned at the bottom** of the viewport in a fixed position. The gallery/content area sits above it and scrolls independently with enough bottom padding to avoid overlap.

**Single layout pattern for all states:**

```text
+--------------------------------------------------+
|                                                  |
|   Gallery / Empty State (scrollable area)        |
|   padding-bottom: enough to clear prompt bar     |
|                                                  |
+--------------------------------------------------+
|  ~~~ gradient fade ~~~                           |
|  +--------------------------------------------+  |
|  |  Prompt bar (always pinned at bottom)      |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

---

### Changes

**File: `src/pages/Freestyle.tsx`**

- Remove the 3-way conditional layout (empty / few images / many images)
- Replace with a unified structure:
  - **Content area**: Takes full height, scrollable, with `pb-52` (or similar) to clear the prompt bar
    - If no images: show centered empty state (icon + heading + description)
    - If loading: show spinner
    - If images: show gallery
  - **Floating prompt bar**: Always absolute-positioned at the bottom with gradient fade above it -- same pattern currently used for 4+ images, now used for ALL states
- The empty state will show its icon/text centered in the scroll area, with the prompt bar pinned below -- visually identical to current but structurally consistent

This is a single-file change to `src/pages/Freestyle.tsx` only. No changes to `FreestylePromptPanel` or `FreestyleGallery`.
