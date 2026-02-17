import { Plus, User, MapPin, Camera, Star, Layers, Smartphone } from 'lucide-react';
import type { WorkflowScene } from './WorkflowAnimatedThumbnail';
import { getLandingAssetUrl } from '@/lib/landingAssets';

/* ── Asset URLs ── */

// Virtual Try-On
const tryonProduct = getLandingAssetUrl('workflows/workflow-tryon-product-flatlay.png');
const tryonModel = getLandingAssetUrl('models/model-female-average-european.jpg');
const tryonScene = getLandingAssetUrl('poses/pose-editorial-minimal.jpg');
const tryonResult = getLandingAssetUrl('workflows/workflow-tryon-result.png');

// Product Listing Set
const listingProduct = getLandingAssetUrl('products/cream-hyaluronic.jpg');
const listingResult = getLandingAssetUrl('workflows/workflow-product-listing.jpg');

// Selfie / UGC Set
const ugcProduct = getLandingAssetUrl('products/ice-roller-white.png');
const ugcModel = getLandingAssetUrl('models/model-female-average-american-redhead.jpg');
const ugcResult1 = getLandingAssetUrl('workflows/ugc-result-1.jpg');
const ugcResult2 = getLandingAssetUrl('workflows/ugc-result-2.jpg');
const ugcResult3 = getLandingAssetUrl('workflows/ugc-result-3.jpg');
const ugcResult4 = getLandingAssetUrl('workflows/ugc-result-4.jpg');

// Mirror Selfie Set
const mirrorSelfieModel = getLandingAssetUrl('models/model-mirror-selfie-blonde.jpg');
const mirrorSelfieScene = getLandingAssetUrl('scenes/scene-cozy-bedroom.jpg');
const mirrorSelfieProduct = getLandingAssetUrl('products/crop-top-white.jpg');

// Flat Lay Set
const flatProduct1 = getLandingAssetUrl('products/powder-setting.jpg');
const flatProduct2 = getLandingAssetUrl('products/lipstick-matte.jpg');
const flatResult = getLandingAssetUrl('workflows/workflow-flat-lay.jpg');

/* ── Scene definitions ── */

export const workflowScenes: Record<string, WorkflowScene> = {

  'Virtual Try-On Set': {
    background: tryonResult,
    elements: [
      {
        type: 'product', image: tryonProduct, label: 'Crop Top', sublabel: 'Product',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'action', label: '', icon: <Plus className="w-4 h-4" />,
        position: { top: '40%', left: '38%' }, enterDelay: 0.9, animation: 'pop',
      },
      {
        type: 'model', image: tryonModel, label: 'Charlotte',
        icon: <User className="w-3 h-3" />,
        position: { top: '22%', right: '6%' }, enterDelay: 1.4, animation: 'slide-right',
      },
      {
        type: 'scene', image: tryonScene, label: 'Editorial Minimal', sublabel: 'Scene',
        icon: <MapPin className="w-3 h-3" />,
        position: { bottom: '18%', left: '6%' }, enterDelay: 2.0, animation: 'slide-up',
      },
    ],
  },

  'Product Listing Set': {
    background: listingResult,
    elements: [
      {
        type: 'product', image: listingProduct, label: 'HA Cream', sublabel: 'Product',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'badge', label: '8 Scenes', icon: <MapPin className="w-3 h-3" />,
        position: { top: '38%', right: '8%' }, enterDelay: 1.0, animation: 'slide-right',
      },
      {
        type: 'badge', label: 'No People', icon: <Camera className="w-3 h-3" />,
        position: { bottom: '24%', left: '6%' }, enterDelay: 1.6, animation: 'slide-up',
      },
    ],
  },

  'Selfie / UGC Set': {
    mode: 'carousel',
    background: ugcResult1,
    backgrounds: [ugcResult1, ugcResult2, ugcResult3, ugcResult4],
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

};
