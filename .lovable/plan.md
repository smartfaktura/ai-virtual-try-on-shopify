

## Fix: "Products Only" Still Shows Props in Flat Lay Set

### Root Cause

The Flat Lay Set's variation instructions in the database **hardcode prop descriptions** directly into each scene. For example:

- **Marble Luxe**: "Product arranged with **gold accents, fresh flowers, and premium accessories**"
- **Natural Wood**: "Product with **dried botanicals, linen textile, ceramic dish**"
- **Concrete Industrial**: "Product arranged with **metallic accents, geometric objects**"

When the user selects "Products Only" (`prop_style: 'clean'`), the edge function adds a `propStyleBlock` saying "Do NOT add any extra items" — but the variation instruction explicitly asks for props. The AI sees two contradicting instructions and follows the more specific one (the variation instruction with named props).

### Fix — Two-pronged approach

**1. Edge function: Strip props from variation instructions when `prop_style === 'clean'`**

**File: `supabase/functions/generate-workflow/index.ts`** — In `buildVariationPrompt`, when `propStyle === 'clean'`, post-process the variation instruction to remove prop-related phrases before injecting it into the prompt. Also strengthen the `propStyleBlock` with more forceful, repeated language.

```typescript
// When clean mode, strip prop mentions from variation instruction
let variationInstruction = variation.instruction;
if (propStyle === 'clean') {
  // Remove phrases like "with gold accents, fresh flowers, and premium accessories"
  // Remove "Product with natural elements — dried botanicals, linen textile, ceramic dish"
  variationInstruction = variationInstruction
    .replace(/\.\s*Product (arranged )?with[\s\S]*$/i, '.')
    .replace(/with\s+([\w\s,]+(?:accents|props|accessories|elements|objects|botanicals|flowers|leaves|textile|ceramics?|hardware))[\w\s,—–-]*/gi, '')
    .trim();
}
```

Also strengthen the `propStyleBlock`:
```
CRITICAL COMPOSITION RULE (OVERRIDE ALL OTHER INSTRUCTIONS): 
Show ONLY the selected products on the surface — NOTHING ELSE. 
IGNORE any mention of props, accents, flowers, botanicals, accessories, 
or decorative items in the variation description above. 
The surface must contain ONLY the provided products. 
Zero additional items. This overrides everything.
```

**2. Database migration: Add clean/decorated variants to each instruction**

Update the Flat Lay Set workflow's variation instructions to separate surface description from prop description using a clear delimiter, making the stripping more reliable. Each instruction becomes two parts:
- Surface description (always used)
- Prop suggestions (only used when `prop_style === 'decorated'`)

Example for Marble Luxe:
- Before: `"White or gray marble surface. Product arranged with gold accents, fresh flowers, and premium accessories. Luxury, aspirational mood."`
- After: `"White or gray marble surface. Luxury, aspirational mood. ||PROPS|| Gold accents, fresh flowers, and premium accessories arranged around the product."`

Then in the edge function, when `propStyle === 'clean'`, strip everything after `||PROPS||`.

### Files changed — 1 file + 1 migration
- `supabase/functions/generate-workflow/index.ts` — Strip props from variation instructions when clean mode; strengthen no-props directive
- Database migration — Restructure Flat Lay Set variation instructions with `||PROPS||` delimiter

