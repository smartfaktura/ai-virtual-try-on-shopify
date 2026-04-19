

## What I see

On `/app/freestyle`, the console is firing two React warnings:

1. **`Badge`** (`src/components/ui/badge.tsx`) is a plain function component but something inside `ImageCard` passes a ref to it.
2. **`ImageCard`** (`src/components/app/freestyle/FreestyleGallery.tsx`) is a plain function component but something inside `FreestyleGallery` passes a ref to it.

The "Error — The app encountered an error" toast in the screenshot is from a **different** flow (Add Products on `/app/products`) — not from the page the user is currently on. Without a reproducible payload for that, I'll address the live, diagnosable issue: the two ref warnings.

These warnings are dev-mode noise today, but they break any feature that *does* try to read those refs (tooltips, focus management, animations) — so worth fixing cleanly.

## Fix (small, surgical)

### 1. Wrap `Badge` in `React.forwardRef`
File: `src/components/ui/badge.tsx`

```tsx
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";
```

### 2. Wrap `ImageCard` in `React.forwardRef`
File: `src/components/app/freestyle/FreestyleGallery.tsx`

Convert the `function ImageCard({...})` declaration into a `forwardRef` component that accepts a forwarded `ref` on its root `<div>` (both the `natural` branch and the default branch). Add a `displayName`.

No other behavior changes.

## Result

- Both React warnings disappear on `/app/freestyle`.
- Any future `Tooltip`, `Slot`, or animation library that asChild-wraps a `Badge` or `ImageCard` will work without breakage.
- Zero functional change to gallery rendering.

## Files to edit

- `src/components/ui/badge.tsx` — convert to `forwardRef`.
- `src/components/app/freestyle/FreestyleGallery.tsx` — convert `ImageCard` to `forwardRef`, attach ref to root `<div>` in both branches.

## Note on the screenshot toast

The "Error — The app encountered an error" in the Add Products modal is a separate, currently non-reproducible event. If you can reopen Add Products and trigger it again, the console/network at that moment will let me pinpoint it. I can address it in a follow-up.

