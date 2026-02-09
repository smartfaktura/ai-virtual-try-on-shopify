

## Fix Upload Step: Split Layout, Better Example Images, Animations

### Problems
1. **"What to Avoid" images are wrong** -- Currently using regular product photos (faux fur jacket, gray hoodie, beige joggers) that actually look fine. They should show genuinely poor inputs: flat-lay shots, heavily cropped images, low-contrast/dark photos
2. **Guide is too large** -- The guide section takes up so much vertical space that the upload area is pushed below the fold and users can't see it
3. **No animation** -- The tab switching uses `animate-in fade-in` but there's no visible transition effect
4. **Layout is stacked** -- Both guide and upload are in a single column, wasting horizontal space on desktop

### Solution: Split-Screen Layout + New Assets

Restructure the upload step into a **two-column layout** on desktop:
- **Left column**: Upload area (drag-and-drop zone + product details form)
- **Right column**: Compact guide ("What Works Best" / "What to Avoid") with proper example images

On mobile, it stacks vertically but with the upload area FIRST (guide below).

```text
Desktop:
+---------------------------+-----------------------------+
|  Upload Your Clothing     |  What Works Best / Avoid    |
|                           |                             |
|  +---------------------+ |  [img] [img] [img]          |
|  |  Drag & drop or     | |  label  label  label        |
|  |  tap to upload      | |                             |
|  +---------------------+ |  Tip: Use front-facing...   |
+---------------------------+-----------------------------+
```

### Steps

**1. Generate 3 proper "What to Avoid" images**
Use AI to create realistic bad-example photos:
- A flat-lay photo of clothing on a surface (not on a person)
- A dark/low-contrast photo where the garment is hard to see
- A heavily cropped photo showing only part of a garment

Save to `src/assets/products/` as `avoid-flatlay.jpg`, `avoid-lowcontrast.jpg`, `avoid-cropped.jpg`.

**2. Restructure the upload step layout in `Generate.tsx`**
- Wrap the upload content in a responsive grid: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- Left column: title/subtitle + UploadSourceCard
- Right column: TryOnUploadGuide (only shown when no file uploaded yet)
- On mobile: upload area first, guide second

**3. Make TryOnUploadGuide more compact**
- Reduce image aspect ratio from 3:4 to 1:1 (square thumbnails)
- Reduce padding and font sizes
- Make the whole component fit within the viewport alongside the upload area

**4. Fix tab switch animation**
- Add proper CSS transition with `transition-all duration-300` on the content container
- Use a key-based re-render with `animate-in fade-in slide-in-from-bottom-2 duration-500`

**5. Replace bad example images**
- Update `TryOnUploadGuide.tsx` to use the 3 newly generated "avoid" images
- Update labels to clearly describe each problem

### Files Changed
- `src/assets/products/avoid-flatlay.jpg` (new) -- AI-generated flat-lay bad example
- `src/assets/products/avoid-lowcontrast.jpg` (new) -- AI-generated dark/low-contrast bad example  
- `src/assets/products/avoid-cropped.jpg` (new) -- AI-generated cropped bad example
- `src/components/app/TryOnUploadGuide.tsx` -- Swap bad images, make compact (square thumbs, less padding), fix animation
- `src/pages/Generate.tsx` -- Split-screen grid layout for upload step
