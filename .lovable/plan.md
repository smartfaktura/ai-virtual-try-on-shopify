
## Replace compact scene banner with WorkflowRequestBanner-style design

### What's wrong now
Current `MissingRequestBanner` (compact mode) renders as a small dashed pill with chevron — looks cheap next to the polished `WorkflowRequestBanner` on `/app/workflows` (avatar stack + bold title + "Share Request" pill button).

### Approach
Create a new sibling component that mirrors `WorkflowRequestBanner` exactly but for **scenes** with the optional reference-image URL field.

### Changes

**1. New file: `src/components/app/SceneRequestBanner.tsx`**
- Copy `WorkflowRequestBanner.tsx` structure 1:1 (same wrapper classes, avatar stack, typography, Share Request button, expanded textarea layout, success state)
- Replace copy:
  - Collapsed title: **"Missing a scene for your products?"**
  - Subtitle: **"Tell us what you need — we'll create it in 1–2 business days."**
  - Expanded prompt: **"What scene would you like us to create?"**
  - Textarea placeholder: **"Describe the scene, mood, or setting you need…"**
  - Success: **"Thanks! We'll create it in 1–2 business days."**
- Add **optional reference URL `<Input type="url">`** below the textarea (placeholder: "Optional: link to a reference image"), styled to match the textarea (`bg-background`, `text-sm`, `h-10`)
- Submit prefix: `[scene-request]`, append `\n\nReference: <url>` when filled
- Same Supabase `feedback` insert as existing banners

**2. Mount in `ProductImagesStep2Scenes.tsx`**
- Replace the current `<MissingRequestBanner …compact />` (lines 493-499) inside the Recommended block with `<SceneRequestBanner />`
- Remove unused `MissingRequestBanner` import if no longer referenced
- Keep position: bottom of Recommended category, before "Explore More"

### Files
- **New**: `src/components/app/SceneRequestBanner.tsx`
- **Edit**: `src/components/app/product-images/ProductImagesStep2Scenes.tsx` (swap component + clean import)

### Validation
1. `/app/generate/product-images` → Step 2 → bottom of Recommended shows the same large banner style as `/app/workflows` (avatar stack + bold title + "Share Request" button)
2. Click "Share Request" → expands to textarea + optional URL input + Send Request
3. Submit text only → row in `feedback` with `[scene-request]` prefix
4. Submit with URL → message includes `Reference: <url>` line
5. Success state shows team-style confirmation
6. `/app/workflows` banner unchanged
