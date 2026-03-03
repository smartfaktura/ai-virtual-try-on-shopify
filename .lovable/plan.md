

## Fix Scene Limits & Upgrade UX in Workflow Generation

### Current State
- `FREE_SCENE_LIMIT = 3` — free users can select up to 3 scenes
- Paid users can select unlimited scenes
- Upgrade message says "Free plan: up to 3 scenes. Upgrade for more" in amber text, opens the Buy Credits modal

### What Needs to Change

**1. Scene limits** — `src/pages/Generate.tsx`
- Change `FREE_SCENE_LIMIT` from `3` to `1`
- Add `PAID_SCENE_LIMIT = 3` constant
- Apply paid user cap in the selection handler (line 2308-2317): when a paid user tries to select more than 3, show a toast
- Update "Select All" button logic to respect the 3-scene cap for paid users

**2. Upgrade message for free users** — line 2408-2410
- Replace the amber text with VOVV.AI branded styling: dark navy chip with primary accent
- Change copy to: "Free plan: 1 scene per generation. **Upgrade to any plan** to unlock up to 3 scenes."
- The "Upgrade to any plan" link opens `openBuyModal()` (which already shows the Plans tab)

**3. Scene count display** — line 2400
- Update the "X of Y scenes selected" to show the correct max for both free (1) and paid (3) users

**4. Selection handler cap for paid users** — line 2308-2317
- Add a cap check: if paid user and `next.size >= PAID_SCENE_LIMIT`, show toast "Maximum 3 scenes per generation"

### Files Changed — 1 file
`src/pages/Generate.tsx` — Update constants, selection logic, and upgrade message styling

