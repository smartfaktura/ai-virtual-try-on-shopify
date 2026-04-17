

## Fix #1 — Revoke object URLs in ManualProductTab

**File:** `src/components/app/ManualProductTab.tsx`

**Change:** Track all `URL.createObjectURL()` calls in a `useRef<Set<string>>`, then:
- Revoke an entry when its preview is removed from the batch
- Revoke all entries on component unmount (cleanup `useEffect`)
- Revoke on successful save (when batch is cleared)

**Why:** Prevents memory leak on large batch uploads (20+ images). Pure correctness fix, zero behavior change, ~5 min.

**Acceptance:**
- All `createObjectURL` calls have a matching `revokeObjectURL`
- Batch previews still display correctly
- Removing one item doesn't break others
- No console warnings

