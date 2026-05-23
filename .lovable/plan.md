
# Improve Lingerie category in Brand Scenes wizard

Lingerie currently shares the generic interior options and a tiny moment list, and the prompt safeguards aren't strong enough — generations come out as random bedrooms with the model out of the hero garment. This plan upgrades the lingerie sub-family end-to-end without touching unrelated categories.

## Goals

1. Make the **interior / setting** picker for lingerie rich, visual and easy to choose from (not just 4 generic strings).
2. Add **lingerie-specific cast options**: poses, angles, framing, mood — surfaced only when sub-family is lingerie.
3. Improve **storytelling moments** (currently 4 entries) into a curated, named library.
4. Strengthen **prompt safeguards** so the model actually wears the lingerie set, not a robe or pajamas.

## 1. Setting / environment library (the "interior" picker)

Today `settingsBySubfamily.ts` for `fashion/lingerie` only exposes:
- `indoor_lifestyle`: 4 strings
- `studio`: 3 strings

Expand to a curated, photography-led pool grouped by scene_type so the user picks an interior by *name + vibe*, not by guessing:

- `indoor_lifestyle` (12 presets, each with a short vibe description):
  Bedroom morning · Velvet boudoir · Sunlit linen room · Marble bath edge · Hotel suite drape · Dressing-room mirror · Loft bedroom by window · Silk-curtain bay · Quiet hallway with sheers · Powder room corner · Walk-in closet bench · Reading nook chaise.
- `studio` (6 presets):
  Soft silk drape · Painted plaster wall · Cyclorama soft sweep · Pleated paper backdrop · Floating tulle veil · Hard-light split studio.
- `architectural` (4 presets):
  Marble bathhouse · Stone cloister · Brutalist concrete bedroom · Glass atrium banquette.

UX change in `SettingPicker`: when the active sub-family is lingerie, render each preset as a card with the **name + one-line vibe** (instead of a flat chip). This is a small additive variant — uses existing component, just a `descriptions?` prop sourced from a new map. Other categories keep their chip style.

Files:
- `src/features/brand-scenes/wizard/registry/settingsBySubfamily.ts` — expand `fashion/lingerie` pools.
- `src/features/brand-scenes/wizard/registry/settingDescriptions.ts` — new file: `{module/sub_family → {settingName → "one-line vibe"}}`.
- `src/features/brand-scenes/wizard/components/SettingPicker.tsx` — accept optional `descriptions` map; when present, render two-line card; otherwise current chip.
- `src/features/brand-scenes/wizard/steps/Step4Environment.tsx` — pass descriptions for the active sub-family.

## 2. Lingerie-specific cast: poses, angles, framing

Extend the per-sub-family resolver so lingerie surfaces a curated set instead of the generic global lists.

In `resolvePresets.ts` (or a new `castBySubfamily.ts`) add a `fashion/lingerie` overlay:

- **Poses** (lingerie-specific, replaces the generic CAST_ACTIONS list when sub_family = lingerie):
  Standing portrait · Hand on hip · Seated edge of bed · Lying on linen · Lying side-profile · Kneeling on bed · Stretching at window · Slip-strap adjust · Looking over shoulder · Back-to-camera contrapposto · Hands-in-hair · Sitting cross-legged.
- **Camera angles** (new field surfaced only for lingerie):
  Eye-level portrait · Slight high · Low-3/4 hero · Profile silhouette · Over-shoulder · Floor-up vertical · Tight bust crop · Full-body wide.
- **Framing presets** (lingerie chip row):
  Full body · 3/4 body · Bust crop · Hip-to-knee · Detail (strap/lace) · Silhouette only.
- **Mood/vibe** (lingerie chip row):
  Soft-romantic · Editorial-cool · Slow morning · Boudoir cinematic · Quiet luxury · Confident-modern.

These are wired into the `PeopleTab` / `InteractionTab` chip rows via the resolver — no new step, just richer chips when sub_family matches.

Files:
- `src/features/brand-scenes/wizard/registry/categoryPresets.ts` — add lingerie overlay (poses, angles, framing, vibes).
- `src/features/brand-scenes/wizard/registry/resolvePresets.ts` — expose the new arrays through `resolveAll(...)`.
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (`PeopleTab` + `InteractionTab`) — render lingerie-specific chips when arrays are non-empty.
- `src/features/brand-scenes/prompt/buildCastDirective.ts` + `assembleSceneDirective.ts` — emit `Camera angle:` and `Framing:` lines when set.

## 3. Storytelling moments — expanded lingerie library

Replace the 4-moment list in `storytellingBySubfamily.ts → fashion/lingerie` with a curated 16:
Slipping on a robe · Sitting on the bed edge · Standing by the window · Lying on linen sheets · Adjusting strap · Tying a sheer robe · Brushing hair at vanity · Reading in bed · Stretching at sunrise · Hand on neck · Looking down quietly · Walking through silk curtain · Sitting at vanity mirror · Reaching for perfume · Lacing a bodice · Tugging a slip strap.

## 4. Prompt safeguards — stronger hero-garment enforcement

In `subfamilyGuides.ts`, beef up `fashion/lingerie`:

```ts
wardrobe:
  "Model wears a well-fitted brand lingerie set as the hero garment — " +
  "matching bralette + briefs OR a slip / bodysuit / corset — fully visible, " +
  "on-body, fabric and lace texture readable. Pose framed so the lingerie " +
  "leads the image; supporting layers (silk robe, sheer kimono) may drape " +
  "but never cover the hero piece.",
safeguards: [
  "Do not render pajamas, oversized t-shirts, bathrobes, towels, loungewear, sweats, or bath wraps in place of the lingerie.",
  "Do not pixelate, blur or censor the lingerie; render true-to-fabric.",
  "Do not change the hero garment into swimwear or activewear.",
  "Avoid clichéd 'wet-look' or oily-skin rendering unless explicitly requested.",
],
```

Also assemble a small `lingerie-style guidance` block into PRODUCT FOCUS (skin tone fidelity, lace transparency handled tastefully, no over-glossy AI skin).

## 5. Out of scope

- No DB schema changes.
- No changes to other sub-families (swimwear, dresses, etc.) — they keep their current pools.
- No new wizard step / no admin UI changes.
- No credit / pricing changes.
- Visual `SettingPicker` description variant is additive — falls back to current chip style for every other category.

## Files touched (summary)

- `src/features/brand-scenes/wizard/registry/settingsBySubfamily.ts`
- `src/features/brand-scenes/wizard/registry/settingDescriptions.ts` (new)
- `src/features/brand-scenes/wizard/registry/storytellingBySubfamily.ts`
- `src/features/brand-scenes/wizard/registry/categoryPresets.ts`
- `src/features/brand-scenes/wizard/registry/resolvePresets.ts`
- `src/features/brand-scenes/wizard/registry/subfamilyGuides.ts`
- `src/features/brand-scenes/wizard/components/SettingPicker.tsx`
- `src/features/brand-scenes/wizard/steps/Step4Environment.tsx`
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
- `src/features/brand-scenes/prompt/buildCastDirective.ts`
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts`

## QA

- Open `/app/brand-scenes/new` → choose **Fashion → Lingerie**; verify Setting picker shows the new named interiors with one-line vibes.
- Verify People / Interaction tabs show lingerie poses, angles, framing, mood chips.
- Verify Storytelling moments list shows the new 16 options.
- Generate 3 variations and confirm the model wears lingerie (not a robe/pajamas) and the scene matches the chosen interior.
