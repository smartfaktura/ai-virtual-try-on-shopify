Three small fixes in `src/components/app/product-images/ProductImagesStep2Scenes.tsx`:

1. **Hide grid toggle on mobile.** Remove `<GridSizeToggle>` from the top toolbar entirely. The toggle only lives inside the first category header pill on desktop (sm+); on mobile there's no toggle at all.

2. **Tighten the gap between stepper and the first category.** When the toolbar has no content (no selection), don't render the toolbar wrapper — it currently contributes `space-y-6`'s 24px gap. Wrap the toolbar in `{selectedSceneIds.size > 0 && (...)}`.

3. **Make grid toggle sit nicely inside the pill on desktop.** Keep current `headerRight` placement (inside pill, before badge), already correct. No additional change needed beyond #1.

These are all in lines 416-432 of the file.