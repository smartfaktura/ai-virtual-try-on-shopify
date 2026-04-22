
## Hide "Missing a model?" banner on My Brand Models view

### Change — `src/components/app/freestyle/ModelCatalogModal.tsx`

Conditionally render the footer `MissingRequestBanner` so it appears only when the user is browsing the general catalog, not when they've switched the sidebar to **My Brand Models**.

Wrap the existing banner render with `{quickView !== 'brand' && ( ... )}`. When hidden, also drop the surrounding border/padding wrapper so there's no empty strip above the sticky footer.

### Validation
- Sidebar → "All models": banner visible (unchanged).
- Sidebar → "My Brand Models": banner hidden; empty-state card and "Create Brand Model" tile sit cleanly above the sticky footer.
- Mobile sheet untouched.

### Untouched
`ModelSelectorChip.tsx`, mobile sheet, gender chips, sort, grid cards, footer Use-model bar.
