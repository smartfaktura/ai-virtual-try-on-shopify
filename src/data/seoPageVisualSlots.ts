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
  getRelatedPages,
  PREVIEW,
  type CategoryPage,
} from './aiProductPhotographyCategoryPages';
import { aiProductPhotographyCategories } from './aiProductPhotographyCategories';
import { getBuiltForGroupsForPage, slotSlugify } from './builtForGridGroups';

const slugify = slotSlugify;

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
    section: 'HERO BANNER IMAGES',
    label: `Hero banner tile ${i + 1} — ${t.label}`,
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
    section: 'Every scene your store needs — already styled.',
    label: `Scene tile ${i + 1} — ${t.label}`,
    whereItAppears: `“Every scene your store needs” grid (tile ${i + 1} of 10).`,
    required: false,
    recommendedTags: tags,
    recommendedAspectRatio: '3:4',
    fallbackImageId: t.id,
    fallbackAlt: `AI ${t.category.toLowerCase()} product photography example: ${t.label}.`,
  }));
}

// Visual System rows: 6 cards × 3 thumbnails each = 18 editable slots.
const HUB_VISUAL_SYSTEM_ROWS: { title: string; thumbs: [string, string, string] }[] = [
  { title: 'Product page',  thumbs: ['1776770347820-s3qwmr', '1776841027943-vetumj', '1776664933175-rjlbn6'] },
  { title: 'Lifestyle',     thumbs: ['1776664924644-8pmju4', '1776524131703-gvh4bb', '1776524128011-dcnlpo'] },
  { title: 'Social content', thumbs: ['1776691906436-3fe7l9', '1776102190563-dioke2', '1776691907477-77vt46'] },
  { title: 'Paid ads',      thumbs: ['1776102204479-9rlc0n', '1776606017719-zzhgy7', '1776239826550-uaopmt'] },
  { title: 'Detail shots',  thumbs: ['1776243905045-8aw72b', '1776244136599-8gw62e', '1776243682026-h1itvm'] },
  { title: 'Campaigns',     thumbs: ['1776524132929-q8upyp', '1776574228066-oyklfz', '1776018020221-aehe8n'] },
];

function buildVisualSystemSlots(tags: string[]): SeoVisualSlot[] {
  const slots: SeoVisualSlot[] = [];
  for (const row of HUB_VISUAL_SYSTEM_ROWS) {
    const cardSlug = row.title.toLowerCase().replace(/\s+/g, '_');
    row.thumbs.forEach((id, i) => {
      slots.push({
        key: `visualSystem_${cardSlug}_${i + 1}`,
        section: 'One product photo. A full visual system.',
        label: `${row.title} · thumb ${i + 1}`,
        whereItAppears: `“${row.title}” card · thumbnail ${i + 1} of 3.`,
        required: false,
        recommendedTags: tags,
        recommendedAspectRatio: '3:4',
        fallbackImageId: id,
        fallbackAlt: `${row.title} — AI product photography example ${i + 1}`,
      });
    });
  }
  return slots;
}

// Category Chooser: 10 categories × 3 thumbnails each = 30 editable slots.
function buildCategoryChooserSlots(tags: string[]): SeoVisualSlot[] {
  const slots: SeoVisualSlot[] = [];
  for (const cat of aiProductPhotographyCategories) {
    cat.previewImages.slice(0, 3).forEach((id, i) => {
      slots.push({
        key: `categoryThumb_${cat.slug}_${i + 1}`,
        section: 'Choose your product category',
        label: `${cat.name} · thumb ${i + 1}`,
        whereItAppears: `“${cat.name}” category card · thumbnail ${i + 1} of 3.`,
        required: false,
        recommendedTags: [...tags, cat.slug, ...cat.subcategories.map((s) => s.toLowerCase())],
        recommendedAspectRatio: '4:5',
        fallbackImageId: id,
        fallbackAlt: `${cat.name} AI product photography example`,
      });
    });
  }
  return slots;
}

