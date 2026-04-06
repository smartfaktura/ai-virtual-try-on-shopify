

# UX Issues Identified in Refine Step

## Issues from the Screenshot

### 1. Scene cards are too dense and visually noisy
- 19 scene cards crammed into a grid with tiny text (9-10px), tiny thumbnails (64px), and multiple competing status indicators (ready badge, settings pill, chevron, dot indicator) all fighting for attention in a tiny space.
- The cards look like a wall of information, not interactive elements. Too many visual layers per card.

### 2. Background strip overlaps/competes with scene grid
- The Background quick-action strip sits awkwardly between the header and the grid — its "Applies to" thumbnails are redundant noise (5px thumbnails are unreadable). The "Advanced details" toggle adds yet another layer of UI to parse.

### 3. "Tap to fine-tune" hint is invisible at scale
- With 19 cards, the header hint "19 selected — tap to fine-tune" gets lost. Individual cards show a "tap" ghost text on hover but it's 8px and invisible.

### 4. Settings pill labels are confusing
- Labels like "Focus Area, Lighting" or "⚙ 7 settings" tell users nothing actionable. "7 settings" for what? Users don't know what "settings" means here.

### 5. Expanded card takes full width — jarring
- When a card expands, it goes from 1 column to full 5-column span. This pushes all other cards down and completely reshuffles the grid layout, creating disorientation.

### 6. "needs model" cards mixed in randomly
- Cards with amber "needs model" badge are scattered through the grid. There's no visual grouping — users have to scan 19 cards to find which ones need attention.

### 7. Outfit & Model section starts collapsed
- Even after clicking a "needs model" card and auto-scrolling, the Outfit section is a collapsed trigger bar. Users must click again to actually see the model picker — two clicks when one should suffice.

### 8. No visual hierarchy between sections
- Scenes grid, Background strip, Outfit, Consistency, Custom Note, Format — they all look similar. Cards within cards, borders within borders. Nothing stands out as the primary action.

### 9. Credit preview at bottom is disconnected
- The "114 cr" in the sticky bottom bar is the only cost indicator. Users refining 19 scenes × 1 product have no sense of cost impact as they change settings.

## Proposed Fixes

| # | Fix | Details |
|---|-----|---------|
| 1 | **Group cards by type** | Split grid into 2 groups: "Product shots" (studio, packshot, etc.) and "On-model shots" (needs model). Add group headers. Reduces cognitive scan. |
| 2 | **Simplify card content** | Remove settings pill text. Show only: thumbnail, title (1 line truncate), status dot (green/amber). Chevron on right. That's it. |
| 3 | **Expand inline below card, not full-width** | Expanded settings appear as a dropdown panel below the single card, keeping grid stable. Other cards stay in place. |
| 4 | **Remove "Applies to" thumbnails** | In Background strip, kill the tiny thumbnails row. Just say "Background · 12 scenes" — users understand. |
| 5 | **Auto-open Outfit when it has pending state** | If any scene needs a model, Outfit section should start open, not collapsed. Remove the extra click. |
| 6 | **Reduce card visual noise** | Remove the green "ready" text — it's the default state, no need to call it out. Only show amber for "needs model". |

## Files to Update

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | (1) Group scene cards into "Product shots" vs "On-model shots" sections. (2) Simplify card to: thumb + title + status dot + chevron only. (3) Change expansion to NOT span full width — keep single column, show settings panel below. (4) Remove "Applies to" thumbnail row from BG strip. (5) Auto-open Outfit section when `needsModel` is true. (6) Remove green "ready" badge — only show amber "needs model". |

