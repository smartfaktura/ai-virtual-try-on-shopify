

## Fix "Generate Video" Button Style to Match Other Buttons

The current "Generate Video — Coming Soon" button looks visually inconsistent because of the extra `opacity-50` class on top of the `disabled` attribute (which already applies `disabled:opacity-50` from the Button component). This double-opacity makes it look too faded compared to the other outline buttons.

### Changes

**`src/components/app/LibraryDetailModal.tsx`** (~line 247-255)

Remove `opacity-50 cursor-not-allowed` from the className — the `disabled` prop on `<Button>` already handles those styles via the base button component. This makes it visually consistent with the other outline buttons, just non-clickable.

```tsx
// Before
<Button variant="outline" disabled className="w-full h-11 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed">

// After
<Button variant="outline" disabled className="w-full h-11 rounded-xl text-sm font-medium">
```

**`src/components/app/WorkflowPreviewModal.tsx`** (~line 228-234)

The Video button here uses a raw `<button>` with custom styling instead of matching the Upscale/Perspectives buttons above it. Normalize its styles to match:

```tsx
// Match the same style pattern as the Upscale/Perspectives buttons above
<button disabled className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 cursor-not-allowed opacity-50">
```

Both changes ensure the Video button looks like a natural part of the button group — just slightly dimmed to indicate "not yet available."

