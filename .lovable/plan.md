

## What's happening

The Edit dialog's **Category** dropdown in `/app/admin/product-image-scenes` is hardcoded to a 14-item list in `src/pages/AdminProductImageScenes.tsx` (lines 31–46):

```
fragrance, beauty-skincare, makeup-lipsticks, bags-accessories, hats-small,
shoes, garments, home-decor, furniture, tech-devices, food, beverages,
supplements-wellness, other
```

But the product analyzer (`analyze-product-category` edge function — the fix we just shipped) classifies products into a **much richer set**: `streetwear`, `hoodies`, `jeans`, `dresses`, `jackets`, `activewear`, `swimwear`, `lingerie`, `skirts`, etc.

So:
- A scene tagged with `category_collection = 'streetwear'` shows up grouped under "streetwear" on the page (because grouping uses the raw value).
- But when you click **Edit** on that scene, the dropdown can't represent `streetwear` — it silently falls back to `'other'` (line 754: `value={draft.category_collection || 'other'}`).
- You have **no way** to reassign a scene to `hoodies`, `streetwear`, `dresses` etc. from the edit form.

## Fix

Expand the hardcoded `CATEGORIES` array in `AdminProductImageScenes.tsx` to include every category the analyzer can produce, so they're all selectable in the Edit dropdown. Group them visually with section headers (Fashion → garments / streetwear / hoodies / jeans / dresses / jackets / skirts / activewear / swimwear / lingerie; Accessories → bags / shoes / hats; Beauty → beauty-skincare / makeup / fragrance; Home → home-decor / furniture; Tech / Food & Drink / Wellness / Other) using `SelectGroup` + `SelectLabel` from the existing `Select` component.

### Categories to add (matching the analyzer)

- **Fashion (new)**: `streetwear`, `hoodies`, `jeans`, `dresses`, `jackets`, `activewear`, `swimwear`, `lingerie`, `skirts`
- Already present: `garments`, `bags-accessories`, `hats-small`, `shoes`, `fragrance`, `beauty-skincare`, `makeup-lipsticks`, `home-decor`, `furniture`, `tech-devices`, `food`, `beverages`, `supplements-wellness`, `other`

### Why this works

- The DB column `category_collection` is just `text` — no enum, no constraint. Any string value is valid.
- Once the dropdown lists the new options, you can open any scene → Edit → pick "Hoodies" (or any other) → Save. Scene moves to the correct group on the page.
- New scenes created from scratch can also be assigned directly to `streetwear`, `hoodies`, etc.

## File to edit

- `src/pages/AdminProductImageScenes.tsx` — expand the `CATEGORIES` const (lines 31–46) with the new specific categories, and update the Category `<Select>` (lines 753–761) to render grouped sections using `SelectGroup` / `SelectLabel`.

## Result

- Edit any shot → Category dropdown now shows Streetwear, Hoodies, Jeans, Dresses, Jackets, Activewear, Swimwear, Lingerie, Skirts (plus the existing categories), grouped under "Fashion / Accessories / Beauty / Home / Tech / Food & Drink / Wellness / Other" headers.
- You can move a scene from one category (e.g., `garments`) to another (e.g., `hoodies` or `streetwear`) with a single Save.
- The page grouping picks up the new value automatically — no schema or migration changes needed.

