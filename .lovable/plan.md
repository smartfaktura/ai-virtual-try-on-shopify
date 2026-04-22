

## Rename "Scene" → "Scene Look" + reorganize mobile chips

### Naming decision

**Scene Look** as the user-facing label. "Scene" anchors the familiar photography term, "Look" clarifies it controls the *visual style/result*, not just a background. Reads naturally in a chip and in copy ("pick a scene look for your product").

- Chip label: **Scene Look**
- Modal title: **Select a Scene Look**
- Modal subtitle: keep "1,200+ curated scenes" (already short)

### Mobile chip layout

Primary row (always visible, in order):
1. **Upload**
2. **Product**
3. **Model**
4. **Scene Look**

Collapsed behind a single chip:
- **Advanced ▾** — opens a popover containing, stacked vertically with labels:
  - Framing
  - Brand
  - Aspect ratio
  - Camera style
  - Quality

Quiz button stays inline next to Advanced (it's a primary action, not a setting).

A small primary-tinted dot appears on the **Advanced** chip when any tucked setting differs from its default, so users know something's customized without opening it.

Final mobile bar:
```text
[ Upload ] [ Product ] [ Model ] [ Scene Look ]   [ Advanced ▾ ] [ Quiz ]
```

If "Scene Look" + a long selected value (e.g. "Sunlit Mediterranean Terrace") wraps to a second line, that's acceptable — primary chips stay above the Advanced row.

### Desktop (`lg+`)

Unchanged layout — all chips visible inline. Only the label change ("Scene" → "Scene Look") applies, for consistency.

### Files touched

- `src/components/app/freestyle/FreestyleSettingsChips.tsx` — restructure mobile branch: 4 primary chips inline + new `AdvancedChipsPopover` wrapping Framing / Brand / Aspect / Camera / Quality. Add "modified" dot indicator. Desktop branch unchanged.
- `src/components/app/freestyle/SceneSelectorChip.tsx` — change visible chip label "Scene" → "Scene Look" (placeholder text only).
- `src/components/app/freestyle/SceneCatalogModal.tsx` — change modal title "Select Scene" → "Select a Scene Look".

### Untouched

Internal types (`TryOnPose`, `selectedScene`, `SceneSelectorChip` component name), hook names, table names, generation pipeline, scene catalog data, sidebar, filter bar, desktop layout.

### Validation (390 × 818)

- `/app/freestyle` mobile shows: Upload, Product, Model, **Scene Look** in the primary row, then Advanced ▾ and Quiz.
- Tap **Advanced** → popover lists Framing, Brand, Aspect, Camera, Quality — each control works exactly as before.
- Change Aspect to 9:16 → close popover → Advanced chip shows a small primary dot.
- Tap **Scene Look** → catalog opens with title "Select a Scene Look".
- Desktop ≥ 1024px: full chip row visible exactly as today; only label change is "Scene" → "Scene Look".

