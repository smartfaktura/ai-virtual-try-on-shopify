// ── Seedream-First Catalog Builder Types ──

export type ProductCategory =
  | 'top' | 'trousers' | 'skirt' | 'shorts' | 'dress' | 'jumpsuit'
  | 'jacket_coat' | 'shoes' | 'bag' | 'hat' | 'sunglasses'
  | 'scarf' | 'belt' | 'jewelry' | 'accessory' | 'unknown';

export type HeroSlot =
  | 'upper_body_slot' | 'lower_body_slot' | 'full_body_slot'
  | 'footwear_slot' | 'bag_slot' | 'headwear_slot'
  | 'eyewear_slot' | 'jewelry_slot' | 'accessory_slot';

export type FashionStyleId =
  | 'minimal_studio' | 'premium_neutral' | 'editorial_clean'
  | 'streetwear_clean' | 'luxury_soft';

export type CatalogShotId =
  // On-model shots
  | 'front_model' | 'back_view' | 'side_3q' | 'detail_closeup'
  | 'movement' | 'hands_detail' | 'sitting' | 'full_look'
  // New on-model shots
  | 'lifestyle_context' | 'over_shoulder' | 'waist_up_crop' | 'walking_motion'
  | 'cross_body' | 'wrist_shot'
  // Product-only shots
  | 'ghost_mannequin' | 'front_flat' | 'back_flat' | 'zoom_detail'
  // New product-only shots
  | 'on_surface' | 'styled_flat_lay'
  // Category-specific
  | 'hand_carry' | 'shoulder_carry' | 'side_body'
  | 'standing_shoe_focus' | 'side_step' | 'walking_crop'
  | 'close_portrait' | 'placement_detail' | 'macro_detail'
  | 'product_front' | 'product_side' | 'product_angle'
  | 'hardware_detail';

export type RenderPath =
  | 'anchor_generate'
  | 'anchor_edit'
  | 'reference_generate'
  | 'product_only_generate';

export type ShotGroup = 'on-model' | 'product-only';

export interface ShotDefinition {
  id: CatalogShotId;
  label: string;
  group: ShotGroup;
  compatibleCategories: Set<ProductCategory>;
  defaultRenderPath: RenderPath;
  needsModel: boolean;
  promptTemplate: string;
  /** Category-specific prompt overrides */
  categoryOverrides?: Partial<Record<ProductCategory, string>>;
}

export type ModelAudienceType = 'adult_woman' | 'adult_man' | 'child';

export interface SupportWardrobe {
  upper_body_slot: string | null;
  lower_body_slot: string | null;
  full_body_slot: string | null;
  footwear_slot: string | null;
  outerwear_slot: string | null;
  headwear_slot: string | null;
  bag_slot: string | null;
  accessory_slot: string | null;
}

export interface FashionStyleDefinition {
  id: FashionStyleId;
  label: string;
  description: string;
  stylingTone: string;
  lightingId: string;
  poseEnergy: string;
  accessoryIntensity: string;
  supportWardrobeKits: Record<ModelAudienceType, SupportWardrobe>;
}

export interface BackgroundDefinition {
  id: string;
  label: string;
  promptBlock: string;
  lightingCompat: string;
  shadowStyle: string;
  hex: string;
}

export interface CatalogSessionLock {
  fashionStyle: FashionStyleId;
  modelId: string | null;
  modelProfile: string;
  modelAudience: ModelAudienceType;
  backgroundId: string;
  backgroundPrompt: string;
  lightingPrompt: string;
  consistencyBlock: string;
}

export interface ProductLookLock {
  productId: string;
  productTitle: string;
  productCategory: ProductCategory;
  heroSlot: HeroSlot;
  supportWardrobePrompt: string;
  anchorShotId: CatalogShotId;
  anchorImageUrl: string | null;
}

export interface CatalogModelEntry {
  id: string;
  profile: string;
  audience: ModelAudienceType;
  imageUrl: string | null;
}

export interface CatalogSessionConfig {
  products: Array<{
    id: string;
    title: string;
    description: string;
    productType: string;
    imageUrl: string;
    imageB64?: string;
    detectedCategory: ProductCategory;
  }>;
  fashionStyle: FashionStyleId;
  /** Multi-model: empty array = product-only mode */
  models: CatalogModelEntry[];
  backgroundId: string;
  selectedShots: CatalogShotId[];
}

export interface CatalogJobExtended {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  images: string[];
  error?: string;
  productId: string;
  productName: string;
  shotId: CatalogShotId;
  shotLabel: string;
  renderPath: RenderPath;
  isAnchor: boolean;
}

export interface CatalogBatchStateV2 {
  jobs: CatalogJobExtended[];
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  allDone: boolean;
  aggregatedImages: string[];
  /** Track anchor completion per product */
  anchorStatus: Record<string, 'pending' | 'generating' | 'completed' | 'failed'>;
  phase: 'anchors' | 'derivatives' | 'complete';
}
