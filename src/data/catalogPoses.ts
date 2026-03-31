import type { TryOnPose, PoseCategory } from '@/types';

// Pose preview imports — Front
import poseFrontRelaxed from '@/assets/catalog/pose_front_relaxed.png';
import poseFrontHandsHips from '@/assets/catalog/pose_front_hands_hips.png';
import poseFrontOneHandHip from '@/assets/catalog/pose_front_one_hand_hip.jpg';
import poseFrontArmsCrossed from '@/assets/catalog/pose_front_arms_crossed.jpg';
import poseFrontWalking from '@/assets/catalog/pose_front_walking.png';

// Pose preview imports — Angled
import poseThreeQuarter from '@/assets/catalog/pose_three_quarter.png';
import poseSideProfile from '@/assets/catalog/pose_side_profile.jpg';
import poseBackView from '@/assets/catalog/pose_back_view.png';
import poseOverShoulder from '@/assets/catalog/pose_over_shoulder.png';
import poseLeaning from '@/assets/catalog/pose_leaning.jpg';

// Pose preview imports — Detail
import poseSeated from '@/assets/catalog/pose_seated.png';
import poseCloseup from '@/assets/catalog/pose_closeup.png';
import poseFabricDetail from '@/assets/catalog/pose_fabric_detail.jpg';
import poseAccessoryDetail from '@/assets/catalog/pose_accessory_detail.jpg';
import poseBackDetail from '@/assets/catalog/pose_back_detail.jpg';

// Mood preview imports
import moodJoyful from '@/assets/catalog/mood_joyful_v2.jpg';
import moodRadiant from '@/assets/catalog/mood_radiant_v2.jpg';
import moodNeutral from '@/assets/catalog/mood_neutral_v2.jpg';
import moodUnapologetic from '@/assets/catalog/mood_unapologetic_v2.jpg';
import moodConfident from '@/assets/catalog/mood_confident_v2.jpg';

// Background preview imports
import bgWhite from '@/assets/catalog/bg_white.jpg';
import bgLightGray from '@/assets/catalog/bg_light_gray.jpg';
import bgConcrete from '@/assets/catalog/bg_concrete.jpg';
import bgIvory from '@/assets/catalog/bg_ivory.jpg';
import bgCharcoal from '@/assets/catalog/bg_charcoal.jpg';
import bgStone from '@/assets/catalog/bg_stone.jpg';
import bgCream from '@/assets/catalog/bg_cream.jpg';

/* ─── Studio-only catalog poses ─── */
export const catalogPoses: TryOnPose[] = [
  // Front (5)
  { poseId: 'catalogPose_front_relaxed', name: 'Front Relaxed', description: 'Arms relaxed at sides, front-facing', category: 'front' as PoseCategory, previewUrl: poseFrontRelaxed, promptHint: 'Fashion model standing front-facing, arms relaxed at sides, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_front_hands_hips', name: 'Hands on Hips', description: 'Both hands on hips, front-facing', category: 'front' as PoseCategory, previewUrl: poseFrontHandsHips, promptHint: 'Fashion model standing front-facing with both hands on hips, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_front_one_hand_hip', name: 'One Hand on Hip', description: 'One hand on hip, front-facing', category: 'front' as PoseCategory, previewUrl: poseFrontOneHandHip, promptHint: 'Fashion model standing front-facing with one hand on hip, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_front_arms_crossed', name: 'Arms Crossed', description: 'Arms crossed, front-facing', category: 'front' as PoseCategory, previewUrl: poseFrontArmsCrossed, promptHint: 'Fashion model standing front-facing with arms crossed, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_front_walking', name: 'Walking', description: 'Mid-stride walking pose', category: 'front' as PoseCategory, previewUrl: poseFrontWalking, promptHint: 'Fashion model walking naturally mid-stride, white studio background, professional e-commerce photography, full body' },

  // Angled (5)
  { poseId: 'catalogPose_three_quarter', name: 'Three-Quarter', description: 'Three-quarter angled turn', category: 'angled' as PoseCategory, previewUrl: poseThreeQuarter, promptHint: 'Fashion model in three-quarter turn pose, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_side_profile', name: 'Side Profile', description: 'Classic side profile', category: 'angled' as PoseCategory, previewUrl: poseSideProfile, promptHint: 'Fashion model in side profile pose, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_back_view', name: 'Back View', description: 'Back-facing pose', category: 'angled' as PoseCategory, previewUrl: poseBackView, promptHint: 'Fashion model seen from behind, back view, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_over_shoulder', name: 'Over-the-Shoulder', description: 'Looking back over shoulder', category: 'angled' as PoseCategory, previewUrl: poseOverShoulder, promptHint: 'Fashion model looking back over shoulder, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_leaning', name: 'Leaning', description: 'Casually leaning at an angle', category: 'angled' as PoseCategory, previewUrl: poseLeaning, promptHint: 'Fashion model leaning casually against wall at an angle, white studio background, professional e-commerce photography, full body' },

  // Detail (5)
  { poseId: 'catalogPose_seated', name: 'Seated', description: 'Relaxed seated pose', category: 'detail' as PoseCategory, previewUrl: poseSeated, promptHint: 'Fashion model seated casually on a minimal stool, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_closeup', name: 'Close-Up', description: 'Upper body detail shot', category: 'detail' as PoseCategory, previewUrl: poseCloseup, promptHint: 'Fashion model upper body close-up, detail shot, white studio background, professional e-commerce photography' },
  { poseId: 'catalogPose_fabric_detail', name: 'Fabric Detail', description: 'Close-up of fabric texture', category: 'detail' as PoseCategory, previewUrl: poseFabricDetail, promptHint: 'Macro close-up of garment fabric texture on model, white studio background, fashion detail photography' },
  { poseId: 'catalogPose_accessory_detail', name: 'Accessory Detail', description: 'Hands & wrist detail shot', category: 'detail' as PoseCategory, previewUrl: poseAccessoryDetail, promptHint: 'Close-up of model hands and wrists showing sleeve and accessory area, white studio background, fashion detail photography' },
  { poseId: 'catalogPose_back_detail', name: 'Back Detail', description: 'Back neckline & collar detail', category: 'detail' as PoseCategory, previewUrl: poseBackDetail, promptHint: 'Close-up of back neckline and collar on model, white studio background, fashion detail photography' },
];

