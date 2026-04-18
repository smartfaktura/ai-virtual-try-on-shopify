/**
 * Product fidelity engine.
 *
 * Builds a per-project ProductFidelity object using category context, and
 * computes per-shot preservation/branding/material/text priorities.
 *
 * This file replaces the implicit "preservation_strength" knob with a
 * structured, category-aware fidelity model.
 */
import type {
  ProductCategoryKey,
  ProductFidelity,
  SensitivityLevel,
  ShotCommerceExtensions,
} from '@/types/commerceVideo';
import type { ShotPlanItem } from '@/types/shortFilm';
import { getCategoryModule } from './categoryModules';

export interface BuildFidelityInput {
  category?: ProductCategoryKey;
  productName?: string;
  hasPackagingRef?: boolean;
  hasLogo?: boolean;
  wornMode?: boolean;
}

const HIGH: SensitivityLevel = 'high';
const MED: SensitivityLevel  = 'medium';
const LOW: SensitivityLevel  = 'low';

/**
 * Build a sensible ProductFidelity baseline from category context.
 * Caller can override individual fields afterwards.
 */
export function buildProductFidelity(input: BuildFidelityInput = {}): ProductFidelity {
  const { category, productName, hasPackagingRef, hasLogo, wornMode } = input;
  const mod = getCategoryModule(category);

  const fidelity: ProductFidelity = {
    productCategory: category,
    productName,
    mustPreserveAttributes: [...mod.mandatoryCoverage],
    forbiddenDeviations: [...mod.negatives],
    logoSensitivity: hasLogo ? HIGH : MED,
    packagingSensitivity: hasPackagingRef ? HIGH : MED,
    colorSensitivity: MED,
    materialSensitivity: MED,
    geometrySensitivity: MED,
    textLegibilityPriority: MED,
    wornMode,
  };

  // Category-specific bumps.
  switch (category) {
    case 'beauty_skincare':
    case 'makeup':
    case 'fragrance':
    case 'supplements':
    case 'food_beverage':
      fidelity.packagingSensitivity = HIGH;
      fidelity.textLegibilityPriority = HIGH;
      fidelity.colorSensitivity = HIGH;
      break;
    case 'jewelry':
      fidelity.materialSensitivity = HIGH;
      fidelity.geometrySensitivity = HIGH;
      break;
    case 'electronics':
      fidelity.geometrySensitivity = HIGH;
      fidelity.textLegibilityPriority = HIGH;
      break;
    case 'fashion_apparel':
    case 'footwear':
    case 'accessories':
      fidelity.materialSensitivity = HIGH;
      fidelity.colorSensitivity = HIGH;
      break;
    case 'home_decor':
      fidelity.geometrySensitivity = HIGH;
      fidelity.materialSensitivity = HIGH;
      break;
  }

  return fidelity;
}

/**
 * Higher of two sensitivity levels.
 */
function maxSens(a: SensitivityLevel, b: SensitivityLevel): SensitivityLevel {
  const order: Record<SensitivityLevel, number> = { low: 0, medium: 1, high: 2 };
  return order[a] >= order[b] ? a : b;
}

/**
 * Derive per-shot fidelity priorities from a project-level fidelity object
 * + the shot's role/visibility flags. Returns a ShotCommerceExtensions
 * patch that callers can merge onto the shot.
 */
export function deriveShotFidelity(
  shot: ShotPlanItem,
  fidelity: ProductFidelity | undefined,
  opts: { clarityFirst?: boolean } = {},
): ShotCommerceExtensions {
  const role = (shot.role || '').toLowerCase();
  const sceneType = (shot.scene_type || '').toLowerCase();
  const isHero =
    role.includes('hero') ||
    role.includes('product_reveal') ||
    role.includes('product_moment') ||
    role.includes('product_focus') ||
    role.includes('highlight');
  const isPackaging = sceneType.includes('packag') || role.includes('packag');
  const isDetail =
    role.includes('detail') || sceneType.includes('macro') || sceneType.includes('detail');

  // Start from project baseline.
  const base: Required<Pick<ShotCommerceExtensions,
    'branding_accuracy_priority'
    | 'material_accuracy_priority'
    | 'shape_accuracy_priority'
    | 'text_legibility_priority'>> = {
    branding_accuracy_priority: fidelity?.logoSensitivity || MED,
    material_accuracy_priority: fidelity?.materialSensitivity || MED,
    shape_accuracy_priority:    fidelity?.geometrySensitivity || MED,
    text_legibility_priority:   fidelity?.textLegibilityPriority || MED,
  };

  // Auto-raise for hero/detail/packaging shots — these MUST be faithful.
  if (isHero || isPackaging || isDetail) {
    base.branding_accuracy_priority = maxSens(base.branding_accuracy_priority, HIGH);
    base.material_accuracy_priority = maxSens(base.material_accuracy_priority, HIGH);
    base.shape_accuracy_priority    = maxSens(base.shape_accuracy_priority,    HIGH);
  }
  if (isPackaging || isDetail) {
    base.text_legibility_priority = maxSens(base.text_legibility_priority, HIGH);
  }

  // Clarity-first projects raise everything one notch (capped at HIGH).
  if (opts.clarityFirst) {
    base.branding_accuracy_priority = maxSens(base.branding_accuracy_priority, MED);
    base.material_accuracy_priority = maxSens(base.material_accuracy_priority, MED);
    base.shape_accuracy_priority    = maxSens(base.shape_accuracy_priority,    MED);
    base.text_legibility_priority   = maxSens(base.text_legibility_priority,   MED);
  }

  return {
    clarity_first: !!opts.clarityFirst,
    ...base,
  };
}
