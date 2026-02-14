

## Update Mirror Selfie Set Workflow Card

### What Changes

**1. Generate a unique cover image for Mirror Selfie Set**

Create a new edge function call to generate a mirror selfie background image using AI (google/gemini-3-pro-image-preview) and upload it to the `landing-assets` bucket at `workflows/workflow-mirror-selfie.jpg`. This replaces the current reuse of `ugcResult` (the Selfie/UGC background).

The prompt will describe: a stylish woman taking a mirror selfie with a visible smartphone, modern bedroom with full-length mirror, warm natural light, Instagram 4:5 aesthetic.

**2. Update animation data with unique assets and improved storytelling**

In `src/components/app/workflowAnimationData.tsx`, the Mirror Selfie Set entry will be updated:

- **New background**: Point to the newly generated `workflows/workflow-mirror-selfie.jpg`
- **Distinct model**: Use a different model image (e.g., `model-female-average-european.jpg`) instead of sharing `ugcModel` with the Selfie/UGC Set
- **Add scene chip**: New "scene" type element showing a mirror environment thumbnail with label "Bedroom Mirror" (slides up from bottom-left)
- **Remove "4:5 Portrait" badge**: Per user request, no aspect ratio step -- all formats supported
- **Keep "Mirror Selfie" badge**: Retains the workflow identity badge
- **Improved timing**: Product (0.3s) -> Model (0.9s) -> Scene (1.5s) -> Mirror Selfie badge (2.0s)

**3. Animation flow (updated)**

```text
0.3s  Product chip slides in from left ("Outfit" + product thumbnail)
0.9s  Model avatar slides in from right (distinct model photo)
1.5s  Scene chip slides up from bottom-left ("Bedroom Mirror" + scene thumbnail)
2.0s  "Mirror Selfie" badge pops in bottom-center
~4s   All elements exit, shimmer sweep, "Generated" badge appears
```

### Technical Details

| File | Change |
|------|--------|
| `src/components/app/workflowAnimationData.tsx` | New background URL, distinct model, add scene element, remove "4:5 Portrait" badge, adjust timing |
| New edge function or one-time script | Generate mirror selfie cover image via AI and upload to `landing-assets/workflows/workflow-mirror-selfie.jpg` |

### Image Generation Approach

A one-time call to the `generate-scene-previews` pattern or a direct edge function invocation will generate the cover image using `google/gemini-3-pro-image-preview` with a prompt for a stylish mirror selfie scene. The resulting image will be uploaded to the `landing-assets` storage bucket and the URL referenced in `workflowAnimationData.tsx`.

