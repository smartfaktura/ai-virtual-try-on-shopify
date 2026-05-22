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
 * Canonical-order assembler. Skips empty sections; returns a single
 * newline-joined string suitable for direct use in a prompt.
 * Aspect ratio is HARD-CODED to 4:5.
 */
export function assembleSceneDirective(answers: BrandSceneAnswers): string {
  const lines: string[] = [];
  const base = answers.base ?? {};

  const refLine =
    answers.source === "reference"
      ? buildReferenceDirective(answers.reference_intent)
      : "";
  if (refLine) lines.push(refLine);

  if (base.scene_type) lines.push(`Scene type: ${base.scene_type.replace(/_/g, " ")}.`);
  else if (base.aesthetic) lines.push(`Scene type: ${base.aesthetic}.`);

  // Setting + surface
  if (base.setting) {
    const surface = metaX(SURFACES, base.surface);
    lines.push(
      `Setting: ${base.setting}${surface ? ` on ${surface.directive}` : ""}.`,
    );
  } else if (base.surface) {
    const surface = metaX(SURFACES, base.surface)!;
    lines.push(`Surface: ${surface.directive}.`);
  }

  if (base.weather) lines.push(`Weather: ${base.weather}.`);
  if (base.season && base.season !== "seasonless") {
    lines.push(`Season: ${base.season}.`);
  }
  if (base.time_of_day) lines.push(`Time of day: ${base.time_of_day}.`);

  // Mood / brand voice / era / realism
  const moodParts: string[] = [];
  if (base.mood) moodParts.push(base.mood);
  const voice = metaX(BRAND_VOICES, base.brand_voice);
  if (voice) moodParts.push(voice.directive);
  const era = metaX(AESTHETIC_ERAS, base.aesthetic_era);
  if (era) moodParts.push(era.directive);
  const realism = metaX(REALISM_LEVELS, base.realism);
  if (realism) moodParts.push(realism.directive);
  if (moodParts.length) lines.push(`Mood: ${moodParts.join(" — ")}.`);

  // Lighting + shadows
  const lightingParts: string[] = [];
  if (base.lighting) lightingParts.push(base.lighting);
  const shadow = metaX(SHADOWS, base.shadows);
  if (shadow) lightingParts.push(shadow.directive);
  if (lightingParts.length) lines.push(`Lighting: ${lightingParts.join(" — ")}.`);

  // Camera + DoF
  const lensMeta = meta(SCENE_LENSES, base.lens);
  const dofMeta = meta(SCENE_DEPTH_OF_FIELD, base.depth_of_field);
  if (lensMeta || dofMeta) {
    const camParts: string[] = [];
    if (lensMeta) camParts.push(`Camera: ${lensMeta.directive}`);
    if (dofMeta) camParts.push(`Depth of field: ${dofMeta.directive}`);
    lines.push(camParts.join(" — ") + ".");
  }

  // Framing + composition + negative space
  const composeParts: string[] = [];
  if (base.framing) composeParts.push(base.framing);
  const composition = metaX(COMPOSITIONS, base.composition);
  if (composition) composeParts.push(composition.directive);
  const negSpace = metaX(NEG_SPACE_INTENTS, base.negative_space_intent);
  if (negSpace && negSpace.directive) composeParts.push(negSpace.directive);
  if (composeParts.length) lines.push(`Framing: ${composeParts.join(" — ")}.`);

  lines.push("Aspect ratio: 4:5 (portrait, vertical) — REQUIRED.");

  // Palette + contrast + saturation + finish
  const paletteDirective =
    base.palette_custom ?? meta(SCENE_PALETTES, base.palette_preset)?.directive;
  const colorParts: string[] = [];
  if (paletteDirective) colorParts.push(paletteDirective);
  const contrast = metaX(COLOR_CONTRASTS, base.color_contrast);
  if (contrast) colorParts.push(contrast.directive);
  const saturation = metaX(SATURATIONS, base.saturation);
  if (saturation) colorParts.push(saturation.directive);
  if (colorParts.length) lines.push(`Color: ${colorParts.join(" — ")}.`);

  const finishMeta = meta(SCENE_FINISHES, base.finish);
  if (finishMeta) lines.push(`Finish: ${finishMeta.directive}.`);

  const focus = metaX(SUBJECT_FOCUSES, base.subject_focus);
  if (focus) lines.push(`Subject focus: ${focus.directive}.`);

  if (answers.cast) lines.push(buildCastDirective(answers.cast));
  if (answers.scale) {
    lines.push(
      buildScaleDirective(answers.scale, {
        castPreset: answers.cast?.preset,
      }),
    );
  }

  if (typeof base.prop_density === "number") {
    lines.push(
      `Prop density: ${PROP_DENSITY_LABELS[base.prop_density]} (level ${base.prop_density}/4).`,
    );
  }

  const useCase = metaX(OUTPUT_USE_CASES, base.output_use_case);
  if (useCase) lines.push(`Output: ${useCase.directive}.`);

  // Phase 7d — scene extras (backdrop, floor, camera-angle, light, motion…)
  const sceneExtras = base.extras ?? {};
  for (const f of SCENE_EXTRAS_FIELDS) {
    const v = sceneExtras[f.key];
    if (v && v.trim()) lines.push(`${f.prefix}: ${v.trim()}.`);
  }
  // Unknown extras (forward-compat) — render as Style lines.
  const knownSceneKeys = new Set(SCENE_EXTRAS_FIELDS.map((f) => f.key));
  for (const [k, v] of Object.entries(sceneExtras)) {
    if (!knownSceneKeys.has(k) && v?.trim()) {
      lines.push(`Style (${k}): ${v.trim()}.`);
    }
  }

  // Cast extras (skin, hair, makeup, pose energy, storytelling…)
  const castExtras = answers.cast?.extras ?? {};
  for (const f of CAST_EXTRAS_FIELDS) {
    const v = castExtras[f.key];
    if (v && v.trim()) lines.push(`${f.prefix}: ${v.trim()}.`);
  }
  const knownCastKeys = new Set(CAST_EXTRAS_FIELDS.map((f) => f.key));
  for (const [k, v] of Object.entries(castExtras)) {
    if (!knownCastKeys.has(k) && v?.trim()) {
      lines.push(`Cast style (${k}): ${v.trim()}.`);
    }
  }

  if (base.notes?.trim()) lines.push(`Notes: ${base.notes.trim()}.`);

  const avoid = base.avoid?.trim() || answers.negative_note?.trim();
  if (avoid) lines.push(`Avoid: ${avoid}.`);

  if (answers.name?.trim()) {
    lines.push(`Scene name: ${answers.name.trim()}.`);
  }

  return lines.filter(Boolean).join("\n");
}
