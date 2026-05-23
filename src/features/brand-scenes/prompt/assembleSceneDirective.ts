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

  // ----- REFERENCE -----
  const refLine =
    answers.source === "reference"
      ? buildReferenceDirective(answers.reference_intent)
      : "";
  if (refLine) reference.push(refLine);

  // ----- SUBJECT (cast + scale) -----
  if (answers.cast) subject.push(buildCastDirective(answers.cast));
  if (answers.scale) {
    subject.push(
      buildScaleDirective(answers.scale, { castPreset: answers.cast?.preset }),
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
  const realism = metaX(REALISM_LEVELS, base.realism);
  if (realism) moodParts.push(realism.directive);
  if (moodParts.length) scene.push(`Mood: ${moodParts.join(" — ")}.`);

  // Lighting + shadows → scene
  const lightingParts: string[] = [];
  if (base.lighting) lightingParts.push(base.lighting);
  const shadow = metaX(SHADOWS, base.shadows);
  if (shadow) lightingParts.push(shadow.directive);
  if (lightingParts.length) scene.push(`Lighting: ${lightingParts.join(" — ")}.`);

  // ----- CAMERA & FRAMING -----
  const lensMeta = meta(SCENE_LENSES, base.lens);
  const dofMeta = meta(SCENE_DEPTH_OF_FIELD, base.depth_of_field);
  if (lensMeta || dofMeta) {
    const camParts: string[] = [];
    if (lensMeta) camParts.push(`Camera: ${lensMeta.directive}`);
    if (dofMeta) camParts.push(`Depth of field: ${dofMeta.directive}`);
    camera.push(camParts.join(" — ") + ".");
  }

  // Framing + composition + negative space → camera
  const composeParts: string[] = [];
  if (base.framing) composeParts.push(base.framing);
  const composition = metaX(COMPOSITIONS, base.composition);
  if (composition) composeParts.push(composition.directive);
  const negSpace = metaX(NEG_SPACE_INTENTS, base.negative_space_intent);
  if (negSpace && negSpace.directive) composeParts.push(negSpace.directive);
  if (composeParts.length) camera.push(`Framing: ${composeParts.join(" — ")}.`);

  const focus = metaX(SUBJECT_FOCUSES, base.subject_focus);
  if (focus) camera.push(`Subject focus: ${focus.directive}.`);

  // ----- COLOR & FINISH -----
  const paletteDirective =
    base.palette_custom ?? meta(SCENE_PALETTES, base.palette_preset)?.directive;
  const colorParts: string[] = [];
  if (paletteDirective) colorParts.push(paletteDirective);
  const contrast = metaX(COLOR_CONTRASTS, base.color_contrast);
  if (contrast) colorParts.push(contrast.directive);
  const saturation = metaX(SATURATIONS, base.saturation);
  if (saturation) colorParts.push(saturation.directive);
  if (colorParts.length) color.push(`Color: ${colorParts.join(" — ")}.`);

  const finishMeta = meta(SCENE_FINISHES, base.finish);
  if (finishMeta) color.push(`Finish: ${finishMeta.directive}.`);

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
  if (castExtras.ethnicity?.trim()) {
    castDetails.push(`- Ethnicity: ${castExtras.ethnicity.trim()}.`);
  }
  for (const f of CAST_EXTRAS_FIELDS) {
    const v = castExtras[f.key];
    if (v && v.trim()) castDetails.push(`- ${f.prefix}: ${v.trim()}.`);
  }
  const knownCastKeys = new Set<string>([
    ...CAST_EXTRAS_FIELDS.map((f) => f.key),
    "ethnicity",
    "design_specific_look",
  ]);
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
  // Always append the standard hard-negative clause when the section emits.
  negative.push(
    "Do not render text, captions, logos, watermarks, UI chrome, or extra products.",
  );

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
    "You are a commercial product-photography art director. Generate ONE photoreal hero image for an e-commerce brand scene. Editorial quality, natural materials and lighting, true-to-life proportions. Aspect ratio 4:5 portrait — REQUIRED. No text, captions, logos, watermarks, or UI chrome.",
  );
  out.push("");

  push("SUBJECT", subject);
  push("SCENE", scene);
  push("CAMERA & FRAMING", camera);
  push("COLOR & FINISH", color);
  push("STYLING DETAILS", styling);
  push("CAST DETAILS", castDetails);
  push("OUTPUT", output);
  push("NEGATIVE", negative);
  push("NOTES", notes);
  push("REFERENCE", reference);
  push("NAME", name);

  // Trim trailing blank line.
  while (out.length && out[out.length - 1] === "") out.pop();

  return out.join("\n");
}
