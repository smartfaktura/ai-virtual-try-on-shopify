

# Replace static subtitle with personalized headline

## Idea
Remove "Here's what's happening with your studio." and move the category-based headline up into its place. The `DashboardPersonalizationHero` component already shows the headline — just remove the duplicate static line and restructure slightly.

## Changes

### File: `src/pages/Dashboard.tsx` (line 407)
Remove the static `<p>` line:
```
<p className="text-muted-foreground mt-1">Here's what's happening with your studio.</p>
```

### File: `src/components/app/DashboardPersonalizationHero.tsx`
Swap order so the personalized headline comes first (as subtitle), then the selector below:

```
<div className="space-y-1.5 mt-1">
  <p className="text-muted-foreground transition-opacity duration-300">
    {headline}
  </p>
  <div className="flex items-center gap-2">
    <span className="text-sm text-muted-foreground">Personalized for</span>
    [pill selector — unchanged]
  </div>
</div>
```

This way the dashboard reads:
```text
Welcome back, Tomas 👋
Highlight every detail with premium, light-perfect jewelry visuals.
Personalized for: [Jewelry ▼]
```

The headline replaces the static subtitle and feels contextual. The selector sits below as a small control.

## Summary
- 2 files, ~3 lines changed
- No new dependencies

