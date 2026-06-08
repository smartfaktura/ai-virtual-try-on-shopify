# Swap one Bags preview on homepage

**Scope:** frontend only — `src/components/home/HomeTransformStrip.tsx`, `BAGS_CARDS` array.

Current slot 5 ("Sunny Shadows") uses `1779254023329-q4m922`. `1780922507032-mpoowj` is already used in slot 12. So I'll interpret the request as: replace `1779254023329-q4m922` with the new scene `1780922504004-qq24dq`.

## Change

| Slot | Before | After |
|---|---|---|
| 5 (Sunny Shadows) | `1779254023329-q4m922` | `1780922504004-qq24dq` |

Other 11 cards untouched. No label/type/hub changes.

## Validation

Reload `/`, open Bags tab, confirm slot 5 shows the new preview and no duplicates.

> If you actually meant a different swap (e.g. replace with `mpoowj` and remove the duplicate elsewhere), tell me and I'll adjust.
