# Brand Models — chooser copy + order + default-open Appearance

Three small changes.

## 1. Swap card order

Manual (VOVV.AI generates) is the primary, recommended path → goes first. Reference is the secondary, advanced path → goes second.

## 2. Rewrite card copy — clearer, no jargon

| | Eyebrow | Title | Subtitle |
|---|---|---|---|
| Card 1 | `01 / Generate` | `Let VOVV.AI create a new model for you` | `Pick gender, age, look — we generate from scratch` |
| Card 2 | `02 / Reference photo` | `Use your own person from a photo` | `Upload a face — we re-photograph that exact person` |

Add a single subtitle line per card (between title and "Start →") so the difference between the two paths is unmistakable. Still no terminal periods (core memory).

## 3. Appearance section: default open on manual path

**File:** `src/pages/BrandModels.tsx` around line 995. The `<Collapsible>` currently mounts closed. Add `defaultOpen` so the user lands inside the manual panel with all attribute chips already visible — no extra click.

```tsx
<Collapsible defaultOpen>
```

## Out of scope

Chooser card layout (padding, border, hover) stays as-is from last edit. Reference panel, consent, generation flow unchanged.
