# Canonical Product Category from Analyzer — Hardened Plan

## Goal

The Product Category field must always be one of the canonical IDs in `src/lib/productCategories.ts` (35 IDs). Today `analyze-product-image` returns a free-form `productType` ("Midi Dress", "Top", "Shed Interior") which gets shown as the category in bulk mode — wrong.

## Decision

Resolve the canonical id **inside `analyze-product-image`** and return it as a new field `userCategory` (id or `null`). Keep `productType` untouched as a free-form display string. The bulk UI then prefers `userCategory` (canonical label) over `productType`, and the picker is the source of truth when the user overrides.

Why not "let Step 2 do it":
- The Products page must already show the correct category — Step 2 only runs later in Visual Studio.
- We'd duplicate logic and leave a window where the wrong label is persisted.

## Approach (three layers of safety)

```text
AI enum (Layer 1)  →  Server regex map (Layer 2)  →  null (Layer 3, safe default)
```

### Layer 1 — Constrain the AI

Extend the existing single AI call (no extra roundtrip, no latency increase):
- Inject the full list of 35 canonical IDs into the prompt as a strict enum.
- Add a new JSON field `"category"`: must be one of the IDs, or `"other"` if uncertain, or `null` for room/space photos.
- Keep existing fields (`title`, `productType`, `description`, `specification`) unchanged.

### Layer 2 — Server-side validation + regex fallback

Reuse the proven mapping table from `supabase/functions/analyze-product-category/index.ts` (40+ regex patterns, battle-tested). Move it into a shared module so both functions use it.

After AI parse, in `analyze-product-image`:
1. If `parsed.category` ∈ `VALID_CATEGORIES` and ≠ `"other"` → use it.
2. Else run `mapTitleToCategory(\`${parsed.title} ${parsed.productType}\`)` → use result if found.
3. Else `userCategory = null` (picker stays empty, user picks manually).

Room/space detection: if AI returns `category: null`, or the resolved id is null AND `productType` matches `/room|bedroom|kitchen|living|office|facade|space|interior|exterior/i`, set `userCategory = null` explicitly so we never mislabel a space as a product.

### Layer 3 — Client merge rules (never overwrite user intent)

In `ManualProductTab.tsx`:
- Single mode (~line 218): `if (data.userCategory && !hasManualEdits.current.userCategory && !userCategory) setUserCategory(data.userCategory);`
- Batch mode (~line 207-216): `userCategory: b.userCategory ?? (data.userCategory ?? null),` — existing manual pick always wins.
- Add `userCategory` to the `manualEdits` ref so picker-driven changes lock the field (mirroring `title`/`productType`/`description`).

## Safety checklist

| Risk | Mitigation |
|------|-----------|
| AI returns invalid string (e.g. "Midi Dress") | Layer 2 regex fallback catches it; otherwise `null` |
| AI hallucinates a near-id ("dress" not "dresses") | `coerceCategory` lowercases/trims + checks `VALID_CATEGORIES`; falls through to regex |
| AI omits the new `category` field entirely | Treated as undefined → regex fallback → `null` |
| Room/space photo gets a product category | Explicit null path + space-keyword guard |
| User already picked a category before analysis finishes | Client guard: never overwrite a non-null `userCategory` |
| Existing callers of `analyze-product-category` break | We only **add** an export and refactor internals; response shape unchanged |
| Edge function deploy fails on shared import | Use relative import `../_shared/category-mapper.ts` (already-used pattern in this project's functions folder) |
| Old products in DB still have free-form `product_type` | Untouched. Display layer falls back to `productType` when `userCategory` is null — no migration needed |
| Bulk submit writes wrong `product_type` field | `product_type` keeps the free-form `productType` for human readability; canonical id lives in `analysis_json.userCategory` (already wired) |
| AI gateway 503/429 | Existing 3-attempt retry path unchanged; if all fail, response surfaces error and analyzer just doesn't fill the field |
| JSON parse failure | Existing extraction + sanitization path unchanged; on failure, `userCategory` simply absent |

## Files

1. **`supabase/functions/_shared/category-mapper.ts`** (new) — exports `VALID_CATEGORIES`, `TITLE_CATEGORY_PATTERNS`, `mapTitleToCategory(text)`, `coerceCategory(input)`. Pure functions, no Deno-specific imports.
2. **`supabase/functions/analyze-product-category/index.ts`** — replace the local `VALID_CATEGORIES` + `TITLE_CATEGORY_PATTERNS` with imports from the shared module. No behaviour change. Keep all existing logic.
3. **`supabase/functions/analyze-product-image/index.ts`** — inject enum into prompt, add `category` field, post-process into `userCategory` via the 3-layer chain, include in response.
4. **`src/components/app/ManualProductTab.tsx`** — merge `data.userCategory` in single + batch flows, add to `manualEdits` ref.

## Non-changes (explicitly)

- No DB migration, no table changes, no new RLS, no new RPC.
- `analyze-product-category` response shape unchanged — other callers safe.
- `productType` field preserved everywhere for backward compatibility.
- No UI restructure — the existing canonical picker, labels, and Step 2 logic already understand `userCategory`.
- No new dependencies, no new edge function.

## Rollout

Single edge-function-only change deploys atomically. Worst case (regression in mapper) → `userCategory` is `null` → picker stays empty → user picks manually (current behaviour for products imported before today). No data corruption path.
