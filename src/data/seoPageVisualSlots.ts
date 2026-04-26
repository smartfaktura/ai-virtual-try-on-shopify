/**
 * Static registry of editable image slots for every public SEO landing page.
 *
 * The admin UI (/app/admin/seo-page-visuals) is driven entirely by this
 * registry. Each slot maps to a real image render site on the public page.
 * If no override is configured, the page renders its existing fallback image
 * unchanged — admins are layering on top, never replacing the base data.
 *
 * Slot keys are stable strings — never rename them after launch, otherwise
 * existing overrides will silently fall back.
 */

import {
  aiProductPhotographyCategoryPages,
  PREVIEW,
  type CategoryPage,
} from './aiProductPhotographyCategoryPages';

export type SeoPageGroup = 'main' | 'category' | 'tool' | 'comparison';

export interface SeoVisualSlot {
  /** Stable identifier used as the DB key. Never rename. */
  key: string;
  /** Human-friendly section grouping shown in the admin UI. */
  section: string;
  /** Human-friendly slot label shown in the admin UI. */
  label: string;
  /** Short explanation of where this image appears on the live page. */
  whereItAppears: string;
  /** True if the slot must always have an image (fallback satisfies this). */
  required: boolean;
  /** Optional content tags used to filter the image picker. */
  recommendedTags: string[];
  /** Suggested aspect ratio (display only). */
  recommendedAspectRatio: string;
  /** Stable scene_id of the current static fallback image. */
  fallbackImageId: string;
  /** Default alt text (used when no override alt is set). */
  fallbackAlt: string;
}

export interface SeoPageEntry {
  route: string;
  label: string;
  group: SeoPageGroup;
  slots: SeoVisualSlot[];
}

// ── Reusable slot factories for the shared hub components ──

/** Slots used on both /ai-product-photography and the tool pages
 *  (/ai-product-photo-generator, /shopify-..., /etsy-...) which embed
 *  the same hero, visual-system, and scene-examples components. */
const HUB_HERO_TILES: { id: string; label: string }[] = [
  { id: 'repeated-shadow-grid-fragrance-1776013389735', label: 'Volcanic Sunset' },
  { id: '1776574208384-fmg2u3', label: 'Cliffside Walk' },
  { id: '1776574228066-oyklfz', label: 'Golden Horizon' },
  { id: '1776102204479-9rlc0n', label: 'Sunset Drive' },
  { id: '1776690212460-cq4xnb', label: 'Movement Shot' },
  { id: 'editorial-office-flash-eyewear-1776150153576', label: 'Office Flash' },
  { id: '1776524132929-q8upyp', label: 'Yacht Bow' },
  { id: '1776018020221-aehe8n', label: 'Dark Elegance' },
  { id: '1776691906436-3fe7l9', label: 'Old Money Portrait' },
  { id: '1776770347820-s3qwmr', label: 'Studio Hero' },
  { id: 'beauty-closeup-oversized-eyewear-1776150210659', label: 'Beauty Closeup' },
  { id: '1776691911049-gsxycu', label: 'Soft Volume Lean' },
];

const HUB_SCENE_EXAMPLES: { id: string; label: string; category: string }[] = [
  { id: '1776770347820-s3qwmr', label: 'Studio Hero', category: 'Studio' },
  { id: '1776522769405-3v1gs0', label: 'Architectural Stair', category: 'Editorial' },
  { id: '1776524131703-gvh4bb', label: 'Sunbathing Editorial', category: 'Lifestyle' },
  { id: '1776691907477-77vt46', label: 'Paris Curb Side', category: 'Streetwear' },
  { id: 'hard-shadow-shoes-sneakers-1776008136691', label: 'Hard Shadow Hero', category: 'Studio' },
  { id: '1776691912818-yiu2uq', label: 'Sunlit Tailored Chair', category: 'Editorial' },
  { id: '1776018038709-gmt0eg', label: 'Frozen Aura', category: 'Seasonal' },
  { id: '1776524128011-dcnlpo', label: 'Coastal Camera', category: 'Lifestyle' },
  { id: '1776102190563-dioke2', label: 'Lounge Selfie', category: 'Editorial' },
  { id: '1776574255634-kmhz9g', label: 'Sunstone Wall', category: 'Seasonal' },
];

