## Re-order Essentials: ask "Design a specific look?" first

**In `Step4Cast.tsx` Essentials tab:**

1. Move the **"Design a specific look?"** branch card to the **top** of the Essentials tab (above "Who's in the shot").

2. **Gate the rest of Essentials** behind that answer:
   - Until the user picks Skip or Yes, only the branch card is rendered.
   - Once picked, the remaining Essentials sections fade in: Who's in the shot → Product interaction → Product scale.

3. Keep current behavior otherwise:
   - Skip → only Essentials tab visible, Next exits Step 4.
   - Yes → People / Interaction / Styling tabs unlock and Next walks through them.

No changes to validation, prompt assembly, or other steps. Scope is purely the order/gating of sections inside the Essentials tab.

### File
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`