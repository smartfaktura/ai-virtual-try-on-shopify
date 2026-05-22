/**
 * Brand Scenes — Product scale constants.
 * Drives the Tier A preset + Tier B exact dimensions UI on Step 4.
 */

import type { BrandSceneModule } from "../../constants";

export const SCALE_PRESETS = [
  {
    value: "pocket",
    label: "Pocket",
    hint: "≤15 cm — perfume, jewelry, headphones",
    directive: "fits in one hand, ~10 cm tall, do not enlarge",
  },
  {
    value: "handheld",
    label: "Handheld",
    hint: "15–35 cm — sneakers, bottles, small bags",
    directive: "handheld scale ~25 cm, sized to a human hand",
  },
  {
    value: "carry",
    label: "Carry",
    hint: "35–80 cm — backpacks, small appliances",
    directive: "carry-sized ~60 cm, scaled to torso",
  },
  {
    value: "furniture",
    label: "Furniture",
    hint: "80–200 cm — chairs, lamps, suitcases",
    directive: "furniture-scale, model stands beside for reference",
  },
  {
    value: "architectural",
    label: "Architectural",
    hint: ">200 cm — sofas, cars, installations",
    directive: "room-scale, model dwarfed by the product for reference",
  },
  {
    value: "on_body",
    label: "Wearable on body",
    hint: "Scaled to the wearer's body",
    directive: "scaled to the wearer's body, naturally proportioned",
  },
] as const;
export type ScalePreset = (typeof SCALE_PRESETS)[number]["value"];

export const SCALE_UNITS = ["cm", "in"] as const;
export type ScaleUnit = (typeof SCALE_UNITS)[number];

/** Default preset suggested by family — user always overrides. */
export function defaultScaleForFamily(
  module: BrandSceneModule | undefined,
): ScalePreset {
  if (!module) return "handheld";
  switch (module) {
    case "fashion":
    case "footwear":
    case "hats-caps-beanies":
      return "on_body";
    case "jewelry":
    case "watches":
    case "eyewear":
    case "beauty-fragrance":
      return "pocket";
    case "bags-accessories":
      return "carry";
    case "tech":
    case "wellness":
    case "food-drink":
      return "handheld";
    case "home":
      return "furniture";
    default:
      return "handheld";
  }
}

export function scalePresetMeta(preset: ScalePreset) {
  return SCALE_PRESETS.find((s) => s.value === preset)!;
}