/* ─── Clean studio backgrounds only ─── */
export const catalogBackgrounds: TryOnPose[] = [
  { poseId: 'catalogBg_white_seamless', name: 'White Seamless', description: 'Pure white seamless studio backdrop', category: 'clean-studio' as PoseCategory, previewUrl: bgWhite, promptHint: 'Pure white seamless studio photography backdrop, clean infinity cove, professional studio lighting, no objects or people' },
  { poseId: 'catalogBg_gray_gradient', name: 'Light Gray', description: 'Soft light gray backdrop', category: 'clean-studio' as PoseCategory, previewUrl: bgLightGray, promptHint: 'Soft light gray studio photography backdrop, subtle vignette, professional lighting, clean and minimal, no objects or people' },
  { poseId: 'catalogBg_warm_beige', name: 'Warm Beige', description: 'Warm beige studio backdrop', category: 'clean-studio' as PoseCategory, previewUrl: bgWarmBeige, promptHint: 'Warm beige toned studio photography backdrop, neutral tones, soft lighting, elegant and clean, no objects or people' },
  { poseId: 'catalogBg_concrete', name: 'Concrete', description: 'Industrial concrete backdrop', category: 'clean-studio' as PoseCategory, previewUrl: bgConcrete, promptHint: 'Raw concrete textured wall background, industrial minimal aesthetic, even lighting, no objects or people' },
  { poseId: 'catalogBg_sage_green', name: 'Sage Green', description: 'Sage green studio backdrop', category: 'clean-studio' as PoseCategory, previewUrl: bgSageGreen, promptHint: 'Sage green colored studio photography backdrop, soft muted green, professional lighting, clean and minimal, no objects or people' },
];

/* ─── Category metadata ─── */
export const CATALOG_POSE_CATEGORIES: string[] = ['front', 'angled', 'detail'];
export const CATALOG_BG_CATEGORIES: string[] = ['clean-studio'];

export const CATALOG_CATEGORY_LABELS: Record<string, string> = {
  front: 'Front',
  angled: 'Side & Angled',
  detail: 'Detail',
  'clean-studio': 'Clean Studio',
};

/* ─── Mood / Expression selector ─── */
export interface CatalogMood {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  promptHint: string;
}

export const CATALOG_MOODS: CatalogMood[] = [
  { id: 'any', name: 'Any Expression', description: 'Let the AI choose the most natural expression', previewUrl: '', promptHint: '' },
  { id: 'joyful', name: 'Joyful', description: 'Genuinely happy, warm smile showing teeth', previewUrl: moodJoyful, promptHint: 'genuinely joyful smiling expression' },
  { id: 'radiant', name: 'Radiant', description: 'Glowing, soft warm smile with warmth', previewUrl: moodRadiant, promptHint: 'radiant glowing warm expression' },
  { id: 'neutral', name: 'Neutral', description: 'Calm, composed, relaxed neutral face', previewUrl: moodNeutral, promptHint: 'calm neutral expression' },
  { id: 'unapologetic', name: 'Unapologetic', description: 'Strong, fierce, determined look', previewUrl: moodUnapologetic, promptHint: 'strong unapologetic fierce expression' },
  { id: 'confident', name: 'Confident', description: 'Self-assured with a subtle knowing smile', previewUrl: moodConfident, promptHint: 'confident self-assured expression' },
];

/** Combined array for lookup by ID */
export const allCatalogItems = [...catalogPoses, ...catalogBackgrounds];
