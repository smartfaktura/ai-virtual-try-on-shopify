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

/**
 * Canonical-order assembler that combines every directive a generator needs
 * for a brand scene. Skips empty sections; returns a single newline-joined
 * string suitable for direct use in a prompt.
 *
 * Aspect ratio is HARD-CODED to 4:5 — that is the canonical preview format
 * for brand scenes across the app.
 */
export function assembleSceneDirective(answers: BrandSceneAnswers): string {
  const lines: string[] = [];
  const base = answers.base ?? {};

  const refLine =
    answers.source === "reference"
      ? buildReferenceDirective(answers.reference_intent)
      : "";
  if (refLine) lines.push(refLine);

  if (base.aesthetic) lines.push(`Scene type: ${base.aesthetic}.`);
  if (base.setting) lines.push(`Setting: ${base.setting}.`);
  if (base.weather) lines.push(`Weather: ${base.weather}.`);
  if (base.season && base.season !== "seasonless") {
    lines.push(`Season: ${base.season}.`);
  }
  if (base.time_of_day) lines.push(`Time of day: ${base.time_of_day}.`);
  if (base.mood) lines.push(`Mood: ${base.mood}.`);
  if (base.lighting) lines.push(`Lighting: ${base.lighting}.`);

  const lensMeta = meta(SCENE_LENSES, base.lens);
  const dofMeta = meta(SCENE_DEPTH_OF_FIELD, base.depth_of_field);
  if (lensMeta || dofMeta) {
    const camParts: string[] = [];
    if (lensMeta) camParts.push(`Camera: ${lensMeta.directive}`);
    if (dofMeta) camParts.push(`Depth of field: ${dofMeta.directive}`);
    lines.push(camParts.join(" — ") + ".");
  }

  if (base.framing) lines.push(`Framing: ${base.framing}.`);

  lines.push("Aspect ratio: 4:5 (portrait, vertical) — REQUIRED.");

  const paletteDirective =
    base.palette_custom ?? meta(SCENE_PALETTES, base.palette_preset)?.directive;
  if (paletteDirective) lines.push(`Color palette: ${paletteDirective}.`);

  const finishMeta = meta(SCENE_FINISHES, base.finish);
  if (finishMeta) lines.push(`Finish: ${finishMeta.directive}.`);

  if (answers.cast) lines.push(buildCastDirective(answers.cast));
  if (answers.scale) {
    lines.push(
      buildScaleDirective(answers.scale, {
        castPreset: answers.cast?.preset,
      }),
    );
  }

  if (base.notes?.trim()) lines.push(`Notes: ${base.notes.trim()}.`);

  const avoid = base.avoid?.trim() || answers.negative_note?.trim();
  if (avoid) lines.push(`Avoid: ${avoid}.`);

  if (answers.name?.trim()) {
    lines.push(`Scene name: ${answers.name.trim()}.`);
  }

  return lines.filter(Boolean).join("\n");
}
