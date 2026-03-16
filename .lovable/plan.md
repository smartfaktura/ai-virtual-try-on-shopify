

## Plan: Remove Dead Bulk Generation Code & Fix Route Order

### Confirmed

No file in the codebase navigates to `/app/generate/bulk`. The route, page, and supporting components are dead code.

### Changes

| Action | File |
|--------|------|
| **Edit** | `src/App.tsx` — Remove `BulkGenerate` import and `/generate/bulk` route. Fix route order: `/generate` before `/generate/:workflowSlug`. |
| **Delete** | `src/pages/BulkGenerate.tsx` |
| **Delete** | `src/components/app/BulkSettingsCard.tsx` |
| **Delete** | `src/components/app/BulkProgressTracker.tsx` |
| **Delete** | `src/components/app/BulkResultsView.tsx` |
| **Delete** | `src/hooks/useBulkGeneration.ts` |
| **Keep** | `src/types/bulk.ts` — still imported by `Generate.tsx` |

### Route fix in App.tsx

```
// After cleanup
<Route path="/generate" element={<Generate />} />
<Route path="/generate/:workflowSlug" element={<Generate />} />
```

Removes ~200 lines of dead code and eliminates the route shadowing issue.

