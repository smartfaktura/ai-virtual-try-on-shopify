import type { BrandSceneAnswers } from "../types";
import { buildCastDirective } from "./buildCastDirective";
import { buildScaleDirective } from "./buildScaleDirective";
import { buildReferenceDirective } from "./buildReferenceDirective";
import {
  SCENE_LENSES,
  SCENE_DEPTH_OF_FIELD,
  SCENE_PALETTES,
  SCENE_FINISHES,
  meta,
} from "../wizard/constants/scene";
import {
  SURFACES,
  COLOR_CONTRASTS,
  SATURATIONS,
  SHADOWS,
  COMPOSITIONS,
  NEG_SPACE_INTENTS,
  AESTHETIC_ERAS,
  REALISM_LEVELS,
  BRAND_VOICES,
  OUTPUT_USE_CASES,
  SUBJECT_FOCUSES,
  PROP_DENSITY_LABELS,
  metaX,
} from "../wizard/constants/sceneExtras";
import {
  SCENE_EXTRAS_FIELDS,
  CAST_EXTRAS_FIELDS,
} from "../wizard/constants/extras";
import {
  OUTFIT_VIBES,
  OUTFIT_TOPS,
  OUTFIT_BOTTOMS,
  OUTFIT_FOOTWEAR,
} from "../wizard/constants/outfit";
import { resolveSubfamilyGuide } from "../wizard/registry/subfamilyGuides";
import {
  LINGERIE_CAMERA_ANGLES,
  LINGERIE_FRAMINGS,
  LINGERIE_MOODS,
} from "../wizard/registry/lingerieCast";
import { CAST_PRESETS_WITH_PEOPLE } from "../wizard/constants/cast";

/**
 * Canonical scene-directive assembler. Produces a structured, Gemini/Nano
 * Banana-friendly prompt: explicit ROLE, prose-style SUBJECT/SCENE/CAMERA/
 * COLOR sections, bulleted STYLING + CAST detail lists, and an always-on
 * negative tail clause. Sections with no data are omitted.
 *
 * Individual canonical fragments (e.g. "Setting: ...", "Camera: 50mm portrait")
 * are preserved so downstream grep-style tests and matchers continue to work.
 *
 * Aspect ratio is HARD-CODED to 4:5.
 */
