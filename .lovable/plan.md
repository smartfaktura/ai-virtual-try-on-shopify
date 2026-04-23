

## Fix: Slow "Pre-selected from Explore" on Product Visuals first load

### Root cause

When the user lands on `/app/generate/product-images?fromDiscover=1&sceneRef=…`, the recreate-from-Explore resolver in `src/pages/ProductImages.tsx` sits idle until `allScenes.length > 0` (line 114). But that page calls `useProductImageScenes()` with **no `priorityCategories`**, so the hook runs **Mode B** — a paginated fetch of every active scene with the heavy `prompt_template` column. On a cold cache that's 1000+ rows over multiple round-trips and easily takes several seconds.

Result: the pre-selected scene card doesn't appear until the entire scene library is in memory. After a couple of Back/Continue cycles the React Query cache is warm → `allScenes` is instant → the "Pre-selected from Explore" card finally shows. Exactly matches the user's report.

### Fix — fast path the `sceneRef` case

Two small, surgical changes in `src/pages/ProductImages.tsx`:

1. **Run the direct `fetchSceneById` immediately when `sceneRef` is in the URL**, without waiting for `allScenes`. We already have this code path (lines 124–155) — just lift the `if (allScenes.length === 0) return;` guard so it doesn't block the `sceneRef` branch. For `?scene=<title>` lookups (which need the full set to disambiguate), keep the guard.

2. **Inject the fetched row into `injectedScene` immediately** so Step 2's "Pre-selected from Explore" card renders within ~200ms of landing, instead of after the full library finishes loading. The existing `injectedScene` merge at lines 70–74 already handles this correctly.

Concretely the effect becomes:

```ts
if (!sceneRefParam && !sceneIdParam && !sceneTitle) return;

// Fast path: sceneRef is deterministic, fetch directly without waiting for allScenes.
if (sceneRefParam && !discoverSceneConsumedRef.current) {
  discoverSceneConsumedRef.current = true;
  (async () => {
    // 1. cache hit in baseScenes? use it.
    const cached = allScenes.find(s => s.id === sceneRefParam);
    if (cached) { setDiscoverScene({ sceneId: cached.id, title: cached.title }); /* clear params */ return; }
    // 2. fetch single row from DB (instant, ~1 query).
    const dbRow = await fetchSceneById(sceneRefParam);
    if (dbRow) {
      const fe = dbToFrontend(dbRow);
      setInjectedScene(fe);
      setDiscoverScene({ sceneId: fe.id, title: fe.title });
    } else {
      toast.info('That Explore scene is no longer available. Pick another shot to continue.');
    }
    /* clear sceneRef/scene/sceneId/sceneCategory params */
  })();
  return;
}

// Title/sceneId paths still need allScenes — keep the existing guard for them only.
if (allScenes.length === 0) return;
// …existing sceneId / title resolver unchanged…
```

### Optional follow-up (not strictly required, but improves overall first-paint)

If we want Step 2 to also feel snappier in general, pass `priorityCategories` to `useProductImageScenes()` based on the current product's category as soon as analysis returns. The hook already supports two-tier loading and will fetch the user's category first, then defer the rest by 3s. That makes scene browsing feel instant for everyone, not just Explore-recreates. (Out of scope for the bug at hand — flagging only.)

### Behaviour after fix

- Land on `/app/generate/product-images?fromDiscover=1&sceneRef=stadium-seating-fashion-…` → within ~200–400ms the "Pre-selected from Explore" card appears with the scene already selected.
- No more dependency on having clicked Back/Continue several times to warm the cache.
- Out-of-category presets (the existing fix from earlier) still work — the same `fetchSceneById` + `injectedScene` plumbing carries them.

### Out of scope
- No changes to `useProductImageScenes` hook.
- No DB or styling changes.
- No changes to the Explore → wizard URL params.

### File touched
```text
EDIT  src/pages/ProductImages.tsx
        - Move the `allScenes.length === 0` guard so it only blocks the
          sceneId/title resolvers, not the deterministic sceneRef path
        - Run fetchSceneById immediately on sceneRef and inject the result,
          regardless of whether the full library has loaded yet
```

