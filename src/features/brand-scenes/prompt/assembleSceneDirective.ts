import type { BrandSceneAnswers } from "../types";
import { buildCastDirective } from "./buildCastDirective";
import { buildScaleDirective } from "./buildScaleDirective";
import { buildReferenceDirective } from "./buildReferenceDirective";

/**
 * Canonical-order assembler that combines every directive a generator needs
 * for a brand scene. Skips empty sections; returns a single newline-joined
 * string suitable for direct use in a prompt.
 */
export function assembleSceneDirective(answers: BrandSceneAnswers): string {
  const lines: string[] = [];

  const refLine =
    answers.source === "reference"
      ? buildReferenceDirective(answers.reference_intent)
      : "";
  if (refLine) lines.push(refLine);

  if (answers.base?.aesthetic) {
    lines.push(`Scene type: ${answers.base.aesthetic}.`);
  }
  if (answers.base?.time_of_day) {
    lines.push(`Time of day: ${answers.base.time_of_day}.`);
  }
  if (answers.base?.mood) lines.push(`Mood: ${answers.base.mood}.`);
  if (answers.base?.lighting) lines.push(`Lighting: ${answers.base.lighting}.`);
  if (answers.base?.framing) lines.push(`Framing: ${answers.base.framing}.`);
  if (answers.base?.aspect_ratio) {
    lines.push(`Aspect ratio: ${answers.base.aspect_ratio}.`);
  }

  if (answers.cast) lines.push(buildCastDirective(answers.cast));
  if (answers.scale) lines.push(buildScaleDirective(answers.scale));

  if (answers.base?.notes?.trim()) {
    lines.push(`Notes: ${answers.base.notes.trim()}.`);
  }
  if (answers.negative_note?.trim()) {
    lines.push(`Avoid: ${answers.negative_note.trim()}.`);
  }
  if (answers.name?.trim()) {
    lines.push(`Scene name: ${answers.name.trim()}.`);
  }

  return lines.filter(Boolean).join("\n");
}
