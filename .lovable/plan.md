# Move Library to top of Assets nav group

## Change
`src/components/app/AppShell.tsx` — Assets group (lines 73–78). Reorder so `Library` is the first item:

```
Assets
  Library
  Products
  Brand Models
  Brand Scenes
```

## Why safe
Pure ordering change in a single array. No routing, icons, or labels affected.
