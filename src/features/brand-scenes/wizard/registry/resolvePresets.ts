/**
 * Resolves the per-section preset bundle for a (family, sub-family) pair,
 * cascading: sub-family → family → global defaults.
 *
 * Every helper returns a *concrete list* the UI can render directly.
 */

import type { BrandSceneModule } from "../../constants";
import { PRESETS, type PresetBundle } from "./categoryPresets";
import {
  SCENE_SETTINGS,
  SCENE_LENSES,
  SCENE_DEPTH_OF_FIELD,
  SCENE_PALETTES,
  SCENE_FINISHES,
  WARDROBE_COLORS,
  type SceneLens,
  type SceneDepthOfField,
  type ScenePalette,
  type SceneFinish,
  type WardrobeColor,
} from "../constants/scene";
import {
  CAST_INTERACTIONS,
  CAST_PRESETS,
  type CastInteraction,
  type CastPreset,
} from "../constants/cast";
import { SCALE_PRESETS, type ScalePreset } from "../constants/scale";
import {
  SURFACES,
  HANDS_ON_PRODUCT,
  BODY_PART_FOCUS,
  type Surface,
  type PropDensity,
  type HandsOnProduct,
  type BodyPartFocus,
} from "../constants/sceneExtras";

export function resolveBundle(
  module: BrandSceneModule | undefined,
  subFamily: string | undefined,
): PresetBundle {
  if (!module) return {};
  const fam = PRESETS[module];
  if (!fam) return {};
  const { sub, ...famBase } = fam;
  const subBundle = subFamily ? sub?.[subFamily] : undefined;
  return { ...famBase, ...(subBundle ?? {}) };
}

const ALL = <T>(arr: readonly T[]): T[] => Array.from(arr);

export interface Resolved {
  scale: { values: ScalePreset[]; default: ScalePreset };
  settings: string[];
  lens: SceneLens[];
  depthOfField: SceneDepthOfField[];
  palettes: ScenePalette[];
  finishes: SceneFinish[];
  wardrobeColors: WardrobeColor[];
  interactions: CastInteraction[];
  castPresets: CastPreset[];
  defaultCast: CastPreset;
  surfaces: Surface[];
  propDensityMax: PropDensity;
  handsOnProduct: HandsOnProduct[];
  bodyPartFocus: BodyPartFocus[];
}

export function resolveAll(
  module: BrandSceneModule | undefined,
  subFamily: string | undefined,
): Resolved {
  const b = resolveBundle(module, subFamily);

  const allScales = SCALE_PRESETS.map((s) => s.value);
  const scaleValues = (b.scale ?? allScales) as ScalePreset[];

  return {
    scale: {
      values: scaleValues,
      default: (b.default_scale ?? scaleValues[0]) as ScalePreset,
    },
    settings: b.settings ?? ALL(SCENE_SETTINGS),
    lens: (b.lens ?? SCENE_LENSES.map((l) => l.value)) as SceneLens[],
    depthOfField: (b.depth_of_field ??
      SCENE_DEPTH_OF_FIELD.map((d) => d.value)) as SceneDepthOfField[],
    palettes: (b.palette_presets ??
      SCENE_PALETTES.map((p) => p.value)) as ScenePalette[],
    finishes: (b.finishes ??
      SCENE_FINISHES.map((f) => f.value)) as SceneFinish[],
    wardrobeColors: (b.wardrobe_colors ??
      WARDROBE_COLORS.map((w) => w.value)) as WardrobeColor[],
    interactions: (b.interactions ??
      CAST_INTERACTIONS.map((i) => i.value)) as CastInteraction[],
    castPresets: (b.cast_presets ??
      CAST_PRESETS.filter((c) => c.value !== "replicate").map((c) => c.value)) as CastPreset[],
    defaultCast: (b.default_cast ?? "solo") as CastPreset,
    surfaces: (b.surfaces ?? SURFACES.map((s) => s.value)) as Surface[],
    propDensityMax: (b.prop_density_max ?? 4) as PropDensity,
    handsOnProduct: (b.hands_on_product ??
      HANDS_ON_PRODUCT.map((h) => h.value)) as HandsOnProduct[],
    bodyPartFocus: (b.body_part_focus ??
      BODY_PART_FOCUS.map((b) => b.value)) as BodyPartFocus[],
  };
}

/** "Category-tuned: jewelry / rings" summary for the UI chip. */
export function tuningLabel(
  module: BrandSceneModule | undefined,
  subFamily: string | undefined,
): string | null {
  if (!module) return null;
  const fam = PRESETS[module];
  if (!fam) return null;
  return subFamily ? `${module} · ${subFamily}` : module;
}
