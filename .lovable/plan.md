

# Premium Edit Product Screen Redesign

## Overview

Redesign the Edit Product modal to feel clean, premium, and intuitive -- matching the luxury studio aesthetic of the app. The current version has raw, utilitarian styling with dashed borders, plain star icons, and cramped layout. The redesign will introduce clear visual hierarchy, refined spacing, and polished micro-interactions.

## Current Issues

- Dashed border around image area looks unfinished and draft-like
- The "star = primary image" text label is raw/technical
- Image thumbnails are small (80px) and cramped
- Form labels are basic with no visual hierarchy
- Description field uses a single-line Input instead of a Textarea
- No visual separation between the image zone and the form fields
- Cancel/Save buttons lack visual weight and polish
- No subtle section headings to guide the user through the form

## Design Direction

Follow the existing studio aesthetic: clean surfaces, subtle shadows instead of borders, refined typography, generous spacing. Think Apple product edit screens -- minimal chrome, clear hierarchy, images as the hero.

---

## Changes

### 1. ProductImageGallery.tsx -- Larger, Polished Image Tiles

- Increase thumbnail size from 80x80px (`w-20 h-20`) to 96x96px (`w-24 h-24`)
- Replace dashed border with solid `border border-border` and add subtle shadow on the selected/primary image
- Replace the plain Star icon with a filled crown/star that uses `bg-primary text-primary-foreground` when primary and a subtle glass overlay when not
- Increase the X (remove) button size slightly for better touch targets
- Style the "Add" button as a cleaner rounded square with a subtle background tint instead of dashed border
- Add smooth hover scale transition on image tiles (`hover:scale-[1.02]`)

### 2. ManualProductTab.tsx -- Refined Layout and Visual Hierarchy

**Image Section:**
- Remove the dashed border wrapper around images entirely
- Add a proper section heading: "Product Images" with a subtle counter badge (e.g., "1/6")
- Add a helpful subline under the heading: "First image is used as the cover. Click the star to change."
- Clean empty-state dropzone: use a solid `bg-muted/50` background with `rounded-xl` instead of dashed border; larger icon; cleaner typography
- When images exist, just show the gallery directly on a clean background (no dashed wrapper)

**Form Section:**
- Add a visual separator (a thin `border-t` or `<Separator />`) between the image section and the form fields
- Add a subtle section heading: "Product Details" above the fields
- Use `Textarea` instead of `Input` for the description field (3 rows, resizable) so long descriptions are readable
- Add `text-xs text-muted-foreground` helper text under the Product Name field: "This name will appear in your generations"
- Refine label styling with slightly more weight (`font-medium`)

**Footer/Actions:**
- Move buttons into a proper `DialogFooter`-like sticky bottom area with top border
- Make Cancel button ghost (not outline) for less visual noise
- Make Save/Add button slightly larger with proper padding
- Add a subtle loading spinner animation (replace the Upload spin icon with a proper Loader2 spinner)

### 3. AddProductModal.tsx -- Modal Polish

- Add a `DialogDescription` under the title for edit mode: "Update your product details and images"
- For add mode: "Upload product images and fill in the details"
- Slightly increase max width to `sm:max-w-[640px]` for breathing room
- Add `rounded-2xl` to match the luxury card aesthetic

---

## Technical Details

### File: `src/components/app/ProductImageGallery.tsx`

- Change `w-20 h-20` to `w-24 h-24` on image tiles
- Change `border-2` to `border` on tiles; add `shadow-sm` on primary tile
- Add `transition-transform hover:scale-[1.02]` to image tiles
- Change the "Add" button from dashed border to `bg-muted/50 hover:bg-muted border border-border`
- Update star button styling: use `bg-primary/90 text-white shadow-sm` when primary, `bg-black/30 text-white/80 backdrop-blur-sm` when not
- Update remove button: use `bg-black/30 text-white/80 backdrop-blur-sm hover:bg-destructive hover:text-white`
- Increase icon sizes from `w-3 h-3` to `w-3.5 h-3.5`

### File: `src/components/app/ManualProductTab.tsx`

- Import `Textarea` from `@/components/ui/textarea`
- Import `Separator` from `@/components/ui/separator`
- Import `Loader2` from `lucide-react` (replace Upload spin)
- Restructure the template:
  - Image section: heading with counter badge + subtext, then gallery or dropzone (no dashed wrapper when images exist)
  - `<Separator />` between image and form sections
  - Form section: "Product Details" heading, then fields
  - Description field: switch from `<Input>` to `<Textarea rows={3}>`
  - Add helper text under Product Name
  - Footer: ghost Cancel, primary Save with `Loader2` spinner

### File: `src/components/app/AddProductModal.tsx`

- Import `DialogDescription` from dialog component
- Add description text below the title
- Update modal max width to `sm:max-w-[640px]`

