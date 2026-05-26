## Shorten plan chip on UpgradePlanModal

In `src/components/app/UpgradePlanModal.tsx` (around lines 363–370), the chip text wraps onto two lines on mobile.

Changes:
- `Custom Brand Models & Scenes` → **`Brand Models & Scenes`**
- `Default VOVV Models & Scenes` → **`Default Models & Scenes`**
- Add `whitespace-nowrap` to the chip span so it stays on one line.

No layout/logic changes.