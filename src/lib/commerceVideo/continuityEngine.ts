/**
 * Continuity engine.
 *
 * Decides which reference type each shot should anchor on, based on:
 *  - shot role / scene type
 *  - product category preferences
 *  - available reference inventory
 *
 * Also exposes default project-level continuity locks per intent/category.
 */
import type {
  ContentIntent,
  ContinuitySettings,
  ProductCategoryKey,
  ReferenceType,
} from '@/types/commerceVideo';
import type { ShotPlanItem } from '@/types/shortFilm';
import { getCategoryModule } from './categoryModules';

/**
 * Recommended reference type strategy per shot.
 * Higher-index entries are fallbacks when the preferred type is missing.
 */
export function pickReferenceStrategy(
  shot: ShotPlanItem,
  available: ReferenceType[],
  category?: ProductCategoryKey,
): ReferenceType[] {
  const role = (shot.role || '').toLowerCase();
  const sceneType = (shot.scene_type || '').toLowerCase();
  const mod = getCategoryModule(category);

  const wishlist: ReferenceType[] = [];

  // Role-driven preferences.
  if (role.includes('hero') || role.includes('product_moment') || role.includes('highlight')) {
    wishlist.push('main_hero', 'front');
  }
  if (role.includes('product_reveal') || role.includes('reveal')) {
    wishlist.push('main_hero', 'front', 'side');
  }
  if (role.includes('detail') || sceneType.includes('macro') || sceneType.includes('detail')) {
    wishlist.push('texture', 'main_hero');
  }
  if (role.includes('packag') || sceneType.includes('packag')) {
    wishlist.push('packaging', 'main_hero');
  }
  if (shot.character_visible || role.includes('human') || role.includes('lifestyle')) {
    wishlist.push('on_body', 'in_hand', 'brand_model');
  }
  if (role.includes('atmosphere') || role.includes('mood')) {
    wishlist.push('brand_scene', 'main_hero');
  }
  if (role.includes('brand_finish') || role.includes('end_frame')) {
    wishlist.push('main_hero', 'packaging');
  }

  // Category supplements (only add if not already present).
  for (const r of mod.referenceRequirements) {
    if (!wishlist.includes(r as ReferenceType)) {
      wishlist.push(r as ReferenceType);
    }
  }

  // Always have a final safety fallback.
  if (!wishlist.includes('main_hero')) wishlist.push('main_hero');

  // Filter by what's actually available, but always return wishlist if
  // nothing is available so the planner can flag the gap.
  const filtered = wishlist.filter(r => available.includes(r));
  return filtered.length ? filtered : wishlist;
}

/**
 * Default continuity locks based on intent + category.
 * These are starting points — user can always override.
 */
export function defaultContinuity(
  intent?: ContentIntent,
  category?: ProductCategoryKey,
): ContinuitySettings {
  const mod = getCategoryModule(category);
  const rules = new Set(mod.continuityRules);

  const locks: ContinuitySettings = {
    keepSameModel: rules.has('keepSameModel'),
    keepSameOutfit: rules.has('keepSameOutfit'),
    keepSameEnvironment: rules.has('keepSameEnvironment'),
    keepSameLightingFamily: rules.has('keepSameLightingFamily'),
    keepSameProductState: rules.has('keepSameProductState'),
  };

  // Intent-driven adjustments.
  switch (intent) {
    case 'pdp_video':
    case 'product_showcase':
    case 'product_detail_film':
      locks.keepSameProductState = true;
      locks.keepSameLightingFamily = true;
      break;
    case 'campaign_editorial':
    case 'fashion_apparel' as ContentIntent: // safety
      locks.keepSameModel = true;
      locks.keepSameOutfit = true;
      break;
    case 'brand_mood_film':
      locks.keepSameLightingFamily = true;
      locks.keepSameEnvironment = true;
      break;
    case 'creator_style_content':
      locks.keepSameModel = true;
      break;
  }

  return locks;
}

/**
 * Human-readable summary used in prompts.
 */
export function continuityToPromptHints(c?: ContinuitySettings): string[] {
  if (!c) return [];
  const out: string[] = [];
  if (c.keepSameModel)          out.push('Same person/model as previous shots.');
  if (c.keepSameOutfit)         out.push('Identical outfit and styling continuity.');
  if (c.keepSameEnvironment)    out.push('Same environment and set continuity.');
  if (c.keepSameLightingFamily) out.push('Consistent lighting family across shots.');
  if (c.keepSameProductState)   out.push('Product state (closed/opened/worn) unchanged.');
  return out;
}
