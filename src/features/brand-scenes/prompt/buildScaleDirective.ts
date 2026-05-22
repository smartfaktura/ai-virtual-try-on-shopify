import {
  scalePresetMeta,
  type ScalePreset,
  type ScaleUnit,
} from "../wizard/constants/scale";
import type { CastPreset } from "../wizard/constants/cast";

export interface ScaleInput {
  preset: ScalePreset;
  dimensions?: {
    w: number;
    h: number;
    d?: number;
    units: ScaleUnit;
  };
}

const CAST_VS_PRODUCT: Partial<Record<ScalePreset, string>> = {
  pocket: "product sits in the palm of a hand",
  handheld: "product is held comfortably in one or two hands",
  carry: "product sits at torso scale, carried by the person",
  furniture: "person stands beside the product for size reference",
  architectural: "person is visibly dwarfed by the product",
  on_body: "product is worn directly on the body, naturally proportioned",
};

/**
 * Emits a single directive line anchoring the product's physical size.
 * Exact dimensions, when provided, override the preset's vague hint.
 * When cast is present (not "none" / undefined), adds a cast-vs-product
 * sentence so the model gets the relative scale right.
 */
export function buildScaleDirective(
  scale: ScaleInput,
  opts?: { castPreset?: CastPreset },
): string {
  let base: string;
  if (scale.dimensions) {
    const { w, h, d, units } = scale.dimensions;
    const dims = [w, h, d].filter((n): n is number => typeof n === "number");
    const dimStr = dims.join("×");
    base = `Product scale: exactly ${dimStr} ${units}. Scale all surrounding props and people accordingly.`;
  } else {
    base = `Product scale: ${scalePresetMeta(scale.preset).directive}.`;
  }

  const cast = opts?.castPreset;
  const hasPeople = cast && cast !== "none" && cast !== "replicate";
  if (hasPeople) {
    const rel = CAST_VS_PRODUCT[scale.preset];
    if (rel) base += ` Cast-vs-product: ${rel}.`;
  }

  return base;
}
