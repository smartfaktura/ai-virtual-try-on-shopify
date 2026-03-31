import type { TryOnPose, PoseCategory } from '@/types';

// Pose preview imports
import poseFrontRelaxed from '@/assets/catalog/pose_front_relaxed.png';
import poseFrontHandsHips from '@/assets/catalog/pose_front_hands_hips.png';
import poseFrontOneHandHip from '@/assets/catalog/pose_front_one_hand_hip.jpg';
import poseFrontArmsCrossed from '@/assets/catalog/pose_front_arms_crossed.jpg';
import poseFrontWalking from '@/assets/catalog/pose_front_walking.png';
import poseThreeQuarter from '@/assets/catalog/pose_three_quarter.png';
import poseSideProfile from '@/assets/catalog/pose_side_profile.jpg';
import poseBackView from '@/assets/catalog/pose_back_view.png';
import moodRadiant from '@/assets/catalog/mood_radiant.jpg';

/* ─── Studio-only catalog poses ─── */
export const catalogPoses: TryOnPose[] = [
  // Front
  { poseId: 'catalogPose_front_relaxed', name: 'Front Relaxed', description: 'Arms relaxed at sides, front-facing', category: 'front' as PoseCategory, previewUrl: poseFrontRelaxed, promptHint: 'Fashion model standing front-facing, arms relaxed at sides, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_front_hands_hips', name: 'Hands on Hips', description: 'Both hands on hips, front-facing', category: 'front' as PoseCategory, previewUrl: poseFrontHandsHips, promptHint: 'Fashion model standing front-facing with both hands on hips, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_front_one_hand_hip', name: 'One Hand on Hip', description: 'One hand on hip, front-facing', category: 'front' as PoseCategory, previewUrl: poseFrontOneHandHip, promptHint: 'Fashion model standing front-facing with one hand on hip, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_front_arms_crossed', name: 'Arms Crossed', description: 'Arms crossed, front-facing', category: 'front' as PoseCategory, previewUrl: poseFrontArmsCrossed, promptHint: 'Fashion model standing front-facing with arms crossed, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_front_walking', name: 'Walking', description: 'Mid-stride walking pose', category: 'front' as PoseCategory, previewUrl: poseFrontWalking, promptHint: 'Fashion model walking naturally mid-stride, white studio background, professional e-commerce photography, full body' },

  // Angled
  { poseId: 'catalogPose_three_quarter', name: 'Three-Quarter', description: 'Three-quarter angled turn', category: 'angled' as PoseCategory, previewUrl: poseThreeQuarter, promptHint: 'Fashion model in three-quarter turn pose, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_side_profile', name: 'Side Profile', description: 'Classic side profile', category: 'angled' as PoseCategory, previewUrl: poseSideProfile, promptHint: 'Fashion model in side profile pose, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_back_view', name: 'Back View', description: 'Back-facing pose', category: 'angled' as PoseCategory, previewUrl: poseBackView, promptHint: 'Fashion model seen from behind, back view, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_over_shoulder', name: 'Over-the-Shoulder', description: 'Looking back over shoulder', category: 'angled' as PoseCategory, previewUrl: poseThreeQuarter, promptHint: 'Fashion model looking back over shoulder, white studio background, professional e-commerce photography, full body' },

  // Detail
  { poseId: 'catalogPose_seated', name: 'Seated', description: 'Relaxed seated pose', category: 'detail' as PoseCategory, previewUrl: poseFrontRelaxed, promptHint: 'Fashion model seated casually on a minimal stool, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_closeup', name: 'Close-Up', description: 'Upper body detail shot', category: 'detail' as PoseCategory, previewUrl: poseFrontHandsHips, promptHint: 'Fashion model upper body close-up, detail shot, white studio background, professional e-commerce photography' },
];

