

## Mobile Prompt Bar Redesign: Docked + Collapsible with Advanced Settings

### Overview

Replace the floating prompt bar on mobile with a full-width docked bottom panel that has rounded top corners and can be collapsed to reveal the full grid. Settings are split into "main" (always visible) and "advanced" (collapsed by default).

### Changes

**1. `src/components/app/freestyle/FreestylePromptPanel.tsx`** -- Major mobile redesign

- On mobile (`lg:` breakpoint), change the outer container from `rounded-2xl` floating card to a docked panel: remove border-radius on bottom, add `rounded-t-2xl` only, remove shadow, make full-width
- Add a collapse/expand toggle button (chevron handle) at the top of the panel
- When collapsed, hide everything except the toggle handle (thin pill/bar)
- When expanded (default), show prompt textarea + main chips + generate button
- Accept new `isCollapsed` / `onToggleCollapse` props (state managed in parent)

**2. `src/components/app/freestyle/FreestyleSettingsChips.tsx`** -- Split into main vs advanced

- On mobile only, split chips into two groups:
  - **Main row**: Upload Image, Add Product, Model, Scene, Aspect Ratio, Image Count
  - **Advanced section** (collapsible): Framing, Brand, Exclude, Quality/Standard/Pro, Camera Style, Polish, Presets
- Use `Collapsible` from Radix for the advanced section with a small "More settings" toggle
- On desktop (`lg:+`), keep all chips in a single flow as they are today

**3. `src/pages/Freestyle.tsx`** -- Layout changes for docked bar

- Remove the `absolute` positioning and gradient overlay for the prompt bar on mobile
- Instead, use a flex column layout: scrollable grid area (flex-1) + docked prompt panel at bottom
- Reduce `pb-72` scroll padding since the bar is no longer overlapping
- Manage `isPromptCollapsed` state here, pass to `FreestylePromptPanel`
- On desktop, keep the existing floating/absolute behavior unchanged

### Technical Details

**Freestyle.tsx layout restructure (mobile only):**
```text
div.freestyle-root (h-dvh, flex flex-col on mobile)
  +-- div.scroll-area (flex-1, overflow-y-auto, pb-4 on mobile)
  +-- div.prompt-dock (on mobile: static, full-width, rounded-t-2xl, bg-background border-t)
       +-- collapse handle (thin pill bar at top)
       +-- FreestylePromptPanel content (hidden when collapsed)
```

On desktop (`lg:`), the prompt bar retains its current `absolute bottom-0` positioning with gradient.

**FreestyleSettingsChips split (mobile only):**
- Main chips: Upload, Product, Model, Scene, Aspect Ratio, Image Count stepper
- Advanced (collapsed by default): Framing, Brand, Exclude, Quality, Camera Style, Polish, Presets
- Toggle shows "More settings" with count of active advanced settings

**Collapse behavior:**
- `isPromptCollapsed` state in `Freestyle.tsx`
- When collapsed: only a small draggable-looking pill/handle visible (height ~32px)
- When expanded: full prompt panel with textarea, chips, generate button
- Default: expanded (open)
- Grid bottom padding adjusts dynamically based on collapsed state

### Files Modified
- `src/pages/Freestyle.tsx` -- layout restructure, collapse state
- `src/components/app/freestyle/FreestylePromptPanel.tsx` -- collapse toggle, mobile docked style
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` -- split main vs advanced on mobile

