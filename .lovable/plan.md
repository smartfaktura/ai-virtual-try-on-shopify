## Changes (both in `src/pages/Generate.tsx`)

### 1. Stack header for upscale page (back on top, title + subtitle below)
The shared `PageHeader` currently keeps the back chip inline with the title on `sm+`. Match the `AnimateVideo` pattern by rendering the back button as a separate row above `PageHeader` when `isUpscale`, and not passing `backAction` in that case.

Replace lines 2400-2404 with:

```tsx
<>
  {isUpscale && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate('/app/workflows')}
      className="gap-1.5 -ml-2 self-start mb-2"
    >
      <ArrowLeft className="w-4 h-4" />Visual Studio
    </Button>
  )}
  <PageHeader
    title={isUpscale ? 'Image Upscaling' : pageTitle}
    subtitle={isUpscale ? 'Enhance images to 4K, print-ready resolution' : undefined}
    backAction={isUpscale ? undefined : { content: activeWorkflow ? 'Visual Studio' : 'Dashboard', onAction: () => navigate(activeWorkflow ? '/app/workflows' : '/app') }}
  >
```

(Wrapping in a Fragment so the existing `</PageHeader>` close tag at the bottom still pairs correctly. `ArrowLeft` is already imported via existing icons block — verify and add to the lucide-react import if missing.)

### 2. Hide the "Workflow Info Banner" on the upscale page
Lines 2410-2423 — guard the alert so it doesn't render when `isUpscale`:

```tsx
{activeWorkflow && !isUpscale && (
  <Alert className="hidden sm:block">
    …
  </Alert>
)}
```

That removes the "Image Upscaling / Sharpen any image… / Visual Type" block, leaving the page header + stepper directly above the source picker.

## Scope
- Only `src/pages/Generate.tsx` is touched.
- Other workflows are unchanged: they still get the in-line PageHeader back chip and the info banner.