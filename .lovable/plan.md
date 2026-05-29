# Bulk mode polish — Add Products

All edits scoped to `src/components/app/ManualProductTab.tsx`, only inside the `isBatchMode` branch (line 660+). No DB, no schema, no other components touched.

## 1. Safe image fallback (no crash, no UI break)

The expanded thumbnail currently shows the raw `alt` text overflowing when the object URL fails to load (visible in screenshot). The actual uploaded image continues to render normally — we only add a graceful fallback for the failure case.

- Add local state `const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({})`.
- On `<img>` `onError` set `brokenThumbs[item.id] = true`. The image element keeps its current `src={item.previewUrl}` and styling — nothing changes on the happy path.
- Only when `brokenThumbs[item.id]` is true, render a small `<Package />` icon centered inside the same `bg-muted/40` tile instead of the broken `<img>`. This is purely a fallback; the user's uploaded image is still the primary content.
- Apply the same `onError` handling to the collapsed `w-12 h-12` thumbnail (line ~720) so the two states stay consistent.

Safety: purely additive UI state, no effect on data or submission.

## 2. Replace free-form "Type" input with canonical Category picker

Mirrors single-mode behaviour and matches the brand category picker the user already approved.

- Extend `BatchItem` with `userCategory?: string | null` (default `null`). Existing items in state get `null` via spread defaults — backwards compatible.
- Replace the second column `<Input>` "Type (e.g. Shoes)" (line ~779) with a button styled like the single-mode picker trigger: `h-8 text-xs rounded-md border px-2 flex items-center justify-between gap-1.5 text-left`. Label = `getCategoryLabel(item.userCategory) || item.productType || 'Choose category'` (so AI's free-form type still shows until user picks).
- Add state `const [activeCategoryItemId, setActiveCategoryItemId] = useState<string | null>(null)`. Clicking the button sets it; the existing `<CategoryPickerModal>` is rendered once at the bottom of the batch tree with `open={!!activeCategoryItemId}`, `value={batchItems.find(b => b.id === activeCategoryItemId)?.userCategory ?? null}`, `onChange={(v) => { updateBatchItem(activeCategoryItemId!, 'userCategory', v); setActiveCategoryItemId(null); }}`, `onOpenChange={(o) => !o && setActiveCategoryItemId(null)}`. We import `CategoryPickerModal` and `getCategoryLabel` the same way single mode does (already imported in this file — verified via grep before editing).
- Remove the QUICK_TYPES chip block + "Change category" dotted link (lines 807-835). The picker supersedes them.
- Collapsed row subtitle (line 724) becomes: `getCategoryLabel(item.userCategory) || item.productType || '—'`.
- Persistence — `handleSubmitBatch` insert payload (line 599):
  - `product_type: (getCategoryLabel(item.userCategory) || item.productType || '').substring(0, 100)` — keeps the column populated for downstream photography logic.
  - Add `analysis_json: item.userCategory ? { userCategory: item.userCategory } : null` — same shape single mode writes.
  - GTM call uses the same resolved label.

Safety: `product_type` column stays a string (never null), `analysis_json` is either null or a small object — both already supported by existing inserts in this file.

## 3. Hide description field in bulk expanded card

Remove the `<Textarea>` description (lines 837-848) from the bulk expanded card. Dimensions input moves to its own full-width row below the name+category row.

- `description` still exists on `BatchItem` and is still set by AI analysis if it arrives — we just don't render an editor for it in bulk. On submit we send `item.description.trim().substring(0, 500)` as today (often empty string, which the column already accepts).

Safety: column is nullable / accepts empty string; no insert shape change.

## Files

- `src/components/app/ManualProductTab.tsx` (only file edited)
