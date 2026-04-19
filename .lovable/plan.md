
## Investigation: empty Jewelry section + missing "Beach Overlays" on bikinis

### Two separate issues to verify

**Issue 1 — Jewelry section renders but is empty**
Screenshot shows `JEWELRY` header with no chips below it. Either:
- a) The slot has zero options defined in the vocabulary
- b) Options exist but are filtered out (gender filter? category filter?)
- c) Render bug — header shows but options array is empty

**Issue 2 — "Beach overlays" / beach-context wardrobe missing for bikinis**
User remembers a "beach" themed slot or overlay (sarong, kaftan cover-up, kimono, towel, beach shirt) that used to appear on swimwear and now doesn't. Likely a swimwear-specific accessory slot we removed when we tightened the swimwear branch in `outfitConflictResolver.ts`.

### What I need to inspect (read-only this turn)

1. `src/lib/outfitVocabulary.ts` — find the JEWELRY slot definition, count options, check if there are gender/category filters trimming them on this product
2. The OutfitSlotCard / ZaraOutfitPanel render path — confirm whether empty slots should be hidden vs rendered with empty body
3. Search for "beach", "sarong", "kaftan", "cover-up", "overlay" across the outfit system to see if a swimwear-specific category ever existed
4. Re-check the swimwear branch in `outfitConflictResolver.ts` — does it omit a slot that used to carry beach pieces (e.g., a `coverUp` or `overlay` slot)?

### Likely root causes (to confirm in the read pass)

- **Jewelry empty**: probably gender-filtered (e.g., no men's jewelry options when current model preset = male) OR the vocabulary genuinely has 0 entries and the section renders an empty container — should hide entirely when empty
- **Missing beach overlays**: most likely a `coverUp`/`overlay` slot that was either (a) never wired into `availableSlots` for swimwear, or (b) got dropped when we hardened the hidden list. Less likely but possible: it lived under `outerwear` and got hidden by our last fix — meaning a "kaftan/sarong/kimono cover-up" sub-vocab is being suppressed.

### Plan after read pass (one or two small fixes)

**Fix A — Jewelry empty state**
Either: add gender-neutral jewelry options if vocab is bare, OR hide the slot card entirely when the filtered options array is empty (cleaner ZARA behavior — don't show a header with no chips).

**Fix B — Restore beach overlays for swimwear**
- If a dedicated `coverUp` slot exists: add it to swimwear's `availableSlots`
- If "beach overlays" lived inside `outerwear` (kaftan, sarong, kimono, beach shirt): unhide `outerwear` for swimwear BUT have the vocabulary auto-filter to only beach-appropriate items when category = swimwear (gated sub-vocab)
- Cleanest path: add a swimwear-only `coverUp` slot to `OutfitSlotKey` + vocab (sarong, kaftan, kimono, oversized shirt, beach pareo, mesh dress) and surface it in the swimwear branch alongside accessories

### Files likely touched (after read confirms diagnosis)
- `src/lib/outfitVocabulary.ts` — jewelry options + new coverUp vocab
- `src/lib/outfitConflictResolver.ts` — add `coverUp` to swimwear `availableSlots`
- `src/components/app/product-images/types.ts` — add `coverUp?: string` to `OutfitConfig`
- Slot card render — hide empty sections (1-line guard)
- Prompt builder — surface `coverUp` value when present

### Why this is safe
- Empty-slot hide is purely visual
- New `coverUp` slot is additive, gated to swimwear only
- No DB migration, no schema change, no impact on existing categories

### Risk
Low. All changes are scoped to vocabulary + the swimwear branch + one render guard.

### Validation after fix
1. Bikini → Jewelry section either shows options OR is hidden (no empty header)
2. Bikini → new "Cover-up" section shows with sarong/kaftan/kimono/oversized shirt
3. Pick "kaftan" + generate → kaftan appears as overlay over bikini in shot
4. Regular tee → no Cover-up slot, jewelry unchanged
