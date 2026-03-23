

# Improve Returning User Dashboard: Better CTA Buttons + Subtitle

## Changes

### `src/pages/Dashboard.tsx`

**1. Update returning user subtitle** (line 411):
```
"Your AI photography studio. Here's what's happening."
→ "Your next visuals are just a click away."
```

**2. Replace single "Start with a Workflow" button** (lines 414-423) with three action buttons with icons:

```tsx
<div className="flex items-center gap-3 mt-5 flex-wrap">
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Sparkles className="w-4 h-4 text-primary" />
    <span><strong className="text-foreground">{balance}</strong> credits available</span>
  </div>
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/workflows')}>
      <Layers className="w-3.5 h-3.5" />
      Create Visuals
    </Button>
    <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/discover')}>
      <Compass className="w-3.5 h-3.5" />
      Discover Ideas
    </Button>
    <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/library')}>
      <Image className="w-3.5 h-3.5" />
      My Library
    </Button>
  </div>
</div>
```

Import `Compass` from lucide-react (already imported in AppShell, need to add to Dashboard imports).

### File
- `src/pages/Dashboard.tsx` — update subtitle, replace single CTA with three navigation buttons

