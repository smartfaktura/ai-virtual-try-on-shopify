/**
 * Pre-flight validator.
 *
 * Scores a Commerce Video project on a 0–100 scale and surfaces:
 *  - errors      → block generation (e.g. no shots, missing product ref).
 *  - warnings    → non-blocking quality issues.
 *  - suggestions → soft recommendations.
 *
 * The scorer is intentionally generous: most projects should land 70+
 * unless something is structurally wrong. Reserve sub-50 for real problems.
 */
import type { ShotPlanItem, ShortFilmSettings } from '@/types/shortFilm';
import type { ReferenceAsset } from '@/components/app/video/short-film/ReferenceUploadPanel';
import type {
  ContentIntent,
  Platform,
  SoundMode,
  ProductCategoryKey,
  EndingStyle,
} from '@/types/commerceVideo';
import { getCategoryModule } from './categoryModules';

export interface PreflightInput {
  intent?: ContentIntent | null;
  platform?: Platform;
  soundMode?: SoundMode;
  endingStyle?: EndingStyle;
  category?: ProductCategoryKey;
  shots: ShotPlanItem[];
  references: ReferenceAsset[];
  settings: ShortFilmSettings;
  clarityFirst?: boolean;
}

export interface PreflightFinding {
  id: string;
  message: string;
  severity: 'error' | 'warning' | 'suggestion';
}

export interface PreflightResult {
  score: number;            // 0–100
  passed: boolean;          // no errors
  errors: PreflightFinding[];
  warnings: PreflightFinding[];
  suggestions: PreflightFinding[];
  breakdown: Record<string, number>; // for telemetry / debugging
}

const PRODUCT_REF_ROLES = new Set(['product', 'main_hero', 'front', 'side', 'back', 'top', 'bottom', 'packaging', 'texture']);

