

## Refresh UGC Outfit Presets — fashion-forward, 3–4 word labels

Replace the 8 current outfit presets in `src/lib/ugcOutfitPresets.ts` with simpler, more fashion-forward selections. Labels are 3–4 words max, vibes stay minimal, and prompt phrases stay tight and on-brief.

Auto stays as the first/default tile. Everything else (UI card, lock-on-Wearing logic, backend injection, negative-prompt safeguards) stays exactly as approved — only the preset list changes.

### New 8 presets

| # | Label (≤4 words) | Vibe (UI line) | Prompt phrase |
|---|---|---|---|
| 1 | **Auto** ⭐ | Smart pick for the scene | *(no override)* |
| 2 | **Bright Minimal Activewear** | Crisp white sport set | wearing a fitted bright white minimal activewear set, clean lines, no visible logos |
| 3 | **Soft Beige Loungewear** | Tonal beige knit set | wearing a tonal soft beige ribbed loungewear set, relaxed and quiet |
| 4 | **Crisp White Shirt** | White shirt, light denim | wearing a crisp oversized white cotton shirt with light-wash straight jeans |
| 5 | **Black Tee Tailored** | Black tee, black trousers | wearing a fitted plain black t-shirt tucked into tailored black trousers |
| 6 | **Cream Linen Set** | Soft cream linen co-ord | wearing a soft cream linen shirt and matching wide-leg linen trousers |
| 7 | **Oversized Grey Knit** | Grey knit, light denim | wearing an oversized soft grey fine-knit sweater with light-wash straight jeans |
| 8 | **Camel Trench Minimal** | Camel coat, white tee | wearing a clean camel trench coat over a plain white t-shirt and slim dark jeans |

All labels ≤4 words, fashion-forward, neutral palette, zero logos, no costume vibes.

### Files touched
- **Edit only** `src/lib/ugcOutfitPresets.ts` — swap the `UGC_OUTFIT_PRESETS` array. IDs are renamed to match the new labels (kebab-case). Helper functions (`resolveUgcOutfitPhrase`, `isOutfitLockedByInteraction`) stay untouched.

No other files change. No DB or edge-function edits needed (backend is already wired to whatever phrase comes through).

### Validation
- `/app/generate/selfie-ugc-set` Settings → Outfit card now shows the new 8 tiles, Auto first with Popular pill.
- Each tile label fits on one line in the 4-col grid.
- Picking *Bright Minimal Activewear* + Applying interaction → outputs show the model in a clean white sport set across scenes.
- Picking Wearing as interaction → card still collapses to the locked note.