function buildHeroSlots(tags: string[]): SeoVisualSlot[] {
  return HUB_HERO_TILES.map((t, i) => ({
    key: `heroTile${i + 1}`,
    section: 'Hero',
    label: `Hero collage tile ${i + 1} — ${t.label}`,
    whereItAppears: `Animated marquee at the top of the page (tile ${i + 1} of 12).`,
    required: false,
    recommendedTags: tags,
    recommendedAspectRatio: '3:4',
    fallbackImageId: t.id,
    fallbackAlt: `AI product photography example: ${t.label}`,
  }));
}

function buildSceneExampleSlots(tags: string[]): SeoVisualSlot[] {
  return HUB_SCENE_EXAMPLES.map((t, i) => ({
    key: `sceneExample${i + 1}`,
    section: 'Scene examples',
    label: `Scene example ${i + 1} — ${t.label}`,
    whereItAppears: `“Every scene your store needs” grid (tile ${i + 1} of 10).`,
    required: false,
    recommendedTags: tags,
    recommendedAspectRatio: '3:4',
    fallbackImageId: t.id,
    fallbackAlt: `AI ${t.category.toLowerCase()} product photography example: ${t.label}.`,
  }));
}

// Visual System rows are 6 cards × 3 thumbnails. We only expose the LEAD
// thumbnail per row in V1 to keep the picker manageable.
const HUB_VISUAL_SYSTEM_ROWS: { title: string; lead: string }[] = [
  { title: 'Product page', lead: '1776770347820-s3qwmr' },
  { title: 'Lifestyle', lead: '1776664924644-8pmju4' },
  { title: 'Social content', lead: '1776691906436-3fe7l9' },
  { title: 'Paid ads', lead: '1776102204479-9rlc0n' },
  { title: 'Detail shots', lead: '1776243905045-8aw72b' },
  { title: 'Campaigns', lead: '1776524132929-q8upyp' },
];

function buildVisualSystemSlots(tags: string[]): SeoVisualSlot[] {
  return HUB_VISUAL_SYSTEM_ROWS.map((r) => ({
    key: `visualSystem_${r.title.toLowerCase().replace(/\s+/g, '_')}`,
    section: 'Visual system',
    label: `Visual system — ${r.title}`,
    whereItAppears: `Lead thumbnail for the “${r.title}” card in the visual system grid.`,
    required: false,
    recommendedTags: tags,
    recommendedAspectRatio: '3:4',
    fallbackImageId: r.lead,
    fallbackAlt: `${r.title} — AI product photography example`,
  }));
}

// ── Per-category page slots, derived from the category page data ──

function buildCategorySlots(page: CategoryPage): SeoVisualSlot[] {
  const tags = [page.slug, ...(page.subcategories ?? []).map((s) => s.toLowerCase())];

  const heroMain: SeoVisualSlot = {
    key: 'heroMain',
    section: 'Hero',
    label: 'Hero main visual',
    whereItAppears: 'Single hero image (or first collage tile) above the fold.',
    required: true,
    recommendedTags: tags,
    recommendedAspectRatio: '4:5',
    fallbackImageId: page.heroImageId,
    fallbackAlt: page.heroAlt,
  };

  const collageSlots: SeoVisualSlot[] = (page.heroCollage ?? []).map((tile, i) => ({
    key: `heroCollage${i + 1}`,
    section: 'Hero',
    label: `Hero collage tile ${i + 1} — ${tile.subCategory}`,
    whereItAppears: `Hero collage tile ${i + 1} (${tile.subCategory}).`,
    required: false,
    recommendedTags: [...tags, tile.subCategory.toLowerCase()],
    recommendedAspectRatio: '4:5',
    fallbackImageId: tile.imageId,
    fallbackAlt: tile.alt,
  }));

  const sceneSlots: SeoVisualSlot[] = (page.sceneExamples ?? []).map((ex, i) => ({
    key: `sceneExample${i + 1}`,
    section: 'Scene examples',
    label: `Scene example ${i + 1} — ${ex.label}`,
    whereItAppears: `“${ex.collectionLabel} · ${ex.subCategory}” example in the scene grid.`,
    required: false,
    recommendedTags: [...tags, ex.subCategory.toLowerCase(), ex.collectionLabel.toLowerCase()],
    recommendedAspectRatio: '3:4',
    fallbackImageId: ex.imageId,
    fallbackAlt: ex.alt,
  }));

  return [heroMain, ...collageSlots, ...sceneSlots];
}

