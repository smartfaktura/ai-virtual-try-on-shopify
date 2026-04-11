

# Fix Upload Card & Product Grid in Step 1

## Problems
1. **Upload card is smaller/different style** than product cards — looks out of place in the grid
2. **Grid has inconsistent gaps** between cards
3. **Upload card text is unclear** — "Upload Image / or paste (Ctrl+V)" doesn't explain what these products are or where they come from
4. **No context** about what the product grid represents (your uploaded products)

## Changes

### File: `src/pages/ProductImages.tsx`

**1. Fix Upload Card to match product card style (lines 1086-1128)**
- Make it the same structure as product cards: `aspect-square` image area + text area below
- Use a solid border (not dashed) with primary tint, matching the rounded-lg and overflow-hidden pattern of product cards
- Content: large Upload icon centered in the square area, then below it a text area with "Upload product image" as title and "Drop, click, or paste" as subtitle — matching the same `px-1.5 py-1.5` text layout of other cards

**2. Fix grid gap consistency (line 1084)**
- Change `gap-3` to `gap-2` to tighten spacing and match visual density
- Ensure all cards use identical border-radius and overflow classes

**3. Add section context (lines 952-953)**
- Add a small label above the toolbar: "Your Products" as a section header with a subtitle "Select from your catalog or upload a new image"
- This clarifies where the products come from

**4. Improve empty state wording (lines 994-995)**
- Change to: "Upload a product image to get started" — clearer call to action

### Summary
Single file edit. Upload card gets identical dimensions/structure to product cards, grid gaps are tightened, and section labels clarify the source of products.

