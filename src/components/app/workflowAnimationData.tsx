import { Plus, User, MapPin, Camera, Star, Layers, Smartphone, Home, Sparkles, Maximize2, Users } from 'lucide-react';
import type { WorkflowScene } from './WorkflowAnimatedThumbnail';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const s = (path: string) => getOptimizedUrl(getLandingAssetUrl(path), { quality: 60 });

/* ── Asset URLs ── */

// Virtual Try-On
const tryonProduct = s('workflows/workflow-tryon-product-flatlay.png');
const tryonModel = s('models/model-female-average-european.jpg');
const tryonScene = s('poses/pose-editorial-minimal.jpg');
const tryonResult = s('workflows/workflow-tryon-result.png');

// Virtual Try-On Showcase Carousel
const tryonShowcase1 = s('workflows/virtual-tryon-showcase/Vovvai-1.jpg');
const tryonShowcase2 = s('workflows/virtual-tryon-showcase/Vovvai-2.jpg');
const tryonShowcase3 = s('workflows/virtual-tryon-showcase/Vovvai-3.jpg');
const tryonShowcase4 = s('workflows/virtual-tryon-showcase/Vovvai-4.jpg');
const tryonShowcase5 = s('workflows/virtual-tryon-showcase/Vovvai-5.jpg');
const tryonShowcase6 = s('workflows/virtual-tryon-showcase/Vovvai-6.jpg');

// Product Listing Set
const listingProduct = s('workflows/product-listing-product.png');
const listingResult = s('workflows/product-listing-result.png');

// Product Showcase Carousel
const showcase1 = s('workflows/product-showcase/Vovvai-products-1.jpg');
const showcase2 = s('workflows/product-showcase/Vovvai-products-2.jpg');
const showcase3 = s('workflows/product-showcase/Vovvai-products-3.jpg');

const showcase5 = s('workflows/product-showcase/Vovvai-products-5.jpg');
const showcase6 = s('workflows/product-showcase/Vovvai-products-6.jpg');
const showcase7 = s('workflows/product-showcase/Vovvai-products-7.jpg');

// Selfie / UGC Set
const ugcProduct = s('products/ice-roller-white.png');
const ugcModel = s('models/model-female-average-american-redhead.jpg');
const ugcResult1 = s('workflows/ugc-result-1.jpg');
const ugcResult2 = s('workflows/ugc-result-2.jpg');
const ugcResult3 = s('workflows/ugc-result-3.jpg');
const ugcResult4 = s('workflows/ugc-result-4.jpg');

// Mirror Selfie Set
const mirrorSelfieModel = s('models/model-mirror-selfie-blonde.jpg');
const mirrorSelfieScene = s('scenes/scene-cozy-bedroom.jpg');
const mirrorSelfieProduct = s('products/crop-top-white.jpg');

// Flat Lay Set
const flatProduct1 = s('products/powder-setting.jpg');
const flatProduct2 = s('products/lipstick-matte.jpg');
const flatResult = s('workflows/workflow-flat-lay.jpg');

/* ── Scene definitions ── */