// ── The full registry ──

const categoryEntries: SeoPageEntry[] = aiProductPhotographyCategoryPages.map((p) => ({
  route: p.url,
  label: p.groupName,
  group: 'category' as const,
  slots: buildCategorySlots(p),
}));

const HUB_TAGS = ['product photography', 'ecommerce', 'editorial', 'studio', 'lifestyle'];

const TOOL_TAGS_GENERATOR = ['product generator', 'ecommerce', 'multi-output'];
const TOOL_TAGS_SHOPIFY = ['shopify', 'ecommerce', 'product page', 'catalog'];
const TOOL_TAGS_ETSY = ['etsy', 'handmade', 'jewelry', 'home decor', 'gift', 'lifestyle'];

const COMPARISON_TAGS = ['before-after', 'workflow', 'comparison'];

export const SEO_PAGES: SeoPageEntry[] = [
  // Main hub
  {
    route: '/ai-product-photography',
    label: 'AI Product Photography Hub',
    group: 'main',
    slots: [
      ...buildHeroSlots(HUB_TAGS),
      ...buildVisualSystemSlots(HUB_TAGS),
      ...buildSceneExampleSlots(HUB_TAGS),
    ],
  },
  // Category hubs
  ...categoryEntries,
  // Tool / commercial intent pages — share the same hero + visual system + scene blocks
  {
    route: '/ai-product-photo-generator',
    label: 'AI Product Photo Generator',
    group: 'tool',
    slots: [
      ...buildHeroSlots(TOOL_TAGS_GENERATOR),
      ...buildVisualSystemSlots(TOOL_TAGS_GENERATOR),
      ...buildSceneExampleSlots(TOOL_TAGS_GENERATOR),
    ],
  },
  {
    route: '/shopify-product-photography-ai',
    label: 'Shopify Product Photos',
    group: 'tool',
    slots: [
      ...buildHeroSlots(TOOL_TAGS_SHOPIFY),
      ...buildVisualSystemSlots(TOOL_TAGS_SHOPIFY),
      ...buildSceneExampleSlots(TOOL_TAGS_SHOPIFY),
    ],
  },
  {
    route: '/etsy-product-photography-ai',
    label: 'Etsy Product Photos',
    group: 'tool',
    slots: [
      ...buildHeroSlots(TOOL_TAGS_ETSY),
      ...buildVisualSystemSlots(TOOL_TAGS_ETSY),
      ...buildSceneExampleSlots(TOOL_TAGS_ETSY),
    ],
  },
  // Comparison pages — share hero + scene blocks
  {
    route: '/ai-product-photography-vs-photoshoot',
    label: 'AI vs Photoshoot',
    group: 'comparison',
    slots: [
      ...buildHeroSlots(COMPARISON_TAGS),
      ...buildSceneExampleSlots(COMPARISON_TAGS),
    ],
  },
  {
    route: '/ai-product-photography-vs-studio',
    label: 'VOVV.AI vs Studio',
    group: 'comparison',
    slots: [
      ...buildHeroSlots(COMPARISON_TAGS),
      ...buildSceneExampleSlots(COMPARISON_TAGS),
    ],
  },
];

export function getSeoPage(route: string): SeoPageEntry | undefined {
  return SEO_PAGES.find((p) => p.route === route);
}

export function getSeoSlot(route: string, slotKey: string): SeoVisualSlot | undefined {
  return getSeoPage(route)?.slots.find((s) => s.key === slotKey);
}

/** Build the fallback image URL for any slot via the existing PREVIEW helper. */
export function getSlotFallbackUrl(slot: SeoVisualSlot): string {
  return PREVIEW(slot.fallbackImageId);
}

export const SEO_PAGE_GROUPS: { id: SeoPageGroup; label: string }[] = [
  { id: 'main', label: 'Main Hub' },
  { id: 'category', label: 'Category Hubs' },
  { id: 'tool', label: 'Tool / Commercial Pages' },
  { id: 'comparison', label: 'Comparison Pages' },
];
