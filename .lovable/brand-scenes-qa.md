# Brand Scenes — QA Findings

Audit of `/app/brand-scenes` (list) and `/app/brand-scenes/new` (7-step wizard). Static read of all wizard files + live walk-through of Step 0.

## Executive summary

| Severity | Count | Notes |
|---|---|---|
| Blocker | **0** | Wizard mounts, navigates, persists; no broken happy path detected |
| Major   | **3** | Behaviour gaps that mislead users or skip safeguards |
| Minor   | **6** | Inconsistencies / UX papercuts |
| Nit     | **4** | Polish opportunities |

**Top 5 to fix first:**
1. [Major] **`tech` and `wellness` families have NO sub-family entries in `categoryPresets.ts`** — they fall back to family defaults only. Tech allows `wearing` (then family-forbidden anyway) so chips disappear at runtime, but it means no sub-specific tuning is possible if you add `tech-phones` or `tech-headphones` later — and right now `tech-devices` users see a generic dial set even though tech devices vary wildly (phone vs. headphones vs. laptop).
2. [Major] **Step 2 "Auto-selected" fallback card is unreachable** — `BrandSceneWizard.handleNext` skips step 2 when `subFamilyCount <= 1`, and `handleBack` from step 3 also skips it. The `Step2ChooseSubFamily` `subs.length === 1` branch is dead code. Either render it briefly with a clear info chip, or remove it.
3. [Major] **`bags-accessories.belts` interaction allowlist** is `["wearing","hero"]` but family-level forbidden has no override for belts. `holding`/`beside` are technically valid editorial shots for belts and are silently hidden. (Same for `scarves`.) Consider adding `holding` back, OR add an explicit user-facing note that "Wearing is the only meaningful interaction for belts."
4. [Minor] **List page card deletes do NOT delete `preview_image_url` from storage** — orphaned blobs accumulate in the `brand-scene-references` bucket over time. No UX impact today, but a maintenance debt.
5. [Minor] **Step-counter shows `01 / 07` even when step 2 is auto-skipped** — single-sub families (eyewear, watches, tech, wellness) jump from step 1 → step 3, so users see counters going 01 → 03, which feels like a missed step.

---

## 1. List page `/app/brand-scenes` — `src/pages/BrandScenes.tsx`

