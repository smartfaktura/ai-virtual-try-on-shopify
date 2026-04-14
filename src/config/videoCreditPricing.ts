// Shared credit pricing engine — single source of truth for frontend + backend
export const VIDEO_CREDIT_RULES = {
  animate: {
    base5s: 10,
    base10s: 18,
    premiumMotion: 2,   // add-on for complex motion recipes
    ambient: 4,         // ambient audio add-on
  },
  adSequence: {
    base2Shots: 24,
    extraShot: 8,
    ambient: 6,
    voice: 12,
  },
  consistentModel: {
    base: 18,
    strong: 6,          // add-on for strong consistency
    maximum: 12,        // add-on for maximum consistency
    base10s: 28,
    ambient: 4,
    voice: 10,
  },
  shortFilm: {
    basePerShot5s: 10,
    basePerShot10s: 18,
    ambient: 4,
    voice: 12,
    planningFee: 5,     // AI shot-plan generation
  },
} as const;

export type VideoWorkflowType = 'animate' | 'adSequence' | 'consistentModel';

export interface CreditEstimateParams {
  workflowType: VideoWorkflowType;
  duration: '5' | '10';
  audioMode: 'silent' | 'ambient' | 'voice';
  motionRecipe?: string;
  shotCount?: number;
  consistencyLevel?: 'standard' | 'strong' | 'maximum';
}

const PREMIUM_MOTION_RECIPES = ['product_orbit', 'premium_handheld'];

export function estimateCredits(params: CreditEstimateParams): number {
  const { workflowType, duration, audioMode, motionRecipe, shotCount = 2, consistencyLevel = 'standard' } = params;

  if (workflowType === 'animate') {
    const rules = VIDEO_CREDIT_RULES.animate;
    let cost = duration === '10' ? rules.base10s : rules.base5s;
    if (motionRecipe && PREMIUM_MOTION_RECIPES.includes(motionRecipe)) {
      cost += rules.premiumMotion;
    }
    if (audioMode === 'ambient') cost += rules.ambient;
    return cost;
  }

  if (workflowType === 'adSequence') {
    const rules = VIDEO_CREDIT_RULES.adSequence;
    let cost = rules.base2Shots;
    if (shotCount > 2) cost += (shotCount - 2) * rules.extraShot;
    if (audioMode === 'ambient') cost += rules.ambient;
    if (audioMode === 'voice') cost += rules.voice;
    return cost;
  }

  if (workflowType === 'consistentModel') {
    const rules = VIDEO_CREDIT_RULES.consistentModel;
    let cost = duration === '10' ? rules.base10s : rules.base;
    if (consistencyLevel === 'strong') cost += rules.strong;
    if (consistencyLevel === 'maximum') cost += rules.maximum;
    if (audioMode === 'ambient') cost += rules.ambient;
    if (audioMode === 'voice') cost += rules.voice;
    return cost;
  }

  return 10;
}

/** Estimate total credits for a bulk batch */
export function estimateBulkCredits(params: CreditEstimateParams, imageCount: number): { perImage: number; total: number } {
  const perImage = estimateCredits(params);
  return { perImage, total: perImage * imageCount };
}
