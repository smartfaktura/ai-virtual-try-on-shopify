import type { Tables } from '@/integrations/supabase/types';

export type UserProduct = Tables<'user_products'>;

export type PIStep = 1 | 2 | 3 | 4 | 5 | 6;

// ── Structured outfit system ──
export interface OutfitPiece {
  garment: string;
  color: string;
  fit?: string;
  material?: string;
}

export interface OutfitConfig {
  top?: OutfitPiece;
  bottom?: OutfitPiece;
  shoes?: OutfitPiece;
  accessories?: string;
  name?: string;
}

export interface OutfitPreset {
  id: string;
  name: string;
  config: OutfitConfig;
  category: string;
  gender?: string;
  isBuiltIn?: boolean;
  createdAt: string;
}

// ── Product categories ──
export type ProductCategory =
  | 'fragrance' | 'beauty-skincare' | 'makeup-lipsticks'
  | 'bags-accessories' | 'hats-small' | 'shoes'
  | 'garments' | 'home-decor' | 'furniture' | 'tech-devices'
  | 'food' | 'beverages' | 'supplements-wellness' | 'other'
  | 'lingerie' | 'swimwear' | 'activewear' | 'kidswear'
  | 'dresses' | 'hoodies' | 'streetwear' | 'jeans' | 'jackets'
  | 'sneakers' | 'boots' | 'high-heels'
  | 'backpacks' | 'wallets-cardholders' | 'belts' | 'scarves' | 'eyewear'
  | 'watches' | 'jewellery-necklaces' | 'jewellery-earrings'
  | 'jewellery-bracelets' | 'jewellery-rings';

export interface ProductAnalysis {
  /** Schema version — used to invalidate stale analyses */
  version?: number;

  category: ProductCategory;
  sizeClass: 'very-small' | 'small' | 'medium' | 'large' | 'extra-large';
  colorFamily: string;
  materialFamily: string;
  finish: string;
  packagingRelevant: boolean;
  personCompatible: boolean;
  accentColor?: string;

  // ── Global Visual tokens ──
  productSubcategory?: string;
  productForm?: string;
  productSilhouette?: string;
  productMainHex?: string;
  productSecondaryHex?: string;
  productAccentHex?: string;
  backgroundBaseHex?: string;
  backgroundSecondaryHex?: string;
  shadowToneHex?: string;
  productFinishType?: string;
  materialPrimary?: string;
  materialSecondary?: string;
  textureType?: string;
  transparencyType?: string;
  metalTone?: string;
  heroFeature?: string;
  detailFocusAreas?: string;
  scaleType?: string;
  wearabilityMode?: string;
  bodyPlacementSuggested?: string;

  // ── Global Semantic tokens ──
  ingredientFamilyPrimary?: string;
  ingredientFamilySecondary?: string;
  fruitsRelated?: string;
  flowersRelated?: string;
  botanicalsRelated?: string;
  woodsRelated?: string;
  spicesRelated?: string;
  greensRelated?: string;
  materialsRelated?: string;
  regionRelated?: string;
  landscapeRelated?: string;

  // ── Fashion & Apparel ──
  garmentType?: string;
  fitType?: string;
  fabricType?: string;
  fabricWeight?: string;
  drapeBehavior?: string;

  // ── Beauty & Skincare ──
  packagingType?: string;
  formulaType?: string;
  formulaTexture?: string;
  applicationMode?: string;
  skinAreaSuggested?: string;

  // ── Fragrances ──
  fragranceFamily?: string;
  bottleType?: string;
  capStyle?: string;
  liquidColorHex?: string;
  glassTintType?: string;
  noteObjectsPrimary?: string;
  noteObjectsSecondary?: string;
  scentWorld?: string;

  // ── Jewelry ──
  jewelryType?: string;
  gemType?: string;
  gemColorHex?: string;
  metalPrimary?: string;
  metalFinish?: string;
  wearPlacement?: string;
  sparkleLevel?: string;

  // ── Accessories ──
  accessoryType?: string;
  carryMode?: string;
  strapType?: string;
  hardwareType?: string;
  hardwareFinish?: string;
  structureType?: string;
  signatureDetail?: string;

  // ── Home & Decor ──
  decorType?: string;
  placementType?: string;
  objectScale?: string;
  baseMaterial?: string;
  surfaceFinish?: string;
  roomContextSuggested?: string;
  stylingCompanions?: string;

  // ── Food & Beverage ──
  foodType?: string;
  servingMode?: string;
  ingredientObjectsPrimary?: string;
  ingredientObjectsSecondary?: string;
  textureCue?: string;
  temperatureCue?: string;
  consumptionContext?: string;

  // ── Electronics ──
  deviceType?: string;
  interfaceType?: string;
  screenPresence?: string;
  screenStateSuggested?: string;
  finishMaterialPrimary?: string;
  industrialStyle?: string;
  portDetail?: string;
  buttonDetail?: string;

  // ── Sports & Fitness ──
  sportType?: string;
  gearType?: string;
  performanceMaterial?: string;
  gripTexture?: string;
  motionCue?: string;
  usageContext?: string;
  surfaceContext?: string;

  // ── Health & Supplements ──
  supplementType?: string;
  dosageForm?: string;
  mixingMode?: string;
  wellnessIngredientObjects?: string;
  containerType?: string;
  clinicalCleanlinessLevel?: string;
  routineContext?: string;
}

// ── Scene assignment ──
export type SceneScope = 'all' | 'category_group' | 'individual_product';

export interface SceneSelection {
  sceneId: string;
  scope: SceneScope;
  scopeValue: string | null; // category slug or product ID
}

