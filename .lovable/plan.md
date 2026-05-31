## Objective
Polish the `/app/generate/image-upscaling` screen:
1. Hide the global StudioChat support bubble on this route.
2. In the "Select from Library" step, render only 12 thumbnails initially with a "Load more" pill.
3. Tighten the header copy + improve mobile layout.
4. Fix the search input — true pill shape (`rounded-full`) and change placeholder to "Search".

All changes are in `src/pages/Generate.tsx` only.

## Changes

### 1. Hide StudioChat on the upscaling route
Inside the existing `Generate` component (right after `isUpscale` is computed), add the same body-attribute pattern used by `ProductSwap.tsx`:

```tsx
useEffect(() => {
  if (!isUpscale) return;
  document.body.setAttribute('data-hide-studio-chat', 'true');
  return () => document.body.removeAttribute('data-hide-studio-chat');
}, [isUpscale]);
```

(StudioChat already respects `[data-hide-studio-chat]` per the existing pattern.)

### 2. Library step — 12 + Load more
Add local state `const [libraryVisibleCount, setLibraryVisibleCount] = useState(12);` near other library state.

In the grid block (lines ~3713-3754):
- Apply `.slice(0, libraryVisibleCount)` after the existing `.filter(...)`.
- Remove `max-h-[420px] overflow-y-auto pr-1` from the grid wrapper (no more inner scroll — page scrolls naturally).
- Below the grid, when `filteredItems.length > libraryVisibleCount`, render a centered pill button:

```tsx
<div className="flex justify-center pt-2">
  <Button
    variant="outline"
    size="sm"
    className="rounded-full px-5"
    onClick={() => setLibraryVisibleCount(c => c + 12)}
  >
    Load more
  </Button>
</div>
```

Reset `libraryVisibleCount` to 12 whenever the search query changes (small `useEffect`).

### 3. Header copy + mobile layout (lines 3677-3683)
Current:
```tsx
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-base font-semibold">Select from Library</h2>
    <p className="text-sm text-muted-foreground">Choose up to 10 previously generated images to create new perspectives from.</p>
  </div>
  <Button variant="link" onClick={...}>Change source</Button>
</div>
```

New:
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
  <div className="min-w-0">
    <h2 className="text-base font-semibold">Select from Library</h2>
    <p className="text-sm text-muted-foreground">Pick up to 10 images to remix</p>
  </div>
  <Button variant="link" size="sm" className="self-start sm:self-auto -ml-3 sm:ml-0 px-0 sm:px-2" onClick={...}>
    Change
  </Button>
</div>
```

- Shortened subtitle (no terminal period per project memory).
- Header stacks on mobile; "Change" sits flush-left below the title instead of fighting the H2 for horizontal space.
- Button label trimmed to "Change".

### 4. Search input — pill + simpler placeholder (lines 3685-3693)
- Change `className="h-8 text-xs pl-8"` → `className="h-9 text-sm pl-9 rounded-full"`.
- Bump icon position to match (`left-3`, `w-4 h-4`).
- Placeholder `"Search by prompt..."` → `"Search"`.

## Scope guardrails
- Touches only `src/pages/Generate.tsx`.
- No logic changes to selection, filtering math, or generation pipeline.
- StudioChat component itself is untouched — same opt-out attribute used elsewhere.
- "Load more" is purely client-side pagination over the already-fetched library list.