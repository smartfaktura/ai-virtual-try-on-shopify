# Update homepage Activewear + Bags cards

**Scope:** frontend only — `src/components/home/HomeTransformStrip.tsx`.

## 1. Replace `ACTIVEWEAR_CARDS` (12 entries)

| Label (Original first) | Scene id |
|---|---|
| *Original* | `1776234970067-5vlptt` |
| 1 | `1776192312181-3v0u0t` |
| 2 | `1776768268121-ceu2p2` |
| 3 | `1776769937151-gknduq` |
| 4 | `1780057441113-nrbomw` |
| 5 | `1776768266956-51yyir` |
| 6 | `1776762658046-8ef77l` |
| 7 | `1780057438189-8oulx7` |
| 8 | `1776762651422-p9psd4` |
| 9 | `1776231822346-2f1iqc` |
| 10 | `1776838045580-te7r49` |
| 11 | `1776762656752-dpc9i6` |

(Keep existing card labels/structure; only swap the preview IDs in order. If labels are tied to scenes, I'll reuse generic descriptive labels matching current pattern.)

## 2. Replace `BAGS_CARDS` (12 entries) + rename label

Change `CATEGORIES` entry label from `'Bags & Accessories'` → `'Bags'` (id stays `'bags'`, hub unchanged).

| Label | Scene id |
|---|---|
| *Original* | `1779254030949-v68n45` |
| 1 | `1779254042866-tzk34b` |
| 2 | `1779254038259-suks3t` |
| 3 | `1777880664879-qp4xbg` |
| 4 | `1779254023329-q4m922` |
| 5 | `1780060131424-9kwee8` |
| 6 | `1779254022047-um76cz` |
| 7 | `1779254027797-grs4vw` |
| 8 | `1780922510641-rpcur5` |
| 9 | `1777880663547-i1ngr6` |
| 10 | `1780922515913-cu4m5i` |
| 11 | `1780922507032-mpoowj` |

## Safe / out of scope

- No backend, type, or asset changes.
- All IDs come from same `product-uploads` bucket, public.
- `ALL_CATEGORY_NAMES` dropdown: if "Bags & Accessories" entry exists there, also rename to "Bags" for consistency.

## Validation

- Reload `/`, Activewear & Bags tabs show new previews in order; first card has "Original" badge; tab label reads "Bags".
