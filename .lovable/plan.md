

## Add "Upscale to 2K & 4K" Feature to All Pricing Plans

Single file change in `src/data/mockData.ts` — add `'Upscale to 2K & 4K'` to the features array of every plan (Free, Starter, Growth, Pro, Enterprise).

| Plan | Insert after | New feature text |
|------|-------------|-----------------|
| Free (line 1428) | `'All Models & Scenes'` | `'Upscale to 2K & 4K'` |
| Starter (line 1443) | `'All Models & Scenes'` | `'Upscale to 2K & 4K'` |
| Growth (line 1461) | `'All Models & Scenes'` | `'Upscale to 2K & 4K'` |
| Pro (line 1482) | `'All Models & Scenes'` | `'Upscale to 2K & 4K'` |
| Enterprise (line 1500) | `'All Pro features'` | already covered by "All Pro features" — no change needed |

This automatically propagates to the landing page pricing section, the Buy Credits modal (Plans tab), and the Settings page since they all read from `pricingPlans`.

