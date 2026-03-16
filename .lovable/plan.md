

## Remove "Model selected" toast from Generate page

### Problem
When selecting a model on any workflow (e.g. `/app/generate/selfie-ugc-set`), a green success toast appears saying `Model "Olivia" selected!`. This is unnecessary visual noise — the selection is already reflected in the UI.

### Change

**File: `src/pages/Generate.tsx` (line 667)**

Remove the `toast.success(...)` call from `handleSelectModel`:

```typescript
// Before
const handleSelectModel = (model: ModelProfile) => { setSelectedModel(model); toast.success(`Model "${model.name}" selected!`); };

// After
const handleSelectModel = (model: ModelProfile) => { setSelectedModel(model); };
```

Single line change, one file.

