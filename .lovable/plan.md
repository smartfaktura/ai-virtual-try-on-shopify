## Restyle Upgrade button

Use the default primary button style (same as Generate) with a Sparkles icon — no destructive red color, no Coins icon.

### Changes in `src/pages/ProductSwap.tsx`
For both mobile (L998–1007) and desktop (L1061–1070) footer buttons:
- Remove `variant={!canAfford ? 'outline' : 'default'}` (always default primary).
- Remove the `border-destructive/40 text-destructive ...` className branch.
- Always render `Sparkles` icon (drop the Coins branch).
- Keep label switch: "Upgrade for more credits" when `!canAfford`, otherwise "Generate N images".
- Keep onClick wiring to open `NoCreditsModal` when `!canAfford`.