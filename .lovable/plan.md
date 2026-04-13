

# Fix & Improve Model Image Replacement on Admin Models Page

## Problem
The current image replacement uses a hidden `<input type="file">` with a ref that gets `.click()`-ed programmatically. This pattern is fragile — the state update (`setImageTargetModel`) and the `.click()` happen in the same synchronous call, so when `handleFileChange` fires, `imageTargetModel` may still be stale. Additionally, there's no visual "Change Image" button — users must know to click the tiny thumbnail, which isn't discoverable.

## Changes (single file: `src/pages/AdminModels.tsx`)

### 1. Fix the file input race condition
- Instead of a single shared `<input ref>`, generate the file input inline per-model OR store the target model ID in a ref (not state) so it's available immediately when `onChange` fires
- Use `useRef` for `imageTargetModel` so the value is synchronously available in `handleFileChange`

### 2. Add an explicit "Change Image" button for custom models
- Add a small `Camera` icon button in the actions area (next to Edit/Delete) that triggers the file picker
- This makes the feature discoverable without relying on clicking the thumbnail
- Keep the thumbnail click working too as a shortcut

### 3. Allow image override for built-in models too
- Built-in (mock) models currently show "read-only" — extend the system so admins can override a built-in model's display image
- Store overrides in a new approach: upload the image and save a mapping in `model_sort_order` or a simple key-value approach
- **Simpler approach**: Since built-in model images come from `mockData.ts`, we can store image overrides in a separate `model_image_overrides` table (model_id → image_url), or piggyback on the existing `model_sort_order` table by adding an `image_url` column

### Actually — simplest approach
Looking again, the user likely just wants the custom model image change to **work reliably**. The fix:

1. **Use a ref for target model** instead of state to avoid the async gap
2. **Add a visible "Change photo" button** in the action buttons for custom models (Camera icon) 
3. **Improve feedback** — show which model is being uploaded with a toast

### Technical details

**File: `src/pages/AdminModels.tsx`**
- Replace `const [imageTargetModel, setImageTargetModel] = useState<UnifiedModel | null>(null)` with `const imageTargetModelRef = useRef<UnifiedModel | null>(null)` 
- In `handleImageClick`: set the ref value, then trigger the file input click
- In `handleFileChange`: read from `imageTargetModelRef.current` instead of state
- Add a `Camera` button in the custom model actions row (next to Pencil, Eye, Trash2) that calls `handleImageClick`
- Keep the thumbnail click-to-replace as a secondary path

