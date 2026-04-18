/**
 * Content Intent options + UI-friendly labels.
 * Used by the new wizard step and downstream planners.
 */
import type { ComponentType } from 'react';
import {
  Sparkles, Layers, ShoppingBag, Smartphone, User, Rocket,
  CloudMoon, Camera, ListChecks, Target,
  Instagram, Music, Globe, Store, Youtube, Newspaper,
  type LucideIcon,
} from 'lucide-react';
import type {
  ContentIntent,
  Platform,
  SoundMode,
  PaceMode,
  ProductPriority,
  EndingStyle,
  ProductCategoryKey,
} from '@/types/commerceVideo';

export interface IntentOption {
  value: ContentIntent;
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
  recommendsClarityFirst?: boolean;
  recommendsVO?: 'required' | 'optional' | 'discouraged';
}

export const INTENT_OPTIONS: IntentOption[] = [
  {
    value: 'product_showcase',
    label: 'Product Showcase',
    short: 'Showcase',
    description: 'Premium, clear, hero-product led — broad commerce use.',
    icon: Sparkles,
    recommendsClarityFirst: true,
    recommendsVO: 'optional',
  },
  {
    value: 'product_detail_film',
    label: 'Product Detail Film',
    short: 'Detail Film',
    description: 'Slow, macro-led craft and texture story.',
    icon: Layers,
    recommendsClarityFirst: true,
    recommendsVO: 'discouraged',
  },
  {
    value: 'pdp_video',
    label: 'PDP Video',
    short: 'PDP',
    description: 'High-clarity loop for product detail pages and marketplaces.',
    icon: ShoppingBag,
    recommendsClarityFirst: true,
    recommendsVO: 'discouraged',
  },
  {
    value: 'social_content',
    label: 'Social Content',
    short: 'Social',
    description: 'Vertical-native, snappy, native energy.',
    icon: Smartphone,
    recommendsVO: 'optional',
  },
  {
    value: 'creator_style_content',
    label: 'Creator Style',
    short: 'Creator',
    description: 'Casual, observational, user-native interaction.',
    icon: User,
    recommendsVO: 'optional',
  },
  {
    value: 'launch_teaser',
    label: 'Launch Teaser',
    short: 'Teaser',
    description: 'Tease → reveal → finish, building anticipation.',
    icon: Rocket,
    recommendsVO: 'optional',
  },
  {
    value: 'brand_mood_film',
    label: 'Brand Mood',
    short: 'Mood',
    description: 'Atmosphere-led, sparse VO, soft resolve.',
    icon: CloudMoon,
    recommendsVO: 'discouraged',
  },
  {
    value: 'campaign_editorial',
    label: 'Campaign Editorial',
    short: 'Editorial',
    description: 'Human × product, cinematic, brand-story driven.',
    icon: Camera,
    recommendsVO: 'optional',
  },
  {
    value: 'feature_benefit_video',
    label: 'Feature / Benefit',
    short: 'Features',
    description: 'Stack features and benefits with a clean brand finish.',
    icon: ListChecks,
    recommendsVO: 'required',
  },
  {
    value: 'performance_ad',
    label: 'Performance Ad',
    short: 'Performance',
    description: 'Hook → demo → benefit → CTA. Conversion focused.',
    icon: Target,
    recommendsClarityFirst: false,
    recommendsVO: 'required',
  },
];

export function getIntentOption(value: ContentIntent | null | undefined): IntentOption | undefined {
  if (!value) return undefined;
  return INTENT_OPTIONS.find(o => o.value === value);
}

// ── Platform options ─────────────────────────────────────────────────────
export interface PlatformOption {
  value: Platform;
  label: string;
  icon: LucideIcon;
}

export const PLATFORM_OPTIONS: PlatformOption[] = [
  { value: 'instagram_reels', label: 'Instagram Reels', icon: Instagram },
  { value: 'tiktok', label: 'TikTok', icon: Music },
  { value: 'meta_feed', label: 'Meta Feed', icon: Newspaper },
  { value: 'website_pdp', label: 'Website / PDP', icon: Globe },
  { value: 'marketplace', label: 'Marketplace', icon: Store },
  { value: 'youtube_shorts', label: 'YouTube Shorts', icon: Youtube },
  { value: 'general', label: 'General', icon: Globe },
];

// ── Sound mode options ───────────────────────────────────────────────────
export const SOUND_MODE_OPTIONS: { value: SoundMode; label: string; hint: string }[] = [
  { value: 'full_audio',           label: 'Full Audio',          hint: 'Music + SFX + voiceover' },
  { value: 'music_plus_sfx',       label: 'Music + SFX',         hint: 'No voiceover' },
  { value: 'voiceover_plus_music', label: 'Voiceover + Music',   hint: 'Spoken focus' },
  { value: 'silent_first',         label: 'Silent-First',        hint: 'Designed to work muted' },
  { value: 'caption_first',        label: 'Caption-First',       hint: 'On-screen text leads' },
  { value: 'music_only',           label: 'Music Only',           hint: 'Mood-led, no SFX/VO' },
  { value: 'no_voiceover',         label: 'No Voiceover',         hint: 'Music + SFX, no spoken script' },
];

// ── Pace, priority, ending ───────────────────────────────────────────────
export const PACE_OPTIONS: { value: PaceMode; label: string; hint: string }[] = [
  { value: 'calm',     label: 'Calm',     hint: 'Slow, considered cuts' },
  { value: 'balanced', label: 'Balanced', hint: 'Default cinematic rhythm' },
  { value: 'dynamic',  label: 'Dynamic',  hint: 'Snappy, scroll-stopping' },
];

export const PRODUCT_PRIORITY_OPTIONS: { value: ProductPriority; label: string }[] = [
  { value: 'hero_product',     label: 'Hero product' },
  { value: 'texture_detail',   label: 'Texture / detail' },
  { value: 'usage_context',    label: 'Usage / context' },
  { value: 'human_connection', label: 'Human connection' },
  { value: 'brand_mood',       label: 'Brand mood' },
];

export const ENDING_STYLE_OPTIONS: { value: EndingStyle; label: string }[] = [
  { value: 'auto',                 label: 'Auto (let planner decide)' },
  { value: 'product_close',        label: 'Product close' },
  { value: 'clean_brand_close',    label: 'Clean brand close' },
  { value: 'detail_close',         label: 'Detail close' },
  { value: 'atmosphere_resolve',   label: 'Atmosphere resolve' },
  { value: 'soft_cta',             label: 'Soft CTA' },
  { value: 'hard_cta',             label: 'Hard CTA' },
  { value: 'marketplace_clean_end',label: 'Marketplace clean end' },
  { value: 'logo_safe_luxury_end', label: 'Logo-safe luxury end' },
];

export const CATEGORY_OPTIONS: { value: ProductCategoryKey; label: string }[] = [
  { value: 'fashion_apparel',  label: 'Fashion / Apparel' },
  { value: 'footwear',         label: 'Footwear' },
  { value: 'beauty_skincare',  label: 'Beauty / Skincare' },
  { value: 'makeup',           label: 'Makeup' },
  { value: 'fragrance',        label: 'Fragrance' },
  { value: 'jewelry',          label: 'Jewelry' },
  { value: 'accessories',      label: 'Accessories' },
  { value: 'home_decor',       label: 'Home Decor' },
  { value: 'food_beverage',    label: 'Food & Beverage' },
  { value: 'supplements',      label: 'Supplements' },
  { value: 'electronics',      label: 'Electronics' },
  { value: 'general_product',  label: 'General Product' },
];
