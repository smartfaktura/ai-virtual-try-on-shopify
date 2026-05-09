## Why "wedding-dress" shows raw slug

The admin Product Visual Scenes page (`src/pages/AdminProductImageScenes.tsx`) renders category headers using its own local `CATEGORIES` list (`CATEGORY_GROUPS` flattened, lines 33–127). That list does not include `wedding-dress`, so `catLabel()` falls back to the raw slug and the collection appears at the bottom in its own ungrouped row instead of inside Fashion.

The customer-facing taxonomy (`src/lib/sceneTaxonomy.ts`) already maps `wedding-dress` → Fashion family with the label "Wedding Dress" — that part is correct. This is purely an admin-UI registration gap.

## Fix

**`src/pages/AdminProductImageScenes.tsx`** — add one line to the Fashion group in `CATEGORY_GROUPS` (after `kidswear`, line 45):

```ts
{ value: 'wedding-dress', label: 'Wedding Dress' },
```

That single addition:
- Renders the section header as **"Wedding Dress"** (not `wedding-dress`)
- Groups it under **Fashion** in the category dropdown
- Makes it selectable when editing/creating other scenes

No DB changes, no other files.
