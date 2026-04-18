/**
 * Clarity-first planning mode.
 *
 * When enabled, transform a shot plan to favor product readability:
 * stable camera motion, no pure-abstract framing, guaranteed hero +
 * detail beats, and a clean ending that does not obscure the product.
 */
import type { ShotPlanItem } from '@/types/shortFilm';

const ABSTRACT_SCENE_TYPES = new Set(['mood_abstract', 'abstract_tease']);
const STABLE_CAMERA_MOTIONS = new Set([
  'static', 'slow_push_in', 'micro_pan', 'slow_pan', 'slow_drift',
]);
const CLARITY_FALLBACK_CAMERA = 'slow_push_in';

export interface ClarityFirstResult {
  shots: ShotPlanItem[];
  changes: string[];
}

export function applyClarityFirst(input: ShotPlanItem[]): ClarityFirstResult {
  const changes: string[] = [];
  const shots = input.map(s => ({ ...s }));

  // 1) Replace abstract scene types with product_hero, ensure product_visible
  for (const s of shots) {
    if (ABSTRACT_SCENE_TYPES.has(s.scene_type)) {
      changes.push(`shot ${s.shot_index}: ${s.scene_type} → product_hero (clarity-first)`);
      s.scene_type = 'product_hero';
      s.product_visible = true;
    }
    // 2) Force stable camera motion
    if (!STABLE_CAMERA_MOTIONS.has(s.camera_motion)) {
      changes.push(`shot ${s.shot_index}: camera ${s.camera_motion} → ${CLARITY_FALLBACK_CAMERA}`);
      s.camera_motion = CLARITY_FALLBACK_CAMERA;
    }
  }

  // 3) Guarantee at least one hero shot (product_reveal/product_moment) early
  const heroRoles = new Set(['product_reveal', 'product_moment']);
  const hasHero = shots.some(s => heroRoles.has(s.role));
  if (!hasHero && shots.length > 0) {
    const idx = Math.min(1, shots.length - 1);
    const before = shots[idx].role;
    shots[idx].role = 'product_reveal';
    shots[idx].scene_type = 'studio_reveal';
    shots[idx].product_visible = true;
    changes.push(`shot ${shots[idx].shot_index}: role ${before} → product_reveal (hero guarantee)`);
  }

  // 4) Guarantee a detail beat
  const detailRoles = new Set(['detail_closeup', 'product_focus']);
  const hasDetail = shots.some(s => detailRoles.has(s.role));
  if (!hasDetail && shots.length > 1) {
    const idx = Math.min(2, shots.length - 1);
    const before = shots[idx].role;
    shots[idx].role = 'detail_closeup';
    shots[idx].scene_type = 'macro_closeup';
    shots[idx].product_visible = true;
    changes.push(`shot ${shots[idx].shot_index}: role ${before} → detail_closeup (detail guarantee)`);
  }

  // 5) Final shot must keep product visible and use a clean scene type
  if (shots.length > 0) {
    const last = shots[shots.length - 1];
    last.product_visible = true;
    if (ABSTRACT_SCENE_TYPES.has(last.scene_type)) {
      last.scene_type = 'hero_end_frame';
      changes.push(`shot ${last.shot_index}: ending scene → hero_end_frame (clarity-first)`);
    }
  }

  // 6) Prefer high preservation on hero/detail shots
  for (const s of shots) {
    if (heroRoles.has(s.role) || detailRoles.has(s.role)) {
      if (s.preservation_strength !== 'high') {
        s.preservation_strength = 'high';
      }
    }
  }

  return { shots, changes };
}
