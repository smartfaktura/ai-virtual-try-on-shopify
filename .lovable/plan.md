

# Fix: Scene items in Discover should behave identically to presets

## Problem
Scene-type items in the Discover card have three differences from presets:
1. Button says "Use this scene" instead of "Recreate this"
2. Hover overlay **skips** scene/model/product thumbnails (guarded by `isPreset &&`)
3. Fallback text shows just the scene name instead of prompt

Since scenes published to Discover have metadata in their `discover_presets` row, they should display identically to presets.

## Changes — `src/components/app/DiscoverCard.tsx`

**Line 88** — Remove `isPreset` guard so thumbnails show for all items:
```typescript
// Before:
{isPreset && (sceneThumb || modelThumb) && (

// After:
{(sceneThumb || modelThumb) && (
```

**Line 117** — Unified button label:
```typescript
// Before:
{isScene ? 'Use this scene' : 'Recreate this'}

// After:
Recreate this
```

**Lines 120-126** — Unified fallback text (when no `onRecreate`):
```typescript
// Before:
{isScene ? (
  <span ...>{item.data.name}</span>
) : (
  <p ...>{item.data.prompt}</p>
)}

// After:
<p className="text-white/80 text-xs line-clamp-2 leading-relaxed">
  {isPreset ? item.data.prompt : item.data.name}
</p>
```

**Line 130** — Remove `isPreset` guard on product chip:
```typescript
// Before:
{isPreset && productName && !productThumb && (

// After:
{productName && !productThumb && (
```

Four small edits, one file. Scene items will show thumbnails, "Recreate this", and product chips — identical to presets.