// ── Scene type for camera/focus defaults ──
export type SceneType = 'macro' | 'packshot' | 'portrait' | 'lifestyle' | 'editorial' | 'flatlay';

// ── Refine structure ──
export interface OverallAesthetic {
  consistency: string;
  colorWorld: string;
  backgroundFamily: string;
  surfaceMaterial: string;
  lightingFamily: string;
  shadowStyle: string;
  stylingDirection: string;
  accentColor: string;
  accentCustom?: string;
  aestheticSource?: 'auto-balance' | 'anchor-first' | 'manual';
}

export interface PersonStyling {
  presentation: string;
  ageRange: string;
  skinTone: string;
  modelSelectionMode: string;
  outfitStyle: string;
  outfitColorDirection: string;
  handStyle: string;
  nails: string;
  jewelryVisibility: string;
  expression: string;
  hairVisibility: string;
  selectedModelId?: string;
}

export interface RefineSettings {
  aesthetic: OverallAesthetic;
  person?: PersonStyling;
  sceneDetails: Record<string, Record<string, string>>;
  advanced?: Record<string, string>;
  customNote?: string;
  packagingReferenceUrl?: string;
  // Format & output (merged from old Settings step)
  aspectRatio?: string;
  quality?: string;
  imageCount?: string;
  sceneAspectOverrides?: Record<string, string>;
  sceneProps?: Record<string, string[]>;
}

export interface ProductImageScene {
  id: string;
  title: string;
  description: string;
  promptTemplate?: string;
  previewUrl?: string;
  chips?: string[];
  triggerBlocks?: string[];
  categoryCollection?: string;
  sceneType?: SceneType;
  subCategory?: string;
  requiresExtraReference?: boolean;
  suggestedColors?: Array<{hex: string; label: string}>;
  outfitHint?: string;
  useSceneReference?: boolean;
}

export interface SubGroup {
  label: string;
  scenes: ProductImageScene[];
}

export interface CategoryCollection {
  id: string;
  title: string;
  scenes: ProductImageScene[];
  subGroups?: SubGroup[];
  categorySortOrder?: number;
}

export interface DetailSettings {
  // Format / generation config
  aspectRatio?: string;
  quality?: string;
  imageCount?: string;

  // Background & composition
  backgroundTone?: string;
  shadowStyle?: string;
  compositionFraming?: string;
  negativeSpace?: string;

  // Visual direction
  mood?: string;
  sceneIntensity?: string;
  productProminence?: string;
  lightingStyle?: string;

  // Scene environment
  environmentType?: string;
  surfaceType?: string;
  stylingDensity?: string;
  props?: string;

  // Visible person details
  presentation?: string;
  ageRange?: string;
  skinTone?: string;
  handStyle?: string;
  nails?: string;
  jewelryVisible?: string;
  cropType?: string;
  expression?: string;
  hairVisibility?: string;

  // Outfit details (from person styling)
  outfitStyle?: string;
  outfitColorDirection?: string;

  // Action details
  actionType?: string;
  actionIntensity?: string;

  // Detail focus
  focusArea?: string;
  cropIntensity?: string;
  detailStyle?: string;

  // Angle selection
  requestedViews?: string;
  numberOfViews?: string;
  matchStyle?: boolean;

  // Packaging details
  packagingType?: string;
  packagingState?: string;
  packagingComposition?: string;
  packagingFocus?: string;
  referenceStrength?: string;
  packagingReferenceUrl?: string;

  // Back view reference image (uploaded when backView trigger scenes are selected)
  backReferenceUrl?: string;

  // Product size
  productSize?: string;

  // Branding visibility
  brandingVisibility?: string;

  // Layout space
  layoutSpace?: string;

  // Consistency
  consistency?: string;

  // Styling direction
  stylingDirection?: string;

  // Accent color
  accentColor?: string;

  // Custom note
  customNote?: string;

  // Custom background hex (used when backgroundTone = 'custom')
  backgroundCustomHex?: string;

  // Custom gradient (used when backgroundTone = 'gradient-custom')
  backgroundCustomGradient?: { from: string; to: string };

  // Multiple selected aspect ratios (multi-format generation)
  selectedAspectRatios?: string[];

  // Per-scene aspect ratio overrides (sceneId -> ratios array)
  sceneAspectOverrides?: Record<string, string[]>;

  // Per-scene props (sceneId -> array of product IDs used as styling accessories)
  sceneProps?: Record<string, string[]>;

  // Model selection (replaces generic person details when set)
  selectedModelId?: string;

  // Multi-model selection (preferred over selectedModelId when set)
  selectedModelIds?: string[];

  // Outfit locking (Catalog Studio-style per-piece control) — legacy flat strings
  outfitTop?: string;
  outfitBottom?: string;
  outfitShoes?: string;
  outfitAccessories?: string;

  // Structured outfit config (preferred over flat strings)
  outfitConfig?: OutfitConfig;

  // Brand logo overlay text (used when brandLogoOverlay trigger is active)
  brandLogoText?: string;

  // Aesthetic color hex (used when aestheticColor trigger is active — consistent color across scenes)
  aestheticColorHex?: string;

  // Human-readable label for the aesthetic color (e.g. "Dusty Blue") — improves prompt fidelity
  aestheticColorLabel?: string;

  // Custom outfit styling note (used when scenes have outfit_hint — user can append extra direction)
  customOutfitNote?: string;
}

export interface GenerationPlan {
  products: UserProduct[];
  scenes: ProductImageScene[];
  details: DetailSettings;
  totalImages: number;
  totalCredits: number;
}
