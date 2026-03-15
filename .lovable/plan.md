

## Restructure Admin Scenes: Category Order Section First, Then Scene Items

### Current Problem
Category reorder arrows are embedded within each category's scene list, making it hard to manage the overall category arrangement. The user wants a clear two-section layout: first control category order, then manage individual scenes within each category.

### Changes

**`src/pages/AdminScenes.tsx`**

1. **Add "Category Order" section** at the top of the page (after the header). This is a compact card/list showing all active categories as draggable-style rows with:
   - Category name + scene count
   - Up/Down arrows to reorder
   - Clean bordered card layout

2. **Remove category up/down arrows** from each category header in the scene items section below

3. **Layout structure**:
```text
Scene Manager                                    [Save Order]

── CATEGORY ORDER ──────────────────────────────
| ≡  Studio Shots (7)                    ↑  ↓  |
| ≡  Lifestyle (33)                      ↑  ↓  |
| ≡  Editorial (12)                      ↑  ↓  |
| ≡  Streetwear (5)                      ↑  ↓  |
| ≡  Product Studio (4)                  ↑  ↓  |
| ≡  Surface & Texture (3)              ↑  ↓  |
| ...                                           |
────────────────────────────────────────────────

── SCENES BY CATEGORY ──────────────────────────
STUDIO SHOTS (7)
  [img] Studio Front    [Studio ▼]       ↑ ↓ 🗑
  [img] Studio Profile  [Studio ▼]       ↑ ↓ 🗑
  ...

LIFESTYLE (33)
  [img] Urban Walking   [Lifestyle ▼]    ↑ ↓ 🗑
  ...
```

### Files
| File | Change |
|---|---|
| `src/pages/AdminScenes.tsx` | Split into two sections: category order manager at top, scene items below (remove category arrows from scene headers) |

