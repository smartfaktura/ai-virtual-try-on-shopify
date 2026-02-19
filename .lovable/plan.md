

## Move Customer Support Chat Icon to Left Side (Near Sidebar)

### Current Behavior
The chat bubble button is positioned at `fixed bottom-4 right-4` on tablet/desktop and `bottom-4 left-4` on mobile. It sits in the bottom-right corner, overlapping with the Generate button area.

### Proposed Change
Reposition the chat icon and panel to the **left side** on tablet/desktop, just outside the sidebar, so it doesn't overlap with the prompt panel or Generate button.

**File: `src/components/app/StudioChat.tsx`**

- **Floating button**: Change from `sm:right-4` to `sm:left-[260px]` (when sidebar expanded) -- but since the sidebar width varies (72px collapsed, 240px expanded), use a simpler approach: always anchor to `left-4` on all screen sizes, and on `lg:` screens offset by the sidebar width using `lg:left-[calc(240px+1.5rem)]` for expanded or dynamically use a CSS variable.
- Simpler approach: Position at `left-4` on mobile, `left-[80px]` on `lg:` (collapsed sidebar = 72px + gap), letting it sit just to the right of the sidebar. Since collapsed state is dynamic, we use a fixed left offset that works for both states: `lg:left-[1rem]` places it inside the sidebar margin area, or better -- place it at `bottom-4 left-4` universally and on `lg:` shift it to `lg:left-[calc(var(--sidebar-w,240px)+1.5rem)]`.
- The cleanest solution: Keep `left-4` on mobile/tablet. On `lg:`, position at `lg:bottom-6 lg:left-[calc(theme(spacing.3)+240px+theme(spacing.3))]` which accounts for the sidebar margin (m-3 = 0.75rem) + sidebar width + gap. For collapsed, the sidebar is 72px.
- **Practical approach**: Pass sidebar collapsed state or simply use a fixed `lg:left-20` (80px) that gives clearance for collapsed sidebar (72px + 12px margin) and sits cleanly beside it. When expanded, it'll be overlapped by sidebar -- so better to keep it **above** the sidebar at a fixed bottom-left with enough margin.

**Final approach**: Position the button and panel at `left-4` on all sizes. On `lg:` screens, it naturally sits in the main content area to the left of the content, beside the sidebar (since sidebar has its own space in the flex layout). Actually, since the button is `fixed`, it ignores flex layout. So:

- Button: `fixed bottom-4 left-4` on mobile. On `lg:` use `lg:left-[268px]` (sidebar 240px + margin 12px + gap 16px). When collapsed, the sidebar is 72px, but we don't have access to that state in StudioChat.

**Simplest clean solution**: Move the button positioning to `left-4` on all breakpoints (already is on mobile). On `sm:` and above, keep `left-4` instead of `sm:right-4`. The chat panel also opens from the left. This places it in the bottom-left on all devices, next to (but not overlapping) the sidebar since the sidebar is in the document flow. But `fixed` positioning ignores flow, so on desktop it would overlap the sidebar.

**Best solution**: Accept the collapsed/expanded sidebar state from AppShell via a CSS custom property or simply hardcode for the most common case. Use `lg:left-[268px]` for the expanded state. The sidebar component in AppShell already sets the width, so we can add a CSS variable.

### Implementation

1. **AppShell.tsx**: Add a CSS custom property `--sidebar-offset` on the shell container that equals `72px + 24px` (collapsed) or `240px + 24px` (expanded), based on the `collapsed` state.

2. **StudioChat.tsx**: 
   - Button: `left-4 lg:left-[var(--sidebar-offset)]` 
   - Panel: Same left positioning, opening upward from the button

This keeps it next to the sidebar on desktop/tablet without overlapping.

### Files Changed

| File | Change |
|------|--------|
| `src/components/app/AppShell.tsx` | Add `--sidebar-offset` CSS variable to the shell container based on collapsed state |
| `src/components/app/StudioChat.tsx` | Change button and panel from `sm:right-4` to left-aligned using the CSS variable on `lg:`, keep `left-4` on mobile |
