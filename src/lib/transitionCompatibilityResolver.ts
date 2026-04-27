/**
 * Compatibility resolver for two analyzed frames in the Start & End workflow.
 * Pure deterministic function — no extra AI call.
 *
 * Returns a tier (strong/good/risky/weak) plus the shared anchor tokens
 * that feed the prompt builder, plus risk flags surfaced in the UI.
 */

import type { VideoAnalysis } from '@/lib/videoStrategyResolver';
import type { TransitionTier } from '@/lib/transitionMotionRecipes';

export interface CompatibilityRiskFlags {
  angleShift: boolean;
  sceneShift: boolean;
  subjectShift: boolean;
  lightingShift: boolean;
}

export interface TransitionCompatibility {
  tier: TransitionTier;
  reason: string;
  recommendation?: string;
  /** Concrete tokens to anchor in the ANCHOR clause of the prompt. */
  sharedElements: string[];
  riskFlags: CompatibilityRiskFlags;
}

function eq<T>(a: T | undefined | null, b: T | undefined | null): boolean {
  if (a == null || b == null) return false;
  return a === b;
}

function categoryOf(a: VideoAnalysis | null | undefined): string | undefined {
  return (a as any)?.category || (a as any)?.subject_category;
}

export function resolveTransitionCompatibility(
  start: VideoAnalysis | null,
  end: VideoAnalysis | null,
): TransitionCompatibility {
  // Default fallback if either analysis is missing.
  if (!start || !end) {
    return {
      tier: 'good',
      reason: 'Analysis not yet complete — using balanced defaults.',
      sharedElements: ['composition'],
      riskFlags: { angleShift: false, sceneShift: false, subjectShift: false, lightingShift: false },
    };
  }

  const sCat = categoryOf(start);
  const eCat = categoryOf(end);
  const sameCategory = sCat && eCat && sCat === eCat;

  const sScene = (start as any).ecommerce_scene_type || (start as any).scene_type;
  const eScene = (end as any).ecommerce_scene_type || (end as any).scene_type;
  const sameScene = eq(sScene, eScene);

  const sLighting = (start as any).lighting_style;
  const eLighting = (end as any).lighting_style;
  const sameLighting = eq(sLighting, eLighting);

  const sAngle = (start as any).camera_angle;
  const eAngle = (end as any).camera_angle;
  const sameAngle = eq(sAngle, eAngle);

  const sSubject = (start as any).subject_type;
  const eSubject = (end as any).subject_type;
  const sameSubject = eq(sSubject, eSubject);

  const sHasPerson = (start as any).has_person;
  const eHasPerson = (end as any).has_person;
  const personConsistent = sHasPerson === eHasPerson;

  const sObjs: string[] = (start as any).visible_object_list || [];
  const eObjs: string[] = (end as any).visible_object_list || [];
  const sharedObjects = sObjs.filter((o) => eObjs.includes(o));

  // Build shared anchor elements
  const sharedElements: string[] = [];
  if (sameCategory) {
    if (sCat === 'fragrances') sharedElements.push('bottle silhouette', 'label typography');
    else if (sCat === 'fashion_apparel') sharedElements.push('outfit silhouette', 'fabric texture');
    else if (sCat === 'jewelry') sharedElements.push('stone facets', 'metal finish');
    else if (sCat === 'beauty_skincare') sharedElements.push('product geometry', 'label typography');
    else if (sCat === 'electronics') sharedElements.push('device geometry', 'finish');
    else sharedElements.push('product geometry', 'finish');
  }
  if (personConsistent && sHasPerson) sharedElements.push('subject identity');
  if (sameLighting && sLighting) sharedElements.push(`${String(sLighting).toLowerCase()} lighting`);
  if (sameScene && sScene) sharedElements.push('scene framing');
  for (const obj of sharedObjects.slice(0, 3)) sharedElements.push(obj.toLowerCase());

  // Always have at least one anchor
  if (sharedElements.length === 0) sharedElements.push('overall composition');

  const riskFlags: CompatibilityRiskFlags = {
    angleShift: !sameAngle,
    sceneShift: !sameScene,
    subjectShift: !sameSubject || !personConsistent,
    lightingShift: !sameLighting,
  };

  // Tier resolution
  let tier: TransitionTier;
  let reason: string;
  let recommendation: string | undefined;

  if (!sameCategory) {
    tier = 'weak';
    reason = 'These two images appear to be different categories. Cinematic dissolve is recommended.';
    recommendation = 'Consider Ad Sequence for unrelated frames.';
  } else if (sameCategory && sameScene && sameLighting && (personConsistent || !sHasPerson)) {
    tier = 'strong';
    reason = 'Both frames share category, scene, and lighting — ideal for a continuous transition.';
  } else if (sameCategory && (sameScene || sameLighting)) {
    tier = 'good';
    reason = 'Frames share category with partial overlap — a controlled transition will work well.';
  } else {
    tier = 'risky';
    reason = 'Same category but large angle, scene, or lighting shift — a soft cross-fade is safer.';
    recommendation = 'Use a softer style and lower motion strength for best results.';
  }

  return { tier, reason, recommendation, sharedElements, riskFlags };
}
