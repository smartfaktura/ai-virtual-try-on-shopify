

## Add "← Workflows" Back Button to Picture Perspectives Page

The Perspectives page (`src/pages/Perspectives.tsx`) has a custom header with an icon + title but no back navigation to the Workflows hub — unlike the other workflow pages (e.g., Virtual Try-On) which use the Generate page's built-in back button.

### Change — `src/pages/Perspectives.tsx`

Add a back button above/beside the header, matching the style used in other workflows:

**Lines ~651-662** — Insert a `← Workflows` button before the title row:

```tsx
<div className="space-y-2">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => navigate('/app/workflows')}
    className="gap-1.5 -ml-2 mb-1"
  >
    <ArrowLeft className="w-4 h-4" />
    Workflows
  </Button>
  <div className="flex items-center gap-3">
    ...existing icon + title...
  </div>
</div>
```

`ArrowLeft` and `Button` are already imported. `navigate` is already available via `useNavigate`. Single file, ~5 lines added.

