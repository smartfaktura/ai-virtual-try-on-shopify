/**
 * Intent-aware ending planner.
 *
 * Given the project context, chooses the most appropriate ending style.
 * The user-selected ending always wins unless it is 'auto'.
 */
import type {
  ContentIntent, Platform, SoundMode, EndingStyle, ProductCategoryKey,
} from '@/types/commerceVideo';
import { getCategoryModule } from './categoryModules';

export interface EndingContext {
  intent: ContentIntent | null | undefined;
  platform?: Platform;
  soundMode?: SoundMode;
  clarityFirst?: boolean;
  offerContext?: string;
  category?: ProductCategoryKey;
  userOverride?: EndingStyle; // if not 'auto', returned as-is
}

export function pickEnding(ctx: EndingContext): EndingStyle {
  if (ctx.userOverride && ctx.userOverride !== 'auto') return ctx.userOverride;

  // Marketplace / PDP → clean
  if (ctx.platform === 'marketplace') return 'marketplace_clean_end';
  if (ctx.platform === 'website_pdp' || ctx.intent === 'pdp_video') return 'product_close';

  // Performance ad / feature benefit with offer → CTA
  if ((ctx.intent === 'performance_ad' || ctx.intent === 'feature_benefit_video') && ctx.offerContext) {
    return 'hard_cta';
  }
  if (ctx.intent === 'performance_ad') return 'soft_cta';
  if (ctx.intent === 'feature_benefit_video') return 'soft_cta';

  // Brand mood / campaign → atmosphere or luxury
  if (ctx.intent === 'brand_mood_film') return 'atmosphere_resolve';
  if (ctx.intent === 'campaign_editorial') return 'logo_safe_luxury_end';
  if (ctx.intent === 'launch_teaser') return 'clean_brand_close';

  // Detail / showcase → product or detail close
  if (ctx.intent === 'product_detail_film') return 'detail_close';
  if (ctx.intent === 'product_showcase') return 'product_close';

  // Creator-style / social → clean brand close
  if (ctx.intent === 'creator_style_content' || ctx.intent === 'social_content') {
    return 'clean_brand_close';
  }

  // Clarity-first overrides ambiguity
  if (ctx.clarityFirst) return 'product_close';

  // Category fallback
  const cat = getCategoryModule(ctx.category);
  return cat.endingTendencies[0] || 'clean_brand_close';
}
