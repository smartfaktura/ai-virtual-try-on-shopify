import {
  ShoppingBag, Sparkles, Instagram, Megaphone, Camera, ZoomIn,
  LayoutTemplate, Rocket, Mail, Calendar, LayoutGrid, Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react';
import type { IconKey } from '@/data/aiProductPhotographyCategoryPages';

export const iconMap: Record<IconKey, LucideIcon> = {
  'shopping-bag': ShoppingBag,
  'sparkles': Sparkles,
  'instagram': Instagram,
  'megaphone': Megaphone,
  'camera': Camera,
  'zoom-in': ZoomIn,
  'layout-template': LayoutTemplate,
  'rocket': Rocket,
  'mail': Mail,
  'calendar': Calendar,
  'layout-grid': LayoutGrid,
  'image': ImageIcon,
};
