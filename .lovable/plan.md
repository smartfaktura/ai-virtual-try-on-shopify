

# Inject Dynamic Tokens into Trend Watch Prompts + Fix Paste

## Problem
1. The `generate-scene-prompts` edge function generates generic `{product}` prompts but doesn't leverage the 70+ dynamic tokens from the product-image system (e.g., `{{flowersRelated}}`, `{{materialPrimary}}`). Adding token-aware prompts would make trend-watch scenes directly usable in the product-image pipeline.
2. The **paste image** feature doesn't work in the `AddImageDraftModal` because there's no paste event listener on the dialog — the global paste handler in `AdminTrendWatch.tsx` sets `pastedFile` and opens the modal, but the modal uses `useState()` as an initializer (wrong API — should be `useEffect`) and never updates when `initialFile` changes after mount.

## Changes

### 1. Fix paste image in `AddImageDraftModal.tsx`
- Replace the incorrect `useState(() => { ... })` initializer (line 27-32) with a proper `useEffect` that watches `initialFile` and `open`
- Add a paste event listener inside the dialog so pasting also works when the modal is already open

### 2. Add "Include Dynamic Tokens" checkbox to `DraftScenesPanel.tsx`
- Add a toggle/checkbox per draft card: **"Inject product tokens"** (default: off)
- When checked, pass `{ inject_tokens: true }` to the `generate-scene-prompts` edge function
- Update `useSceneRecipes.ts` `generatePrompts` mutation to accept `{ sceneRecipeId, injectTokens }` instead of just a string

### 3. Update `generate-scene-prompts` edge function
- Accept optional `inject_tokens: boolean` in the request body
- When `true`, append a new section to the AI system prompt instructing it to weave `{{tokenName}}` placeholders into the generated prompt where contextually appropriate
- Provide the token reference list (grouped by category) so the AI knows which tokens exist
- The AI will output prompts like: `"Surround {{productName}} with fresh {{flowersRelated}} scattered on a {{materialPrimary}} surface in {{backgroundBaseHex}} tones"` instead of generic `{product}` text
- When `false` (default), behavior stays exactly as today — no tokens, just `{product}` placeholder

### 4. Token reference data
- Extract the token names + descriptions from `AdminPromptTokens.tsx`'s `TOKEN_GROUPS` into a shared constant file `src/data/promptTokenReference.ts` so both the admin page and the edge function can reference the same list
- The edge function will inline a compact version of this list in its system prompt when `inject_tokens` is true

## Files

| File | Action |
|------|--------|
| `src/components/app/trend-watch/AddImageDraftModal.tsx` | Fix: `useEffect` for `initialFile`, add paste listener |
| `src/components/app/trend-watch/DraftScenesPanel.tsx` | Add "Inject product tokens" checkbox per card |
| `src/hooks/useSceneRecipes.ts` | Update `generatePrompts` to accept `injectTokens` param |
| `supabase/functions/generate-scene-prompts/index.ts` | Handle `inject_tokens`, append token reference to AI prompt |
| `src/data/promptTokenReference.ts` | New: shared token names + descriptions extracted from admin page |
| `src/pages/AdminPromptTokens.tsx` | Refactor to import from shared data file |

## How the token injection works in the AI prompt

When `inject_tokens: true`, the system prompt gets an additional section:

```text
DYNAMIC TOKEN MODE:
Instead of using '{product}' as a generic placeholder, weave these dynamic 
tokens into your prompt where contextually appropriate. Each token resolves 
to a real value from the user's product analysis at generation time.

Available tokens (use as {{tokenName}}):
- {{productName}} — Product title
- {{materialPrimary}} — Main material (e.g., glass, leather)
- {{flowersRelated}} — Related flowers for styling
- {{productMainHex}} — Dominant product color hex
... [compact list of all tokens with one-line descriptions]

Rules:
1. Use tokens naturally within sentences, not as a list
2. Only use tokens that are contextually relevant to the scene
3. Keep the prompt reusable — tokens make it adaptive, not rigid
4. Always include {{productName}} where you would have used {product}
```

This produces prompts ready for the product-image pipeline with zero manual token insertion.

