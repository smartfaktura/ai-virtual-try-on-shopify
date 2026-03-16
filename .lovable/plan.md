

## Fix sticky navigation for Model and Scene selection steps

### Problem
The `sticky bottom-0` approach doesn't work because the scroll container is `<main id="app-main-scroll">` in AppShell, but the sticky div is deeply nested inside intermediate wrapper divs (`space-y-4`, `max-w-7xl mx-auto px-4...`). CSS `sticky` requires all ancestors between the sticky element and the scroll container to have `overflow: visible` — the nesting breaks it.

Additionally, the Model selection step (line 2883) has no sticky bar at all — its Back/Continue buttons are just inline inside `CardContent`.

### Solution
Use **fixed positioning** instead of sticky, rendering a bottom-pinned bar for both the Model and Scene steps.

**File: `src/pages/Generate.tsx`**

#### 1. Scene step (~line 2933)
Change the sticky div to `fixed bottom-0` with proper width constraints:
```tsx
{/* Replace sticky div with fixed bottom bar */}
<div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between">
    <Button variant="outline" onClick={...}>Back</Button>
    <Button disabled={...} onClick={...}>Continue to Settings (...)</Button>
  </div>
</div>
```

#### 2. Model step (~line 2883)
Move the Back/Continue buttons out of `CardContent` into the same fixed bottom bar pattern:
```tsx
{/* Remove inline buttons from CardContent */}
{/* Add fixed bottom bar after the Card */}
<div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between">
    <Button variant="outline" onClick={...}>Back</Button>
    <Button disabled={!selectedModel} onClick={...}>Continue to Scene</Button>
  </div>
</div>
```

#### 3. Add bottom padding
Add `pb-20` to both step wrapper divs (`<div className="space-y-4 pb-20">`) so content doesn't get hidden behind the fixed bar.

#### 4. Account for sidebar
Use `lg:left-64` (or whatever the sidebar width is) on the fixed bar so it doesn't overlap the sidebar on desktop. Will check actual sidebar width before implementing.

