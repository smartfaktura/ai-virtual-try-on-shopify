

# Fix: Inflated View Counts on Discover Items

## Root Cause

The `useEffect` that tracks views fires every time `selectedItem` changes with zero deduplication. Combined with the earlier modal close/reopen bug (which caused rapid state oscillation), this created dozens of duplicate inserts per single user interaction. Even without that bug, opening the same item twice in one session creates duplicate views.

The network logs confirm: **20+ identical POST requests** to `discover_item_views` for the same item ID at the exact same timestamp.

## Fix

### 1. `src/pages/Discover.tsx` — Deduplicate view tracking

Replace the bare `useEffect` with a ref-based deduplication that tracks which items have already been viewed in this session:

```ts
const viewedItemsRef = useRef<Set<string>>(new Set());

useEffect(() => {
  if (!selectedItem) return;
  const key = `${selectedItem.type}:${getItemId(selectedItem)}`;
  if (viewedItemsRef.current.has(key)) return;
  viewedItemsRef.current.add(key);
  supabase.from('discover_item_views').insert({
    item_type: selectedItem.type,
    item_id: getItemId(selectedItem),
  }).then();
}, [selectedItem]);
```

### 2. `src/pages/PublicDiscover.tsx` — Same fix

Same ref-based deduplication pattern.

### 3. (Optional) Database cleanup — Remove duplicate views

Run a migration to deduplicate existing inflated view records:

```sql
-- Delete duplicate views, keeping only the first per user+item combo
DELETE FROM discover_item_views a
USING discover_item_views b
WHERE a.id > b.id
  AND a.item_type = b.item_type
  AND a.item_id = b.item_id
  AND a.user_id IS NOT DISTINCT FROM b.user_id
  AND a.created_at::date = b.created_at::date;
```

This will bring view counts back to realistic numbers.

## Files

| File | Change |
|------|--------|
| `src/pages/Discover.tsx` | Add ref-based view dedup (~5 lines) |
| `src/pages/PublicDiscover.tsx` | Same dedup pattern (~5 lines) |
| Migration (optional) | Clean up existing duplicate view records |

