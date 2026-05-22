/**
 * Brand Scenes — illogical-combo guards.
 *
 * Hard rules: gate at UI (hide forbidden options) AND in the Zod schema.
 * Soft rules: emit warnings the user can override.
 */

import type { BrandSceneModule } from "../../constants";
import type { CastInteraction, CastPreset } from "../constants/cast";
import type { ScalePreset } from "../constants/scale";
import type { BrandSceneAnswers } from "../../types";

/** Hard rule: which interactions are impossible for a given cast preset. */
export function forbiddenInteractionsByCast(
  cast: CastPreset | undefined,
): Set<CastInteraction> {
  if (!cast) return new Set();
  switch (cast) {
    case "none":
      // Only "hero" is valid.
      return new Set<CastInteraction>(["wearing", "holding", "using", "beside"]);
    case "hands":
      // Face / body required to "wear".
      return new Set<CastInteraction>(["wearing"]);
    case "replicate":
      // Reference dictates everything.
      return new Set<CastInteraction>([
        "wearing",
        "holding",
        "using",
        "beside",
        "hero",
      ]);
    default:
      // People presets: hero is product-only and not valid when people are present.
      return new Set<CastInteraction>(["hero"]);
  }
}

/** Hard rule: which interactions are impossible for a given family. */
export function forbiddenInteractionsByFamily(
  family: BrandSceneModule | undefined,
): Set<CastInteraction> {
  if (!family) return new Set();
  switch (family) {
    case "beauty-fragrance":
      return new Set<CastInteraction>(["wearing"]);
    case "food-drink":
      return new Set<CastInteraction>(["wearing"]);
    case "jewelry":
    case "watches":
    case "eyewear":
      return new Set<CastInteraction>(["using"]);
    case "home":
      return new Set<CastInteraction>(["wearing"]);
    case "tech":
    case "wellness":
      return new Set<CastInteraction>(["wearing"]);
    default:
      return new Set();
  }
}

/** Hard rule: which interactions are impossible at this scale. */
export function forbiddenInteractionsByScale(
  scale: ScalePreset | undefined,
): Set<CastInteraction> {
  if (!scale) return new Set();
  switch (scale) {
    case "architectural":
      return new Set<CastInteraction>(["holding", "wearing"]);
    case "furniture":
      return new Set<CastInteraction>(["wearing"]);
    default:
      return new Set();
  }
}

export function forbiddenInteractions(
  cast: CastPreset | undefined,
  family: BrandSceneModule | undefined,
  scale: ScalePreset | undefined,
): Set<CastInteraction> {
  const out = new Set<CastInteraction>();
  for (const i of forbiddenInteractionsByCast(cast)) out.add(i);
  for (const i of forbiddenInteractionsByFamily(family)) out.add(i);
  for (const i of forbiddenInteractionsByScale(scale)) out.add(i);
  return out;
}

/** Hard rule: which cast presets are impossible at this scale/family. */
export function forbiddenCastPresets(
  scale: ScalePreset | undefined,
  family: BrandSceneModule | undefined,
): Set<CastPreset> {
  const out = new Set<CastPreset>();
  if (scale === "architectural") out.add("hands");
  if (
    (family === "jewelry" || family === "eyewear" || family === "watches") &&
    scale === "pocket"
  ) {
    out.add("group");
  }
  return out;
}

/** Soft warnings (non-blocking). */
export interface SceneWarning {
  field: string;
  message: string;
  severity: "info" | "warn";
}

export function warnings(answers: BrandSceneAnswers): SceneWarning[] {
  const out: SceneWarning[] = [];
  const base = answers.base ?? {};
  const cast = answers.cast;

  if (base.time_of_day === "night" && base.weather === "clear") {
    out.push({
      field: "weather",
      message: "Clear night usually reads as moonlit / artificial light — that's fine, just confirming.",
      severity: "info",
    });
  }

  if (
    base.lens === "macro" &&
    cast?.preset &&
    (cast.preset === "solo" || cast.preset === "two" || cast.preset === "group")
  ) {
    out.push({
      field: "lens",
      message: "Macro lens will not capture full body — consider 'Hands only' or no people.",
      severity: "warn",
    });
  }

  if (base.season === "winter" && /beach|water/i.test(base.setting ?? "")) {
    out.push({
      field: "season",
      message: "Winter on the beach is editorial-only — flagged for awareness.",
      severity: "info",
    });
  }

  return out;
}
