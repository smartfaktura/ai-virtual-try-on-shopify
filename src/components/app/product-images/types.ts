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
  | 'garments' | 'home-decor' | 'tech-devices'
  | 'food-beverage' | 'supplements-wellness' | 'other';

export interface ProductAnalysis {
  category: ProductCategory;
  sizeClass: 'very-small' | 'small' | 'medium' | 'large' | 'extra-large';
  colorFamily: string;
  materialFamily: string;
  finish: string;
  packagingRelevant: boolean;
  personCompatible: boolean;
  accentColor?: string;
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
  triggerBlocks: string[];
  isGlobal: boolean;
  categoryCollection?: string;
  sceneType?: SceneType;
  excludeCategories?: string[];
}

export interface CategoryCollection {
  id: string;
  title: string;
  scenes: ProductImageScene[];
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

  // Per-scene aspect ratio overrides (sceneId -> ratio)
  sceneAspectOverrides?: Record<string, string>;

  // Per-scene props (sceneId -> array of product IDs used as styling accessories)
  sceneProps?: Record<string, string[]>;

  // Model selection (replaces generic person details when set)
  selectedModelId?: string;

  // Outfit locking (Catalog Studio-style per-piece control)
  outfitTop?: string;
  outfitBottom?: string;
  outfitShoes?: string;
  outfitAccessories?: string;
}

export interface GenerationPlan {
  products: UserProduct[];
  scenes: ProductImageScene[];
  details: DetailSettings;
  totalImages: number;
  totalCredits: number;
}
