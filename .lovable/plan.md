

# Product Images Page — Issues & Improvements

## Issues Found

### 1. Grid card height inconsistency
The "Upload Image" card text area uses `py-1.5` (lines 1101-1104) while product cards use `py-1.5` too (line 1129), but product cards have conditional `product_type` text — when it exists it adds a second line, when it doesn't the card is shorter. This causes uneven row heights across the grid. Fix: add `min-h-[40px]` to the text area on both card types, and always render the subtitle line (use `\u00A0` as placeholder when `product_type` is empty).

### 2. Upload card is shorter than product cards
The Upload card's dashed inner box + text area doesn't perfectly align with the product card's `aspect-square` image + text combo. The outer `border-dashed` on the Upload card compounds with the inner dashed box — double-dashed looks cluttered. Fix: simplify to single outer dashed border (remove inner dashed box), center the Upload icon + text vertically in the `aspect-square` area.

### 3. Product title truncation — `line-clamp-2` vs single line
Product cards use `line-clamp-2` which allows wrapping to 2 lines (line 1130), but some titles are short (1 line). Combined with the conditional `product_type`, this creates variable card heights. Fix: use fixed-height text container (`h-[44px]`) so all cards match regardless of content.

### 4. Missing product_type fallback in grid view
Line 1131: `{up.product_type && ...}` — when product_type is empty, no subtitle renders, causing height differences. Fix: always render the line with a non-breaking space fallback.

### 5. Drag-and-drop overlay not visible
The `isDragOver` state is set (lines 99) but there's no visible overlay when dragging a file onto the grid. Users don't know they can drag & drop. Fix: add a conditional overlay that appears during drag with a "Drop image here" message.

### 6. Quick upload progress has no visual indicator in the grid
`quickUploading` state exists but there's no loading skeleton or spinner shown in the product grid during upload. Fix: show a temporary skeleton card at position 1 (after the Upload card) while uploading.

### 7. "Select All" selects filtered products but label doesn't indicate this
When a search filter is active, "Select All" selects only filtered results (line 970-974), but the button text doesn't change to "Select Filtered" or similar. Minor UX confusion.

### 8. No indication of paste-to-upload capability
The paste listener exists (lines 184-200) but there's no visible hint on the page that Ctrl+V works (only shown in the empty state, line 1012). Fix: add a small hint near the search bar or Upload card.

## Recommended Changes

### File: `src/pages/ProductImages.tsx`

**A) Fix grid card heights (lines 1091-1135)**
- Upload card: Remove inner dashed box, center content in aspect-square, use fixed `h-[44px]` text area
- Product cards: Use fixed `h-[44px]` text area, always render product_type line with `\u00A0` fallback
- Both cards get consistent structure: `aspect-square` + `h-[44px] px-1.5 py-1`

**B) Add drag overlay (around line 1087-1089)**
- When `isDragOver` is true, show a full-grid overlay with "Drop image to add product" message

**C) Show upload progress skeleton (after line 1105)**
- When `quickUploading`, render a skeleton card with a spinner and progress text

**D) Add paste hint to Upload card subtitle**
- Change "or paste / import URL" to "drop, paste, or import"

These are ~30 lines of changes total, all in a single file.

