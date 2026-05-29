# Fix AI styling leak + scene-aware AI wardrobe directive

## Problem

When the user picks **AI styling** in the Outfit Styling panel, the prompt still ships the hardcoded `OUTFIT LOCK — Wearing exactly: grey crewneck / light wash jeans / white sneakers` line.

Root cause: `buildPersonDirective` in `src/lib/productImagePromptBuilder.ts` (L811 and L823) calls `defaultOutfitDirective(...)` unconditionally — it does not check `outfitMode === 'ai'`, while the token resolver (L1037) and auto-injector (L1482) do.

## Plan

### 1. Close the AI-styling leak

`src/lib/productImagePromptBuilder.ts`, inside `buildPersonDirective` (L792–831):

- Compute `isAiMode` once using the existing rule:  
  `details.outfitMode === 'ai' || (!details.outfitMode && !details.outfitConfig && !details.outfitConfigByScene)`
- At L811 and L823, when `isAiMode` is true → emit the new AI wardrobe directive (defined in §3).
- When `isAiMode` is false → keep current `defaultOutfitDirective(...)` (manual mode and legacy slot fields still produce `OUTFIT LOCK — Wearing exactly: …`).

### 2. Single shared helper

Extract the AI directive into one helper so all three call sites use the exact same string:

```
buildAiWardrobeDirective(): string
```

Reused by:
- `buildPersonDirective` (L811, L823) — new
- `outfitDirective` token resolver (L1041) — replace current short line
- Auto-injector for templates missing `{{outfitDirective}}` (L1505) — replace current short line

This guarantees no drift between the three paths.

### 3. New directive text

Exact string emitted in AI mode:

```
WARDROBE DIRECTION: Follow the variation prompt as the styling source of truth. Add only the visible clothing or styling elements that naturally support the scene, product placement, and composition. Do not force a full outfit if the image only needs an open neckline, bare shoulder, hand, wrist, cropped body area, or product interaction. Wardrobe must stay minimal, appropriate, and secondary to the product, without covering, recoloring, reshaping, or distracting from it. Keep styling consistent across this batch.
```

When `details.customOutfitNote` is set, append: ` STYLING PRIORITY: ${customOutfitNote}`.

No hex codes, no color names, no specific garments — the AI decides everything from the variation prompt, scene framing, and product crop.

### 4. Precedence (when does the AI line fire)

Unchanged order, just clarified:

1. Scene `outfit_hint` (admin-authored) → `OUTFIT DIRECTION — <resolved hint>` — wins.
2. "Product IS the outfit" categories (lingerie, swimwear, activewear, kidswear) → existing hard lock at `defaultOutfitDirective` L731–741 — wins before AI mode is considered.
3. Manual styling (`outfitMode === 'manual'` or any populated `outfitConfig` / legacy slots) → `OUTFIT LOCK — Wearing exactly: …`.
4. AI styling, no styling direction text → **new `WARDROBE DIRECTION:` line** (this PR).
5. AI styling, "Add styling direction" filled → same new line + ` STYLING PRIORITY: <user text>` appended.

### 5. Touch list

Single file: `src/lib/productImagePromptBuilder.ts`
- Add helper `buildAiWardrobeDirective(details)` near the other directive builders (around L725).
- Add `isAiMode` calc + branch at L811 and L823 inside `buildPersonDirective`.
- Replace the inline string at L1041 with the helper call.
- Replace the inline string at L1505 with the helper call.

No other files change. No edge function, no DB, no UI, no token reference docs.

### 6. Verify

- Necklace product, on-model bust scene, **AI styling**, no styling direction → preview shows the new `WARDROBE DIRECTION:` line; no grey crewneck / jeans / sneakers. Generated image keeps neckline uncluttered.
- Watch product, wrist hero scene → same directive; AI keeps the wrist area clean.
- Type "linen, soft folds" into Add styling direction → directive ends with ` STYLING PRIORITY: linen, soft folds`.
- Switch to **Style manually**, pick top + shoes → old `OUTFIT LOCK — Wearing exactly: …` returns with the user's selections.
- Bikini product → "product IS the outfit" lock still fires (AI line never reached).
- Scene with admin `outfit_hint` → that hint still wins regardless of AI/Manual.

## Out of scope

- No UI changes (the AI / Manual toggle already behaves correctly).
- No edge function or DB changes.
- No changes to category locks, scene hints, manual-mode OUTFIT LOCK, or `defaultOutfitDirective` gap-fill defaults.
- No token reference doc updates.
