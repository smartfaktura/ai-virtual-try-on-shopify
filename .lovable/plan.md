

# Product Images Flow — UX Fixes Round 3

## 3 Changes

### 1. Scene ordering: Recommended categories appear right after Universal Scenes, auto-opened

**Current**: Recommended categories show above Universal Scenes. Non-matched categories show below in a separate section.

**Fix**: Reorder Step2 layout to: Universal Scenes first → Recommended categories (auto-expanded, with "Recommended" badge) → Other categories (collapsed). Move the recommended section from above global scenes to directly below them.

**File**: `ProductImagesStep2Scenes.tsx` — restructure the JSX order: global scenes section first, then recommended categories, then other categories.

### 2. Scene card placeholders: uniform gray, 4:5 aspect ratio

**Current**: Scene cards use colorful gradients (`from-slate-100 to-gray-200`, etc.) with `aspect-[4/3]`.

**Fix**: Replace all gradient placeholders with a single uniform `bg-muted` (light gray) and change aspect ratio from `aspect-[4/3]` to `aspect-[4/5]`. Remove the `SCENE_GRADIENTS` map entirely.

**File**: `ProductImagesStep2Scenes.tsx` — in `SceneCard`, replace `bg-gradient-to-br ${gradient}` with `bg-muted`, change `aspect-[4/3]` to `aspect-[4/5]`.

### 3. Step 3 Details — replace collapsibles with inline fields, add scene thumbnail on hover, remove blocking requirement

**Current problems**:
- Non-prominent blocks use collapsible dropdowns — users don't realize they need to open them
- No visual reference to the scene that triggered the block
- Fields feel hidden and disconnected

**Fix**:
- Remove `DetailBlock` collapsible wrapper entirely. Render ALL block fields **inline** (always visible) within their scene group card — same as prominent blocks but without the "Important" badge for non-critical ones
- Add a small 24×24 gray placeholder thumbnail next to each "Because you selected X" header. On hover, show a larger 120px preview via a simple CSS hover scale/tooltip
- Make all detail fields **optional** — user should be able to proceed to next step without filling anything. The sticky bar CTA should always be enabled on Step 3 (details are all optional with smart defaults). Remove any validation gating if present
- Keep the "All fields are optional — we'll use smart defaults" text prominent

**Files**:
- `ProductImagesStep3Details.tsx` — Remove `DetailBlock` component, render all `BlockFields` inline. Add scene thumbnail (small gray placeholder with hover enlarge) next to "Because you selected" header.
- `ProductImages.tsx` — Ensure `canProceed` for step 3 is always `true` (no required field gating)

## Summary of file changes

| File | Change |
|------|--------|
| `ProductImagesStep2Scenes.tsx` | Reorder: Universal first → Recommended below → Others. Gray placeholders, 4:5 aspect. Remove `SCENE_GRADIENTS`. |
| `ProductImagesStep3Details.tsx` | Remove collapsibles, render all fields inline. Add scene thumbnail with hover preview. |
| `ProductImages.tsx` | Ensure step 3 always allows proceeding (no validation gate) |

