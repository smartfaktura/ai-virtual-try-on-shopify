

# Fix Scene Selection Dialog Z-Index

## Problem
The DiscoverDetailModal uses a custom overlay at `z-[200]`, but the scene picker `<Dialog>` renders via Radix portal at the default `z-50`. The Dialog appears behind the modal and can't be interacted with.

## Fix

### `src/components/app/DiscoverDetailModal.tsx` (line 415)
Add a higher z-index to the `DialogContent` so it renders above the `z-[200]` parent modal:

```tsx
// Before
<DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">

// After  
<DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 z-[250]">
```

Also need to ensure the Dialog's overlay is above z-200 too. Since `DialogContent` renders inside `DialogPortal` which also renders `DialogOverlay` at `z-50`, we need to override the overlay z-index. The cleanest approach: wrap the `Dialog` in a container or pass a custom className to ensure both overlay and content sit at `z-[250]`.

Looking at `dialog.tsx`, the overlay and content both use `z-50`. We'll add `z-[250]` to `DialogContent` — but since the overlay is a sibling rendered by the portal, we should also style it. The simplest fix: add a `[&_.fixed]:z-[250]` or use the `DialogOverlay` directly. Actually the cleanest: just add `z-[250]` to `DialogContent` which already includes `fixed` positioning — but the separate `DialogOverlay` also needs it.

**Revised approach**: Override both by adding inline style or className on DialogContent with `z-[250]`, and since DialogOverlay is rendered automatically inside DialogContent's portal, we need to customize the Dialog usage to pass overlay className. But our `DialogContent` component auto-renders the overlay.

**Simplest fix**: Add a global CSS rule or modify the Dialog usage to include a custom overlay. Actually, let's just add `[&+[data-radix-dialog-overlay]]:z-[250]` — no, the overlay is a sibling.

**Best approach**: Use the Dialog primitives directly for this instance, or add a CSS class to the portal container. The simplest working fix:

1. On `DialogContent` add `className="... z-[250]"` 
2. The `DialogOverlay` inside `DialogContent` component is rendered as a sibling — we need to modify the Dialog import to also control overlay z-index

Since `dialog.tsx` renders overlay automatically inside `DialogContent`, we can add a wrapper `<div className="[&>*]:z-[250]">` around the `<Dialog>`, but portals escape DOM hierarchy.

**Final approach**: Add a simple CSS style. Actually the most pragmatic fix: add `style` overrides. Or better — since this is a known pattern, just add `z-[250]` class to both. We'll need to slightly modify the Dialog rendering for this specific case by not using the auto-overlay `DialogContent` but instead manually rendering overlay + content with higher z-index. 

Actually, let me reconsider — the simplest working fix is to just add CSS that targets the portal:

```tsx
<Dialog open={sceneDialogOpen} onOpenChange={setSceneDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 !z-[250] [&~[data-radix-dialog-overlay]]:!z-[250]">
```

Wait — `DialogContent` in our code wraps things in `DialogPortal` which renders both `DialogOverlay` and `DialogPrimitive.Content`. Both are children of the portal div. So adding a className to the portal's parent won't work since it portals to body.

**Actual simplest fix**: Modify the `DialogContent` call to pass a custom class, and update `dialog.tsx`'s `DialogOverlay` to inherit className. OR just add `z-[250]` as inline style on both the overlay and content.

The real fix: Since our `DialogContent` component renders `<DialogOverlay />` internally, we can pass a prop or just add a global override. But the cleanest single-file fix:

Just add a `<style>` tag or use Tailwind's arbitrary variant. Actually — the portal renders to `document.body`, so a simple `z-[250]` on `DialogContent` will work for the content, and we need the overlay too. Let me just check if `[&_[data-radix-dialog-overlay]]` on a parent works... no, portal escapes.

**Final pragmatic solution**: Render the scene picker as a custom overlay (like the parent modal) instead of using Radix Dialog, OR modify `dialog.tsx` to accept an overlay className prop. The cleanest: just pass a custom z-index class and also add it to a `DialogOverlay` override.

Let me simplify: We'll modify the scene picker Dialog to use `DialogPortal` + `DialogOverlay` + `DialogPrimitive.Content` directly (imported from dialog.tsx exports), giving both overlay and content `z-[250]`.

### File: `src/components/app/DiscoverDetailModal.tsx`

1. Import `DialogPortal, DialogOverlay` from dialog
2. Replace `<DialogContent className="...">` with manual rendering:
```tsx
<DialogPortal>
  <DialogOverlay className="z-[250]" />
  <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[250] -translate-x-1/2 -translate-y-1/2 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col p-0 bg-background border rounded-lg shadow-lg">
```

Actually this is getting complex. Simpler: just add `z-[250]` to both via CSS. Since the overlay and content are both `fixed` with `z-50`, we can use a global utility. 

**FINAL simple approach**: The `DialogContent` component renders `<DialogOverlay />` as a sibling. Both live in a `<DialogPortal>` container. We can target the portal container. The portal renders a `<div>` to body. We can't easily style it.

OK — the truly simplest fix: **Don't use Radix Dialog. Convert the scene picker to a simple fixed overlay div** (like the parent modal pattern), with `z-[250]`. This avoids all portal z-index issues.

### Changes to `src/components/app/DiscoverDetailModal.tsx`

Replace the `<Dialog>` / `<DialogContent>` scene picker (lines 414-477) with a custom fixed overlay:

- When `sceneDialogOpen` is true, render a `<div className="fixed inset-0 z-[250]">` with backdrop + centered content panel
- Same search input and grid content, just wrapped in custom overlay instead of Radix Dialog
- Click backdrop or select scene closes it

Single file, ~10 lines changed (wrapper swap).

