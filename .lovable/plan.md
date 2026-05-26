## Add two new perspectives to /app/perspectives

Add **Front View** and **Low Angle / Hero View** to the Picture Perspectives variation catalog. Variations are loaded from `workflows.generation_config.variation_strategy.variations` (DB) with a hardcoded fallback in `src/pages/Perspectives.tsx`. Both must be updated to stay in sync.

### 1. Database migration
Update the `Picture Perspectives` row in `workflows`, appending two variations to `generation_config.variation_strategy.variations` (JSONB):

- **Front View** — `category: 'angle'`, no reference upload
  - instruction: "Straight-on front-facing view of the product, camera perfectly perpendicular at lens height. Symmetrical composition centered on the product's primary face. Same environment and lighting as the source. Classic catalog hero with zero perspective distortion."
- **Low Angle / Hero View** — `category: 'angle'`, no reference upload
  - instruction: "Dramatic low-angle shot with the camera positioned slightly below the product looking upward (10–20° below horizontal). Conveys scale, power, and presence — the hero treatment. Product looms confidently in frame. Same environment, lighting, and material fidelity as the source."

### 2. Frontend fallback (`src/pages/Perspectives.tsx`)
- Append matching entries to `FALLBACK_VARIATIONS` (ids: `front`, `hero-low`).
- Add icon mappings to `VARIATION_ICONS`:
  - `'Front View'` → `Square` (lucide-react)
  - `'Low Angle / Hero View'` → `ArrowUp`
- Add the two icon imports.

### Out of scope
- No changes to backend perspective hook, prompt engine, or admin workflow variation UI.
- No route, naming, or studio chat changes.
- Order: appended at the end of the current 9-item list (total becomes 11).

### Risk
Low. Additive only. DB JSONB append + two frontend fallback rows. Existing variation rendering, prompt injection, and reference-upload logic handle any `category: 'angle'` item generically.
