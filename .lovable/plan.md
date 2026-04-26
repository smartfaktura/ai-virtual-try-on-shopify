## Swap 6 marquee tiles in "Place your product anywhere" section

Single file: `src/components/landing/EnvironmentShowcaseSection.tsx`

Add a `PB` (product-uploads scene-previews) base + `p()` helper, then replace these tiles:

| Card | Old source | New source (scene-previews/...) |
|---|---|---|
| Studio Movement | `poses/pose-studio-movement.jpg` | `1776840731708-d8q4ox.jpg` |
| Dynamic Water Splash | `freestyle/baebb27e-…png` | `1776018020221-aehe8n.jpg` |
| Frozen Aura | `freestyle/2f6bb14f-…png` | `1776018027926-ua03bd.jpg` |
| Earthy Woodland Product | `freestyle/ccfaf5c8-…png` | `1776842392261-39paz7.jpg` |
| Brutalist Urban Steps | `freestyle/0682905a-…png` | `1776664678316-msnkm0.jpg` |
| Amber Glow Studio (×2 — rows 1 & 2) | `freestyle/91418be3-…png` | `1776848678453-vw1uf9.jpg` |

Helper: `p(name, file)` resolves `${PB}/${file}` through `getOptimizedUrl({ quality: 75 })` (matches the explicit `?quality=75` in your URLs).

Plus version.json bump.