export const workflowScenes: Record<string, WorkflowScene> = {

  'Virtual Try-On Set': {
    mode: 'carousel',
    background: tryonShowcase1,
    objectPosition: 'center',
    backgrounds: [tryonShowcase1, tryonShowcase2, tryonShowcase3, tryonShowcase4, tryonShowcase5, tryonShowcase6],
    recipe: [
      { image: tryonProduct, label: 'Product' },
      { image: tryonModel, label: 'Model' },
    ],
    recipeResult: tryonResult,
    elements: [
      {
        type: 'badge', label: '40+ Models', icon: <Users className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0, animation: 'slide-left',
      },
      {
        type: 'badge', label: 'Auto Fit', icon: <Maximize2 className="w-3 h-3" />,
        position: { bottom: '18%', left: '6%' }, enterDelay: 0, animation: 'slide-up',
      },
    ],
  },

  'Product Listing Set': {
    mode: 'carousel',
    background: showcase1,
    objectPosition: 'center',
    backgrounds: [showcase1, showcase2, showcase3, showcase5, showcase6, showcase7],
    recipe: [
      { image: listingProduct, label: 'Product' },
    ],
    recipeResult: listingResult,
    elements: [
      {
        type: 'badge', label: '30+ Scenes', icon: <Sparkles className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0, animation: 'slide-left',
      },
      {
        type: 'badge', label: '1 Click', icon: <Camera className="w-3 h-3" />,
        position: { bottom: '18%', left: '6%' }, enterDelay: 0, animation: 'slide-up',
      },
    ],
  },

  'Selfie / UGC Set': {
    mode: 'carousel',
    background: ugcResult1,
    objectPosition: 'center',
    backgrounds: [ugcResult1, ugcResult2, ugcResult3, ugcResult4],
    recipe: [
      { image: ugcProduct, label: 'Product' },
      { image: ugcModel, label: 'Model' },
    ],
    recipeResult: ugcResult1,
    elements: [
      {
        type: 'product', image: ugcProduct, label: 'Ice Roller', sublabel: 'Product',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0, animation: 'slide-left',
      },
      {
        type: 'badge', label: 'UGC Style', icon: <Camera className="w-3 h-3" />,
        position: { bottom: '18%', left: '6%' }, enterDelay: 0, animation: 'slide-up',
      },
    ],
  },

  'Flat Lay Set': {
    background: flatResult,
    recipe: [
      { image: flatProduct1, label: 'Product 1' },
      { image: flatProduct2, label: 'Product 2' },
    ],
    recipeResult: flatResult,
    elements: [
      {
        type: 'product', image: flatProduct1, label: 'Powder', sublabel: 'Product 1',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'product', image: flatProduct2, label: 'Lipstick', sublabel: 'Product 2',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '36%', right: '6%' }, enterDelay: 0.9, animation: 'slide-right',
      },
      {
        type: 'badge', label: 'Arrange', icon: <Layers className="w-3 h-3" />,
        position: { bottom: '22%', left: '28%' }, enterDelay: 1.5, animation: 'pop',
      },
    ],
  },

  'Mirror Selfie Set': {
    background: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/7a203c7e-0367-4fc3-8eb2-2e4d181fa158_mirror_selfie_v2.png',
    objectPosition: 'center 25%',
    recipe: [
      { image: mirrorSelfieProduct, label: 'Product' },
      { image: mirrorSelfieModel, label: 'Model' },
      { image: mirrorSelfieScene, label: 'Scene' },
    ],
    recipeResult: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/7a203c7e-0367-4fc3-8eb2-2e4d181fa158_mirror_selfie_v2.png',
    elements: [
      {
        type: 'product', image: mirrorSelfieProduct, label: 'Sweater', sublabel: 'Product',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'action', label: '', icon: <Plus className="w-5 h-5" />,
        position: { top: '48%', left: '42%' }, enterDelay: 0.9, animation: 'pop',
      },
      {
        type: 'model', image: mirrorSelfieModel, label: 'Model',
        icon: <User className="w-3 h-3" />,
        position: { top: '22%', right: '6%' }, enterDelay: 1.4, animation: 'slide-right',
      },
      {
        type: 'scene', image: mirrorSelfieScene, label: 'Cozy Bedroom', sublabel: 'Scene',
        icon: <MapPin className="w-3 h-3" />,
        position: { bottom: '18%', left: '6%' }, enterDelay: 2.0, animation: 'slide-up',
      },
    ],
  },

  'Interior / Exterior Staging': {
    mode: 'staging',
    background: '/images/staging/staging-empty.png',
    backgrounds: [
      '/images/staging/staging-empty.png',
      '/images/staging/staging-japandi.png',
      '/images/staging/staging-eclectic.png',
      '/images/staging/staging-contemporary.png',
    ],
    slideLabels: ['Empty Room', 'Japandi', 'Eclectic', 'Contemporary'],
    elements: [],
  },

  'Image Upscaling': {
    mode: 'upscale',
    background: '/images/upscale-demo.png',
    elements: [],
  },

  'Picture Perspectives': {
    mode: 'carousel',
    background: '/images/perspectives/VOVVAI-Perspectives-1.jpg',
    backgrounds: [
      '/images/perspectives/VOVVAI-Perspectives-1.jpg',
      '/images/perspectives/VOVVAI-Perspectives-2.jpg',
      '/images/perspectives/VOVVAI-Perspectives-3.jpg',
      '/images/perspectives/VOVVAI-Perspectives-4.jpg',
      '/images/perspectives/VOVVAI-Perspectives-5.jpg',
      '/images/perspectives/VOVVAI-Perspectives-6.jpg',
    ],
    elements: [
      {
        type: 'badge', label: '1 Photo, Endless Angles', icon: <Sparkles className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'badge', label: 'No Reshoots Needed', icon: <Camera className="w-3 h-3" />,
        position: { bottom: '8%', left: '6%' }, enterDelay: 0.8, animation: 'slide-up',
      },
    ],
  },

  'Catalog Studio': {
    mode: 'carousel',
    background: tryonShowcase1,
    objectPosition: 'center',
    backgrounds: [tryonShowcase1, tryonShowcase2, showcase1, showcase2, tryonShowcase3, showcase3],
    elements: [
      {
        type: 'badge', label: 'Bulk Generation', icon: <Layers className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0, animation: 'slide-left',
      },
      {
        type: 'badge', label: 'Catalog Ready', icon: <Star className="w-3 h-3" />,
        position: { bottom: '18%', left: '6%' }, enterDelay: 0, animation: 'slide-up',
      },
    ],
  },

};
