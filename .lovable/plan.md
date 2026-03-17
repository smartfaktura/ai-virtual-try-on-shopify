

## Add "Missing a Scene?" Feedback Banner to WorkflowSettingsPanel

### What
Add a `MissingRequestBanner` at the end of the scene/variation grid in `WorkflowSettingsPanel.tsx` — the same component already used in model selection and pose selection steps in `Generate.tsx`.

### Change

**File: `src/components/app/generate/WorkflowSettingsPanel.tsx`**

1. Import `MissingRequestBanner` from `@/components/app/MissingRequestBanner`
2. After the scene cards grid closing `</div>` (line 432) and before the info note (line 434), add:
   ```tsx
   <MissingRequestBanner
     category="scene"
     title="Missing a scene? Tell us and we'll add it."
   />
   ```

This is a single-line addition using an existing component — no new logic needed. The banner lets users submit scene requests via the same feedback mechanism used elsewhere.

