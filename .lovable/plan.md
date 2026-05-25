## Goal
Place the "New brand model" button in the top-right of the Brand Models page header (same pattern as Brand Scenes), instead of below the subtitle.

## Root cause
`PageHeader` renders right-aligned controls only via the `actions` prop. `BrandModels.tsx` currently passes the button as `children`, so it renders below the title as a section body — not in the header's right slot.

## Change — `src/pages/BrandModels.tsx` (lines 1306–1314)
Move the button from `children` to the `actions` prop on `PageHeader`:

```tsx
<PageHeader
  title="Brand Models"
  subtitle="Custom AI models that match your brand"
  actions={
    models.length > 0 ? (
      <Button asChild className="gap-2">
        <Link to="/app/models/new">
          <Plus className="h-4 w-4" /> New brand model
        </Link>
      </Button>
    ) : null
  }
>
  {null}
</PageHeader>
```

(or drop the empty children by making PageHeader's `children` optional — out of scope; passing `null` is fine.)

## Out of scope
- Empty-state CTA, locked-models view, dashed "New model" tile — all unchanged.
- No styling changes to PageHeader itself.
