
The user wants me to audit the conflict-resolution logic for fashion/apparel products to ensure that when a user uploads a product (t-shirt, jacket, trousers, dress, skirt, swimwear, etc.) and locks outfit pieces, the system correctly nullifies conflicting slots — so the AI doesn't render a t-shirt over their t-shirt product, or pants over their dress.

## Investigation needed
1. Read `getConflictingSlots(garmentType)` — what categories does it know about? what slots does it nullify per category?
2. Read `analyze-product-category` output — what `garmentType` / `category` values can a fashion product receive?
3. Cross-reference: for every fashion category the analyzer can return, does the conflict resolver have a matching rule?
4. Check the OUTFIT LOCK safety-net path — does it call `getConflictingSlots` correctly?

## Plan

**Step 1 — Audit (read-only, in this turn)**
I'll scan:
- `src/lib/productImagePromptBuilder.ts` → `getConflictingSlots`, safety-net injection
- `src/lib/productOutfitConflicts.ts` (or wherever the resolver lives)
- `supabase/functions/analyze-product-category/index.ts` → category list (already visible: 35 categories incl. dresses, hoodies, jeans, jackets, activewear, swimwear, lingerie, garments, shoes, sneakers, boots, high-heels)
- The Step 3 outfit slot UI to confirm slot names (top / bottom / shoes / accessories / outerwear?)

**Step 2 — Build conflict matrix**
Produce a table: every fashion category × every outfit slot → keep / nullify / warn.

Expected rules to verify:
| Product category | Slots to nullify |
|---|---|
| dresses | top + bottom (dress = full body) |
| garments (generic top) | top |
| hoodies | top + outerwear |
| jackets | outerwear (NOT top — user can wear t-shirt under) |
| jeans / trousers / garments-bottom | bottom |
| activewear | top + bottom (typically full set) — needs decision |
| swimwear | top + bottom (one-piece) OR top OR bottom (bikini set) — ambiguous |
| lingerie | top + bottom (intimate set) |
| skirts (under garments today?) | bottom |
| shoes / sneakers / boots / high-heels | shoes |
| kidswear | top + bottom (full set) |

**Step 3 — Identify gaps**
Likely gaps I expect to find:
- Skirts not a distinct category → falls under "garments" → nullifies wrong slot
- Activewear/swimwear ambiguity (one-piece vs two-piece) not handled
- "garments" is too broad — same rule for shirt vs. pants vs. skirt is wrong
- Jacket may be over-nullifying (blocking inner top)
- Outerwear slot may not exist in `outfitConfig` — needs adding

**Step 4 — Fix proposal (next turn, after you approve)**
- Refine `getConflictingSlots` with explicit per-category rules
- Add sub-detection inside "garments" using `analysis.garmentType` (shirt / pants / skirt / dress)
- Decide swimwear/activewear policy (suggest: nullify both for safety)
- Optionally add an `outerwear` slot if jackets need to layer over tops
- Add logged warnings when conflicts auto-fire so you can audit

## Deliverable in this audit turn
A clear conflict matrix + list of concrete gaps (with file/line refs). No code changes. Then you choose which gaps to fix.
