

## Hide Generation Bar on Freestyle & Move to Right Side on Other Pages

### Problem
The "1 running" pill on the Freestyle page is redundant — Freestyle already shows its own "Generating images…" banner at the top. On other pages it should still appear, but on the right side (opposite to the support chat icon on the left).

### Changes

**`src/components/app/GlobalGenerationBar.tsx`**

1. **Add `/app/freestyle` to `HIDDEN_PATHS`** (line 14) so the bar never renders on Freestyle
2. **Move positioning to bottom-right**: Change `fixed bottom-20 left-4 lg:left-6` → `fixed bottom-20 right-4 lg:right-6` so it sits on the opposite side from the support chat icon

Two lines changed, no new files.

