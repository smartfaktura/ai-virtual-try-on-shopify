## Goal

Drop the duplicate page-level `<h1>` + subtitle from both `/new` wizard pages — the wizard already shows a per-step title/subtitle, so the outer header is redundant. Keep the small back button.

## Changes

### `src/pages/BrandSceneWizard.tsx` (lines 44–60)
Remove the `<h1>` and `<p>` block. Keep the back button.

```tsx
<div className="mb-4 sm:mb-6">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => navigate("/app/brand-scenes")}
    className="gap-1.5 -ml-2"
  >
    <ArrowLeft className="w-4 h-4" />
    Brand Scenes
  </Button>
</div>
```

### `src/pages/BrandModelNew.tsx` (lines 13–27)
Same treatment — remove the `<h1>New brand model</h1>` and the subtitle, keep the back button.

```tsx
<div className="mb-4 sm:mb-6">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => navigate('/app/models')}
    className="gap-1.5 -ml-2"
  >
    <ArrowLeft className="w-4 h-4" />
    Brand Models
  </Button>
</div>
```

## Out of scope

- Wizard-internal titles/subtitles — already correct.
- `SEOHead` tags — keep.
