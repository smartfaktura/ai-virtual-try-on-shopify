Three independent UX upgrades to the brand-scene creation flow.

## 1) Move the "Before you upload" confirmation modal to the upload click

Currently `ResponsibilityModal` opens on Step 0 when the user clicks the "Build from a reference" card. The user wants it to open later — when they actually try to upload a reference image on Step 3.

**Changes**
- `Step0ChooseSource.tsx`: drop the lock icon, the "Quick check required" tag, and the gating. Both source cards become a simple `onChange("wizard"|"reference")`. Remove `onPickReference` and `referenceUnlocked` props.
- `BrandSceneWizard.tsx`: stop opening the modal in `handlePickReference`. Instead, pass a new prop `responsibilityAccepted` and `onRequestResponsibility` callback to `Step3Reference`. The callback is `() => setModalOpen(true)`.
- `Step3Reference.tsx`: wrap every upload entry point (file-picker button click, drop, paste) in a guard:
  ```ts
  const ensureAccepted = () => {
    if (!responsibilityAccepted) { onRequestResponsibility(); return false; }
    return true;
  };
  ```
  - Button: `onClick={() => ensureAccepted() && inputRef.current?.click()}`
  - Drop: bail before `handleFiles` if not accepted (and call `onRequestResponsibility`)
  - Paste listener: same guard
  - Also disable the drop zone visual hint and lower the dashed border opacity when not accepted, plus show a one-line helper "We'll ask for a quick usage check the first time you upload" under the dropzone (only when not accepted).
- The modal's `onAccept` still records the acceptance row + dispatches `acceptResponsibility`, but no longer dispatches `setSource` (source is already set from Step 0).

## 2) Show a small reference-image thumbnail on "Review & generate"

In `Step6PreviewAndPick.tsx`, when `isReferenceFlow && answers.reference_preview_url`, render a compact preview row inside the "Pick your favorite" header card:

```
┌─[64×80 ref thumb]──┐
│  REFERENCE          │  Scene name
│  Your uploaded     │  Pick your favorite — Select the variation…
│  inspiration       │
└────────────────────┘
```

Implementation: insert a small flex row above (or to the left of) the existing "Pick your favorite" copy: 64×80 rounded-md `<img>` with `object-cover`, label "Reference", filename/intent line `e.g. "Location only"`. Same treatment in the idle "Ready to generate" card so the user sees their reference there too. Stock-product card stays as is.

## 3) Make variation cards open a fullscreen preview

The three "Option 1/2/3" cards in `BrandSceneVariationGrid.tsx` currently only select. Add a clear way to open a fullscreen lightbox:

- Add a small "expand" icon button (top-left, opposite of the selection check) that calls a new `onPreview(index)` prop. Main card click keeps selecting.
- In `Step6PreviewAndPick.tsx`, import the existing `ImageLightbox` from `@/components/app/ImageLightbox`. Wire:
  - `images = variations.map(v => v.url)`
  - `selectedIndices = new Set([variations.findIndex(v => v.url === selectedUrl)])` (only when one matches)
  - `onSelect = (i) => setSelectedUrl(variations[i].url)` + update cache
  - `onClose / onNavigate` standard
- New local state: `const [previewIndex, setPreviewIndex] = useState<number | null>(null)`. Render `<ImageLightbox open={previewIndex !== null} currentIndex={previewIndex ?? 0} … />`.

## Files touched
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`
- `src/features/brand-scenes/wizard/steps/Step0ChooseSource.tsx`
- `src/features/brand-scenes/wizard/steps/Step3Reference.tsx`
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`
- `src/features/brand-scenes/wizard/components/BrandSceneVariationGrid.tsx`

## Out of scope
- No DB, edge-function, or RLS changes.
- Modal copy and the `reference_responsibility_acceptances` insert stay unchanged.
- No changes to Step 0 visual style other than removing the lock state from the reference card.
