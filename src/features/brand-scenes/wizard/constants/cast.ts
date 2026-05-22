/**
 * Brand Scenes — Cast & product interaction constants.
 * Drives the new Step 4 "Cast & interaction" UI and the prompt-builder.
 */

import type { BrandSceneModule } from "../../constants";

export const CAST_PRESETS = [
  { value: "solo", label: "Solo person", hasPeople: true },
  { value: "two", label: "Two people", hasPeople: true },
  { value: "group", label: "Group (3+)", hasPeople: true },
  { value: "hands", label: "Hands only", hasPeople: false },
  { value: "none", label: "No people — product hero", hasPeople: false },
  // Reference-only — surfaced conditionally in the UI.
  { value: "replicate", label: "Replicate reference exactly", hasPeople: false },
] as const;
export type CastPreset = (typeof CAST_PRESETS)[number]["value"];

export const CAST_PRESETS_WITH_PEOPLE: CastPreset[] = CAST_PRESETS
  .filter((c) => c.hasPeople)
  .map((c) => c.value);

export const CAST_GENDERS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "mixed", label: "Mixed" },
  { value: "any", label: "Non-specified" },
] as const;
export type CastGender = (typeof CAST_GENDERS)[number]["value"];

export const CAST_AGES = [
  { value: "young", label: "Young adult" },
  { value: "adult", label: "Adult" },
  { value: "mature", label: "Mature" },
  { value: "mixed", label: "Mixed ages" },
] as const;
export type CastAge = (typeof CAST_AGES)[number]["value"];

export const CAST_VIBES = [
  { value: "athlete", label: "Athlete" },
  { value: "creative", label: "Creative" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "editorial", label: "Editorial model" },
] as const;
export type CastVibe = (typeof CAST_VIBES)[number]["value"];

export const CAST_INTERACTIONS = [
  { value: "wearing", label: "Wearing" },
  { value: "holding", label: "Holding" },
  { value: "using", label: "Using" },
  { value: "beside", label: "Placed beside" },
  { value: "hero", label: "Hero — product only" },
] as const;
export type CastInteraction = (typeof CAST_INTERACTIONS)[number]["value"];

export const CAST_ACTIONS = [
  { value: "still", label: "Still" },
  { value: "walking", label: "Walking" },
  { value: "motion", label: "Mid-motion" },
  { value: "seated", label: "Seated" },
  { value: "candid", label: "Candid" },
] as const;
export type CastAction = (typeof CAST_ACTIONS)[number]["value"];

export const CAST_NOTE_MAX = 160;

/**
 * Interaction options filtered to a family. Fragrance hides "Wearing",
 * fashion hides "Using", etc.
 */
export function interactionsForFamily(
  module: BrandSceneModule | undefined,
): readonly (typeof CAST_INTERACTIONS)[number][] {
  if (!module) return CAST_INTERACTIONS;
  switch (module) {
    case "fashion":
    case "footwear":
    case "hats-caps-beanies":
      return CAST_INTERACTIONS.filter((c) => c.value !== "using");
    case "eyewear":
    case "watches":
    case "jewelry":
      return CAST_INTERACTIONS.filter(
        (c) => c.value !== "using" && c.value !== "holding",
      );
    case "beauty-fragrance":
      return CAST_INTERACTIONS.filter((c) => c.value !== "wearing");
    case "bags-accessories":
      return CAST_INTERACTIONS.filter((c) => c.value !== "using");
    case "tech":
    case "home":
    case "food-drink":
    case "wellness":
      return CAST_INTERACTIONS.filter((c) => c.value !== "wearing");
    default:
      return CAST_INTERACTIONS;
  }
}
