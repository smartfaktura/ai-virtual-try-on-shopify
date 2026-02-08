import { Plus, User, MapPin, Sparkles, Layout, Image, Camera, Globe, Shirt, Eye, ArrowLeftRight, Layers, Grid3X3, Star, Zap, Palette, Sun, Leaf, Wand2 } from 'lucide-react';
import type { SceneElement, WorkflowScene } from './WorkflowAnimatedThumbnail';

/* ── Asset imports ── */

// Virtual Try-On
import tryonProduct from '@/assets/workflows/workflow-tryon-product-flatlay.png';
import tryonModel from '@/assets/models/model-female-average-european.jpg';
import tryonScene from '@/assets/poses/pose-editorial-minimal.jpg';
import tryonResult from '@/assets/workflows/workflow-tryon-result.png';

// Social Media Pack
import socialProduct from '@/assets/products/serum-vitamin-c.jpg';
import socialResult from '@/assets/workflows/workflow-social-media.jpg';

// Product Listing Set
import listingProduct from '@/assets/products/cream-hyaluronic.jpg';
import listingResult from '@/assets/workflows/workflow-product-listing.jpg';

// Lifestyle Set
import lifestyleProduct from '@/assets/products/candle-soy.jpg';
import lifestyleScene from '@/assets/showcase/home-candle-scandi.jpg';
import lifestyleResult from '@/assets/workflows/workflow-lifestyle.jpg';

// Website Hero Set
import heroProduct from '@/assets/products/faux-fur-jacket-1.jpg';
import heroModel from '@/assets/models/model-female-athletic-european.jpg';
import heroResult from '@/assets/workflows/workflow-website-hero.jpg';

// Ad Refresh Set
import adProduct from '@/assets/products/leggings-black-1.jpg';
import adModel from '@/assets/models/model-female-athletic-mixed.jpg';
import adResult from '@/assets/workflows/workflow-ad-refresh.jpg';

// Selfie / UGC Set
import ugcProduct from '@/assets/products/lipstick-matte.jpg';
import ugcModel from '@/assets/models/model-female-average-american-redhead.jpg';
import ugcResult from '@/assets/workflows/workflow-selfie-ugc.jpg';

// Flat Lay Set
import flatProduct1 from '@/assets/products/powder-setting.jpg';
import flatProduct2 from '@/assets/products/lipstick-matte.jpg';
import flatResult from '@/assets/workflows/workflow-flat-lay.jpg';

// Seasonal Campaign Set
import seasonProduct from '@/assets/products/retinol-treatment.jpg';
import seasonResult from '@/assets/workflows/workflow-seasonal.jpg';

// Before & After Set
import baProduct from '@/assets/products/serum-vitamin-c.jpg';
import baResult from '@/assets/workflows/workflow-before-after.jpg';

/* ── Scene definitions ── */

