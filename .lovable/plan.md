

# Reorganize Virtual Try-On Results Layout

## Current Layout (lines 4473-4514)
1. Crafted by your studio team (avatars + text, centered)
2. Saved to your library (separate block with checkmark)
3. View in Library button (left-aligned)
4. Survey feedback card

## New Layout
1. **Survey feedback card** — moved right after the images grid (line ~4471)
2. **Combined line**: Avatars + "Crafted by your studio team · Saved to your library" (centered, single row)
3. **View in Library** button — centered below the combined line

## Changes

### `src/pages/Generate.tsx` — Lines 4473-4514

Reorder and merge:

```tsx
{/* Contextual feedback card — right after images */}
<ContextualFeedbackCard ... />

{/* Combined crafted + saved */}
<div className="flex flex-col items-center gap-2 pt-2">
  <div className="flex items-center gap-3">
    <div className="flex items-center">
      {[avatarSophia, avatarZara, avatarKenji, avatarLuna].map((src, i) => (
        <img key={i} src={src} alt="Team member"
          className="w-7 h-7 rounded-full border-2 border-background object-cover"
          style={{ marginLeft: i === 0 ? 0 : '-0.4rem' }} />
      ))}
    </div>
    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
      Crafted by your studio team
      <span className="mx-1">·</span>
      <CheckCircle className="w-3.5 h-3.5 text-primary" />
      Saved to your library
    </p>
  </div>
  <Button className="rounded-xl min-h-[44px]" onClick={() => navigate('/app/library')}>
    View in Library
  </Button>
</div>
```

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Lines 4473-4514: Move feedback card before crafted section, merge crafted + saved into one centered line, center View in Library CTA |

