Polish the `Look` sub-step of Step 4 on `/app/brand-scenes/new` so the recommendation, copy, spacing, and "Product interaction" framing match the brand-scenes use case (user is creating a reusable scene, no product is selected yet).

## Changes

### 1. Swap the recommended branch card
File: `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (Look sub-step, ~lines 240–255)
- Move the `recommended` flag from `Auto-cast` to `Design the look`.
- Drop the `secondary` styling from `Design the look` so it reads as the primary option; apply `secondary` (lighter weight) to `Auto-cast` instead.
- Order stays the same (Auto-cast left, Design the look right) so muscle memory is preserved; only the visual emphasis flips.

### 2. Remove the switch-anytime caption
Same file, ~lines 256–258.
- Delete the `<p>You can switch any time — your picks won't be lost</p>` line entirely. No replacement copy.

### 3. Tighten and unify spacing in the Look view
Same file, Look sub-step container.
- Replace ad-hoc `pt-6`, `mt-3`, and the outer `space-y-8` rhythm around the branch cards with a single consistent vertical scale (`space-y-6` inside the Look block, `mt-6` before `AutoCastSummary`).
- Ensure the `AutoCastSummary` panel sits flush with the same max-width (`max-w-2xl mx-auto`) as the branch cards so the column doesn't visually shift when expanding.
- Audit the four sub-step panels (`essentials`, `people`, `interaction`, `styling`) to use the same outer rhythm (`space-y-10` already in essentials becomes the standard) and the same `Section` gap so headlines align across tabs.

### 4. Clarify "Product interaction" for scene-only flow
Context: brand-scenes wizard creates a reusable scene; no specific product is attached at this step, so labels like "Wearing / Holding / Using / Placed beside" read ambiguously.
- Rename the section label from `Product interaction` to `How the product appears` (keeps the underlying `cast.interaction` field unchanged).
- Add a one-line helper under the label (via the existing `Section` `hint`/description slot, or a `<p className="text-[11px] text-muted-foreground">` directly under the label) reading: `Defines how any product placed into this scene will be staged.`
- Keep chip labels (Wearing, Holding, Using, Placed beside) — they're fine once the framing sentence is in place.
- Mirror the same label change in `Step5Review.tsx` where the interaction value is summarized, so the review screen stays consistent.

## Out of scope
- No changes to the underlying `CastInteraction` enum, schema, or prompt assembly.
- No changes to other Step 4 tabs' logic, only their spacing tokens.
- No changes to Step 4 on other entry points (Visual Studio, Product Images) — only the brand-scenes wizard.

## Files touched
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (branch cards, caption removal, spacing pass, interaction label + helper)
- `src/features/brand-scenes/wizard/steps/Step5Review.tsx` (mirror the renamed label in the summary row)
