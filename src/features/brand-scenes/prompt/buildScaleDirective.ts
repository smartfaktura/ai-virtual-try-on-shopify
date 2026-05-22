import {
  scalePresetMeta,
  type ScalePreset,
  type ScaleUnit,
} from "../wizard/constants/scale";

export interface ScaleInput {
  preset: ScalePreset;
  dimensions?: {
    w: number;
    h: number;
    d?: number;
    units: ScaleUnit;
  };
}

/**
 * Emits a single directive line anchoring the product's physical size.
 * Exact dimensions, when provided, override the preset's vague hint.
 */
export function buildScaleDirective(scale: ScaleInput): string {
  if (scale.dimensions) {
    const { w, h, d, units } = scale.dimensions;
    const dims = [w, h, d].filter((n): n is number => typeof n === "number");
    const dimStr = dims.join("×");
    return `Product scale: exactly ${dimStr} ${units}. Scale all surrounding props and people accordingly.`;
  }
  return `Product scale: ${scalePresetMeta(scale.preset).directive}.`;
}
