## Four fixes — `/app/models` and `/app/models/new`

### 1. Bug: model name input loses focus after 1 character

**Root cause**: `UnifiedGenerator` defines `Section` as a function expression **inside** the component body (~line 771). Every keystroke re-renders `UnifiedGenerator`, which produces a new `Section` function identity. React treats it as a different component type and remounts the entire subtree (including the model-name `<Input>`), stealing focus. User can only type one character before focus is lost.

**Fix**: Move `Section` out of `UnifiedGenerator` into a module-scope component (before the `UnifiedGenerator` export). Same signature, no behavior change.

### 2. Sticky bar — adopt the exact Generate.tsx pattern

Generate.tsx pattern (canonical):
```
<div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-30 lg:left-60">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    <div className="flex items-center gap-3">
      <img w-10 h-10 rounded-lg /> {/* preview */}
      <div>
        <p className="text-sm font-semibold">Title</p>
        <p className="text-xs text-muted-foreground">N credits</p>
      </div>
    </div>
    <Button>Continue</Button>
  </div>
</div>
```

Apply to BrandModels sections-layout footer:
- Left cluster: 40×40 rounded-lg thumbnail of the selected gender's first model preview (or a static dashed placeholder when no reference is uploaded — use the uploaded preview thumb if present, else a small `Users` icon tile `bg-muted`).
- Text stack:
  - Line 1 (`text-sm font-semibold`): `modelName || 'New brand model'`
  - Line 2 (`text-xs text-muted-foreground`): `20 credits · Balance N` (or `Public model · free` when public toggle on)
- Right: single primary `Generate` button. Disabled when `!canGenerate`; `title={validationError}` for hover hint. Public variant text → `Generate · free`.
- Validation error displayed as a thin red bar above the row when present:
  ```
  <div className="bg-destructive/10 border-b border-destructive/20 text-destructive text-[11px] px-4 py-1.5 text-center">{validationError}</div>
  ```
  Sits above the main row, full-width.
- Remove the Cancel button (Generate flow uses single CTA; back nav is in the page header).
- Keep `lg:left-60`, drop `backdrop-blur`, drop `max-w-5xl` → `max-w-7xl`.

### 3. Hide chat launcher on `/app/models/new` everywhere

In `src/components/app/StudioChat.tsx`:
- Add a `hideAlways` route check above `hideOnMobile`:
  ```ts
  if (location.pathname === '/app/models/new') return null;
  ```
- Remove `/app/models/new` from the mobile-only list (still hidden on `/app/models` mobile, but visible on desktop for the list page).

### 4. Empty state — use real mockModels

Replace the three landing-asset paths with `mockModels` from `src/data/mockData.ts` — these are the actual model previews shown across the product-images / catalog flows. Use the first three (Freya, Zara, Anders) which already represent the brand's canonical opening sequence.

```tsx
import { mockModels } from '@/data/mockData';
// …
{mockModels.slice(0, 3).map((m, i) => (
  <img
    key={m.modelId}
    src={m.previewUrl}
    alt={m.name}
    loading="lazy"
    className={cn(
      "w-24 aspect-[3/4] rounded-xl object-cover shadow-sm ring-2 ring-background",
      i === 1 ? "z-10 scale-110" : "opacity-90",
      i > 0 && "-ml-3"
    )}
  />
))}
```

Remove the unused `getLandingAssetUrl` import added in the prior pass.

### Files
- `src/pages/BrandModels.tsx`
  - Hoist `Section` to module scope (fixes input focus loss).
  - Replace sticky footer with Generate.tsx pattern (thumbnail + text + single button + thin validation banner).
  - Swap empty-state image source to `mockModels`.
- `src/components/app/StudioChat.tsx`
  - Hard-hide on `/app/models/new` (all viewports); keep `/app/models` mobile-only hide.

### Out of scope
- No DB / edge function changes.
- No changes to fields, form sections, populated grid, or upgrade-gated view.