export function assembleSceneDirective(answers: BrandSceneAnswers): string {
  const base = answers.base ?? {};

  // ---- Per-section line buckets ----
  const subject: string[] = [];
  const scene: string[] = [];
  const camera: string[] = [];
  const color: string[] = [];
  const styling: string[] = [];
  const castDetails: string[] = [];
  const output: string[] = [];
  const negative: string[] = [];
  const notes: string[] = [];
  const reference: string[] = [];
  const name: string[] = [];
  const productFocus: string[] = [];

  // ----- PRODUCT FOCUS (sub-family-aware wardrobe / hero-piece directive) -----
  const guide = resolveSubfamilyGuide(answers.module, answers.sub_family);
  const castHasPeople = !!(
    answers.cast && CAST_PRESETS_WITH_PEOPLE.includes(answers.cast.preset as any)
  );
  // Jewelry / watches use the "hands" preset for worn-on-body shots; still emit
  // the placement guide so the piece doesn't render floating beside the hand.
  const guideShouldFire = !!guide && (castHasPeople || answers.cast?.preset === "hands");
  if (guideShouldFire) {
    productFocus.push(guide!.wardrobe);
  }

  // ----- REFERENCE -----
  const refLine =
    answers.source === "reference"
      ? buildReferenceDirective(answers.reference_intent)
      : "";
  if (refLine) reference.push(refLine);

  // ----- SUBJECT (cast + scale) -----
  if (answers.cast?.preset) {
    subject.push(buildCastDirective(answers.cast as Parameters<typeof buildCastDirective>[0]));
  }
  if (answers.scale?.preset) {
    subject.push(
      buildScaleDirective(answers.scale as Parameters<typeof buildScaleDirective>[0], {
        castPreset: answers.cast?.preset,
      }),
    );
  }

  // ----- SCENE -----
  if (base.scene_type) scene.push(`Scene type: ${base.scene_type.replace(/_/g, " ")}.`);
  else if (base.aesthetic) scene.push(`Scene type: ${base.aesthetic}.`);

  if (base.setting) {
    const surface = metaX(SURFACES, base.surface);
    scene.push(
      `Setting: ${base.setting}${surface ? ` on ${surface.directive}` : ""}.`,
    );
  } else if (base.surface) {
    const surface = metaX(SURFACES, base.surface)!;
    scene.push(`Surface: ${surface.directive}.`);
  }

  if (base.weather) scene.push(`Weather: ${base.weather}.`);
  if (base.season && base.season !== "seasonless") {
    scene.push(`Season: ${base.season}.`);
  }

  // Mood / brand voice / era / realism
  const moodParts: string[] = [];
  if (base.mood) moodParts.push(base.mood);
  const voice = metaX(BRAND_VOICES, base.brand_voice);
  if (voice) moodParts.push(voice.directive);
  const era = metaX(AESTHETIC_ERAS, base.aesthetic_era);
  if (era) moodParts.push(era.directive);
  const realismDirective =
    base.realism_custom ?? metaX(REALISM_LEVELS, base.realism)?.directive;
  if (realismDirective) moodParts.push(realismDirective);
  if (moodParts.length) scene.push(`Mood: ${moodParts.join(" — ")}.`);

  // Lighting + shadows → scene
  const lightingParts: string[] = [];
  if (base.lighting) lightingParts.push(base.lighting);
  const shadowDirective =
    base.shadows_custom ?? metaX(SHADOWS, base.shadows)?.directive;
  if (shadowDirective) lightingParts.push(shadowDirective);
  if (lightingParts.length) scene.push(`Lighting: ${lightingParts.join(" — ")}.`);

  // ----- CAMERA & FRAMING -----
  const lensDirective =
    base.lens_custom ?? meta(SCENE_LENSES, base.lens)?.directive;
  const dofDirective =
    base.depth_of_field_custom ?? meta(SCENE_DEPTH_OF_FIELD, base.depth_of_field)?.directive;
  if (lensDirective || dofDirective) {
    const camParts: string[] = [];
    if (lensDirective) camParts.push(`Camera: ${lensDirective}`);
    if (dofDirective) camParts.push(`Depth of field: ${dofDirective}`);
    camera.push(camParts.join(" — ") + ".");
  }

  // Framing + composition + negative space → camera
  const composeParts: string[] = [];
  if (base.framing) composeParts.push(base.framing);
  const compositionDirective =
    base.composition_custom ?? metaX(COMPOSITIONS, base.composition)?.directive;
  if (compositionDirective) composeParts.push(compositionDirective);
  const negSpaceDirective =
    base.negative_space_intent_custom ??
    metaX(NEG_SPACE_INTENTS, base.negative_space_intent)?.directive;
  if (negSpaceDirective) composeParts.push(negSpaceDirective);
  if (composeParts.length) camera.push(`Framing: ${composeParts.join(" — ")}.`);

  const focusDirective =
    base.subject_focus_custom ?? metaX(SUBJECT_FOCUSES, base.subject_focus)?.directive;
  if (focusDirective) camera.push(`Subject focus: ${focusDirective}.`);

  // ----- COLOR & FINISH -----
  const paletteDirective =
    base.palette_custom ?? meta(SCENE_PALETTES, base.palette_preset)?.directive;
  const colorParts: string[] = [];
  if (paletteDirective) colorParts.push(paletteDirective);
  const contrastDirective =
    base.color_contrast_custom ?? metaX(COLOR_CONTRASTS, base.color_contrast)?.directive;
  if (contrastDirective) colorParts.push(contrastDirective);
  const saturationDirective =
    base.saturation_custom ?? metaX(SATURATIONS, base.saturation)?.directive;
  if (saturationDirective) colorParts.push(saturationDirective);
  if (colorParts.length) color.push(`Color: ${colorParts.join(" — ")}.`);

  const finishDirective =
    base.finish_custom ?? meta(SCENE_FINISHES, base.finish)?.directive;
  if (finishDirective) color.push(`Finish: ${finishDirective}.`);

  // ----- STYLING DETAILS (scene extras: backdrop, floor, camera-angle, light, motion…) -----
  const sceneExtras = base.extras ?? {};
  for (const f of SCENE_EXTRAS_FIELDS) {
    const v = sceneExtras[f.key];
    if (v && v.trim()) styling.push(`- ${f.prefix}: ${v.trim()}.`);
  }
  const knownSceneKeys = new Set(SCENE_EXTRAS_FIELDS.map((f) => f.key));
  for (const [k, v] of Object.entries(sceneExtras)) {
    if (!knownSceneKeys.has(k) && v?.trim()) {
      styling.push(`- Style (${k}): ${v.trim()}.`);
    }
  }

  // ----- CAST DETAILS -----
  const castExtras = answers.cast?.extras ?? {};
  const modelLocked = !!answers.cast?.model_ref;
  if (!modelLocked && castExtras.ethnicity?.trim()) {
    castDetails.push(`- Ethnicity: ${castExtras.ethnicity.trim()}.`);
  }
  for (const f of CAST_EXTRAS_FIELDS) {
    if (modelLocked && f.key === "build") continue;
    const v = castExtras[f.key];
    if (v && v.trim()) castDetails.push(`- ${f.prefix}: ${v.trim()}.`);
  }
  const knownCastKeys = new Set<string>([
    ...CAST_EXTRAS_FIELDS.map((f) => f.key),
    "ethnicity",
    "design_specific_look",
    "lingerie_camera_angle",
    "lingerie_framing",
    "lingerie_mood",
  ]);

  // Lingerie-specific structured extras → human-readable directive lines.
  const angle = LINGERIE_CAMERA_ANGLES.find((a) => a.value === castExtras.lingerie_camera_angle);
  if (angle) castDetails.push(`- Camera angle: ${angle.directive}.`);
  const framing = LINGERIE_FRAMINGS.find((f) => f.value === castExtras.lingerie_framing);
  if (framing) castDetails.push(`- Framing: ${framing.directive}.`);
  const lingerieMood = LINGERIE_MOODS.find((m) => m.value === castExtras.lingerie_mood);
  if (lingerieMood) castDetails.push(`- Mood: ${lingerieMood.directive}.`);

  for (const [k, v] of Object.entries(castExtras)) {
    if (!knownCastKeys.has(k) && v?.trim()) {
      castDetails.push(`- Cast style (${k}): ${v.trim()}.`);

    }
  }

  // Outfit-direction quiz → single "Outfit:" line.
  const outfit = answers.cast?.outfit;
  if (outfit) {
    const outfitParts: string[] = [];
    const pickSlot = (
      slot: { preset?: string; custom?: string } | undefined,
      options: ReadonlyArray<{ value: string; directive: string }>,
      suffix: string,
    ) => {
      if (!slot) return;
      const custom = slot.custom?.trim();
      if (custom) {
        outfitParts.push(`${custom}${suffix ? ` ${suffix}` : ""}`);
        return;
      }
      const match = options.find((o) => o.value === slot.preset);
      if (match && match.directive) outfitParts.push(match.directive);
    };
    pickSlot(outfit.vibe, OUTFIT_VIBES, "vibe");
    pickSlot(outfit.top, OUTFIT_TOPS, "top");
    pickSlot(outfit.bottom, OUTFIT_BOTTOMS, "");
    pickSlot(outfit.footwear, OUTFIT_FOOTWEAR, "");
    if (outfitParts.length) {
      castDetails.push(`- Outfit: ${outfitParts.join(", ")}.`);
    }
  }

  // Outfit direction analyzed from the reference image — only when people are
  // in the scene. Manual outfit slots above still take precedence (printed first).
  const refOutfit = answers.reference_outfit?.description?.trim();
  if (refOutfit && castHasPeople) {
    castDetails.push(`- Outfit direction (from reference): ${refOutfit}`);
  }




  // ----- OUTPUT -----
  output.push("Aspect ratio: 4:5 (portrait, vertical) — REQUIRED.");
  if (typeof base.prop_density === "number") {
    output.push(
      `Prop density: ${PROP_DENSITY_LABELS[base.prop_density]} (level ${base.prop_density}/4).`,
    );
  }
  const useCase = metaX(OUTPUT_USE_CASES, base.output_use_case);
  if (useCase) output.push(`Output: ${useCase.directive}.`);

  // ----- NEGATIVE -----
  const avoid = base.avoid?.trim() || answers.negative_note?.trim();
  if (avoid) negative.push(`Avoid: ${avoid}.`);
  // Positive phrasing — Gemini 3 Pro Image treats listed nouns as topics, so
  // we avoid words like "logos" / "watermarks" that trigger SAFETY_BLOCKED:OTHER.
  negative.push(
    "Keep the frame clean and unbranded: a single hero product, plain surfaces, no overlaid graphics or signage.",
  );
  // Location-lock hardening — prevents the model from collapsing into a
  // tight headshot with a generic background and losing the reference scene.
  if (answers.source === "reference" && answers.reference_intent === "location") {
    negative.push(
      "Do not output a tight headshot or closeup that hides the reference environment — the reference location MUST be clearly visible around the subject in every variation.",
    );
    negative.push(
      "Do not invent a new room, studio, or background; reuse the reference scene only.",
    );
  }
  if (guideShouldFire) {
    for (const s of guide!.safeguards) negative.push(s);
  }


  // ----- NOTES -----
  if (base.notes?.trim()) notes.push(`Notes: ${base.notes.trim()}.`);

  // ----- NAME -----
  if (answers.name?.trim()) name.push(`Scene name: ${answers.name.trim()}.`);

  // ----- Compose final string with section headers -----
  const out: string[] = [];
  const push = (header: string, lines: string[]) => {
    const filtered = lines.filter(Boolean);
    if (!filtered.length) return;
    out.push(header);
    for (const l of filtered) out.push(l);
    out.push(""); // blank spacer between sections
  };

  // Role header — stronger directive for Gemini / Nano Banana image models.
  out.push("ROLE");
  out.push(
    "You are a commercial product-photography art director. Generate ONE photoreal hero image for an e-commerce brand scene. Editorial quality, natural materials and lighting, true-to-life proportions. Aspect ratio 4:5 portrait — REQUIRED. Clean, unbranded composition with a single hero product.",
  );
  out.push("");

  // REFERENCE goes FIRST (right after ROLE) — promoted from the bottom of
  // the prompt so the model treats the uploaded image as the dominant
  // constraint rather than a trailing afterthought.
  push("REFERENCE", reference);
  push("PRODUCT FOCUS", productFocus);

  push("SUBJECT", subject);
  push("SCENE", scene);
  push("CAMERA & FRAMING", camera);
  push("COLOR & FINISH", color);
  push("STYLING DETAILS", styling);
  push("CAST DETAILS", castDetails);
  push("OUTPUT", output);
  push("NEGATIVE", negative);
  push("NOTES", notes);
  // REFERENCE is intentionally promoted to the TOP of the prompt (right after
  // ROLE) so Gemini treats it as the dominant constraint. Without this, the
  // model often ignored the reference and produced a portrait on a generic
  // background. See buildReferenceDirective for the per-intent wording.
  push("NAME", name);


  // Trim trailing blank line.
  while (out.length && out[out.length - 1] === "") out.pop();

  return out.join("\n");
}
