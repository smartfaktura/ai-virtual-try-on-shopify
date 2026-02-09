

## Fix "What to Avoid" Examples & Replace "Garment" Wording

### Problem
The three "What to Avoid" images don't match their labels:
- **Faux fur jacket** looks like a nice model photo, not a "covered/cropped" item
- **Hoodie** has a clean background, not a "busy background"
- **Joggers** show a single item, not "multiple items"

Also, the word "garment" feels too technical and should be replaced with something friendlier like "clothing" or "item."

### Changes in `src/components/app/TryOnUploadGuide.tsx`

**1. Update bad example labels to accurately describe what's wrong with the photos:**

| Image | Current Label | New Label |
|---|---|---|
| `fauxFurJacket` | Covered / cropped garment | Clothing hidden under layers |
| `hoodieGray` | Busy background | Low contrast, hard to detect |
| `joggersBeige` | Multiple items / flat lay | Cropped — missing full outfit |

**2. Replace "garment" with "clothing item" everywhere:**

| Location | Current | New |
|---|---|---|
| Good example label (line 13) | `Clear front-facing garment` | `Clear front-facing photo` |
| Tip text (line 114) | `...single garment on a model...` | `...single clothing item on a model...` |
| Avoid text (line 120) | `...accessories cover the garment...` | `...accessories cover the clothing...` |

**3. Update the heading in `src/pages/Generate.tsx`** (where TryOnUploadGuide is used):
- Change "Upload Your Garment Photo" to "Upload Your Clothing Photo" (if present in Generate.tsx heading area)

### Files Changed
- `src/components/app/TryOnUploadGuide.tsx` -- fix labels + replace "garment"
- `src/pages/Generate.tsx` -- update heading if it says "Garment"

