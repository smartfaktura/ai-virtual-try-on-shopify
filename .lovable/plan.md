

## Fix auto-focused search + bump small text in Scene Look modal

### 1. Stop the search input from looking "selected" on open

When the modal opens, Radix Sheet auto-focuses the first focusable element — which happens to be the desktop search input, leaving a visible focus ring around it (what you're seeing in the screenshot). 

**Fix** in `src/components/app/freestyle/SceneCatalogModal.tsx` — add `onOpenAutoFocus` handler to the `<SheetContent>` to cancel Radix's default auto-focus:

```tsx
<SheetContent
  side={isMobile ? 'bottom' : 'right'}
  onOpenAutoFocus={(e) => e.preventDefault()}
  className={...}
>
```

This keeps focus on the trigger button instead of inside the dialog. Keyboard accessibility is preserved — Tab still moves into the modal normally, focus is still trapped inside, and Escape still closes it. Just nothing looks pre-selected on open.

### 2. Bump small text to match the rest of the modal

Two text bumps in `src/components/app/freestyle/SceneCatalogModal.tsx`:

- **"1,200+ curated scenes"** (header subtitle, currently `text-xs`) → `text-sm` with slightly looser tracking.
- **"Pick a scene to continue."** (footer empty-state, currently `text-xs`) → `text-sm`. The footer "Use scene" / "Cancel" buttons stay the same.

These are the only two affected strings. The active-selection footer (thumbnail + scene title) already uses `text-sm font-semibold` and stays unchanged.

### Untouched

Search input styling, sidebar, grid, all selectors, hooks, RLS, mobile layout, focus trap, keyboard nav.

### Validation

- Open modal: no input shows a focus ring; Tab still moves focus into the modal in normal order.
- Header subtitle and footer empty-state copy read at `text-sm`, matching the surrounding UI weight.
- Mobile and desktop both unchanged otherwise.

