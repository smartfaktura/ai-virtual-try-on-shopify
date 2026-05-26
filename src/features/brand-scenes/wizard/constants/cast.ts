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
  { value: "none", label: "No people", hasPeople: false },
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
  { value: "hero", label: "Product only" },
  // Food-native verbs — surfaced for food-drink only via interactionsForFamily.
  { value: "pouring", label: "Pouring" },
  { value: "plating", label: "Plating / serving" },
  { value: "cutting", label: "Cutting / slicing" },
  { value: "garnishing", label: "Garnishing" },
  { value: "dipping", label: "Dipping" },
  { value: "steaming", label: "Steaming / fresh out of oven" },
] as const;
export type CastInteraction = (typeof CAST_INTERACTIONS)[number]["value"];

/** Food-only interaction values — hidden from every non-food family. */
const FOOD_ONLY_INTERACTIONS: ReadonlySet<CastInteraction> = new Set([
  "pouring",
  "plating",
  "cutting",
  "garnishing",
  "dipping",
  "steaming",
]);

export const CAST_ACTIONS = [
  { value: "standing", label: "Standing" },
  { value: "seated", label: "Sitting" },
  { value: "crossed_legs", label: "Crossed legs" },
  { value: "leaning", label: "Leaning" },
  { value: "kneeling", label: "Kneeling / crouched" },
  { value: "walking", label: "Walking" },
  { value: "motion", label: "Mid-motion" },
  { value: "jumping", label: "Jumping" },
  { value: "still", label: "Still & composed" },
  { value: "candid", label: "Candid moment" },
] as const;
export type CastAction = (typeof CAST_ACTIONS)[number]["value"];

export const CAST_ACTION_NOTE_MAX = 80;

export const CAST_NOTE_MAX = 160;

/**
 * Pose options filtered by cast preset + scale. Hides whole-body poses
 * (walking, jumping, mid-motion) when there is no full body in frame
 * (hands-only, pocket-scale, or product-only).
 */
export function posesForCast(
  preset: CastPreset | undefined,
  scale: import("./scale").ScalePreset | undefined,
): readonly (typeof CAST_ACTIONS)[number][] {
  if (!preset) return CAST_ACTIONS;
  if (preset === "hands" || preset === "none" || preset === "replicate") {
    // Only stationary poses make sense.
    return CAST_ACTIONS.filter((a) =>
      ["still", "candid", "leaning"].includes(a.value),
    );
  }
  if (scale === "pocket") {
    // Macro / product-led shots — drop full-body motion poses.
    return CAST_ACTIONS.filter(
      (a) => !["walking", "jumping", "motion"].includes(a.value),
    );
  }
  return CAST_ACTIONS;
}

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
      return CAST_INTERACTIONS.filter(
        (c) => c.value !== "wearing" && !FOOD_ONLY_INTERACTIONS.has(c.value),
      );
    case "bags-accessories":
      return CAST_INTERACTIONS.filter(
        (c) => c.value !== "using" && !FOOD_ONLY_INTERACTIONS.has(c.value),
      );
    case "tech":
    case "home":
    case "wellness":
      return CAST_INTERACTIONS.filter(
        (c) => c.value !== "wearing" && !FOOD_ONLY_INTERACTIONS.has(c.value),
      );
    case "food-drink":
      // Food keeps food-native verbs + the non-wearing generic ones.
      return CAST_INTERACTIONS.filter((c) => c.value !== "wearing");
    default:
      return CAST_INTERACTIONS.filter((c) => !FOOD_ONLY_INTERACTIONS.has(c.value));
  }
}
