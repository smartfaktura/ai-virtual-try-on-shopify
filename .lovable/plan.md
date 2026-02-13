

## Fix Framing Thumbnails - Generate Real Photos

### Problem
The AI image generation produced pictograms/icons instead of photographic crops matching the existing model (blonde woman in white crop top). Specifically:
- **Side Profile** - shows a tiny ear icon instead of a photo
- **Close-Up** - shows same upper body shot, not a tighter face portrait
- **Neck/Shoulders** - shows same upper body shot, not a collarbone-focused crop

### Solution
Re-generate all 3 images using the AI image generation API with the existing `upper_body.png` as an **input reference image**, asking the model to create specific crops of the same woman:

1. **`close_up.png`** - Generate using upper_body.png as reference: "Create a tight beauty headshot portrait of this exact woman. Frame from forehead to chin, face fills the entire frame. Same lighting, same background. Professional 85mm lens portrait."

2. **`neck_shoulders.png`** - Generate using upper_body.png as reference: "Create a collarbone/necklace display crop of this exact woman. Frame from just below the chin to mid-chest. Do not show the face. Same clothing, lighting, background."

3. **`side_profile.png`** - Generate using upper_body.png as reference: "Create a side profile view of this exact woman. Show the side of her head from temple to jawline, focusing on the ear area. Same lighting, same background."

### Technical Details

All 3 images will be generated via the image editing API (passing the existing `upper_body.png` as a reference) and saved to:
- `public/images/framing/close_up.png`
- `public/images/framing/neck_shoulders.png`
- `public/images/framing/side_profile.png`

No code changes needed - only the image assets are replaced. The components already reference these paths correctly.

### Files Changed
- `public/images/framing/close_up.png` (regenerated photo)
- `public/images/framing/neck_shoulders.png` (regenerated photo)
- `public/images/framing/side_profile.png` (regenerated photo)
