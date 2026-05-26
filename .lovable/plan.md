Three small polish edits in `src/pages/ProductSwap.tsx` only.

### 1. Shorter header subtitle
Replace:
> "Keep the exact scene — camera, lighting, background — and only swap in a different product"

with:
> "Same scene, different product"

(Single short line, matches minimalist-restraint core rule, no terminal period.)

### 2. Clearer Step 1 heading + helper
Current copy is vague about the outcome. Replace:
- H2: "Choose the scene to keep" → **"Pick the scene you want to reuse"**
- Subtitle: "Pick from your library or upload any image" → **"We'll recreate this exact shot — same camera, lighting and background — with the products you choose next"**

This tells the user (a) what to pick and (b) what will happen. Multi-sentence → keeps period per memory rule.

### 3. Hide the floating Selected tray on mobile
In Step 2, wrap the selected-tray sticky pill (the one rendered just above the floating sticky bar) with `hidden sm:block` so it only appears on `sm` and up. Mobile users still see their count in the floating bar's dot+coins area; they no longer get the extra pill taking vertical space.

### Out of scope
No backend, hook, generation, or stepper changes.