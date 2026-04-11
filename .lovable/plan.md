

# Move Video to Create, Library to Assets

## Change
Reorder two nav items in `src/components/app/AppShell.tsx`:

```text
Before:                          After:
CREATE                           CREATE
  Visual Studio                    Visual Studio
  Create with Prompt               Create with Prompt
                                   Video
ASSETS
  Products                       ASSETS
  Brand Models                     Products
  Explore                          Brand Models
                                   Explore
MEDIA                              Library
  Library
  Video
```

- Move `Video` from Media → Create (3rd item)
- Move `Library` from Media → Assets (4th item, after Explore)
- Remove the now-empty `Media` group entirely

## File Changed
`src/components/app/AppShell.tsx` — update `navGroups` array (lines 51–80)

