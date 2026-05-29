# Hide chat on Edit Product + reposition Sienna tip

## 1. Hide StudioChat on product add/edit pages

`src/components/app/StudioChat.tsx` already has explicit path exclusions (`/app/models/new`, `/app/help`, etc.). Add two more:

```ts
if (location.pathname === '/app/products/new') return null;
if (/^\/app\/products\/[^/]+\/edit$/.test(location.pathname)) return null;
```

Place alongside the existing `return null` guards near line 72.

## 2. Move Sienna QuickTip inside the form, above the sticky footer

Right now `<ProductUploadTips />` is rendered as a sibling AFTER `<ManualProductTab>` in `AddProduct.tsx`. Since the sticky footer lives inside `ManualProductTab`, the tip ends up visually below the floating bar — exactly the glitch shown.

Fix in `ManualProductTab.tsx`: render the QuickTip card inline just after the More Details collapsible and before the sticky footer block, controlled by a new prop.

- Add prop `showQuickTip?: boolean` to `ManualProductTabProps`.
- When true and `singleImage` is present, render `<ProductUploadTips />` immediately before the footer with `mt-2` (the tip already brings its own card styling and fade-in).

In `AddProduct.tsx`:
- Remove the `<div className="mt-6"><ProductUploadTips /></div>` block added after `<ManualProductTab>` in the edit branch.
- Pass `showQuickTip` to the edit-mode `<ManualProductTab>` instance.

## Files

- `src/components/app/StudioChat.tsx` — two new path guards.
- `src/components/app/ManualProductTab.tsx` — new `showQuickTip` prop + inline tip render before footer.
- `src/pages/AddProduct.tsx` — drop external tip render, pass `showQuickTip` instead.
