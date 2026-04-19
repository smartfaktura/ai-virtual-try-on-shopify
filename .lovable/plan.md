

## Why methods are still showing

The compact-mode fix only kicks in when the parent component passes `compact={true}` + `initialFiles` + `onSwitchMethod` to `<AddProductModal>`. On the page you're on (`/app/generate/product-images`, `src/pages/ProductImages.tsx` line 1213), the modal is mounted with **only** `open` / `onOpenChange` / `onProductAdded` — none of the compact props. So it always renders the full Method rail.

Two separate flows on this page need to be unified:

1. **Cmd+V / paste** → currently calls `handleQuickUpload` directly, never opens the modal. ✅ Already streamlined (no methods shown because no modal).
2. **Click "Upload Image" card** → opens `AddProductModal` with no compact flag → full method rail shows. ❌ This is what your screenshot captures.
3. **Drag-drop onto the modal after it's open** → the analyzing preview you see is from `ManualProductTab`, but the rail is still visible above it because compact wasn't enabled.

## Fix

Make the "Upload Image" card on the Step 1 grid open the modal in **compact mode** pinned to the `manual` tab — exactly like the Products page does. The user can still click "Switch method" to reveal Product URL / CSV / Mobile / Shopify.

### Edits

`src/pages/ProductImages.tsx`:

1. Add a small state for compact mode + the active tab:
   ```ts
   const [addProductCompact, setAddProductCompact] = useState(true);
   const [addProductTab, setAddProductTab] = useState<AddProductTab>('manual');
   ```
2. When the "Upload Image" card is clicked (line 1152), set `compact=true`, `tab='manual'`, then open.
3. Pass the props to `<AddProductModal>` (line 1213):
   ```tsx
   <AddProductModal
     open={addProductOpen}
     onOpenChange={(o) => { setAddProductOpen(o); if (!o) setAddProductCompact(true); }}
     onProductAdded={() => queryClient.invalidateQueries({ queryKey: ['user-products'] })}
     compact={addProductCompact}
     initialTab={addProductTab}
     onSwitchMethod={() => setAddProductCompact(false)}
   />
   ```
4. Import `AddProductTab` type from `@/components/app/AddProductModal`.

## Result

- Clicking **Upload Image** opens the modal directly into the upload pane — no method rail, just the dropzone + analyzing preview, with a small "Switch method" link at the bottom (and a back chevron in the header) to reveal the other 4 import methods if needed.
- Behavior matches the Products page where this pattern already works.
- Paste/drop on the page itself still bypasses the modal entirely (unchanged).

