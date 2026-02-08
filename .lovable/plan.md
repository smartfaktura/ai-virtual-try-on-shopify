

## Freestyle Studio -- Floating Prompt Bar, Masonry Grid, and Persistent Image Storage

Three major improvements to make Freestyle Studio feel like a professional creative tool:

---

### 1. Floating Prompt Bar (Overlay on Images)

Currently the prompt bar sits in a separate section below the gallery, pushing content up. Like the Higgsfield reference, it should float ON TOP of the gallery as a translucent overlay anchored to the bottom.

**How it works:**
- The gallery takes up the full viewport height (no flex split)
- The prompt panel is positioned with `position: absolute` at the bottom of the page, centered, with generous horizontal padding
- A strong upward shadow and `backdrop-blur-xl` creates a floating card effect over the images
- The gallery gets extra bottom padding (matching the prompt bar height) so the last row of images isn't hidden behind it
- When the user scrolls through the gallery, images slide behind the floating prompt bar

**File: `src/pages/Freestyle.tsx`**
- Change the layout from flex-column split to a single scrollable container with `position: relative`
- Move the prompt panel to `absolute bottom-4 left-4 right-4` (or centered with max-width)
- Add bottom padding to the gallery scroll area to account for the floating bar height
- Remove the `border-t` divider since it no longer sits in a separate section

---

### 2. Masonry Grid with Actual Aspect Ratios

Currently all images are forced to `aspect-[3/4]` regardless of what was generated. A 16:9 thumbnail gets cropped into a portrait frame.

**How it works:**
- Replace the CSS Grid with a CSS Columns masonry layout (`columns-2 lg:columns-3`)
- Each image uses its natural aspect ratio (no forced `aspect-[3/4]`)
- Images load with `onLoad` to detect natural dimensions and fade in smoothly
- The `break-inside-avoid` property prevents images from being split across columns
- Small gap between items using `mb-[2px]` and `gap-[2px]` on columns
- Each `GeneratedImage` type gets an `aspectRatio` field so we know what ratio was requested

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**
- Change from `grid grid-cols-2 lg:grid-cols-3` to `columns-2 lg:columns-3 gap-[2px]`
- Remove `aspect-[3/4]` from images, use `w-full h-auto` instead
- Add `break-inside-avoid mb-[2px]` to each image card
- Add `onDelete` prop for the delete button
- Add a delete button (Trash icon) to the hover overlay alongside download and expand

---

### 3. Save Generated Images to User Account

Currently images are only held in React state and lost on page refresh. They need to be persisted.

**Database: New `freestyle_generations` table**

```text
freestyle_generations
  - id (uuid, primary key)
  - user_id (uuid, references auth.users, not null)
  - image_url (text, not null) -- public URL from storage
  - prompt (text, not null)
  - aspect_ratio (text, default '1:1')
  - quality (text, default 'standard')
  - created_at (timestamptz, default now())
```

RLS policies:
- Users can SELECT their own rows (`user_id = auth.uid()`)
- Users can INSERT their own rows (`user_id = auth.uid()`)
- Users can DELETE their own rows (`user_id = auth.uid()`)

**Storage: New `freestyle-images` bucket**
- Public bucket so images can be displayed directly via URL
- RLS: authenticated users can upload to their own folder (`user_id/filename`)
- RLS: authenticated users can delete from their own folder

**Flow:**
1. Edge function generates base64 image(s)
2. Client receives base64 data URLs
3. Client converts each base64 to a Blob and uploads to `freestyle-images/{user_id}/{uuid}.png`
4. Client gets back the public URL
5. Client inserts a row into `freestyle_generations` with the public URL, prompt, and aspect ratio
6. On page load, client fetches all `freestyle_generations` for the current user, ordered by `created_at DESC`

**File: `src/hooks/useFreestyleImages.ts`** (new)
- Hook that manages loading saved images from the database on mount
- Provides `saveImage(base64, prompt, aspectRatio)` -- uploads to storage, inserts DB row
- Provides `deleteImage(id)` -- deletes from storage and DB
- Returns `images`, `isLoading`, `saveImage`, `deleteImage`

**File: `src/hooks/useGenerateFreestyle.ts`**
- No changes needed -- it still returns base64 URLs
- The save logic moves to the page level after generation succeeds

**File: `src/pages/Freestyle.tsx`**
- Import and use `useFreestyleImages` hook
- On mount, load saved images and populate the gallery
- After generation succeeds, save each image via the hook
- Pass `onDelete` handler to the gallery
- Merge newly generated (unsaved) images with saved images for instant display

---

### 4. Delete on Hover

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**
- Add a `Trash2` icon button to the hover overlay (alongside Download and Expand)
- Add `onDelete(imageId: string)` to the component props
- Show a brief confirmation toast or immediate delete with undo option
- The delete button appears on the left side of the hover overlay to separate it from download/expand

---

### Visual Result

```text
+-----------------------------------------------------------+
|  [Header bar]                                   [User v]  |
+-----------------------------------------------------------+
|          |                                                 |
| Sidebar  |  [  16:9 wide img  ] [portrait]                |
|          |  [square] [ 4:5 ]    [  16:9   ]               |
|          |  [portrait]          [square   ]               |
|          |  [  16:9 wide img  ] [portrait ]               |
|          |                                                 |
|          |  +-------------------------------------------+  |
|          |  |  Describe what you want...       FLOATING |  |
|          |  |  [Upload|Model|Scene] | [1:1|Std|Polish]  |  |
|          |  |                          [Generate (1)]   |  |
|          |  +-------------------------------------------+  |
+-----------------------------------------------------------+
```

Hover on any image reveals: `[Trash] ... [Download] [Expand]`

---

### Technical Details -- Files Changed

| File | Action |
|------|--------|
| `src/pages/Freestyle.tsx` | Refactor layout to relative container with floating prompt bar; integrate `useFreestyleImages` hook for persistence; add delete handler |
| `src/components/app/freestyle/FreestyleGallery.tsx` | CSS columns masonry; natural aspect ratios; add delete button on hover; accept `onDelete` prop |
| `src/hooks/useFreestyleImages.ts` | **New** -- load/save/delete images from database and storage |
| Database migration | Create `freestyle_generations` table with RLS; create `freestyle-images` storage bucket with RLS |

