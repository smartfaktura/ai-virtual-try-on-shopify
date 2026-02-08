
## Freestyle Studio -- Open-Ended Creative Generation

A new dedicated page at `/app/freestyle` where users have full creative control. Unlike the structured Generate flow (product + template + brand profile), this is a single-screen creative playground inspired by the reference screenshot. Users write their own prompt, optionally upload an image, optionally pick a model, choose output settings, and generate -- all on one page. Results appear in a growing gallery grid below the prompt bar.

### Layout (Single Page, No Steps)

The page has two main areas stacked vertically:

1. **Results Gallery** (top) -- a masonry-style grid showing all generated images from this session, newest first. Each image gets a hover overlay with a download button. Starts empty with a stylish empty state.

2. **Prompt Bar + Settings** (bottom, sticky) -- a dark-themed bottom bar (similar to the reference) with:
   - A text prompt input with an "attach image" button (+ icon) on the left
   - Settings chips below the prompt: Model selector, Aspect Ratio, Resolution (likes), Prompt Polish toggle, Image count
   - A "Generate" button on the right showing the credit cost

### Features

**Prompt Input**
- Large text area for free-form prompt (placeholder: "Describe what you want to create...")
- Plus (+) button opens file upload (same drag-and-drop pattern as UploadSourceCard)
- When an image is attached, show a small thumbnail preview next to the prompt

**Optional Model Selection**
- Clicking the "Model" chip opens a popover/dropdown showing the existing model library (reuses `mockModels`)
- Shows selected model as a small avatar chip, or "No Model" by default
- Character reference concept from the screenshot

**Output Settings (chips below prompt)**
- **Aspect Ratio**: 1:1, 3:4, 4:5, 16:9 (clickable chip cycles or opens dropdown)
- **Resolution**: Standard (1 credit) / High (2 credits)
- **Prompt Polish**: On/Off toggle -- when on, the AI refines the prompt before generating (adds 0 extra credits, just better prompting)
- **Count**: 1-4 images (stepper with - / +)

**Credit Cost**
- Standard quality: 1 credit per image
- High quality: 2 credits per image
- Shown on the Generate button: "Generate (4 credits)"

**Results Gallery**
- Images appear in a responsive grid (2 cols mobile, 3-4 cols desktop)
- Each image card has a hover overlay with:
  - Download button (downloads immediately on click)
  - Expand/lightbox button
- No selection/publish flow -- this is pure freestyle exploration
- Uses the existing ImageLightbox for full-screen view

**Generation**
- Uses a new edge function `generate-freestyle` that accepts a raw prompt + optional image + optional model reference
- Simpler than `generate-product` -- no template or brand profile overhead
- Still uses `google/gemini-2.5-flash-image` via Lovable AI Gateway

### Technical Details

**New files to create:**

1. **`src/pages/Freestyle.tsx`** -- Main page component
   - Sticky bottom prompt bar with dark background (bg-sidebar or similar)
   - Prompt textarea + attach image button
   - Settings chips row: Model, Aspect Ratio, Resolution, Polish, Count
   - Generate button with credit cost display
   - Results gallery grid above the prompt bar
   - Download on hover for each generated image
   - Uses existing `useFileUpload` hook for image uploads
   - Uses existing `useCredits` for credit management
   - Reuses `ImageLightbox` for full-screen view
   - Reuses `mockModels` data for model selection
   - Reuses `ModelSelectorCard` pattern in a popover for model picking

2. **`src/hooks/useGenerateFreestyle.ts`** -- Generation hook
   - Accepts: prompt (string), sourceImage (base64, optional), modelImage (base64, optional), aspectRatio, imageCount, quality, polishPrompt (boolean)
   - Calls the `generate-freestyle` edge function
   - Returns array of generated image URLs
   - Handles progress, loading state, errors (429/402)

3. **`supabase/functions/generate-freestyle/index.ts`** -- Edge function
   - Accepts raw prompt + optional image + optional model reference image
   - If prompt polish is on, prepends professional photography instructions to the user's prompt
   - Calls `google/gemini-2.5-flash-image` with the prompt (and optional images)
   - Returns generated images as base64 data URLs
   - Handles rate limits (429) and payment (402) errors

**Files to modify:**

4. **`src/App.tsx`** -- Add route `/app/freestyle` pointing to `Freestyle` page

5. **`src/components/app/AppShell.tsx`** -- Add "Freestyle" nav item to sidebar between "Generate" CTA and the Main nav section (or within Main nav). Uses `Wand2` or `Brush` icon from lucide-react.

6. **`supabase/config.toml`** -- Add `[functions.generate-freestyle]` with `verify_jwt = false`

### UI Design Details

**Bottom Prompt Bar** (inspired by reference):
- Dark background (`bg-[#1a1a1a]` or `bg-sidebar`)
- Rounded container with the prompt input
- Left side: + button for image upload
- Right side: Generate button (primary color, shows credit cost)
- Below prompt: row of setting chips with subtle borders
- Chips are small, rounded-full buttons showing current value

**Results Grid**:
- `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`
- Each image has `rounded-lg overflow-hidden` with `aspect-square object-cover`
- Hover overlay: semi-transparent black with centered download icon button
- Empty state: centered illustration with "Your creations will appear here" text

**Model Selector Popover**:
- Opens from the "Model" chip
- Shows a compact grid (3 cols) of model thumbnails using existing `ModelSelectorCard` styling
- Includes existing filter bar (gender, body type)
- Selected model shown as tiny avatar on the chip
