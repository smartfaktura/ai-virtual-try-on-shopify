## Plan — Fresh Scenes mobile modal polish

Update `src/components/app/DashboardFreshScenes.tsx` only.

### 1. Remove the “active/hover” looking CTA state on mobile
- The screenshot shows the primary button with a heavy double-outline/focus ring.
- Add mobile-specific focus styling so touch focus does not leave that visible ring.
- Keep desktop keyboard accessibility intact with focus-visible behavior on larger screens.

### 2. Remove the weird image side bars
- Change the mobile preview image from `object-contain` back to a natural mobile crop using `object-cover`.
- Use a stable mobile image frame, likely around `aspect-[4/5]` with a controlled max height, so the image fills the modal width without white/gray side bars.
- Keep desktop behavior unchanged.

### 3. Keep the modal mobile-first and fitting normally
- Keep the simplified mobile content: image, collection label, title, short subtitle, CTA, Close.
- Slightly tune mobile spacing/padding if needed so it fits cleanly inside the visible viewport.
- Preserve hidden desktop-only details (`What you get`, metadata) and the desktop two-column layout.

### Expected result
- Mobile modal opens as a clean card.
- Image fills the top area without side bars.
- CTA looks normal after tapping/opening, not stuck in an active/focused hover state.
- Desktop Fresh Scenes modal remains unchanged.