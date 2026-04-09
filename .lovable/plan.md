

# 10 UX Improvements for Product Upload Reference Images

## Problems Identified (from screenshot + code)

1. **Reference slots are tiny (14×14 = 56px)** — barely visible, feel like an afterthought
2. **"Optional" label is cramped** — the 9px uppercase text is nearly invisible at the top right
3. **No visual guidance** — empty slots show just "+" and a 3-letter label, no hint what photo to take
4. **No preview tooltip** — can't see reference images at full size once uploaded
5. **Main image has no max-width constraint** — stretches awkwardly on wide screens while refs stay tiny
6. **Helper text is buried** — "Extra angles auto-fill during generation…" is 10px text below the image, easily missed
7. **StoreImportTab role assignment is confusing** — "Assign:" row with tiny 10×10 slots is unclear; users don't know how to assign roles to imported images
8. **No drag-to-assign** — in URL import, you must click individual role slots after clicking a thumbnail, no intuitive flow
9. **Edit mode doesn't show existing refs prominently** — on the edit page (screenshot), the Back/Side/Pack slots on the right edge are barely noticeable
10. **Missing "from product" badge** — when refs auto-fill in generation, there's no visual indicator where the image came from

## Plan: 10 Changes

### 1. Enlarge reference slots from 56px → 72px with descriptive labels
Change `w-14 h-14` → `w-[72px] h-[72px]`. Add descriptive mini-labels inside placeholders: "Back view", "Side view", "Packaging" instead of just "Back", "Side", "Pack".

### 2. Add icon hints to empty slots
Each empty slot gets a subtle camera/angle icon (RotateCcw for back, ArrowRight for side, Package for packaging) instead of just the generic "+" icon.

### 3. Add section header with inline explanation
Replace the tiny "Optional" label with a proper row: **"Reference Angles"** with a subtle info line "Helps AI render accurate back-view & packaging scenes" — placed as a small header above the reference column.

### 4. Constrain main image width and balance layout
Set main image container to `max-w-[280px]` on desktop so it doesn't dominate. Make the reference column sit naturally beside it with proper vertical alignment.

### 5. Add hover-to-enlarge preview on filled reference slots
When a reference is uploaded, hovering shows a 200px tooltip preview using the existing HoverCard component. Quick visual check without opening anything.

### 6. Improve StoreImportTab role assignment UX
Replace the tiny "Assign:" row with a clearer layout:
- Each thumbnail in the grid gets a small dropdown on click (or cycle: Main → Back → Side → Pack → unassigned)
- Clicking an already-assigned thumbnail cycles its role
- Role badge is larger (proper Badge component) and color-coded

### 7. Add "click to assign role" instruction in StoreImportTab
Replace "Click to set primary · use labels below for other angles:" with clearer: "**Click** any image to cycle its role: Main → Back → Side → Pack"

### 8. Polish edit mode layout
On the edit page, move the reference slots from the far right edge to directly below the main image in a horizontal row (3 slots side by side) when in edit mode. This is more discoverable than a vertical stack pushed to the edge.

### 9. Add subtle border + background to image section
Wrap the entire image section (main + refs) in a light `bg-muted/10 rounded-2xl p-3 border border-border/50` container to visually group them as a cohesive "images" area.

### 10. Add "(from product)" badge support for generation auto-fill
In `ProductImages.tsx`, when a reference URL comes from the product data (not manually uploaded in Step 3), show a small badge "(from product)" on the reference card. Track this with a `source: 'product' | 'manual'` flag on the ref state.

## Files to Change

1. **`src/components/app/ManualProductTab.tsx`** — Changes 1-5, 8-9 (reference slot sizing, icons, labels, layout, hover preview, edit mode horizontal layout, container styling)
2. **`src/components/app/StoreImportTab.tsx`** — Changes 6-7 (role cycling UX, clearer instructions)
3. **`src/pages/ProductImages.tsx`** — Change 10 (source badge on auto-filled refs)

## Scope
- ~120 lines changed in ManualProductTab
- ~60 lines changed in StoreImportTab  
- ~15 lines changed in ProductImages

