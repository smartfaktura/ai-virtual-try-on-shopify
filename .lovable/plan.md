# Fix edit-image flow only (Freestyle)

Strictly scoped to the **Edit image** path. No changes to other generation modes, no schema/config/dependency changes.

---

## Fix 1 — UI: intent pills hidden on first mount

**File:** `src/components/app/freestyle/ImageRoleSelector.tsx`, line 45.

**Bug:** `roleExpanded` defaults to `true`, so on mount the role-picker row renders and the intent pills are gated behind `imageRole === 'edit' && !roleExpanded` (line 102). The user has to click the already-selected "Edit this image" pill once to collapse the role row before the intent pills appear — the "double-click" they reported.

**Change:** flip the default.

```ts
const [roleExpanded, setRoleExpanded] = useState(false);
```

That's the entire UI fix. When an image is already attached with `imageRole='edit'`, intent pills appear immediately. The collapsed "Using image as: Edit ⌄" pill remains as the affordance to switch roles. For non-edit roles, the collapsed pill is still correct (no intent step exists for them).

---

## Fix 2 — Backend: each intent pill carries non-contradictory rules

**File:** `supabase/functions/generate-freestyle/index.ts`, only the `imageRole === 'edit'` block (lines 154–172).

**Why:** today the universal opener says *"preserve composition, lighting, and colors exactly"* while `change_background` says *"change the environment"* — the model is told to swap the background but keep the old background's lighting on the subject. Same conflict for `change_model`. Result: subjects floating in new scenes still lit like the old scene.

**Changes inside that block only:**

1. Replace the universal opener with a softer scope line that doesn't lock lighting globally:

   > "Apply the change described above to the uploaded image. Leave everything not mentioned by the user or the directive below unchanged. Match the input image's product identity (shape, color, materials, logos, proportions)."

2. Rewrite the four intent strings so each pill carries its own preserve/permit rules:

   | Pill | New line |
   |---|---|
   | `replace_product` | "Replace or modify only the product as described. Keep the person, pose, background, framing, and overall lighting the same. Match the new product's materials to the scene's light so it sits naturally." |
   | `change_background` | "Change the background/environment as described. Keep the subject (person and product) identity, pose, and framing intact. Re-derive the lighting on the subject so it matches the new environment." |
   | `change_model` | "Replace the person as described. Keep the product, product placement, pose silhouette, and framing close to the original. Let skin tone, hair, and facial lighting re-derive naturally for the new person." |
   | `enhance` | "Refine sharpness, color accuracy, and fine detail without changing what's in the image, the composition, the lighting, or the colors." |

3. Drop the silent `['enhance']` fallback. With Fix 1, the user always sees the pills — no need to secretly inject "improve lighting" when they picked nothing. New behavior: if no intent picked, only the opener + user prompt go through.

4. Keep the closing "High resolution, clean result, single cohesive photograph" line as-is. Minimal blast radius.

**Untouched:** `[IMAGE TO EDIT]` label, function signature (`editIntent` param stays for backward compat), all other branches in this file, fallback chain, 2K PNG enforcement, JWT auth.

---

## Fix 3 — Client: mirror the same strings

**File:** `src/pages/Freestyle.tsx`, lines ~581–589.

Same four intent strings as Fix 2, drop the same `|| ['enhance']` default. If only the backend changes and the client still appends old phrasing, the model receives both copies — defeats the fix.

Nothing else in `Freestyle.tsx` changes.

---

## Files touched (3, all surgical)

- `src/components/app/freestyle/ImageRoleSelector.tsx` — one line (`useState(true)` → `useState(false)`)
- `supabase/functions/generate-freestyle/index.ts` — only the edit branch (lines 154–172)
- `src/pages/Freestyle.tsx` — only the intent-string map + `|| ['enhance']` default

No DB, no migrations, no `config.toml`, no new deps, no new env vars, no other generation paths affected. Pure prompt-string + one UI default flip. Trivially revertable.

## Risk

Near-zero. UI fix is a state default flip. Backend changes are string edits inside a single `if (imageRole === 'edit')` branch. Material Swap, Product Swap, Perspectives, Catalog, Video, and the non-edit Freestyle paths (product / model / scene / full freestyle) are untouched and cannot be affected.
