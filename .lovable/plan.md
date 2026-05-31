## Changes

### 1. `src/components/app/UpscaleModal.tsx` — simplify modal header
Replace the icon-tile + two-line header (lines ~45-56) with a flat title row:

```tsx
<div className="flex items-center justify-between px-6 pt-6 pb-2">
  <h3 className="text-lg font-semibold text-foreground">Enhance to 4K</h3>
  <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
    <X className="w-5 h-5" />
  </button>
</div>
```

- Removes the `Sparkles` icon tile.
- Removes the "{n} image(s) selected" subtitle.
- Drop the now-unused `Sparkles` import if no other usage remains in the file (the CTA button keeps its own `Sparkles` icon at lines 105/115, so the import stays).

### 2. `src/pages/Generate.tsx` — animate-style header for upscaling
Currently (line 2397):
```ts
const pageTitle = activeWorkflow ? `Create: ${activeWorkflow.name}` : 'Generate Visuals';
```

For the upscaling route, mirror the `AnimateVideo` header pattern:
- Title without the "Create:" prefix → just `Image Upscaling`
- Add a short subtitle: `Enhance images to 4K, print-ready resolution`

Update PageHeader usage (line 2400) to:

```tsx
<PageHeader
  title={isUpscale ? 'Image Upscaling' : pageTitle}
  subtitle={isUpscale ? 'Enhance images to 4K, print-ready resolution' : undefined}
  backAction={{ content: activeWorkflow ? 'Visual Studio' : 'Dashboard', onAction: () => navigate(activeWorkflow ? '/app/workflows' : '/app') }}
>
```

PageHeader already renders the `← Visual Studio` ghost back button + title + subtitle stack, matching the AnimateVideo composition (back button → title → muted subtitle). No structural changes needed elsewhere.

## Scope
- Two files touched: `UpscaleModal.tsx`, `Generate.tsx`.
- No state, props, or generation-logic changes.
- Other workflows keep the existing `Create: …` title.