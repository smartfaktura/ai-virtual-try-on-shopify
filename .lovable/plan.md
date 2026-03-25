

# Persist Freestyle Settings with Session TTL

## Approach
Store all freestyle settings in `localStorage` with a timestamp. On page load, if the stored data is older than **30 minutes**, discard it and start fresh. This keeps settings alive during active work but gives a clean slate for new sessions — and uses zero database resources.

## What gets persisted
`prompt`, `aspectRatio`, `cameraStyle`, `framing`, `imageRole`, `editIntent`, plus IDs for `selectedModel`, `selectedScene`, `selectedProduct`, `selectedBrandProfile`.

**Not persisted**: uploaded source image, popover states, prompt helper, guide state (already has its own persistence).

## Storage format
Single `localStorage` key `freestyle_settings`:
```json
{
  "ts": 1711370400000,
  "prompt": "...",
  "aspectRatio": "1:1",
  "cameraStyle": "pro",
  "framing": null,
  "imageRole": "edit",
  "editIntent": [],
  "modelId": "abc",
  "sceneId": "xyz",
  "productId": "123",
  "brandProfileId": "456"
}
```

## Implementation — single file: `src/pages/Freestyle.tsx`

### On mount (read)
- Read & parse `freestyle_settings` from localStorage
- If `Date.now() - ts > 30 * 60 * 1000` → ignore stored data, remove key
- Otherwise, use stored values as initial state defaults
- For model/scene: look up by ID from `mockModels`/`mockTryOnPoses` + custom scenes (sync)
- For product/brand profile: store the ID, then restore in a `useEffect` once React Query data arrives

### On change (write)
- One `useEffect` watching all persisted values → debounce 500ms → write JSON with fresh `ts` to localStorage

### On reset
- `handleReset` also calls `localStorage.removeItem('freestyle_settings')`

### URL params priority
- Existing `searchParams` logic runs after mount and calls setters, naturally overriding localStorage defaults

## Quality auto-select
The existing `useEffect` that sets quality based on model/scene selection will still run after restoration, so quality doesn't need to be persisted separately.

## No database changes needed
Everything is client-side localStorage only.