/* ─── Catalog-specific backgrounds ─── */
export const catalogBackgrounds: TryOnPose[] = [
  // Clean Studio
  { poseId: 'catalogBg_white_seamless', name: 'White Seamless', description: 'Pure white seamless studio backdrop', category: 'clean-studio' as PoseCategory, previewUrl: '', promptHint: 'Pure white seamless studio photography backdrop, clean infinity cove, professional studio lighting, no objects or people' },
  { poseId: 'catalogBg_gray_gradient', name: 'Gray Gradient', description: 'Soft gray gradient backdrop', category: 'clean-studio' as PoseCategory, previewUrl: '', promptHint: 'Soft gray gradient studio photography backdrop, subtle vignette, professional lighting, clean and minimal, no objects or people' },
  { poseId: 'catalogBg_warm_beige', name: 'Warm Beige', description: 'Warm beige studio backdrop', category: 'clean-studio' as PoseCategory, previewUrl: '', promptHint: 'Warm beige toned studio photography backdrop, neutral tones, soft lighting, elegant and clean, no objects or people' },

  // Surface
  { poseId: 'catalogBg_marble', name: 'Marble Surface', description: 'White marble background', category: 'surface' as PoseCategory, previewUrl: '', promptHint: 'White Carrara marble surface background for product photography, clean veining pattern, soft top-down lighting, no objects' },
  { poseId: 'catalogBg_concrete', name: 'Raw Concrete', description: 'Industrial concrete backdrop', category: 'surface' as PoseCategory, previewUrl: '', promptHint: 'Raw concrete textured wall background, industrial minimal aesthetic, even lighting, no objects or people' },
  { poseId: 'catalogBg_wood_grain', name: 'Light Wood', description: 'Natural light wood surface', category: 'surface' as PoseCategory, previewUrl: '', promptHint: 'Natural light oak wood surface background, clean grain pattern, warm soft lighting, suitable for product photography, no objects' },

  // Outdoor & Environment
  { poseId: 'catalogBg_botanical', name: 'Botanical Garden', description: 'Lush green botanical setting', category: 'botanical' as PoseCategory, previewUrl: '', promptHint: 'Lush green botanical garden background, tropical foliage, soft natural light filtering through leaves, no people, blurred bokeh' },
  { poseId: 'catalogBg_urban', name: 'Urban Street', description: 'Clean urban streetscape', category: 'outdoor' as PoseCategory, previewUrl: '', promptHint: 'Clean modern urban street background, minimalist architecture, soft daylight, shallow depth of field, no people, muted tones' },
  { poseId: 'catalogBg_golden_hour', name: 'Golden Hour', description: 'Warm sunset golden hour light', category: 'outdoor' as PoseCategory, previewUrl: '', promptHint: 'Golden hour warm sunset background, beautiful warm light, soft bokeh, outdoor setting, no people, ethereal atmosphere' },

  // Interior
  { poseId: 'catalogBg_living_room', name: 'Modern Living Room', description: 'Contemporary living room interior', category: 'living-space' as PoseCategory, previewUrl: '', promptHint: 'Modern contemporary living room interior background, designer furniture, natural light from large windows, no people, editorial interior style' },
  { poseId: 'catalogBg_loft', name: 'Industrial Loft', description: 'Open loft space with exposed brick', category: 'living-space' as PoseCategory, previewUrl: '', promptHint: 'Industrial loft space with exposed brick walls, large windows, warm lighting, open floor plan, no people, editorial interior' },
  { poseId: 'catalogBg_boutique', name: 'Boutique Store', description: 'High-end retail environment', category: 'retail' as PoseCategory, previewUrl: '', promptHint: 'High-end fashion boutique retail interior, minimalist shelving, luxury materials, soft ambient lighting, no people' },
];

/* ─── Category metadata ─── */
export const CATALOG_POSE_CATEGORIES: string[] = ['front', 'angled', 'detail'];
export const CATALOG_BG_CATEGORIES: string[] = ['clean-studio', 'surface', 'botanical', 'outdoor', 'living-space', 'retail'];

export const CATALOG_CATEGORY_LABELS: Record<string, string> = {
  front: 'Front',
  angled: 'Side & Angled',
  detail: 'Detail',
  'clean-studio': 'Clean Studio',
  surface: 'Surface',
  botanical: 'Botanical',
  outdoor: 'Outdoor',
  'living-space': 'Living Space',
  retail: 'Retail',
};

/* ─── Mood / Expression selector ─── */
export interface CatalogMood {
  id: string;
  name: string;
  previewUrl: string;
  promptHint: string;
}

export const CATALOG_MOODS: CatalogMood[] = [
  { id: 'any', name: 'Any Expression', previewUrl: '', promptHint: '' },
  { id: 'joyful', name: 'Joyful', previewUrl: moodRadiant, promptHint: 'genuinely joyful smiling expression' },
  { id: 'radiant', name: 'Radiant', previewUrl: moodRadiant, promptHint: 'radiant glowing warm expression' },
  { id: 'neutral', name: 'Neutral', previewUrl: moodRadiant, promptHint: 'calm neutral expression' },
  { id: 'unapologetic', name: 'Unapologetic', previewUrl: moodRadiant, promptHint: 'strong unapologetic fierce expression' },
  { id: 'confident', name: 'Confident', previewUrl: moodRadiant, promptHint: 'confident self-assured expression' },
];

/** Combined array for lookup by ID */
export const allCatalogItems = [...catalogPoses, ...catalogBackgrounds];
