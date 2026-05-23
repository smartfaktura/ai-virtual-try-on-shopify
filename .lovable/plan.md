## Step 4 → Look sub-step UX fixes

Tighten the mode-chooser screen so the choice is obvious, the auto-cast path actually feels automatic, and the chrome around it stops contradicting itself. Visual-only changes — no business logic, no schema, no prompt changes.

### 1. Auto-cast actually skips ahead
File: `BrandSceneWizard.tsx` (`handleNext`)

When the user is on `subStep === "look"` and mode is `skip`, advance the wizard past `essentials` straight to the next wizard step (Photography / step 5). Today it stops on Essentials even though Auto-cast already filled everything.

- If `mode === "skip"` and `subStep === "look"`: skip the sub-step loop and go to `dispatch({type:"next"})` (which moves to step 5).
- Keep `mode === "yes"` behaviour unchanged (walk through Essentials → People → Interaction → Styling).
- Update `nextLabel` so the Look screen reads **"Continue"** when mode is skip, and **"Continue to Essentials"** only when mode is yes.

### 2. Stop showing premature ✓ on tabs the user hasn't seen
File: `Step4Cast.tsx` (tab bar `done` calculation)

A tab should only show a check if the user has actually visited it OR explicitly chose Auto-cast for it. Pass `subStepsVisited: Set<Step4SubStep>` from `BrandSceneWizard` (tracks which sub-steps have been the active one) and gate the ✓ on `visited.has(t)`. Auto-cast still marks all skipped tabs as visited so they read as "handled" rather than "to do".

### 3. Visual hierarchy on the two cards
File: `Step4Cast.tsx` `BranchCard` + the wrapper grid

- Active card gets a stronger treatment: 2px border (`border-foreground`), subtle inner ring (`ring-1 ring-foreground/10`), and a small **Recommended** chip on Auto-cast.
- Add a tiny `aria-pressed` + visually-hidden "Selected" label.
- Demote the secondary card slightly (smaller title weight, muted body) so the default choice is unambiguous.
- Place a one-line caption under the grid: **"You can switch any time — your picks won't be lost."**

### 4. Show the auto-picked values inline
File: `Step4Cast.tsx`, under the BranchCard grid when `mode === "skip"`

Render a small read-only summary row of chips with the seeded values (cast preset, interaction, scale) — e.g. `Solo · Holding · Handheld`. Tapping a chip jumps to Essentials with that field focused. Gives users confidence without forcing them through tabs.

### 5. Unify vocabulary
Files: `Step4Cast.tsx` (BranchCard body strings), and the tab `labelMap`.

- Auto-cast body: **"We pick cast, interaction and scale"**
- Design the look body: **"Choose cast, interaction and styling yourself"**
- Tab order stays `Look · Essentials · People · Interaction · Styling` — but make the Auto-cast subtitle reference the same nouns ("cast, interaction, scale") used in Essentials so the words match what the tabs show.

### 6. Single progress indicator on this screen
File: `Step4Cast.tsx` tab bar

The page header already shows `04 / 07`. Hide the right-aligned `Step 1 of 5` counter on the **Look** sub-step (the chooser has no real "step N" meaning). Keep it visible on Essentials/People/Interaction/Styling where it does help.

### 7. Action-bar spacing
File: `WizardLayout` footer (or wherever the Back/Continue strip lives — confirm during build)

The white container around Back/Continue currently floats far below the cards. On the Look sub-step only, tighten the top padding of the footer so the cards and the CTA feel like one composition.

### Out of scope

- No changes to `step4Flow` validation, prompt assembly, schema, or any other wizard step.
- No copy changes to the page header / subtitle ("Who's in the scene?") — separate pass.
- No keyboard shortcut work (noted for later).

### Files touched

- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — skip-ahead routing, nextLabel, visited tracking
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — BranchCard styling, summary chips, vocab, conditional step counter, gated ✓
- `src/features/brand-scenes/wizard/components/WizardLayout.tsx` (or footer file) — Look-only footer spacing tweak
