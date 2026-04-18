/**
 * Commerce Video — extended story structures.
 *
 * Each structure declares which content intents it fits best, recommended
 * shot counts, duration ranges, coverage policies, and whether it expects
 * voiceover / character / CTA. The planner uses these to auto-pick the
 * best structure when the user has not explicitly chosen one.
 */
import type { ContentIntent } from '@/types/commerceVideo';

export type Policy = 'required' | 'optional' | 'discouraged';

export interface CommerceStructureDef {
  value: string;
  label: string;
  description: string;
  roles: string[];
  bestFitIntents: ContentIntent[];
  recommendedShotCount: number;
  durationRangeSec: [number, number];
  minProductVisiblePct: number; // 0..1
  characterPolicy: Policy;
  voPolicy: Policy;
  ctaPolicy: Policy;
}

export const COMMERCE_STORY_STRUCTURES: CommerceStructureDef[] = [
  {
    value: 'reveal_detail_finish',
    label: 'Reveal → Detail → Finish',
    description: 'Clean three-beat reveal for premium product showcases.',
    roles: ['product_reveal', 'detail_closeup', 'brand_finish'],
    bestFitIntents: ['product_showcase', 'product_detail_film', 'launch_teaser'],
    recommendedShotCount: 3,
    durationRangeSec: [6, 10],
    minProductVisiblePct: 0.8,
    characterPolicy: 'discouraged',
    voPolicy: 'optional',
    ctaPolicy: 'discouraged',
  },
  {
    value: 'detail_texture_hero_close',
    label: 'Detail → Texture → Hero → Close',
    description: 'Macro-led story emphasizing craftsmanship.',
    roles: ['detail_closeup', 'detail_closeup', 'product_reveal', 'brand_finish'],
    bestFitIntents: ['product_detail_film', 'product_showcase'],
    recommendedShotCount: 4,
    durationRangeSec: [9, 14],
    minProductVisiblePct: 0.85,
    characterPolicy: 'discouraged',
    voPolicy: 'optional',
    ctaPolicy: 'discouraged',
  },
  {
    value: 'hero_context_detail_end',
    label: 'Hero → Context → Detail → End',
    description: 'Hero shot, in-use moment, detail, clean end.',
    roles: ['product_reveal', 'lifestyle_moment', 'detail_closeup', 'end_frame'],
    bestFitIntents: ['product_showcase', 'pdp_video', 'feature_benefit_video'],
    recommendedShotCount: 4,
    durationRangeSec: [8, 13],
    minProductVisiblePct: 0.75,
    characterPolicy: 'optional',
    voPolicy: 'optional',
    ctaPolicy: 'optional',
  },
  {
    value: 'product_usage_finish',
    label: 'Product → Usage → Finish',
    description: 'Show product, demonstrate use, sign off.',
    roles: ['product_reveal', 'human_interaction', 'brand_finish'],
    bestFitIntents: ['feature_benefit_video', 'pdp_video', 'creator_style_content'],
    recommendedShotCount: 3,
    durationRangeSec: [6, 11],
    minProductVisiblePct: 0.7,
    characterPolicy: 'optional',
    voPolicy: 'optional',
    ctaPolicy: 'optional',
  },
  {
    value: 'atmosphere_product_detail_resolve',
    label: 'Atmosphere → Product → Detail → Resolve',
    description: 'Mood-led brand film with product anchor.',
    roles: ['atmosphere', 'product_reveal', 'detail_closeup', 'resolve'],
    bestFitIntents: ['brand_mood_film', 'campaign_editorial', 'launch_teaser'],
    recommendedShotCount: 4,
    durationRangeSec: [10, 15],
    minProductVisiblePct: 0.55,
    characterPolicy: 'optional',
    voPolicy: 'discouraged',
    ctaPolicy: 'discouraged',
  },
  {
    value: 'creator_intro_product_moment_end',
    label: 'Creator Intro → Product Moment → End',
    description: 'Creator-style human-led product clip.',
    roles: ['intro', 'human_interaction', 'product_moment', 'end_frame'],
    bestFitIntents: ['creator_style_content', 'social_content'],
    recommendedShotCount: 4,
    durationRangeSec: [8, 13],
    minProductVisiblePct: 0.55,
    characterPolicy: 'required',
    voPolicy: 'optional',
    ctaPolicy: 'optional',
  },
  {
    value: 'showcase_feature_detail_close',
    label: 'Showcase → Feature → Detail → Close',
    description: 'Feature-forward product walkthrough.',
    roles: ['product_reveal', 'product_focus', 'detail_closeup', 'brand_finish'],
    bestFitIntents: ['feature_benefit_video', 'product_showcase'],
    recommendedShotCount: 4,
    durationRangeSec: [9, 14],
    minProductVisiblePct: 0.8,
    characterPolicy: 'discouraged',
    voPolicy: 'optional',
    ctaPolicy: 'optional',
  },
  {
    value: 'clean_pdp_hero_detail_context',
    label: 'PDP: Hero → Detail → Context',
    description: 'Marketplace-clean clarity-first PDP video.',
    roles: ['product_reveal', 'detail_closeup', 'lifestyle_moment'],
    bestFitIntents: ['pdp_video'],
    recommendedShotCount: 3,
    durationRangeSec: [6, 10],
    minProductVisiblePct: 0.9,
    characterPolicy: 'optional',
    voPolicy: 'discouraged',
    ctaPolicy: 'discouraged',
  },
  {
    value: 'launch_tease_reveal_finish',
    label: 'Tease → Reveal → Finish',
    description: 'Three-beat launch teaser with hard reveal.',
    roles: ['tease', 'product_reveal', 'brand_finish'],
    bestFitIntents: ['launch_teaser', 'brand_mood_film'],
    recommendedShotCount: 3,
    durationRangeSec: [6, 10],
    minProductVisiblePct: 0.6,
    characterPolicy: 'optional',
    voPolicy: 'discouraged',
    ctaPolicy: 'discouraged',
  },
  {
    value: 'editorial_focus_human_product_close',
    label: 'Editorial: Focus → Human → Product → Close',
    description: 'Campaign-style human × product editorial film.',
    roles: ['atmosphere', 'human_interaction', 'product_focus', 'brand_finish'],
    bestFitIntents: ['campaign_editorial', 'brand_mood_film'],
    recommendedShotCount: 4,
    durationRangeSec: [10, 15],
    minProductVisiblePct: 0.55,
    characterPolicy: 'required',
    voPolicy: 'optional',
    ctaPolicy: 'discouraged',
  },
  {
    value: 'hook_problem_solution_cta',
    label: 'Hook → Problem → Solution → CTA',
    description: 'Direct-response storytelling for performance ads.',
    roles: ['hook', 'build', 'product_reveal', 'brand_finish'],
    bestFitIntents: ['performance_ad', 'feature_benefit_video'],
    recommendedShotCount: 4,
    durationRangeSec: [8, 13],
    minProductVisiblePct: 0.65,
    characterPolicy: 'optional',
    voPolicy: 'required',
    ctaPolicy: 'required',
  },
  {
    value: 'hook_demo_benefit_cta',
    label: 'Hook → Demo → Benefit → CTA',
    description: 'Fast-pace conversion ad with demo and clear payoff.',
    roles: ['hook', 'human_interaction', 'product_focus', 'brand_finish'],
    bestFitIntents: ['performance_ad', 'feature_benefit_video'],
    recommendedShotCount: 4,
    durationRangeSec: [8, 13],
    minProductVisiblePct: 0.65,
    characterPolicy: 'optional',
    voPolicy: 'required',
    ctaPolicy: 'required',
  },
  {
    value: 'feature_stack_brand_finish',
    label: 'Feature Stack → Brand Finish',
    description: 'Stacked feature beats ending on brand mark.',
    roles: ['product_focus', 'detail_closeup', 'product_focus', 'brand_finish'],
    bestFitIntents: ['feature_benefit_video', 'performance_ad'],
    recommendedShotCount: 4,
    durationRangeSec: [9, 13],
    minProductVisiblePct: 0.8,
    characterPolicy: 'discouraged',
    voPolicy: 'optional',
    ctaPolicy: 'optional',
  },
  {
    value: 'ugc_hook_reaction_demo_cta',
    label: 'UGC: Hook → Reaction → Demo → CTA',
    description: 'Creator-style direct response with reaction beat.',
    roles: ['hook', 'human_interaction', 'product_focus', 'brand_finish'],
    bestFitIntents: ['creator_style_content', 'performance_ad', 'social_content'],
    recommendedShotCount: 4,
    durationRangeSec: [7, 12],
    minProductVisiblePct: 0.6,
    characterPolicy: 'required',
    voPolicy: 'optional',
    ctaPolicy: 'optional',
  },
];

/** Score how well a structure fits a content intent. */
export function scoreStructureForIntent(
  def: CommerceStructureDef,
  intent: ContentIntent | null | undefined,
): number {
  if (!intent) return 0;
  if (def.bestFitIntents[0] === intent) return 100;
  if (def.bestFitIntents.includes(intent)) return 70;
  return 0;
}

/** Pick the best structure for a content intent. Returns null if none. */
export function pickBestStructureForIntent(
  intent: ContentIntent | null | undefined,
): CommerceStructureDef | null {
  if (!intent) return null;
  let best: CommerceStructureDef | null = null;
  let bestScore = -1;
  for (const def of COMMERCE_STORY_STRUCTURES) {
    const s = scoreStructureForIntent(def, intent);
    if (s > bestScore) {
      bestScore = s;
      best = def;
    }
  }
  return bestScore > 0 ? best : null;
}

export function getStructureByValue(value: string): CommerceStructureDef | undefined {
  return COMMERCE_STORY_STRUCTURES.find(s => s.value === value);
}
