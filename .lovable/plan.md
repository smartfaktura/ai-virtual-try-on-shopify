## QA summary

**Functionally safe to deploy.** Spot checks:
- `useProductSwap` posts to the shared `enqueue-generation` edge function with the authenticated Supabase session (Bearer token from `auth.getSession()`), same path other workflows use. RLS and credit deduction live server-side. No new client-side trust surface.
- No new tables, no new policies — page reads `user_products` (existing RLS), `freestyle_generations`, `generation_jobs` (existing RLS).
- No raw user HTML rendered; all titles go through React text.
- Build is clean (last TS errors were closed-tag issues, resolved).
- Wizard guards: `canAdvanceFrom1` requires a scene, `canAdvanceFrom2` requires ≥1 product, `canGenerate` enforces both + credit check on top of server-side enforcement.

No web-app-crash risk introduced (component is self-contained, only imports already used elsewhere).

## Fixes

### 1. Hide the support chat on `/app/product-swap`

Use the existing `data-hide-studio-chat` body attribute pattern (already honored by `StudioChat.tsx` via a MutationObserver). Add a `useEffect` in `ProductSwap.tsx` that sets the attribute on mount and removes it on unmount.

```ts
useEffect(() => {
  document.body.setAttribute('data-hide-studio-chat', 'true');
  return () => document.body.removeAttribute('data-hide-studio-chat');
}, []);
```

### 2. Tighten the gap between "Choose products to swap in" and the search bar

Step 2's sticky search uses `-mx-4 px-4 py-3 bg-background/95 backdrop-blur-xl border-b border-border` — the negative margin was sized for the old `max-w-4xl mx-auto px-4` container we removed, so it now pokes outside the content column and the `border-b + py-3 + outer space-y-4` adds a chunky empty band under the heading.

Edit (`src/pages/ProductSwap.tsx`, Step 2 block):
- Drop `-mx-4 px-4` (no parent padding to break out of any more).
- Drop `border-b border-border` and `bg-background/95 backdrop-blur-xl` — keep it as a normal sticky element.
- Tighten outer rhythm: change Step 2 wrapper from `space-y-4` to `space-y-3`, and the sticky block from `py-3 space-y-3` to `pt-2 pb-3 space-y-2`.

Result: H2 sits cleanly above the search input with a single comfortable gap, no chrome band.

## Files

- `src/pages/ProductSwap.tsx` — add the chat-hide effect; restyle the Step 2 sticky bar.

No other components, no backend changes.