// LandingOneToManyShowcase: 6 cards × 3 thumbnails each = 18 slots.
// Slot key uses card position (not title) because tool pages use slightly
// different card titles for the same positions (e.g. "Social" vs "Social
// content", "Detail" vs "Detail close-ups").
const ONE_TO_MANY_DEFAULTS: { label: string; thumbs: [string, string, string] }[] = [
  { label: 'Card 1 (Product page)', thumbs: ['1776770347820-s3qwmr', '1776841027943-vetumj', '1776664933175-rjlbn6'] },
  { label: 'Card 2 (Lifestyle)',    thumbs: ['1776664924644-8pmju4', '1776524131703-gvh4bb', '1776524128011-dcnlpo'] },
  { label: 'Card 3 (Social)',       thumbs: ['1776691906436-3fe7l9', '1776102190563-dioke2', '1776691907477-77vt46'] },
  { label: 'Card 4 (Paid ads)',     thumbs: ['1776102204479-9rlc0n', '1776606017719-zzhgy7', '1776239826550-uaopmt'] },
  { label: 'Card 5 (Detail)',       thumbs: ['1776243905045-8aw72b', '1776244136599-8gw62e', '1776243682026-h1itvm'] },
  { label: 'Card 6 (Campaigns)',    thumbs: ['1776524132929-q8upyp', '1776574228066-oyklfz', '1776018020221-aehe8n'] },
];

function buildOneToManyShowcaseSlots(tags: string[]): SeoVisualSlot[] {
  const slots: SeoVisualSlot[] = [];
  ONE_TO_MANY_DEFAULTS.forEach((row, cardIdx) => {
    row.thumbs.forEach((id, i) => {
      slots.push({
        key: `oneToMany_card${cardIdx + 1}_${i + 1}`,
        section: 'One product photo. A full visual system.',
        label: `${row.label} · thumb ${i + 1}`,
        whereItAppears: `Card ${cardIdx + 1} of 6 · thumbnail ${i + 1} of 3.`,
        required: false,
        recommendedTags: tags,
        recommendedAspectRatio: '3:4',
        fallbackImageId: id,
        fallbackAlt: `${row.label} — AI product photography example ${i + 1}`,
      });
    });
  });
  return slots;
}