export function validateProject(input: PreflightInput): PreflightResult {
  const errors: PreflightFinding[] = [];
  const warnings: PreflightFinding[] = [];
  const suggestions: PreflightFinding[] = [];
  const breakdown: Record<string, number> = {};

  const shots = input.shots || [];
  const refs = input.references || [];
  const totalDuration = shots.reduce((s, x) => s + (x.duration_sec || 0), 0);

  // ── HARD ERRORS ───────────────────────────────────────────────
  if (shots.length === 0) {
    errors.push({ id: 'no_shots', severity: 'error', message: 'No shots planned. Generate or add a shot plan first.' });
  }

  const hasProductRef = refs.some(r => PRODUCT_REF_ROLES.has((r.role || '').toLowerCase()));
  if (!hasProductRef) {
    errors.push({ id: 'no_product_ref', severity: 'error', message: 'At least one product reference image is required.' });
  }

  // ── HERO CLARITY (25 pts) ─────────────────────────────────────
  const productVisibleShots = shots.filter(s => s.product_visible).length;
  const productVisibleRatio = shots.length ? productVisibleShots / shots.length : 0;
  let heroScore = Math.round(productVisibleRatio * 25);
  breakdown.hero_clarity = heroScore;
  if (productVisibleRatio < 0.5 && shots.length > 0) {
    warnings.push({
      id: 'low_product_visibility',
      severity: 'warning',
      message: `Product is only visible in ${Math.round(productVisibleRatio * 100)}% of shots. Consider raising it for commerce intents.`,
    });
  }

  // ── DETAIL COVERAGE (15 pts) ──────────────────────────────────
  const hasDetail = shots.some(s => /detail|macro/i.test(s.role || s.scene_type || ''));
  const detailScore = hasDetail ? 15 : 8;
  breakdown.detail_coverage = detailScore;
  if (!hasDetail && shots.length >= 3) {
    suggestions.push({
      id: 'add_detail_shot',
      severity: 'suggestion',
      message: 'Adding a macro/detail shot strengthens product credibility.',
    });
  }

  // ── ENDING SUITABILITY (10 pts) ───────────────────────────────
  const lastShot = shots[shots.length - 1];
  const goodEndingRoles = /finish|close|end|brand|reveal|hero/i;
  const endingScore = lastShot && goodEndingRoles.test(lastShot.role || '') ? 10 : 6;
  breakdown.ending = endingScore;
  if (lastShot && !goodEndingRoles.test(lastShot.role || '')) {
    suggestions.push({
      id: 'weak_ending',
      severity: 'suggestion',
      message: 'Final shot is not a clear product/brand close — endings convert better when they resolve cleanly.',
    });
  }

  // ── REFERENCE ADEQUACY (15 pts) ───────────────────────────────
  let refScore = Math.min(refs.length, 3) * 5; // 5/10/15
  breakdown.reference_adequacy = refScore;
  if (refs.length < 2) {
    suggestions.push({
      id: 'few_references',
      severity: 'suggestion',
      message: 'Adding 1–2 more reference angles improves identity preservation.',
    });
  }

  // ── CATEGORY FIT (10 pts) ─────────────────────────────────────
  let categoryScore = 10;
  if (input.category) {
    const mod = getCategoryModule(input.category);
    const haveTexture = refs.some(r => /texture/i.test(r.role || r.name || ''));
    if (mod.referenceRequirements.includes('texture') && !haveTexture) {
      categoryScore -= 4;
      suggestions.push({
        id: 'missing_texture_ref',
        severity: 'suggestion',
        message: `For ${input.category.replace(/_/g, ' ')}, a texture/macro reference improves material accuracy.`,
      });
    }
  }
  breakdown.category_fit = categoryScore;

  // ── VO / VISUAL ALIGNMENT (10 pts) ────────────────────────────
  let voScore = 10;
  const sm = input.soundMode;
  const voActive = sm !== 'silent_first' && sm !== 'caption_first' && sm !== 'music_only' && sm !== 'no_voiceover';
  const shotsWithScript = shots.filter(s => s.script_line && s.script_line.trim().length > 0);
  if (voActive && shotsWithScript.length === 0 && shots.length >= 2) {
    voScore = 5;
    suggestions.push({
      id: 'vo_without_script',
      severity: 'suggestion',
      message: 'Voiceover is enabled but no shots have script lines. Add lines or switch to a music-only sound mode.',
    });
  }
  if (!voActive && shotsWithScript.length > 0) {
    voScore = 6;
    warnings.push({
      id: 'script_without_vo',
      severity: 'warning',
      message: 'Sound mode disables voiceover but shots contain script lines — they will be ignored.',
    });
  }
  breakdown.vo_alignment = voScore;

  // ── DURATION FIT (10 pts) ─────────────────────────────────────
  let durationScore = 10;
  if (input.platform === 'tiktok' || input.platform === 'instagram_reels' || input.platform === 'youtube_shorts') {
    if (totalDuration > 30) {
      durationScore = 5;
      warnings.push({
        id: 'too_long_for_social',
        severity: 'warning',
        message: `${totalDuration}s is long for ${input.platform.replace(/_/g, ' ')} — consider trimming under 30s.`,
      });
    }
  }
  if (input.platform === 'website_pdp' && totalDuration > 0 && totalDuration < 4) {
    durationScore = 6;
    suggestions.push({
      id: 'pdp_too_short',
      severity: 'suggestion',
      message: 'PDP videos benefit from a few seconds of breathing room.',
    });
  }
  breakdown.duration_fit = durationScore;

  // ── PLATFORM / ASPECT FIT (5 pts) ─────────────────────────────
  let aspectScore = 5;
  const verticalPlatforms: Platform[] = ['tiktok', 'instagram_reels', 'youtube_shorts'];
  if (input.platform && verticalPlatforms.includes(input.platform) && input.settings.aspectRatio !== '9:16') {
    aspectScore = 2;
    warnings.push({
      id: 'wrong_aspect',
      severity: 'warning',
      message: `${input.platform.replace(/_/g, ' ')} is vertical-first — switch aspect ratio to 9:16.`,
    });
  }
  if (input.platform === 'website_pdp' && input.settings.aspectRatio === '9:16') {
    aspectScore = 3;
    suggestions.push({
      id: 'pdp_vertical',
      severity: 'suggestion',
      message: 'Most PDPs render best in 1:1 or 4:5 — vertical may letterbox.',
    });
  }
  breakdown.aspect_fit = aspectScore;

  // ── Aggregate ─────────────────────────────────────────────────
  const score = Math.max(
    0,
    Math.min(
      100,
      heroScore + detailScore + endingScore + refScore + categoryScore + voScore + durationScore + aspectScore,
    ),
  );

  return {
    score,
    passed: errors.length === 0,
    errors,
    warnings,
    suggestions,
    breakdown,
  };
}