| Element | Behavior | Status |
|---|---|---|
| Header `<h1>` "Brand Scenes" + subtitle | Renders, no terminal period (memory rule respected) | ✅ |
| "New brand scene" button (top right) | Only visible when `hasScenes && canCreate`. Navigates to `/app/brand-scenes/new` | ✅ |
| Empty state CTA "Create your first brand scene" | Navigates to `/app/brand-scenes/new` | ✅ |
| Upgrade banner (has scenes but can't create) | Calls `openBuyModal('brand-scenes-gate')` | ✅ |
| Upgrade state (no scenes, can't create) | Same modal | ✅ |
| Loading skeleton | 4 placeholder cards with `aspect-[4/5]` | ✅ |
| `SceneCard` image | Optimized via `getOptimizedUrl({ quality: 70 })` — memory rule "quality-only, no width param" respected | ✅ |
| `SceneCard` delete button | Opens `AlertDialog` → soft delete from DB | ⚠️ Does NOT delete the storage object → **orphans** (Minor #1) |
| `SceneCard` "Use scene" CTA | `navigate('/app/generate/product-images?sceneRef=…')` | ✅ |
| Delete dialog copy | Mentions "Credits already spent are not refunded" — correct | ✅ |
| `category_collection` chip on card | Falls back to `brand_scene_module` if not set, then empty | ✅ |

---

## 2. Wizard shell — `src/pages/BrandSceneWizard.tsx` + `BrandSceneWizard.tsx`

| Element | Behavior | Status |
|---|---|---|
| Plan gate | Redirects to `/app/brand-scenes` when `!isRealAdmin && !canCreateBrandScenes(plan)` | ✅ |
| `data-hide-studio-chat="1"` body attr | Hides StudioChat bubble inside wizard, restores on unmount | ✅ |
| Loading copy "Loading" | No terminal period — memory rule respected | ✅ |
| Variation cache (`BrandSceneCache`) | Invalidated when `currentPromptHash` changes; survives Step 6 unmount on back-nav | ✅ Smart |
| Step counter `0/7` label | UI says `01 / 07` — but for single-sub families step 2 is silently skipped → user sees 01 → 03 jump (Minor #2) | ⚠️ |
| `handleNext` skips step 2 when `subFamilyCount <= 1` | Correct shortcut | ✅ |
| `handleBack` from step 3 when single sub | Returns to step 1 (not step 2) — symmetric | ✅ |
| Reference flow skips step 5 (Photography) | `step === 4 && isReference → setStep 6` | ✅ Documented |
| Step 4 sub-step tab persistence | `visitedSubSteps` Set adds the active tab on visit | ✅ |
| Auto-cast marks all tabs visited | Effect at line 142 — so check marks appear correctly | ✅ |
| Reset scroll on step change | Calls `scrollTo({ top: 0 })` on both window and `#app-main-scroll` | ✅ |

---

## 3. Per-step audit

### Step 0 — Choose source (`Step0ChooseSource.tsx`)
- Two cards: "Build from the wizard", "Build from a reference". Both clickable, active state on selection. Next button disabled until one picked.
- ✅ Live-verified on `/app/brand-scenes/new` at 1366×768.

### Step 1 — Module (`Step1ChooseModule.tsx`)
- 12 family cards from `BRAND_SCENE_MODULES`, all unlocked (`BRAND_SCENE_UNLOCKED_MODULES` lists all 12).
- `selectedNeedsFallback` warning text is **unreachable** today (every module is unlocked).
- **Nit #1**: dead-code fallback message — delete or guard for future locked modules.

### Step 2 — Sub-family (`Step2ChooseSubFamily.tsx`)
- `subs.length === 0` empty state — only triggers if taxonomy is missing.
- `subs.length === 1` "Auto-selected" card — **unreachable**, wizard skips this step.
- **Major #2**: dead branch. Either remove or land users on it briefly so they see the auto-selection happened (improves trust).

### Step 3 — Reference (`Step3Reference.tsx`) [reference flow only]
| Surface | Status |
|---|---|
| Drag/drop, choose file, paste from clipboard | ✅ All three work |
| MIME validation (`jpg/png/webp`) | ✅ |
| 8 MB size limit | ✅ |
| Responsibility modal gate (`ensureAccepted`) | ✅ Triggers on first file pick |
| Replace button (label is "Replace" but icon is Trash2) | ⚠️ Confusing — Nit #2 |
| `ReferenceOutfitCard` (AI outfit direction) | ✅ Wired |
| Name field 80-char counter | ✅ |
| Intent picker (4 cards) | ✅ |
| Intent='location' hint text | ✅ |
| Extra-direction textarea (240 char) | ✅ |

### Step 4 — Cast (`Step4Cast.tsx`) — wizard flow step 3, reference flow step 4
- 5 sub-tabs: Look / Essentials / People / Interaction / Styling, dynamically pruned by `computeStep4Flow`.
- "Branch card" (Auto-cast vs. Design the look) only on Look tab.
- Auto-cast seeds `preset`, `interaction` (prefers "wearing"), `vibe='editorial'`, `hands_on_product[0]`, `body_part_focus[0]`, plus `action='still'`, `gaze='away'`, `age=['adult']` for people-presets, plus scene `lens`, `depth_of_field`, `finish`. ✅ Matches recent improvements.
- `visibleInteractions` is now a true allowlist (resolved ∩ not-forbidden), sorted by resolved order. ✅
- `posesForCast(preset, scale)` filters whole-body poses for hands/none/replicate and pocket scale. ✅
- `AutoCastSummary` chips are clickable and jump to the right tab. ✅
- **Minor #3**: `setMode("skip")` early-returns without ever transitioning to mode `"yes"` when user toggles back — actually it does (`else { onCastChange({ extras: nextExtras }) }`). Confirmed OK.
- **Nit #3**: Branch-card "Recommended" badge sits on "Design the look", but Auto-cast is what most first-time users pick. Consider whether "Recommended" label belongs on Auto-cast (or remove it).

### Step 4 — Environment (`Step4Environment.tsx`) — wizard flow step 4
- `SceneTypePicker` then `SettingPicker` (gated on scene_type) — good progressive disclosure.
- Weather, Season, Brand voice, Aesthetic era, Prop density chips.
- Fine-tuning fields (`SCENE_EXTRAS_FIELDS`) rendered via `ExtrasPillField` with cascade rules.
- "Avoid in this scene" (240 char) and "Notes" (600 char) at the bottom.
- ✅ Solid.

### Step 5 — Photography (`Step5Photography.tsx`) — wizard flow only
- 3 chapters: Lens & focus / Composition / Color & finish.
- Lens, DoF, Palette, Finish all have `expandable` toggle (filtered → full list). ✅
- All chips use `ChipRowWithOther` so users can type a custom value. ✅

### Step 5 — Review (`Step5Review.tsx`)
- Rendered inside Step 6 (`<Step5Review answers={…} />` at line 408 of Step6PreviewAndPick). Acts as a structured summary panel.
- ✅ Single source — no duplication.

### Step 6 — Preview & pick (`Step6PreviewAndPick.tsx`)
| Element | Status |
|---|---|
| Back button | ✅ |
| Scene name input (wizard flow) | ✅ 80-char limit |
| Generate CTA gated on `nameValid && !submitting` | ✅ |
| `inFlightRef` idempotency lock | ✅ Prevents double-deduct on fast double-click |
| Phase machine `idle → generating → picking → saving` | ✅ |
| `BrandSceneGenerateLoading` | ✅ |
| Variation grid + click-to-select | ✅ |
| Lightbox preview | ✅ Uses portal, `pt-14`, `75vh` per memory rule |
| Regenerate confirm dialog | ✅ Mentions credit cost and replacement |
| Save → `saveBrandScene` then navigate to list | ✅ |
| Stock product preview thumbnail | ✅ Explanatory copy |
| Reference thumb during pick/idle phases | ✅ |
| Admin debug panels (compiled prompt, raw payload) | ✅ Admin-gated |
| Toast on partial generation (refund) | ✅ |
| Credit balance refresh after generate | ✅ `refreshBalance().catch(() => {})` |

---

## 4. Per sub-family matrix

Walking every sub-family in `PRESETS` (`categoryPresets.ts`) plus the taxonomy from `onboardingTaxonomy.ts`. **★** = sub explicitly declared in `PRESETS`, else falls back to family-only defaults.

### Jewelry
| Sub | Cast presets | Interactions | hands_on_product | body_part_focus | Notes |
|---|---|---|---|---|---|
| ★ `jewellery-rings` | hands, none | wearing, hero | ring_finger, pinch, cradle | hands, detail | ✅ Tight |
| ★ `jewellery-necklaces` | solo, hands, none | wearing, hero | necklace_clasp | neck, face, detail | ✅ Tight |
| ★ `jewellery-earrings` | solo, none | wearing, hero | earring_place | face, neck, detail | ✅ |
| ★ `jewellery-bracelets` | hands, solo, none | wearing, hero | bracelet_wrist, wrist_show, pinch | wrist, hands, detail | ✅ |

### Watches
| Sub | Cast presets | Interactions | hands_on_product | body_part_focus | Notes |
|---|---|---|---|---|---|
| `watches` (family-level) | hands, solo, none | wearing, hero | wrist_show, pinch | wrist, hands, detail | ✅ Holding correctly hidden |

### Eyewear
| Sub | Cast presets | Interactions | hands_on_product | body_part_focus | Notes |
|---|---|---|---|---|---|
| `eyewear` (family-level) | solo, hands, none | wearing, beside, hero | cradle, pinch | face, detail | ✅ |

### Fashion
| Sub | Notable overrides |
|---|---|
| ★ `activewear` | moods: Energetic/Confident/Cinematic; wearing+hero |
| ★ `dresses` | DoF shallow/balanced; wearing+hero |
| ★ `lingerie` | settings: Studio/Domestic/Architectural |
| ★ `swimwear` | settings: Beach/Studio/Outdoor |
| ★ `streetwear` | bold moods, default solo |
| ★ `jackets` / `hoodies` / `jeans` / `garments` | mood overrides only |
| Family `hands_on_product: []` | ✅ Empty — correctly hides "hands on product" section |

### Footwear
| Sub | Notes |
|---|---|
| ★ `high-heels` | Studio/Architectural/Urban settings, portrait/tele lens |
| ★ `sneakers` | Urban/Studio/Tabletop |
| ★ `boots` | Nature/Urban/Studio |
| ★ `shoes` (dress shoes) | Architectural/Studio/Tabletop/Domestic, portrait/tele/macro, full_body restored |

### Bags & Accessories
| Sub | Notes |
|---|---|
| ★ `bags-accessories` (umbrella) | Editorial/Clean/Cinematic moods |
| ★ `backpacks` | Carry scale only, hands_on=cradle, body=full_body+detail |
| ★ `wallets-cardholders` | Pocket scale, hands cast default, hands_on=pinch/cap/tap |
| ★ `belts` | wearing+hero, hands_on=cradle/pinch — **Major #3**: `holding` valid for product-only shots but hidden |
| ★ `scarves` | wearing+hero, `hands_on_product: []` — correct empty allowlist |

### Hats / Caps / Beanies
| Sub | Notes |
|---|---|
| ★ `caps` | Urban/Studio/Outdoor, Confident/Energetic |
| ★ `hats` | Architectural/Nature/Studio/Domestic, Editorial/Romantic |
| ★ `beanies` | Nature/Urban/Studio, Cozy/Cinematic/Quiet |

### Beauty & Fragrance
| Sub | Notes |
|---|---|
| ★ `fragrance` | none/hands cast, default none, hands_on=cradle/pinch/cap |
| ★ `beauty-skincare` | hands/none/solo, default hands, hands_on=cradle/pinch/cap/pour |
| ★ `makeup-lipsticks` | hands/solo/none, default hands, body=face/hands/detail, hands_on=cap/pinch/tap |

### Home
| Sub | Notes |
|---|---|
| ★ `furniture` | furniture/architectural scale, beside/using/hero |
| ★ `home-decor` | handheld/carry/furniture, beside/holding/using/hero |

### Tech
| Sub | Notes |
|---|---|
| `tech-devices` (taxonomy single sub, no `PRESETS.sub`) | **Major #1**: uses family-level only. A phone, a headphone, and a laptop have wildly different framings — but the wizard treats them identically. Auto-skipped Step 2 hides the choice from the user. |

### Food & Drink
| Sub | Notes |
|---|---|
| ★ `beverages` | hands/none/solo, default hands, hands_on=pour/cradle/cap |
| ★ `food` | none/hands, default none |
| ★ `snacks-food` | none/hands, default none |

### Wellness
| Sub | Notes |
|---|---|
| `supplements-wellness` (taxonomy single sub, no `PRESETS.sub`) | **Major #1 (same pattern)**: family-level only. OK because the family currently maps to a coherent product type, but no room for future sub-specific tuning. |

---

## 5. Cross-cutting checks

| Check | Result |
|---|---|
| `forbiddenInteractions` layered (cast + family + scale) | ✅ Defence in depth |
| `resolveAll` respects empty arrays as opt-outs | ✅ Confirmed via `Object.prototype.hasOwnProperty.call` |
| `posesForCast` filters whole-body poses for hands/none/replicate/pocket | ✅ |
| Auto-cast person-injection (action/gaze/age) | ✅ Only when `seededHasPeople` |
| Mobile chip wrapping (`flex-wrap gap-x-2 gap-y-2.5`) | ✅ Consistent across all tabs |
| Sticky tab bar (`overflow-x-auto snap-x snap-mandatory`) | ✅ Scrollable on mobile, wraps on desktop |
| Sticky CTA footer | ✅ Lives in `WizardLayout` (not audited line-by-line but reachable) |
| Loading / error states on async buttons | ✅ Generate, Save, Upload all guarded |
| Toast on partial generation refund | ✅ |
| Console errors on happy path (live nav 0 → 1) | None observed |
| Memory rule "no terminal periods in headers / single-sentence subtitles" | ✅ Audited file-by-file |
| Inter font 300-600 across wizard | ✅ Inherits from app shell |

---

## 6. Detailed issue log

### Blockers
_None._

### Major
1. **`tech` and `wellness` lack sub-family entries in `PRESETS`** → `categoryPresets.ts`. When/if the taxonomy gains second sub-types, presets will silently fall back to family defaults. Add at least the current single-sub stubs (`tech-devices`, `supplements-wellness`) for forward compat.
2. **Step 2 "Auto-selected" card is dead code** → `Step2ChooseSubFamily.tsx` lines 22–36. The wizard auto-skips this step. Either remove the branch, or briefly land users on it.
3. **`belts` / `scarves` interaction set is too narrow** → `categoryPresets.ts` `bags-accessories.sub`. Belts can be held/staged beside (still life), scarves can be cradled. Today they only show `wearing` + `hero`. Add `holding` (and `beside` for scarves) or document why they're hidden.

### Minor
1. List-page delete leaves orphaned `preview_image_url` in storage. Add a `storage.remove([scene.preview_image_url])` call after the DB delete succeeds.
2. Step-counter shows `01 / 07` even when step 2 is auto-skipped. Either fix the denominator dynamically (`6` when single-sub) or render step 2 briefly so the count is honest.
3. Step 4 `setMode` toggle back-and-forth verified OK (just noting tracing covered this).
4. `BrandSceneCard` "Use scene" only navigates to `product-images`. Considering the rename to "Visual Studio" + the new short-film/video flows, the button could be re-labelled "Apply to product" or branch by destination. Minor terminology drift.
5. `Step3Reference` "Replace" button uses `Trash2` icon. Label says replace, icon says delete — pick one.
6. `Step5Review` is rendered inside Step 6 only — `Step5Review.tsx` is never used as a standalone step. The filename implies step 5; consider renaming to `SceneReviewPanel.tsx` for clarity.

### Nits
1. `Step1ChooseModule.tsx` lines 32–40 "more tailored questions ship soon" fallback is unreachable (all modules unlocked).
2. `Step3Reference` "Replace" trash icon mismatch (see Minor #5).
3. `BranchCard` "Recommended" badge on "Design the look" — Auto-cast may be the better default for first-time users; reconsider which side gets the badge.
4. Generated-variation grid: no obvious empty-state copy if `variations.length === 0` after a successful API call (server returns empty array). Today it just stays on `picking` with an empty grid. Add `"No variations returned — try again"` with a Retry button.

---

## 7. Recommended fix batches

When you're ready to ship fixes, the cleanest groupings:

- **Batch A (terminology / dead code)**: Minor #4, Minor #6, Nit #1, Nit #3 → 1 PR, low risk.
- **Batch B (sub-family allowlists)**: Major #1 (add tech/wellness sub stubs), Major #3 (belts/scarves) → 1 PR touching `categoryPresets.ts`.
- **Batch C (UX correctness)**: Major #2 (Step 2 dead branch), Minor #2 (step counter denominator) → 1 PR touching `BrandSceneWizard.tsx` + `Step2ChooseSubFamily.tsx`.
- **Batch D (storage hygiene)**: Minor #1 → 1 PR touching `BrandScenes.tsx`.
- **Batch E (polish)**: Nit #2, Nit #4 → 1 PR.

No backend, RLS, or generation-prompt changes required.