// LandingCategoryGrid: scoped per page. If `slugs` is provided we only emit
// slots for those categories; otherwise all 10 categories × 3 thumbs = 30 slots.
function buildCategoryGridSlots(tags: string[], slugs?: string[]): SeoVisualSlot[] {
  const cats = slugs
    ? slugs
        .map((s) => aiProductPhotographyCategories.find((c) => c.slug === s))
        .filter(Boolean)
    : aiProductPhotographyCategories;
  const slots: SeoVisualSlot[] = [];
  for (const cat of cats as typeof aiProductPhotographyCategories) {
    cat.previewImages.slice(0, 3).forEach((id, i) => {
      slots.push({
        key: `categoryGrid_${cat.slug}_${i + 1}`,
        section: 'Built for every product category',
        label: `${cat.name} · thumb ${i + 1}`,
        whereItAppears: `“${cat.name}” category grid card · thumbnail ${i + 1} of 3.`,
        required: false,
        recommendedTags: [...tags, cat.slug, ...cat.subcategories.map((s) => s.toLowerCase())],
        recommendedAspectRatio: '4:5',
        fallbackImageId: id,
        fallbackAlt: `${cat.name} AI product photography example`,
      });
    });
  }
  return slots;
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

// "Built for every {category} shot" — chip rail × 8-tile grid.
// Source of truth: BUILT_FOR_GRIDS[page.slug]
function buildBuiltForGridSlots(page: CategoryPage): SeoVisualSlot[] {
  const groups = getBuiltForGroupsForPage(page.slug);
  const baseTags = [page.slug, ...(page.subcategories ?? []).map((s) => s.toLowerCase())];
  const slots: SeoVisualSlot[] = [];
  for (const g of groups) {
    const subSlug = slugify(g.subCategory);
    g.cards.forEach((card, i) => {
      slots.push({
        key: `builtFor_${subSlug}_${i + 1}`,
        section: `Built for every ${page.groupName.toLowerCase()} shot`,
        label: `${g.subCategory} · tile ${i + 1} — ${card.label}`,
        whereItAppears: `“Built for every ${page.groupName.toLowerCase()} shot” · "${g.subCategory}" chip · tile ${i + 1}.`,
        required: false,
        recommendedTags: [...baseTags, ...slugify(g.subCategory).split('-'), ...slugify(card.label).split('-')],
        recommendedAspectRatio: '3:4',
        fallbackImageId: card.imageId,
        fallbackAlt: `${card.label} — ${page.groupName} AI product photography example`,
      });
    });
  }
  return slots;
}

// Mirror getRelatedThumbs() in CategoryRelatedCategories.tsx so the admin
// preview matches the live render exactly.
function pickRelatedThumbIds(rel: CategoryPage): string[] {
  const picks: string[] = [];
  const seen = new Set<string>();
  const push = (id?: string) => {
    if (!id || seen.has(id) || picks.length >= 3) return;
    seen.add(id);
    picks.push(id);
  };
  rel.heroCollage?.forEach((t) => push(t.imageId));
  rel.sceneExamples.forEach((s) => push(s.imageId));
  push(rel.heroImageId);
  return picks.slice(0, 3);
}

// "Related product photography categories" — 3 thumbs per related category.
function buildRelatedCategorySlots(page: CategoryPage): SeoVisualSlot[] {
  const related = getRelatedPages(page.relatedCategories ?? []);
  const slots: SeoVisualSlot[] = [];
  for (const rel of related) {
    const ids = pickRelatedThumbIds(rel);
    ids.forEach((id, i) => {
      slots.push({
        key: `related_${rel.slug}_${i + 1}`,
        section: 'Related product photography categories',
        label: `${rel.groupName} · thumb ${i + 1}`,
        whereItAppears: `“Related categories” · "${rel.groupName}" card · thumbnail ${i + 1} of 3.`,
        required: false,
        recommendedTags: [rel.slug, ...(rel.subcategories ?? []).map((s) => s.toLowerCase())],
        recommendedAspectRatio: '1:1',
        fallbackImageId: id,
        fallbackAlt: `${rel.groupName} AI product photography example`,
      });
    });
  }
  return slots;
}

// ── The full registry ──

const categoryEntries: SeoPageEntry[] = aiProductPhotographyCategoryPages.map((p) => ({
  route: p.url,
  label: p.groupName,
  group: 'category' as const,
  slots: [
    ...buildCategorySlots(p),
    ...buildBuiltForGridSlots(p),
    ...buildRelatedCategorySlots(p),
  ],
}));

const HUB_TAGS = ['product photography', 'ecommerce', 'editorial', 'studio', 'lifestyle'];

const TOOL_TAGS_GENERATOR = ['product generator', 'ecommerce', 'multi-output'];
const TOOL_TAGS_SHOPIFY = ['shopify', 'ecommerce', 'product page', 'catalog'];
const TOOL_TAGS_ETSY = ['etsy', 'handmade', 'jewelry', 'home decor', 'gift', 'lifestyle'];

const COMPARISON_TAGS = ['before-after', 'workflow', 'comparison'];

export const SEO_PAGES: SeoPageEntry[] = [
  // Main hub — section order matches top-to-bottom on the live page.
  {
    route: '/ai-product-photography',
    label: 'AI Product Photography Hub',
    group: 'main',
    slots: [
      ...buildHeroSlots(HUB_TAGS),
      ...buildCategoryChooserSlots(HUB_TAGS),
      ...buildVisualSystemSlots(HUB_TAGS),
      ...buildSceneExampleSlots(HUB_TAGS),
    ],
  },
  // Category hubs
  ...categoryEntries,
  // Tool / commercial intent pages — full coverage of every image-bearing
  // section (hero marquee, "One product photo" showcase, category grid).
  {
    route: '/ai-product-photo-generator',
    label: 'AI Product Photo Generator',
    group: 'tool',
    slots: [
      ...buildHeroSlots(TOOL_TAGS_GENERATOR),
      ...buildOneToManyShowcaseSlots(TOOL_TAGS_GENERATOR),
      ...buildCategoryGridSlots(TOOL_TAGS_GENERATOR),
    ],
  },
  {
    route: '/shopify-product-photography-ai',
    label: 'Shopify Product Photos',
    group: 'tool',
    slots: [
      ...buildHeroSlots(TOOL_TAGS_SHOPIFY),
      ...buildOneToManyShowcaseSlots(TOOL_TAGS_SHOPIFY),
      ...buildCategoryGridSlots(TOOL_TAGS_SHOPIFY),
    ],
  },
  {
    route: '/etsy-product-photography-ai',
    label: 'Etsy Product Photos',
    group: 'tool',
    slots: [
      ...buildHeroSlots(TOOL_TAGS_ETSY),
      ...buildOneToManyShowcaseSlots(TOOL_TAGS_ETSY),
      ...buildCategoryGridSlots(TOOL_TAGS_ETSY),
    ],
  },
  // Comparison pages — hero + category grid (no OneToMany on these pages).
  {
    route: '/ai-product-photography-vs-photoshoot',
    label: 'AI vs Photoshoot',
    group: 'comparison',
    slots: [
      ...buildHeroSlots(COMPARISON_TAGS),
      ...buildCategoryGridSlots(COMPARISON_TAGS),
    ],
  },
  {
    route: '/ai-product-photography-vs-studio',
    label: 'VOVV.AI vs Studio',
    group: 'comparison',
    slots: [
      ...buildHeroSlots(COMPARISON_TAGS),
      ...buildCategoryGridSlots(COMPARISON_TAGS),
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
