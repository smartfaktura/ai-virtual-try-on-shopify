/**
 * Adaptive duration planner.
 *
 * Replaces the hard 15-second total assumption. Returns a target total
 * duration band based on intent, platform, pace, category, shot count,
 * and clarity-first mode. Callers may still proportionally scale to
 * fit Kling per-shot constraints — that fallback remains intact.
 */
import type {
  ContentIntent, Platform, PaceMode, ProductCategoryKey,
} from '@/types/commerceVideo';
import { getCategoryModule } from './categoryModules';

export interface DurationContext {
  intent: ContentIntent | null | undefined;
  platform?: Platform;
  shotCount: number;
  pace?: PaceMode;
  category?: ProductCategoryKey;
  clarityFirst?: boolean;
}

export interface DurationPlan {
  totalSec: number;
  rangeSec: [number, number];
  perShotAvgSec: number;
}

const INTENT_RANGES: Partial<Record<ContentIntent, [number, number]>> = {
  social_content: [5, 9],
  creator_style_content: [7, 12],
  performance_ad: [8, 13],
  feature_benefit_video: [9, 13],
  pdp_video: [6, 10],
  product_showcase: [8, 12],
  product_detail_film: [10, 15],
  launch_teaser: [6, 10],
  brand_mood_film: [10, 15],
  campaign_editorial: [10, 15],
};

const PLATFORM_BIAS: Partial<Record<Platform, number>> = {
  tiktok: -1,
  instagram_reels: -1,
  meta_feed: 0,
  youtube_shorts: 0,
  website_pdp: 0,
  marketplace: 0,
  general: 0,
};

const PACE_BIAS: Record<PaceMode, number> = {
  calm: 1.5,
  balanced: 0,
  dynamic: -1.5,
};

export function planDuration(ctx: DurationContext): DurationPlan {
  const baseRange = INTENT_RANGES[ctx.intent ?? 'product_showcase'] ?? [8, 12];
  let lo = baseRange[0];
  let hi = baseRange[1];

  // Platform bias
  const pBias = PLATFORM_BIAS[ctx.platform ?? 'general'] ?? 0;
  lo += pBias;
  hi += pBias;

  // Pace bias
  const pace = ctx.pace ?? getCategoryModule(ctx.category).pacingBias;
  const paceBias = PACE_BIAS[pace];
  lo += paceBias;
  hi += paceBias;

  // Clarity-first slightly trims abstract space
  if (ctx.clarityFirst) hi -= 1;

  // Hard clamps
  lo = Math.max(4, Math.round(lo));
  hi = Math.min(15, Math.max(lo + 1, Math.round(hi)));

  // Choose midpoint, but prefer something divisible by shot count
  const mid = Math.round((lo + hi) / 2);
  const shots = Math.max(1, ctx.shotCount);
  const perShot = Math.max(1, Math.round(mid / shots));
  const total = Math.min(hi, Math.max(lo, perShot * shots));

  return {
    totalSec: total,
    rangeSec: [lo, hi],
    perShotAvgSec: perShot,
  };
}
