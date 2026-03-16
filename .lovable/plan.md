

## Plan: Replace Dashboard preset preview with Discover-style split modal

### Problem
The "What You Can Create" gallery on the Dashboard opens presets in a small `Dialog` (standard centered card). It should use the same full-screen split-layout modal as the Discover page — large image on the left, controls panel on the right.

### Fix

**`src/components/app/RecentCreationsGallery.tsx`**

Replace the current `Dialog`/`DialogContent` implementation (lines 232-298) with a custom full-screen overlay matching `DiscoverDetailModal`'s pattern:

- Remove the `Dialog`/`DialogContent` import and usage
- Add body scroll lock + Escape key handler (same as DiscoverDetailModal)
- Render a `fixed inset-0 z-[200]` overlay with `bg-black/90` backdrop and `fade-in duration-150`
- **Left panel (60%)**: Full image showcase with `object-contain`
- **Right panel (40%)**: Title, category, workflow badge, prompt text, tags, "Copy Prompt" + "Use This Style" + optional "Try Workflow" buttons, close X button
- On mobile: stack vertically (image 45vh top, controls 55vh bottom) — same as Discover modal
- Keep existing `handleCopyPrompt`, `handleUseStyle` handlers

No new components needed — just inline the split layout in the same file, reusing the exact same CSS classes from `DiscoverDetailModal`.

