## Fix Product Swap generate button when credits are insufficient

### Problem
On `/app/product-swap` Review step, the "Generate 2 images" button stays styled as an active primary CTA even when the user lacks credits. The click does call `setNoCreditsOpen(true)`, but visually the button suggests generation will run, which is misleading.

### Fix
In `src/pages/ProductSwap.tsx`, update **both** the mobile (L998–1006) and desktop (L1061–1069) Generate buttons in the sticky footer so that when `!canAfford`:

- Swap the icon to `Coins` and the label to **"Upgrade for more credits"** (mobile: short "Upgrade").
- Keep the button enabled (so it remains clickable) and keep `onClick={() => setNoCreditsOpen(true)}`.
- Apply an `outline` variant (or `variant="outline"` with `border-destructive/40 text-destructive`) so it visibly differs from a normal "ready to generate" CTA, matching the existing destructive "Not enough credits" microcopy already shown next to it.

No business logic, credit math, or modal behavior changes — purely the button presentation + label, plus guaranteed click-to-modal wiring (already in place).

### Verification
- With balance < cost: button reads "Upgrade", styled outline/destructive, click opens `NoCreditsModal`.
- With balance ≥ cost: button reads "Generate N images", primary style, click runs `handleGenerate` (unchanged).
- Mobile and desktop footers both behave consistently.