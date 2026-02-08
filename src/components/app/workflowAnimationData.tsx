import { Plus, User, MapPin, Sparkles, Instagram, Layout, Image, Palette, Sun, Moon, Leaf, Snowflake, Camera, Share2, Globe, Wand2, Shirt, Eye, ArrowLeftRight, Layers, Grid3X3, Star, Zap } from 'lucide-react';
import type { AnimatedStep } from './WorkflowAnimatedThumbnail';

// === Virtual Try-On Set ===
import tryonProduct from '@/assets/products/tank-white-1.jpg';
import tryonModel from '@/assets/models/model-female-slim-american-blonde.jpg';
import tryonScene from '@/assets/poses/pose-lifestyle-coffee.jpg';
import tryonResult from '@/assets/drops/drop-model-cream-bodysuit.jpg';

// === Social Media Pack ===
import socialProduct from '@/assets/products/serum-vitamin-c.jpg';
import socialScene1 from '@/assets/showcase/skincare-serum-morning.jpg';
import socialScene2 from '@/assets/showcase/skincare-oil-lifestyle.jpg';
import socialResult from '@/assets/workflows/workflow-social-media.jpg';

// === Product Listing Set ===
import listingProduct from '@/assets/products/cream-hyaluronic.jpg';
import listingScene from '@/assets/showcase/skincare-serum-marble.jpg';
import listingResult from '@/assets/workflows/workflow-product-listing.jpg';

// === Lifestyle Set ===
import lifestyleProduct from '@/assets/products/candle-soy.jpg';
import lifestyleScene from '@/assets/showcase/home-candle-scandi.jpg';
import lifestyleResult from '@/assets/workflows/workflow-lifestyle.jpg';

// === Website Hero Set ===
import heroProduct from '@/assets/products/faux-fur-jacket-1.jpg';
import heroModel from '@/assets/models/model-female-athletic-european.jpg';
import heroScene from '@/assets/showcase/fashion-dress-botanical.jpg';
import heroResult from '@/assets/workflows/workflow-website-hero.jpg';

// === Ad Refresh Set ===
import adProduct from '@/assets/products/leggings-black-1.jpg';
import adModel from '@/assets/models/model-female-athletic-mixed.jpg';
import adResult from '@/assets/workflows/workflow-ad-refresh.jpg';

// === Selfie / UGC Set ===
import ugcProduct from '@/assets/products/lipstick-matte.jpg';
import ugcModel from '@/assets/models/model-female-average-american-redhead.jpg';
import ugcResult from '@/assets/workflows/workflow-selfie-ugc.jpg';

// === Flat Lay Set ===
import flatProduct1 from '@/assets/products/powder-setting.jpg';
import flatProduct2 from '@/assets/products/lipstick-matte.jpg';
import flatResult from '@/assets/workflows/workflow-flat-lay.jpg';

// === Seasonal Campaign Set ===
import seasonProduct from '@/assets/products/retinol-treatment.jpg';
import seasonSpring from '@/assets/showcase/skincare-cream-botanical.jpg';
import seasonResult from '@/assets/workflows/workflow-seasonal.jpg';

// === Before & After Set ===
import baProduct from '@/assets/products/serum-vitamin-c.jpg';
import baBefore from '@/assets/showcase/skincare-set-minimal.jpg';
import baResult from '@/assets/workflows/workflow-before-after.jpg';

export const workflowAnimations: Record<string, AnimatedStep[]> = {
  'Virtual Try-On Set': [
    { image: tryonProduct, label: 'Upload Product', icon: <Plus className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: tryonModel, label: 'Select Model', icon: <User className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: tryonScene, label: 'Choose Scene', icon: <MapPin className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: tryonResult, label: 'Result', icon: <Sparkles className="w-3.5 h-3.5" />, overlay: 'result' },
  ],

  'Social Media Pack': [
    { image: socialProduct, label: 'Pick Product', icon: <Image className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: socialScene1, label: 'Morning Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { image: socialScene2, label: 'Lifestyle Shot', icon: <Camera className="w-3.5 h-3.5" /> },
    { image: socialResult, label: 'Feed Ready', icon: <Grid3X3 className="w-3.5 h-3.5" />, overlay: 'result' },
  ],

  'Product Listing Set': [
    { image: listingProduct, label: 'Upload Product', icon: <Plus className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: listingScene, label: 'Studio Setup', icon: <Layout className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: listingResult, label: 'Listing Ready', icon: <Sparkles className="w-3.5 h-3.5" />, overlay: 'result' },
  ],

  'Lifestyle Set': [
    { image: lifestyleProduct, label: 'Pick Product', icon: <Plus className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: lifestyleScene, label: 'Choose Setting', icon: <MapPin className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: lifestyleResult, label: 'In Context', icon: <Sparkles className="w-3.5 h-3.5" />, overlay: 'result' },
  ],

  'Website Hero Set': [
    { image: heroProduct, label: 'Select Product', icon: <Shirt className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: heroModel, label: 'Choose Model', icon: <User className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: heroScene, label: 'Set Location', icon: <Globe className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: heroResult, label: 'Hero Shot', icon: <Sparkles className="w-3.5 h-3.5" />, overlay: 'result' },
  ],

  'Ad Refresh Set': [
    { image: adProduct, label: 'Pick Product', icon: <Zap className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: adModel, label: 'Select Model', icon: <User className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: adResult, label: 'Ad Ready', icon: <Sparkles className="w-3.5 h-3.5" />, overlay: 'result' },
  ],

  'Selfie / UGC Set': [
    { image: ugcProduct, label: 'Choose Product', icon: <Plus className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: ugcModel, label: 'Pick Creator', icon: <User className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: ugcResult, label: 'UGC Ready', icon: <Star className="w-3.5 h-3.5" />, overlay: 'result' },
  ],

  'Flat Lay Set': [
    { image: flatProduct1, label: 'Add Products', icon: <Plus className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: flatProduct2, label: 'Style Props', icon: <Palette className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: flatResult, label: 'Flat Lay Done', icon: <Layers className="w-3.5 h-3.5" />, overlay: 'result' },
  ],

  'Seasonal Campaign Set': [
    { image: seasonProduct, label: 'Pick Product', icon: <Plus className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: seasonSpring, label: 'Spring Vibes', icon: <Leaf className="w-3.5 h-3.5" /> },
    { image: seasonResult, label: '4 Seasons', icon: <Sparkles className="w-3.5 h-3.5" />, overlay: 'result' },
  ],

  'Before & After Set': [
    { image: baProduct, label: 'Select Product', icon: <Eye className="w-3.5 h-3.5" />, overlay: 'action' },
    { image: baBefore, label: 'Before State', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
    { image: baResult, label: 'Transformation', icon: <Wand2 className="w-3.5 h-3.5" />, overlay: 'result' },
  ],
};
