

# Rename "Pro" Chip to "Camera"

## Change

**`src/components/app/freestyle/FreestyleSettingsChips.tsx`** — Line 135

Change the default (non-natural) chip label from `'Pro'` to `'Camera'`:

```
// Before
{cameraStyle === 'natural' ? 'Natural' : 'Pro'}

// After
{cameraStyle === 'natural' ? 'Natural' : 'Camera'}
```

Single line change, no other files affected.

