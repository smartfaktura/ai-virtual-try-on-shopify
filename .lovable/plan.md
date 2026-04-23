

## Pre-select Discover shot in Product Images — minimal, isolated

### What this does
When a user clicks **Recreate** on a Product Images Discover preset, they land in `/app/generate/product-images?scene=<Title>`. They pick products as normal (Step 1, untouched). In Step 2, a new **From Explore** section renders directly above Recommended, containing just the one scene that came from Discover, auto-selected so the wizard can advance with it.

That's it. No category matching against products. No variant resolution. No fallback banners. No changes to Recommended or Explore More.

### Behaviour

| Entry | From Explore section | Rest of wizard |
|---|---|---|
| Discover Recreate (`?scene=` resolves to a `product_image_scenes` row) | Renders above Recommended, scene auto-selected | Untouched |
| Discover Recreate (`?scene=` doesn't resolve — rare) | Hidden, silent `console.warn` | Untouched |
| Normal entry to Product Images | Hidden | Untouched |

### Scene resolution (deliberately simple)
- Read `?scene=<Title>` from URL via `useSearchParams`.
- `allScenes.find(s => s.title.trim().toLowerCase() === title.trim().toLowerCase())` — first match wins, no category logic, no variant scoring.
- If found → stash `{ sceneId, title }` in component state, clear `?scene=` from URL with `replace: true`.
- If not found → `console.warn`, store nothing, section hides.

### Step 2 rendering
```text
{discoverScene && (
  <section>
    <SectionHeader>From Explore</SectionHeader>
    <SceneCard scene={resolvedScene}
               selected={selectedSceneIds.has(scene.id)}
               onClick={toggleScene} />
  </section>
)}
<RecommendedSection ... />   // untouched
<ExploreMoreSection ... />   // untouched
```

Auto-add effect (idempotent via `useRef`):
```ts
useEffect(() => {
  if (!discoverScene?.sceneId) return;
  if (autoAddedRef.current === discoverScene.sceneId) return;
  setSelectedSceneIds(prev => new Set(prev).add(discoverScene.sceneId));
  autoAddedRef.current = discoverScene.sceneId;
}, [discoverScene?.sceneId]);
```

### Files touched

```text
EDIT  src/pages/ProductImages.tsx
        + read ?scene from URL once on mount
        + resolve title → scene_id by exact title match in allScenes
        + stash discoverScene state, clear URL param (replace:true)
        + pass discoverScene prop into Step 2

EDIT  src/components/app/product-images/ProductImagesStep2Scenes.tsx
        + accept optional discoverScene prop
        + render <FromExploreSection> above Recommended when present
        + auto-add sceneId to selectedSceneIds (useRef-gated)
```

No DB changes. No edge functions. No changes to product analysis, Recommended, Explore More, scene categories, ratios, quality, or any other wizard logic.

### Safety & performance
- Recommended / Explore More render paths: zero edits.
- Resolver is one `Array.find` over already-loaded scenes (~200 items, <1 ms).
- No new network calls, no realtime, no polling.
- `useRef` gate prevents duplicate auto-adds across re-renders / back-forward.
- URL param cleared after consumption → no replay loops.
- Section is conditional → normal entries to Product Images render identically to today.
- All null branches handled silently — wizard never crashes if title doesn't resolve.

### Validation
1. Recreate a PI Discover preset → Step 1 (pick any product) → Step 2 shows **From Explore** on top with the scene selected; Recommended and Explore More render unchanged below.
2. Open `/app/generate/product-images` directly → no From Explore section, identical to today.
3. Recreate → Step 2 → Back → forward → no duplicate auto-add.
4. Recreate a freestyle preset → still routes to freestyle, Product Images untouched.
5. Recreate a PI preset whose scene title was deleted from `product_image_scenes` → section hidden, console warning, wizard works normally.
6. User can deselect the From Explore scene; wizard proceeds with whatever they choose.

