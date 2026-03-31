import type { TryOnPose, PoseCategory } from '@/types';

/* ─── Catalog-specific poses ─── */
export const catalogPoses: TryOnPose[] = [
  // Studio
  { poseId: 'catalogPose_studio_front', name: 'Studio Front', description: 'Straight-on front-facing studio pose', category: 'studio' as PoseCategory, previewUrl: '', promptHint: 'Fashion model standing front-facing, arms relaxed at sides, white studio background, professional e-commerce photography, full body' },
  { poseId: 'catalogPose_studio_side', name: 'Studio Side', description: 'Classic side profile studio pose', category: 'studio' as PoseCategory, previewUrl: '', promptHint: 'Fashion model standing in side profile pose, white studio background, professional lighting, full body shot' },
  { poseId: 'catalogPose_three_quarter', name: 'Three-Quarter', description: 'Three-quarter angled pose', category: 'studio' as PoseCategory, previewUrl: '', promptHint: 'Fashion model in three-quarter angle pose, slight turn, white studio background, professional e-commerce photo, full body' },
  { poseId: 'catalogPose_back_view', name: 'Back View', description: 'Back-facing studio pose', category: 'studio' as PoseCategory, previewUrl: '', promptHint: 'Fashion model seen from behind, back view pose, white studio background, professional photography, full body' },

  // Lifestyle
  { poseId: 'catalogPose_walking', name: 'Walking', description: 'Natural mid-stride walking pose', category: 'lifestyle' as PoseCategory, previewUrl: '', promptHint: 'Fashion model walking naturally mid-stride, confident movement, white studio background, professional photography, full body' },
  { poseId: 'catalogPose_seated', name: 'Seated', description: 'Relaxed seated pose on stool', category: 'lifestyle' as PoseCategory, previewUrl: '', promptHint: 'Fashion model seated on a minimal stool, relaxed posture, white studio background, professional photography, full body' },
  { poseId: 'catalogPose_leaning', name: 'Leaning', description: 'Casual leaning pose', category: 'lifestyle' as PoseCategory, previewUrl: '', promptHint: 'Fashion model leaning casually to one side, relaxed and confident, white studio background, professional photography, full body' },

  // Editorial
  { poseId: 'catalogPose_editorial_power', name: 'Power Pose', description: 'Strong editorial power stance', category: 'editorial' as PoseCategory, previewUrl: '', promptHint: 'Fashion model in editorial power stance, hands on hips, confident expression, white studio background, professional photography, full body' },
  { poseId: 'catalogPose_over_shoulder', name: 'Over-the-Shoulder', description: 'Looking back over shoulder', category: 'editorial' as PoseCategory, previewUrl: '', promptHint: 'Fashion model looking back over their shoulder, editorial style, white studio background, professional photography, full body' },
  { poseId: 'catalogPose_closeup', name: 'Close-Up', description: 'Upper body close-up shot', category: 'editorial' as PoseCategory, previewUrl: '', promptHint: 'Fashion model upper body close-up, detail shot showing garment neckline and shoulders, white studio background, professional photography' },
  { poseId: 'catalogPose_dynamic', name: 'Dynamic Motion', description: 'Movement captured mid-action', category: 'editorial' as PoseCategory, previewUrl: '', promptHint: 'Fashion model in dynamic motion, fabric flowing naturally, mid-action editorial style, white studio background, professional photography, full body' },
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
export const CATALOG_POSE_CATEGORIES: string[] = ['studio', 'lifestyle', 'editorial'];
export const CATALOG_BG_CATEGORIES: string[] = ['clean-studio', 'surface', 'botanical', 'outdoor', 'living-space', 'retail'];

export const CATALOG_CATEGORY_LABELS: Record<string, string> = {
  studio: 'Studio',
  lifestyle: 'Lifestyle',
  editorial: 'Editorial',
  'clean-studio': 'Clean Studio',
  surface: 'Surface',
  botanical: 'Botanical',
  outdoor: 'Outdoor',
  'living-space': 'Living Space',
  retail: 'Retail',
};

/** Combined array for lookup by ID */
export const allCatalogItems = [...catalogPoses, ...catalogBackgrounds];
