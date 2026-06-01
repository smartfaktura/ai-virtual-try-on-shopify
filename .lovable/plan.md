## Swap Editorial / Atelier / Garden hero tiles on `/ai-product-photography/wedding-dresses`

Update the `heroCollage` array in `src/data/aiProductPhotographyCategoryPages.ts` (lines 1712–1717). The **Video** tile stays unchanged.

### Swaps
| Tile | New image | Source |
|------|-----------|--------|
| Editorial | `1780309205809-7skt5e` Cliffside Goddess Gown | already in `sceneExamples` |
| Atelier | `1780309226612-pdloqt` Veil & Bouquet Pause | already in `sceneExamples` |
| Garden | `1780308026963-vb0k3u` Garden Dip Kiss | already in `sceneExamples` |

Alt text updated to match each new image. No component or asset changes.

### QA
Reload `/ai-product-photography/wedding-dresses` → verify the 3 swapped tiles render the new bridal imagery and the Video tile is untouched.
