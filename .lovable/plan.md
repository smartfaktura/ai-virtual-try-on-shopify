

## Replace Framing Icons with AI-Generated Model Photos

### What Changes

Replace the hand-drawn SVG stick-figure icons in the Framing Selector dropdown with clean, professional AI-generated studio photos of a blonde supermodel (white crop top, grey leggings, casual sporty look) demonstrating each body crop zone.

### Image Generation

Generate **7 photos** (1:1 ratio, ~256px) using the AI image generation model, each showing the same model with the camera framed to match the framing option:

| Option | Photo Description |
|--------|------------------|
| Full Body | Full head-to-toe shot, light grey studio background |
| Upper Body | Waist-up crop, same model and background |
| Close-Up | Shoulders-up portrait crop |
| Hand / Wrist | Close-up of hand and wrist area only |
| Neck / Shoulders | Collarbone/neckline area crop |
| Lower Body | Hips-to-feet crop showing leggings and shoes |
| Back View | Model facing away, full or upper back visible |

All images will share the same model appearance, outfit, and clean light-grey studio backdrop for visual consistency.

### UI Update

**File: `src/components/app/FramingSelectorChip.tsx`**

- Replace the `FramingIcon` SVG component with a `FramingThumbnail` component that renders a small circular `<img>` thumbnail (24x24px in the chip trigger, 32x32px in the dropdown list)
- Each dropdown row gets a rounded photo thumbnail instead of the SVG silhouette
- The "None (Auto)" option keeps the existing `Frame` lucide icon (no photo needed)
- The chip trigger button also shows the selected framing's photo thumbnail

**File: `src/lib/framingUtils.ts`**

- Add a `previewUrl` field to each `FramingOptionConfig` entry pointing to the stored image path

### Image Storage

Images will be saved to `public/images/framing/` as:
- `full_body.png`
- `upper_body.png`
- `close_up.png`
- `hand_wrist.png`
- `neck_shoulders.png`
- `lower_body.png`
- `back_view.png`

### Files Changed

- `public/images/framing/*.png` -- 7 new AI-generated photos
- `src/lib/framingUtils.ts` -- add `previewUrl` to each option config
- `src/components/app/FramingSelectorChip.tsx` -- replace SVG icons with circular photo thumbnails

### Visual Result

The dropdown transforms from abstract stick figures to a polished visual menu where users can instantly see what each framing looks like on a real model, making the selection intuitive and professional.

