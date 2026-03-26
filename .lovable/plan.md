

# Animate Image — Premium First Screen Redesign

## Overview
Redesign the pre-upload state of the Animate Image page to make the upload area the dominant focus, add Library and paste input methods, lighten supporting content, and add proof-of-output elements.

## Changes

### File: `src/pages/video/AnimateVideo.tsx`

**1. Upload card — dominant and smart**
- Increase upload zone size and visual weight: larger icon, stronger border on hover, gradient background hint
- Update copy: title "Upload your product image", subtitle "We'll detect category, scene type, and recommended motion automatically"
- Replace "Click to upload" with a more intentional CTA: "Drop image here or click to browse"
- Add secondary input methods row below the dropzone: three compact buttons — "Upload image", "Choose from Library", "Paste image (⌘V)"

**2. Paste image support (CMD+V)**
- Add a `useEffect` that listens for `paste` events on the document when no image is loaded
- On paste, extract the first image from `clipboardData.items`, convert to File, and run through the same `handleFileSelect` flow
- Show a brief toast confirming paste was received

**3. Library picker modal**
- Create a lightweight modal/sheet triggered by "Choose from Library"
- Use existing `useLibraryItems` hook to fetch recent images
- Display a grid of recent library images; on click, use the image URL directly (set `imageUrl` and `imagePreview`, then trigger analysis)
- Keep it simple: recent images grid with a search bar, paginated

**4. Category chips — lighter, with label**
- Add a small label above: "Works across ecommerce categories"
- Reduce chip visual weight: smaller text (text-[10px]), lighter border opacity, no icon background
- Keep them visible but clearly secondary to the upload card

**5. Right-side support rebalance**
- Keep "How it works" card as-is (already good)
- Simplify "Best results" card: reduce to a compact inline list with lighter styling, or collapse into 2-line summary. Remove the card border to make it feel lighter than "How it works"

**6. Assistant banner — smarter copy**
- Update text to: "VOVV.AI Studio" / "We detect category, scene type, and motion opportunities so you don't need to prompt from scratch."

**7. Proof-of-output element**
- Add a compact "What Animate Image creates" strip below the upload card area, above the assistant banner
- Show 3-4 small thumbnail pairs (still → video icon overlay) using placeholder/example images
- Keep it minimal: a single horizontal row, small thumbnails, subtle label

**8. Hover and interaction polish**
- Upload card: `hover:border-primary/50 hover:shadow-md hover:shadow-primary/5` transition
- Upload card active/focus: `focus-within:ring-2 focus-within:ring-primary/20`
- Category chips: `hover:bg-muted/50` subtle transition
- Support cards: `hover:border-border/80` subtle lift

### New component: `src/components/app/video/LibraryPickerModal.tsx`
- Dialog with grid of recent library images
- Uses `useLibraryItems('newest', '')` to fetch
- Each image is clickable, returns the image URL to parent via callback
- Simple close/cancel behavior

### Grid layout adjustment
- Change from `lg:grid-cols-[1fr_320px]` to `lg:grid-cols-[1.4fr_1fr]` to give upload card more dominance
- Upload card gets `min-h-[400px]` to feel more substantial

## Files Modified
- `src/pages/video/AnimateVideo.tsx` — main page restructure
- `src/components/app/video/LibraryPickerModal.tsx` — new component

## Design Rules Maintained
- Upload card is the undeniable visual center
- No prompting required messaging maintained
- Luxury restraint aesthetic preserved
- `rounded-2xl` consistency kept

