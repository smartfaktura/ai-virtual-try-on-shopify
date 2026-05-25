# Brand Scenes — full QA sweep

A slow, methodical audit of `/app/brand-scenes` (list) and `/app/brand-scenes/new` (7-step wizard) covering every button, every sub-category, and every option chip — producing a written findings doc first, then targeted fixes.

## Scope

| Surface | Files | LoC |
|---|---|---|
| List page `/app/brand-scenes` | `src/pages/BrandScenes.tsx` | 330 |
| Wizard shell `/app/brand-scenes/new` | `src/pages/BrandSceneWizard.tsx` | 43 |
| Step 0 — Choose source | `Step0ChooseSource.tsx` | 30 |
| Step 1 — Module | `Step1ChooseModule.tsx` | 43 |
| Step 2 — Sub-family | `Step2ChooseSubFamily.tsx` | 52 |
| Step 3 — Reference | `Step3Reference.tsx` | 340 |
| Step 4 — Cast / Environment / Module Qs | 3 files | ~1850 |
| Step 5 — Photography / Review | 2 files | ~580 |
| Step 6 — Preview & Pick | `Step6PreviewAndPick.tsx` | 515 |
| Registries | `categoryPresets`, `subfamilyGuides`, `settingsBySubfamily`, `storytellingBySubfamily`, `resolvePresets`, `lingerieCast` | ~1500 |
| Constants | `cast`, `scale`, `scene`, `extras`, `sceneExtras`, `outfit`, `stockOverrides` | ~600 |

## QA process (phases)

### Phase 1 — Inventory & static audit (read-only, no code changes)

Produce `.lovable/brand-scenes-qa.md` with:

1. **List page checklist** — every button/CTA on `/app/brand-scenes`:
   - "New scene", filters, sort, card actions (open, duplicate, delete), pagination, empty state, loading skeleton.
   - For each: expected behavior, observed behavior, status (✅ / ⚠️ / ❌).

2. **Wizard nav** — Back / Next / Skip / step-jump on every step, plus auto-save / draft restore.

3. **Per-step audit**, in order:
   - **Step 0** — source mode buttons.
   - **Step 1** — module tiles, recommended badge.
   - **Step 2** — sub-family list, search/filter, "Other" path.
   - **Step 3** — reference upload, multi-angle slots, paste URL, remove, replace, validation.
   - **Step 4 (Cast)** — preset chips, scale chips, interaction chips, gesture chips, pose chips, vibe, action, gaze, body-part-focus, **Skip / Auto-cast**. Verify each is filtered by sub-family (per recent allowlist work).
   - **Step 4 (Environment)** — setting picker, time-of-day, weather, props, surface, palette, lighting.
   - **Step 4 (Module Qs)** — per-module question rendering.
   - **Step 5 (Photography)** — lens, aspect ratio, DoF, finish, framing, camera angle, height.
   - **Step 5 (Review)** — directive preview, edit-jump links.
   - **Step 6 (Preview & Pick)** — generate, retry, pick winner, refine, download, save to library, credit cost.

4. **Per sub-family matrix** — for each sub-family declared in `categoryPresets.ts`, list:
   - Allowed interactions / gestures / poses / body-part-focus.
   - Any allowed value that is logically impossible for that sub-family (the original bug pattern).
   - Missing options the user would expect.

   Sub-families to walk through: apparel (tops/bottoms/outerwear/dresses/activewear/swim/lingerie), footwear (sneakers/boots/heels/sandals), bags (totes/backpacks/clutches/crossbody), eyewear (sunglasses/optical), hats, jewelry (rings/necklaces/earrings/bracelets), watches, beauty (fragrance/skincare/makeup), home, electronics, fashion-misc.

5. **Cross-cutting checks**:
   - Forbidden combinations actually enforced (`combinationGuards.ts`).
   - Empty-array allowlist behavior (recent `resolvePresets` change).
   - Person-injection on hands-only presets.
   - Mobile viewport (≤640px) chip wrapping, sticky CTAs.
   - Loading / error / disabled states on every async button.
   - Console errors / warnings during a full happy-path run.

### Phase 2 — Live browser walkthrough

Using the browser tool at viewport 930×809 and 390×844:
- Walk every step for **3 representative sub-families** (rings, sneakers, fragrance) end-to-end.
- Capture screenshots of any visual/UX issue and append to the QA doc with severity (Blocker / Major / Minor / Nit).
- Note any console errors via `read_console_logs`.

### Phase 3 — Findings report

Final `.lovable/brand-scenes-qa.md` sections:
- Executive summary (counts by severity).
- Blocker / Major / Minor / Nit tables, each row: file → line → issue → suggested fix.
- Per sub-family matrix from Phase 1.

### Phase 4 — Targeted fixes (separate confirmation)

After you review the report, we agree which findings to fix and ship them in batched, minimal edits. No code changes happen in Phases 1–3.

## Out of scope

- Backend / edge function changes.
- Generation prompt rewrites beyond fixing allowlist / placement bugs.
- Visual redesign — only UX bugs and inconsistencies.
- Adding new sub-families or new options.

## Deliverables

1. `.lovable/brand-scenes-qa.md` — the full findings doc.
2. A short summary in chat with severity counts and the top 5 issues.
3. A follow-up fix plan you approve before any edits.

## Clarifying question (before I start)

Two ways to run this — pick one:

- **A. Full sweep** — every sub-family in the matrix (≈12). Slower, ~30–45 min of tool calls, most thorough.
- **B. Targeted sweep** — focus on the 3–5 sub-families you care about most (e.g. jewelry, watches, eyewear, footwear, fragrance). Faster, ~10–15 min.

If you don't specify, I'll default to **A (full sweep)** since you asked for "slow but good QA".
