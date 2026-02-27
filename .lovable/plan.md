

## Improvements to Interior / Exterior Staging

### 1. Add Optional Exact Room Dimensions Input

Add two optional text inputs below "Room Size" and "Ceiling Height" for users who want to provide precise measurements:
- **Room Dimensions** (e.g., "4.5m x 3.2m" or "15ft x 10ft") -- free text input
- **Exact Ceiling Height** (e.g., "2.8m" or "9.5ft") -- free text input

These will be sent as `room_dimensions` and `exact_ceiling_height` in the payload and injected into the backend prompt as high-priority constraints that override the dropdown approximations.

### 2. Generate Design Style Previews for Interior Styles

The `generate-scene-previews` edge function currently has no prompts for interior design styles (e.g., "Modern Minimalist", "Scandinavian", "Industrial"). The fallback prompt is generic and won't produce good interior staging previews.

**Fix**: Add interior-specific preview prompts to `scenePreviewPrompts` in `supabase/functions/generate-scene-previews/index.ts`. Each style will get a beautiful staged room preview prompt (e.g., "A beautifully staged modern minimalist living room with clean lines, neutral palette, platform sofa...").

### 3. Add Separate Exterior Styles with Different Previews

Currently, interior and exterior share the same variation list from the workflow config. Since the styles are stored in the database (`generation_config.variation_strategy.variations`), and exterior needs completely different styles (e.g., "Mediterranean Villa", "Tropical Resort", "English Cottage Garden"), we need to:

- Add a separate set of exterior-specific variations to the `generation_config` in the database
- Update the UI to filter variations based on `interiorType` -- show only interior styles when interior is selected, and only exterior styles when exterior is selected
- Add preview prompts for each exterior style in the edge function

This requires a database update to the workflow's `generation_config` JSONB to include a `category` field on each variation (e.g., `"category": "interior"` or `"category": "exterior"`), then filter in the UI.

### 4. Simplify Selection UX for Interior Design

- The single-select logic already works (clicking one deselects previous)
- **Remove** the "Select at least 1 style to continue" red text and "Free plan: up to 3 scenes" text for interior design, since it's always single-select and irrelevant
- Replace with a simpler indicator like "Tap a style to select it" when nothing is selected

---

### Files to Change

| File | Changes |
|------|---------|
| `src/pages/Generate.tsx` | Add exact dimensions inputs, filter variations by interior/exterior, simplify selection footer for interior |
| `supabase/functions/generate-workflow/index.ts` | Read and inject `room_dimensions` and `exact_ceiling_height` into prompt |
| `supabase/functions/generate-scene-previews/index.ts` | Add preview prompts for all interior styles AND exterior styles |
| Database migration | Update the Interior/Exterior Staging workflow's `generation_config` to add `category: "interior"` / `category: "exterior"` to each variation, and add exterior-specific style variations |

### Technical Details

**New state variables** in Generate.tsx:
```typescript
const [interiorRoomDimensions, setInteriorRoomDimensions] = useState('');
const [interiorExactCeilingHeight, setInteriorExactCeilingHeight] = useState('');
```

**Payload additions**:
```typescript
room_dimensions: isInteriorDesign && interiorRoomDimensions ? interiorRoomDimensions : undefined,
exact_ceiling_height: isInteriorDesign && interiorExactCeilingHeight ? interiorExactCeilingHeight : undefined,
```

**Backend prompt injection** (in generate-workflow):
```
if (roomDimensions) {
  roomSizeBlock += `\nEXACT ROOM DIMENSIONS: ${roomDimensions}. Scale ALL furniture precisely to these real-world measurements.`;
}
if (exactCeilingHeight) {
  ceilingHeightBlock += `\nEXACT CEILING HEIGHT: ${exactCeilingHeight}. Scale vertical elements (curtains, shelving, art placement) to this precise height.`;
}
```

**Variation filtering** in Generate.tsx:
```typescript
const filteredVariations = isInteriorDesign
  ? variationStrategy?.variations.filter(v => v.category === interiorType) || []
  : variationStrategy?.variations || [];
```

**Interior style previews** (12 styles):
Modern Minimalist, Scandinavian, Mid-Century Modern, Industrial, Bohemian, Art Deco, Japandi, Coastal/Hampton, Traditional, Contemporary, Rustic Farmhouse, Hollywood Glam

**Exterior style previews** (10 styles):
Mediterranean Villa, Tropical Resort, Modern Architectural, English Cottage Garden, Desert Southwest, Coastal Beach House, Japanese Zen, Rustic Mountain, Contemporary Urban, French Country

