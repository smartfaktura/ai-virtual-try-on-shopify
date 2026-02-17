

## Fix Freestyle Mobile Layout

### Issues Identified

1. **Images overlap the mobile header**: The Freestyle page uses negative margins (`-mt-4 sm:-mt-6 lg:-mt-8`) and `height: calc(100dvh)` to break out of the AppShell padding. But on mobile, the header is a fixed floating bar with `pt-24` offset in AppShell. The negative top margin causes the gallery to slide behind the header.

2. **Prompt bar cut off / requires scrolling**: The prompt panel is positioned `absolute bottom-0` inside a div with `height: calc(100dvh)`. However, on mobile, this 100dvh container sits inside the AppShell's scrollable `main` element with its own padding. The absolute positioning doesn't reliably pin to the actual viewport bottom on mobile.

3. **Images off-center with gap on right side**: The negative horizontal margins (`-mx-4 sm:-mx-6`) combined with `px-1` on the masonry grid create asymmetric spacing. The scrollbar on the left side also shifts perception.

4. **Style presets (Cinematic, Editorial, etc.) take too much space on mobile**: All 6 presets are shown as individual chips, eating vertical space on the prompt panel.

### Changes

**File: `src/pages/Freestyle.tsx`**

- On mobile (below `lg`), remove the negative top margin override so content starts below the mobile header naturally
- Adjust the container height calculation to account for mobile header: use `calc(100dvh - 6rem)` on mobile (header height + padding) vs full `100dvh` on desktop
- Ensure the scrollable area has proper bottom padding (`pb-80` on mobile) to clear the prompt panel
- Center the gallery content by ensuring symmetric horizontal padding

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`**

- On mobile, replace the inline `StylePresetChips` row with a "Presets" dropdown button that opens a popover containing the preset options
- On desktop, keep the current inline chips as they are
- Use `useIsMobile()` hook to conditionally render

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

- Add symmetric horizontal padding to the masonry grid container to center images properly on mobile
- Ensure the gap between the first image row and the top of the gallery matches the gap between images (`gap-1`)

### Technical Details

**Freestyle.tsx container fix (line 528)**:
```text
BEFORE: className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mb-4 sm:-mb-6 lg:-mb-8 -mt-4 sm:-mt-6 lg:-mt-8 ..."
         style={{ height: 'calc(100dvh)' }}

AFTER:  className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mb-4 sm:-mb-6 lg:-mb-8 -mt-4 sm:-mt-6 lg:-mt-8 ..."
         style on mobile accounts for header offset
```

The key fix: on mobile, the container should use `height: calc(100dvh - 5.5rem)` to account for the fixed mobile header (56px + 24px padding = ~5.5rem). On `lg+` screens it stays at `100dvh` since the sidebar is beside, not above.

**Prompt bar positioning (line 580)**:
Increase mobile bottom padding on the scroll area from `pb-72` to `pb-80` and ensure the prompt bar itself uses safe bottom insets.

**Style presets mobile optimization (FreestyleSettingsChips.tsx, line 347-348)**:
```text
BEFORE: <StylePresetChips selected={stylePresets} onChange={onStylePresetsChange} />

AFTER:  On mobile -> a single "Presets" chip button that opens a Popover
        On desktop -> same inline StylePresetChips as before
```

The Presets popover will show all 6 options as toggleable items in a compact vertical list, matching the existing dropdown pattern used by Quality, Camera Style, etc.

**Gallery centering (FreestyleGallery.tsx)**:
Ensure the masonry grid uses equal `px-1` padding on both sides and the container itself is not offset by any parent negative margins. The content wrapper will center properly within whatever space is available.

