## Five fixes — `/app/models/new`

### 1. Sticky bar — copy the exact Product Visuals pattern

Source of truth = `Generate.tsx` line 3514 (the bar shown after a product is selected):

```tsx
<div className="fixed bottom-4 left-0 right-0 lg:left-[var(--sidebar-offset)] z-50 px-4">
  <div className="max-w-3xl mx-auto bg-background border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
    <Button variant="outline" onClick={back}>Back</Button>
    {needsHelp && <span className="text-xs text-muted-foreground text-center flex-1">…hint…</span>}
    <Button disabled={!canGenerate} onClick={handleGenerate}>Generate</Button>
  </div>
</div>
```

Apply to BrandModels sections-layout footer:
- Floating pill (not edge-to-edge): `fixed bottom-4 left-0 right-0 lg:left-[var(--sidebar-offset)] z-50 px-4` + inner `max-w-3xl mx-auto bg-background border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4`.
- Left: `Back` (`variant="outline"`, calls `onSuccess` to go back to `/app/models`).
- Center (only when `validationError`): `text-xs text-muted-foreground text-center flex-1`. If `isLowCreditsError`, render as a `<button>` opening `NoCreditsModal` with `→` suffix.
- Right: `Generate` primary button. Label `Generate` (or `Generate · free` when public). No icon. `disabled={!canGenerate}`.
- Remove the thumbnail + meta block, remove the `bg-card border-t shadow-lg` full-width container, remove the "20 credits · Balance N" copy from this bar (cost shown elsewhere on page).
- Bottom padding on container: change `pb-32` → `pb-28` to match pill clearance.

### 2. Age slider — eliminate drag lag

Root cause: `<Slider value={age} onValueChange={setAge} />` updates parent state on every pixel-step. Every change re-renders `UnifiedGenerator` with ~10 Radix `<Select>` trees → frame drops on drag.

Fix: extract a tiny self-contained `AgeSlider` component (defined at module scope, not inside UnifiedGenerator). It holds its own `local` state synced to the prop, updates internal display instantly during drag, and **commits to parent only on `onValueCommit`** (drag release / keyboard step).

```tsx
const AgeSlider = ({ value, onCommit }: { value: number; onCommit: (n: number) => void }) => {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <>
      <Label …>Age — {local}</Label>
      <Slider min={4} max={70} step={1} value={[local]}
        onValueChange={(v) => setLocal(v[0])}
        onValueCommit={(v) => onCommit(v[0])} />
      <div className="flex justify-between text-[10px] text-muted-foreground/50">
        <span>4</span><span>18</span><span>35</span><span>50</span><span>70</span>
      </div>
    </>
  );
};
```

Replace inline slider usage with `<AgeSlider value={age[0]} onCommit={(n) => setAge([n])} />`. Display value updates instantly, parent updates once on release — no lag.

### 3. Region / Look dropdown — clearer non-clickable group labels

`SelectLabel` is correctly non-interactive in Radix, but currently styled like an item (same indent, similar weight), making users think they're tappable.

Fix: differentiate `<SelectLabel>` visually:
- `className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60"` (smaller, uppercase, more muted).
- Add `<SelectSeparator />` between groups for clearer hierarchy.
- Trigger height aligned to other selects (`h-9` already).

This applies only to the Region/Look select — keep other selects unchanged.

### 4. Reference image — drag-drop support (paste already works, keep it)

Currently: click-to-upload + clipboard paste (via `useEffect` listening for paste events). No drag-drop.

Fix on the dropzone button:
- Add state `const [isDragging, setIsDragging] = useState(false);`
- Add handlers `onDragOver` (preventDefault + setIsDragging(true)), `onDragLeave` (setIsDragging(false)), `onDrop` (preventDefault, get `e.dataTransfer.files[0]`, validate `type.startsWith('image/')`, call existing `processFile`).
- When `isDragging`, swap border to `border-primary bg-primary/5`.
- Update microcopy: `Click, drag, or paste (⌘V) reference photo`.

### 5. "I confirm" checkbox — stop the jump-to-top

Likely cause: clicking `<label htmlFor="terms">` triggers a focus on the Radix Checkbox button. When validationError disappears the sticky bar's error row collapses, and the focus shift combined with layout settling reads as a "jump."

Fix:
- Remove `htmlFor="terms"` from the label and instead make the wrapper row clickable: `onClick={() => uploadedUrl && setTermsAccepted(v => !v)}` on the outer container, with `cursor-pointer` when enabled.
- Add `e.preventDefault()` on the label click to block native focus-scroll behavior.
- Keep the `<Checkbox>` visually present and synchronized via `checked={termsAccepted}` — pointer events on the checkbox itself still toggle via `onCheckedChange`.

Same pattern applied to the admin "Add as public model" checkbox row for consistency.

### Out of scope
- No DB / edge-function changes.
- No changes to fields list, generation logic, or empty-state grid.
- No changes to `/app/models` list page (sticky bar only lives in the `sections` layout used by `/new`).

### Files
- `src/pages/BrandModels.tsx`
  - Hoist `AgeSlider` to module scope; swap inline slider for it.
  - Restyle Region/Look `SelectLabel`s + add separators.
  - Add drag-drop handlers + isDragging state on reference dropzone; update microcopy.
  - Replace sticky footer JSX with the Product Visuals pill pattern.
  - Convert terms + make-public label rows from `htmlFor` to wrapper-`onClick` to stop focus jump.
- `src/pages/BrandModelNew.tsx`
  - `pb-32` → `pb-28`.