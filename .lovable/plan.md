

## Make Logo Bigger and Rename to "VOVV"

Two simple text changes in `src/components/app/AppShell.tsx`:

**1. Sidebar logo (line 136)** — Change `VOVV.AI` to `VOVV` and increase size from `text-lg` to `text-xl`:
```tsx
<span className="font-bold text-xl text-sidebar-foreground tracking-tight">VOVV</span>
```

**2. Mobile header logo (line 317)** — Same change:
```tsx
<span className="font-bold text-xl text-sidebar-foreground tracking-tight">VOVV</span>
```

One file modified: `src/components/app/AppShell.tsx`

