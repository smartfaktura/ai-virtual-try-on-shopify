import { Plus, User, MapPin, Camera, Layout, Star, Layers } from 'lucide-react';
import type { WorkflowScene } from './WorkflowAnimatedThumbnail';

/* ── Asset imports ── */

// Virtual Try-On
import tryonProduct from '@/assets/workflows/workflow-tryon-product-flatlay.png';
import tryonModel from '@/assets/models/model-female-average-european.jpg';
import tryonScene from '@/assets/poses/pose-editorial-minimal.jpg';
import tryonResult from '@/assets/workflows/workflow-tryon-result.png';

// Product Listing Set
import listingProduct from '@/assets/products/cream-hyaluronic.jpg';
import listingResult from '@/assets/workflows/workflow-product-listing.jpg';

// Selfie / UGC Set
import ugcProduct from '@/assets/products/lipstick-matte.jpg';
import ugcModel from '@/assets/models/model-female-average-american-redhead.jpg';
import ugcResult from '@/assets/workflows/workflow-selfie-ugc.jpg';

// Flat Lay Set
import flatProduct1 from '@/assets/products/powder-setting.jpg';
import flatProduct2 from '@/assets/products/lipstick-matte.jpg';
import flatResult from '@/assets/workflows/workflow-flat-lay.jpg';

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
        type: 'badge', label: 'Studio', icon: <Layout className="w-3 h-3" />,
        position: { top: '38%', right: '8%' }, enterDelay: 1.0, animation: 'slide-right',
      },
      {
        type: 'action', label: '', icon: <Camera className="w-4 h-4" />,
        position: { bottom: '24%', left: '38%' }, enterDelay: 1.6, animation: 'pop',
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
};
