
## Add "Missing a scene?" request banner inside Recommended category

### Goal
On `/app/generate/product-images` Step 2 (Shots), inside the always-open **Recommended** category, append a feedback-style banner letting users request a custom scene. Promise: "We'll create it in 1–2 business days." Optional: image link.

### Reuse existing pattern
We already have `MissingRequestBanner` (`src/components/app/MissingRequestBanner.tsx`) that does exactly this for models/scenes/workflows — submits to `feedback` table with `[scene-request]` prefix, shows success state, compact mode supported. It just needs one small extension: an **optional reference image URL field**.

### Changes

**1. Extend `MissingRequestBanner.tsx`**
- Add prop `showImageLinkField?: boolean` (default false)
- When true, render a small `<Input type="url">` under the textarea: placeholder "Optional: link to a reference image"
- Append to message body when submitting: `\n\nReference: <url>` (only if filled)
- Update success copy to: "Thanks! We'll create it in 1–2 business days."

**2. Mount it in Step 2 inside the Recommended group**
- File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
- Locate the Recommended category render path (the always-open one — likely near the `SubGroupSection` / `CategoryExpandedContent` block around lines 661 / 759 we touched recently)
- After the last sub-group's scene grid in the Recommended category, render:
  ```tsx
  <MissingRequestBanner
    category="scene"
    title="Missing a scene? Tell us, we'll create it in 1–2 business days."
    placeholder="Describe the scene, mood, or setting you need…"
    showImageLinkField
    compact
  />
  ```
- Only render once per Recommended category block (not per sub-group)

### Visual
```
RECOMMENDED FOR YOUR PRODUCTS
  Essential Shots …
  Color Stories …
  Lifestyle …

  ┌──────────────────────────────────────────────┐
  │ ✏️  Missing a scene? Tell us, we'll create   │
  │     it in 1–2 business days.            ›    │
  └──────────────────────────────────────────────┘
```
Expanded: textarea + optional URL input + Send Request button (matches existing compact style).

### Files
- `src/components/app/MissingRequestBanner.tsx` — add optional URL field
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — mount banner at end of Recommended category

### Validation
1. Step 2 → Recommended category shows banner at the bottom (after all sub-groups)
2. Click banner → expands to textarea + optional reference URL input
3. Submit with text only → row inserts into `feedback` with `[scene-request]` prefix
4. Submit with URL filled → message includes `Reference: <url>` line
5. Success state shows "Thanks! We'll create it in 1–2 business days."
6. Banner does NOT appear in other categories (only Recommended)
