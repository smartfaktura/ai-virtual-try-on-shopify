
## Adjust Model picker plan — remove non-binary filter and search

Two small refinements to the previously approved Model Catalog modal plan:

### 1. Remove "Non-binary" gender filter
Gender chips in the top filter bar will be: **All · Female · Male** only. (Matches the current chip's filter set and the underlying `mockModels` data — there are no non-binary entries.)

### 2. Remove the search input
Drop the search field from the top filter bar entirely. Filtering is handled by the sidebar (Body type, Age, Brand Models) + the gender chips, which is enough given the catalog size.

### Updated top bar layout

```text
Filters bar:  [All / Female / Male]                    [Sort ▾]
```

Everything else from the prior plan stays the same:
- Right-side Sheet (max 1500px), sidebar with Quick / Body type / Age sections
- Brand Models section + "+ Create Brand Model" tile
- Free-plan upgrade affordances wired to `useCredits().openBuyModal()`
- Pending-then-confirm footer with "Use model"
- Mobile picker untouched