export const workflowScenes: Record<string, WorkflowScene> = {

  'Virtual Try-On Set': {
    background: tryonResult,
    elements: [
      {
        type: 'product', image: tryonProduct, label: 'Tank Top', sublabel: 'Product',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'action', label: '', icon: <Plus className="w-4 h-4" />,
        position: { top: '40%', left: '38%' }, enterDelay: 0.9, animation: 'pop',
      },
      {
        type: 'model', image: tryonModel, label: 'Slim Blonde',
        icon: <User className="w-3 h-3" />,
        position: { top: '22%', right: '6%' }, enterDelay: 1.4, animation: 'slide-right',
      },
      {
        type: 'scene', image: tryonScene, label: 'Coffee Shop', sublabel: 'Scene',
        icon: <MapPin className="w-3 h-3" />,
        position: { bottom: '18%', left: '6%' }, enterDelay: 2.0, animation: 'slide-up',
      },
    ],
  },

  'Social Media Pack': {
    background: socialResult,
    elements: [
      {
        type: 'product', image: socialProduct, label: 'Vitamin C', sublabel: 'Product',
        icon: <Image className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'badge', label: 'Story', icon: <Camera className="w-3 h-3" />,
        position: { top: '34%', right: '8%' }, enterDelay: 0.9, animation: 'slide-right',
      },
      {
        type: 'badge', label: 'Post', icon: <Grid3X3 className="w-3 h-3" />,
        position: { top: '48%', right: '14%' }, enterDelay: 1.3, animation: 'slide-right',
      },
      {
        type: 'badge', label: 'Reel', icon: <Sun className="w-3 h-3" />,
        position: { top: '62%', right: '8%' }, enterDelay: 1.7, animation: 'slide-right',
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
        type: 'badge', label: 'Studio', icon: <Layout className="w-3 h-3" />,
        position: { top: '38%', right: '8%' }, enterDelay: 1.0, animation: 'slide-right',
      },
      {
        type: 'action', label: '', icon: <Camera className="w-4 h-4" />,
        position: { bottom: '24%', left: '38%' }, enterDelay: 1.6, animation: 'pop',
      },
    ],
  },

  'Lifestyle Set': {
    background: lifestyleResult,
    elements: [
      {
        type: 'product', image: lifestyleProduct, label: 'Soy Candle', sublabel: 'Product',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '10%', right: '6%' }, enterDelay: 0.3, animation: 'slide-right',
      },
      {
        type: 'scene', image: lifestyleScene, label: 'Scandi', sublabel: 'Setting',
        icon: <MapPin className="w-3 h-3" />,
        position: { bottom: '20%', left: '6%' }, enterDelay: 1.0, animation: 'slide-up',
      },
    ],
  },

  'Website Hero Set': {
    background: heroResult,
    elements: [
      {
        type: 'product', image: heroProduct, label: 'Faux Fur', sublabel: 'Product',
        icon: <Shirt className="w-3 h-3" />,
        position: { top: '8%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'model', image: heroModel, label: 'Athletic',
        icon: <User className="w-3 h-3" />,
        position: { top: '32%', right: '6%' }, enterDelay: 1.0, animation: 'slide-right',
      },
      {
        type: 'badge', label: 'Botanical', icon: <Globe className="w-3 h-3" />,
        position: { bottom: '22%', left: '8%' }, enterDelay: 1.6, animation: 'slide-up',
      },
    ],
  },

  'Ad Refresh Set': {
    background: adResult,
    elements: [
      {
        type: 'product', image: adProduct, label: 'Leggings', sublabel: 'Product',
        icon: <Zap className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'model', image: adModel, label: 'Athletic',
        icon: <User className="w-3 h-3" />,
        position: { top: '36%', right: '6%' }, enterDelay: 1.0, animation: 'slide-right',
      },
      {
        type: 'badge', label: 'Refresh', icon: <Zap className="w-3 h-3" />,
        position: { bottom: '22%', left: '30%' }, enterDelay: 1.6, animation: 'pop',
      },
    ],
  },

  'Selfie / UGC Set': {
    background: ugcResult,
    elements: [
      {
        type: 'product', image: ugcProduct, label: 'Lipstick', sublabel: 'Product',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'model', image: ugcModel, label: 'Creator',
        icon: <Star className="w-3 h-3" />,
        position: { top: '34%', right: '6%' }, enterDelay: 1.0, animation: 'slide-right',
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

  'Seasonal Campaign Set': {
    background: seasonResult,
    elements: [
      {
        type: 'product', image: seasonProduct, label: 'Retinol', sublabel: 'Product',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'badge', label: 'Spring', icon: <Leaf className="w-3 h-3" />,
        position: { top: '34%', right: '8%' }, enterDelay: 0.9, animation: 'slide-right',
      },
      {
        type: 'badge', label: '4 Seasons', icon: <Palette className="w-3 h-3" />,
        position: { bottom: '24%', left: '8%' }, enterDelay: 1.5, animation: 'slide-up',
      },
    ],
  },

  'Before & After Set': {
    background: baResult,
    elements: [
      {
        type: 'product', image: baProduct, label: 'Serum', sublabel: 'Product',
        icon: <Eye className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'badge', label: 'Before', icon: <ArrowLeftRight className="w-3 h-3" />,
        position: { top: '40%', left: '10%' }, enterDelay: 1.0, animation: 'slide-left',
      },
      {
        type: 'badge', label: 'After', icon: <Wand2 className="w-3 h-3" />,
        position: { top: '40%', right: '10%' }, enterDelay: 1.5, animation: 'slide-right',
      },
    ],
  },
};
