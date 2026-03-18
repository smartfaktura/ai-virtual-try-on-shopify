

## Fix: Center-align "Generate Video" Button Text

The "Coming Soon" span uses `ml-auto` which pushes it to the far right and forces the icon+label to the left. The other buttons center their content naturally.

### Change in `src/components/app/LibraryDetailModal.tsx` (~line 254)

Replace `ml-auto` with `ml-2` on the "Coming Soon" span so the entire button content stays centered together:

```tsx
// Before
<span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Coming Soon</span>

// After
<span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Coming Soon</span>
```

This keeps the "Coming Soon" badge close to the label, matching the centered alignment of all other buttons.

