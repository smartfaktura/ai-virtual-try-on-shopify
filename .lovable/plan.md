

## Redesign Freestyle Prompt Bar: Organized Settings Layout

### Current Problem
The settings row has 12+ chips in a single flat wrap with no visual hierarchy:
`Upload Image | Add Product | Model | Scene | Framing | Brand | Exclude | 1:1 | Standard | Pro | Polish | -1+ | Cinematic Editorial Minimal...`

Users can't quickly find what they need because asset controls, creative settings, and output settings are all mixed together.

### Proposed Layout: 3 Logical Groups with Subtle Dividers

**Desktop (single row with vertical dividers):**

```text
[+ Upload] [Add Product] [Model] [Scene]  |  [Framing] [Brand] [Exclude] [Presets]  |  [1:1] [Standard] [Pro] [Polish]  ___  [-1+]
 ^--- Assets/References ---^                 ^--- Creative Controls ---^               ^--- Output Settings ---^          ^count
```

- Group 1 "References": Upload Image, Product, Model, Scene -- what goes INTO the image
- Group 2 "Style": Framing, Brand, Exclude, Presets -- HOW it looks
- Group 3 "Output": Aspect Ratio, Quality, Camera Style, Polish -- technical output config
- Image count stepper stays right-aligned

Groups separated by a thin vertical `border-l` divider (1px, subtle) -- no labels needed, the visual grouping is enough.

**Mobile (keep current 2-row collapsible approach but regroup):**
- Row 1: Upload, Product, Model, Scene (references -- most used)
- Row 2: Framing, Aspect Ratio, Quality, Camera, Count, Style (collapsed advanced)
- Move Brand + Exclude + Polish + Presets into the "Style" collapsible (already works this way)

### Style Presets: Move Inside the Prompt Bar
Currently style presets (Cinematic, Editorial, Minimal, etc.) sit as a separate row below the chips. Move them inline as part of the "Style" group on desktop -- either as a popover like on mobile, or keep them inline but visually grouped with the other creative controls.

### File to Change

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestyleSettingsChips.tsx` | Regroup desktop layout into 3 visual groups with dividers; move presets into creative group |

### Technical Details

**FreestyleSettingsChips.tsx -- Desktop layout (lines 429-488):**

Replace the single flat `flex-wrap` with grouped sections:

```tsx
// Desktop: grouped chips with subtle dividers
<div className="flex items-center gap-1.5 flex-wrap">
  {/* Group 1: References */}
  {uploadButton}
  <ProductSelectorChip ... />
  <ModelSelectorChip ... />
  <SceneSelectorChip ... />
  
  {/* Divider */}
  <div className="h-5 w-px bg-border/60 mx-1" />
  
  {/* Group 2: Creative */}
  <FramingSelectorChip ... />
  <BrandProfileChip ... />
  <NegativesChip ... />
  {presetsChipOrInline}
  
  {/* Divider */}
  <div className="h-5 w-px bg-border/60 mx-1" />
  
  {/* Group 3: Output */}
  {aspectRatioChip}
  {qualityChip}
  {cameraStyleChip}
  {polishChip}
  
  <div className="flex-1" />
  {imageCountStepper}
</div>
```

- No separate presets row on desktop -- merge into a single popover chip like mobile (saves vertical space)
- Remove the extra `{presetsSection}` below the main row on desktop
- Mobile layout stays mostly the same (already well-organized with collapsible)

### What This Achieves
- Clear visual grouping without labels or extra UI weight
- Users intuitively find "what" (references) vs "how" (style) vs "output" (technical)
- Removes the random feel of the current flat chip soup
- Saves vertical space by collapsing presets into a chip on desktop too
- No functionality changes -- just reorganization

