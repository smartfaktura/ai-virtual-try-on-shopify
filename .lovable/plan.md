

## Add "Outfit" picker to the Selfie/UGC Settings step

Give the user control over what the model is wearing in UGC shots — auto-pick a sensible default, allow override with 8 curated outfit presets, and inject the chosen outfit into the prompt for clean, on-brief generations.

### Where it lives
A new section inside `WorkflowSettingsPanel.tsx`, shown only when `isSelfieUgc === true`, placed right after the existing **Creator Mood** card (so the order flows: Scenes → Mood → **Outfit** → Framing → Settings).

The card looks and behaves like the Mood selector for visual consistency: title, subtitle, 8 tile grid (2 cols mobile, 4 cols desktop). Each tile shows the outfit name + a one-line vibe descriptor. The first tile is selected by default and labeled **Auto** (Popular pill, recommended). Picking nothing = Auto = the first preset.

### The 8 outfit presets (curated for quiet luxury UGC)

Each preset has an `id`, `label`, `vibe` (short UI line), and `phrase` (the prompt injection string).

| # | Label | Vibe (UI) | Prompt phrase |
|---|---|---|---|
| 1 | **Auto** ⭐ | Smart pick for the scene | *(no outfit phrase — backend uses scene-default styling)* |
| 2 | **Cream Knit & Denim** | Soft cream knit + light wash jeans | wearing a soft cream knit sweater and light-wash straight-leg jeans, minimal silver jewelry |
| 3 | **White Tee & Tailored** | Crisp white tee + beige tailored trousers | wearing a crisp white fitted t-shirt tucked into pleated beige tailored trousers, slim leather belt |
| 4 | **Linen Set** | Relaxed cream linen co-ord | wearing a relaxed cream linen button-up shirt and matching wide-leg linen trousers, softly draped |
| 5 | **Black Slip & Cardigan** | Black slip dress, oat cardigan | wearing a simple black silk slip dress layered with an oversized oat-coloured fine-knit cardigan |
| 6 | **Oversized Blazer Look** | Black blazer, white tee, straight jeans | wearing an oversized black wool blazer over a plain white t-shirt and dark straight-leg jeans, sleeves slightly pushed up |
| 7 | **Athleisure Neutral** | Beige hoodie + matching joggers | wearing a tonal beige cotton hoodie and matching tapered joggers, clean white minimal sneakers |
| 8 | **Trench Off-Duty** | Camel trench, white tee, jeans | wearing a long camel trench coat over a white t-shirt and mid-wash straight jeans, casual off-duty styling |

(8 tiles total including Auto — keeps the grid tidy at 2×4.)

Selected by default: `auto`. If the user never opens the section, Auto is sent (= no outfit override, current behavior preserved).

### Interaction-aware visibility
When the user picked **Wearing** as their interaction in the prior step, the product already dictates the worn item — forcing an outfit on top would conflict. In that case the card collapses to a single info line: *"Outfit is locked by the product you're wearing."* and silently sends no outfit phrase. (We detect this via the existing `ugcInteraction` resolver — phrase contains `wearing`.)

For all other interactions (applying, holding, spraying, sipping, using, etc.), the outfit picker is fully active.

### Backend prompt injection (`generate-workflow/index.ts`)

1. Add a new optional field on the request type:
   ```ts
   outfit_phrase?: string;
   ```

2. In the function that builds the UGC block (around the existing `ugcBlock = …` near line 318–322), append an **OUTFIT STYLING** segment when `body.outfit_phrase` is present:
   ```
   OUTFIT STYLING:
   The subject is {outfit_phrase}. The outfit must look natural, lived-in, and complement the product without competing with it. Keep accessories minimal and the palette quiet — neutral tones, premium materials, no logos.
   ```

3. Same template-replacement pass: support a `{OUTFIT}` placeholder in scene `prompt_template` so future scenes can position the outfit within their own copy. If the placeholder isn't in the template, the block is appended after the mood block — works for every existing scene.

4. **Saugiklis (safeguard)** appended to `negative_prompt_additions` when an outfit phrase is sent: *"mismatched layering, costume-like outfit, loud patterns competing with product, branded logos on clothing, ill-fitting garments."*

### Wiring (`src/pages/Generate.tsx`)
- Add state: `const [ugcOutfit, setUgcOutfit] = useState<string>('auto');`
- Pass `ugcOutfit` and `setUgcOutfit` into `WorkflowSettingsPanel`.
- In both enqueue paths (single-product around line 1361 and multi-product), add:
  ```ts
  outfit_phrase: isSelfieUgc ? resolveUgcOutfitPhrase(ugcOutfit, resolveUgcInteractionPhrase(product)) : undefined,
  ```
  where `resolveUgcOutfitPhrase` returns the preset's `phrase`, or `undefined` for `auto` or when interaction is "wearing".

### Files touched
1. **New** `src/lib/ugcOutfitPresets.ts` — exports `UGC_OUTFIT_PRESETS` array (id/label/vibe/phrase) and `resolveUgcOutfitPhrase(id, interactionPhrase)` helper.
2. **Edit** `src/components/app/generate/WorkflowSettingsPanel.tsx` — new "Outfit" card after the Mood card; new props `ugcOutfit`, `setUgcOutfit`.
3. **Edit** `src/pages/Generate.tsx` — add `ugcOutfit` state, pass into panel, include `outfit_phrase` in both enqueue payloads (single + multi-product loops).
4. **Edit** `supabase/functions/generate-workflow/index.ts` — accept `outfit_phrase`, build OUTFIT STYLING block, append `{OUTFIT}` token replacement, extend negative prompt when outfit is set.

### Validation
- Open `/app/generate/selfie-ugc-set` → reach Settings step → new **Outfit** card appears under Creator Mood. "Auto" tile selected by default with Popular pill.
- Generate without touching outfit → behaves exactly as today (no regression).
- Pick **Cream Knit & Denim** + a non-wearing interaction (e.g. "applying") → results show the model in a cream knit + denim across all selected scenes.
- Pick **Wearing** as interaction → outfit card collapses to the locked-info note; payload contains no `outfit_phrase`.
- Switching outfit between two batches produces visibly different wardrobes while keeping the same scenes/mood.

### Out of scope
No changes to the Mood card, scene library, or other workflows. No DB schema changes. No new admin tools.

