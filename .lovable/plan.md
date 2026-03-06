

## Fix Annual Savings Label: 17% → 20%

The annual savings percentage is hardcoded as "17%" in two places, but it should be "20%" to match the landing page pricing section (which shows "−20%").

### Files Changed

**`src/pages/Settings.tsx`** (line 255) — Change `Annual (Save 17%)` to `Annual (Save 20%)`

**`src/components/app/BuyCreditsModal.tsx`** (line 216) — Change `SAVE 17%` to `SAVE 20%`

