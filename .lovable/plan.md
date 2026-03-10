

## Why Pages Flash on First Visit (and How to Fix It)

### Root Cause

Every app page (Dashboard, Products, Freestyle, etc.) is **lazy-loaded** with `React.lazy()`, and the `Suspense` wrapper uses `fallback={null}` — meaning while the page JS chunk downloads, the user sees **nothing** (blank content area), then the page pops in. This creates a visible flash on first visit.

On subsequent visits the chunk is cached, so it feels instant. But first visit = network fetch = flash.

### Is This Good?

Lazy loading itself is good for initial load performance (smaller bundle). But the **user experience of the transition is bad** because there's no visual feedback. The sidebar stays, content disappears, then reappears — feels broken.

### Fix

Replace `fallback={null}` with a subtle loading skeleton that matches the app layout, so the sidebar persists and the content area shows a shimmer/spinner instead of going blank.

#### Changes

**`src/components/app/AppShellLoading.tsx`** (new file)
- A simple skeleton component: a few rounded shimmer bars matching the typical page header + content area layout
- Lightweight, no lazy loading needed (bundled with AppShell)

**`src/App.tsx`** — line 71
```tsx
// Before
<Suspense fallback={null}>

// After — wrap the inner app routes with a content-area skeleton
```

For the **protected `/app/*` routes specifically**, add a second `Suspense` inside `AppShell` so the sidebar stays rendered while only the content area shows the skeleton:

```tsx
<AppShell>
  <Suspense fallback={<AppShellLoading />}>
    <Routes>
      ...
    </Routes>
  </Suspense>
</AppShell>
```

The outer `Suspense` (for public routes) can use a simple centered spinner.

This way:
- Sidebar never disappears during navigation
- Content area shows a brief skeleton instead of blank
- No flash of empty content

