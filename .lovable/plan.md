

## Control Extra Items in Flat Lay Generation

### Problem
The AI adds extra products (watches, cameras, earbuds, etc.) to the flat lay that weren't selected by the user. This is misleading -- users expect ONLY their selected products, optionally with abstract/decorative styling elements (textures, flowers, fabrics) but never additional commercial products that could be confused with the user's own inventory.

### Solution
Two changes:
1. **Add a "Prop Style" toggle** in the Flat Lay details step (last wizard page) with options: "Products Only" (no extra items at all) vs "Add Decorative Props" (abstract decorations, no extra commercial products)
2. **Update the prompt engineering** to explicitly forbid adding extra commercial products and only allow abstract/decorative elements when the user opts in

### Changes

#### 1. Add Prop Style Toggle (UI)
**File: `src/pages/Generate.tsx`**

Add a new state variable `flatLayPropStyle` with values `'clean'` (default) or `'decorated'`.

In the Flat Lay details phase (lines ~1836-1888), add a toggle/radio group BEFORE the Quick Aesthetics section:

```text
Composition Style
- [x] Products Only -- Clean layout with just your products, no extra items
- [ ] Add Styling Props -- Include decorative elements (leaves, fabric, abstract shapes) around your products
```

When "Products Only" is selected:
- Hide the Quick Aesthetics chips entirely
- Hide the Styling Notes textarea
- The prompt will instruct: "ONLY the selected products, absolutely nothing else"

When "Add Styling Props" is selected:
- Show aesthetics and styling notes as today
- But update the aesthetics hints to be clearly decorative (not commercial products)

#### 2. Update FLAT_LAY_AESTHETICS
**File: `src/pages/Generate.tsx` (lines 76-84)**

Revise hints to explicitly be non-product decorations:
- `botanical` -> "dried flowers, eucalyptus leaves, greenery accents"
- `coffee-books` -> "coffee cup, open book pages" (remove "reading glasses" -- too product-like)
- `travel` -> rename to "Textured" -> "linen fabric, kraft paper, washi tape"
- `beauty` -> rename to "Soft Glam" -> "silk ribbon, dried petals, soft fabric swatches"
- Keep `minimal`, `cozy`, `seasonal`

#### 3. Pass Prop Style to Edge Function
**File: `src/pages/Generate.tsx`**

Include `prop_style: flatLayPropStyle` in the generation payload alongside `styling_notes`.

#### 4. Update Prompt in Edge Function
**File: `supabase/functions/generate-workflow/index.ts`**

When `prop_style === 'clean'` (or not set), add to the prompt:
```text
CRITICAL: Show ONLY the selected products. Do NOT add any extra items, props, accessories, 
or commercial products. The surface should contain ONLY the products provided -- nothing else.
```

When `prop_style === 'decorated'`, add:
```text
You may add ONLY abstract/decorative styling elements around the products: natural textures, 
dried flowers, fabric swatches, paper, abstract shapes. 
NEVER add extra commercial products like watches, cameras, electronics, bags, or any item 
that could be mistaken for the user's own product.
```

#### 5. Update Database Prompt Template
Update the workflow's `generation_config.negative_prompt_additions` to include: "extra commercial products, additional merchandise, unrelated accessories, random products"

### Summary of Files Changed
1. `src/pages/Generate.tsx` -- Add prop style toggle, update aesthetics, pass to payload
2. `supabase/functions/generate-workflow/index.ts` -- Handle `prop_style` in prompt construction
3. Database update -- Strengthen negative prompt for flat lay workflow
