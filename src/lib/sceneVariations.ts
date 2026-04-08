import type { DetailSettings, ProductImageScene } from '@/components/app/product-images/types';

/**
 * Multi-select fields that generate extra variations.
 * Maps the field key to the trigger block that must be active for the field to apply.
 */
const MULTI_SELECT_FIELDS: { field: keyof DetailSettings; block: string }[] = [
  { field: 'packagingState', block: 'packagingDetails' },
  { field: 'backgroundTone', block: 'background' },
  { field: 'environmentType', block: 'sceneEnvironment' },
  { field: 'surfaceType', block: 'sceneEnvironment' },
];

/** Parse a comma-separated multi-select value into an array, defaulting to single-element */
function parseMulti(val: string | undefined): string[] {
  if (!val) return [];
  return val.split(',').filter(Boolean);
}

/** Get the variation multiplier for a single scene based on multi-select fields */
export function getSceneMultiplier(scene: ProductImageScene, details: DetailSettings): number {
  const blocks = new Set(scene.triggerBlocks || []);
  let multiplier = 1;

  for (const { field, block } of MULTI_SELECT_FIELDS) {
    if (!blocks.has(block)) continue;
    const vals = parseMulti(details[field] as string);
    if (vals.length > 1) multiplier *= vals.length;
  }

  return multiplier;
}

/** Get the total multiplier across all selected scenes */
export function getTotalMultiplier(
  scenes: ProductImageScene[],
  details: DetailSettings,
): number {
  return scenes.reduce((sum, scene) => sum + getSceneMultiplier(scene, details), 0);
}

/** Compute total images accounting for multi-select variations and per-scene format overrides */
export function computeTotalImages(
  productCount: number,
  scenes: ProductImageScene[],
  imageCountPerScene: number,
  details: DetailSettings,
): number {
  const globalFormats = details.selectedAspectRatios || [details.aspectRatio || '1:1'];
  let total = 0;
  for (const scene of scenes) {
    const sceneFormats = details.sceneAspectOverrides?.[scene.id] || globalFormats;
    total += getSceneMultiplier(scene, details) * imageCountPerScene * sceneFormats.length;
  }
  return productCount * total;
}

export interface VariationOverride {
  [key: string]: string;
}

/**
 * Expand multi-select fields for a given scene into individual variation overrides.
 * Each override is a partial DetailSettings that replaces the multi-select value
 * with a single value for prompt building.
 */
export function expandMultiSelects(
  scene: ProductImageScene,
  details: DetailSettings,
): VariationOverride[] {
  const blocks = new Set(scene.triggerBlocks || []);
  
  // Collect all multi-select dimensions relevant to this scene
  const dimensions: { field: string; values: string[] }[] = [];

  for (const { field, block } of MULTI_SELECT_FIELDS) {
    if (!blocks.has(block)) continue;
    const vals = parseMulti(details[field] as string);
    if (vals.length > 1) {
      dimensions.push({ field, values: vals });
    }
  }

  if (dimensions.length === 0) return [{}]; // single variation, no overrides

  // Compute cartesian product of all dimensions
  let combos: VariationOverride[] = [{}];
  for (const dim of dimensions) {
    const next: VariationOverride[] = [];
    for (const combo of combos) {
      for (const val of dim.values) {
        next.push({ ...combo, [dim.field]: val });
      }
    }
    combos = next;
  }

  return combos;
}
