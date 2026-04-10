

# Filter Sub-Category Dropdown to Current Category

## Problem
When creating a new scene in a specific category (e.g. "Hats & Small Accessories"), the sub-category dropdown shows sub-categories from ALL categories instead of only those belonging to the current category.

## Solution
Replace the single global `allSubCategories` list with a per-category lookup, then pass only the relevant sub-categories to `SceneForm`.

### Changes in `src/pages/AdminProductImageScenes.tsx`

1. **Replace `allSubCategories` memo** with a `Map<string, string[]>` keyed by `category_collection`:
   ```typescript
   const subCategoriesByCategory = useMemo(() => {
     const map = new Map<string, Set<string>>();
     for (const s of rawScenes) {
       if (s.sub_category && s.category_collection) {
         if (!map.has(s.category_collection)) map.set(s.category_collection, new Set());
         map.get(s.category_collection)!.add(s.sub_category);
       }
     }
     return new Map(Array.from(map.entries()).map(([k, v]) => [k, Array.from(v).sort()]));
   }, [rawScenes]);
   ```

2. **Pass filtered list** wherever `allSubCategories` is used:
   - New scene form: `subCategoriesByCategory.get(newDraft.category_collection || '') || []`
   - Edit form in SceneRow: `subCategoriesByCategory.get(scene.category_collection || '') || []`

3. **Update prop name** in `SceneRow` and `SceneForm` signatures accordingly (or keep the same name, just pass the filtered array).

No other files affected. The "＋ Create new..." option remains available for defining new sub-categories within that category.

