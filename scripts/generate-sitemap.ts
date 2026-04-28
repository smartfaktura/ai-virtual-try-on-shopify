/**
 * Generates public/sitemap.xml from a single source of truth.
 *
 * - Static marketing routes are listed in MARKETING_URLS below.
 * - Blog post URLs come from src/data/blogPosts.ts
 * - SEO category URLs come from src/data/aiProductPhotographyCategoryPages.ts
 *
 * Wired into `npm run build` so every deploy regenerates the sitemap.
 * Run manually with: `npm run sitemap`
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

import { blogPosts } from '../src/data/blogPosts';
import { aiProductPhotographyCategoryPages } from '../src/data/aiProductPhotographyCategoryPages';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://vovv.ai';
const TODAY = new Date().toISOString().slice(0, 10);

// =============================================================
// PILOT — Discover SEO pages
// First 10 hand-picked Discover items get a dedicated SEO URL.
// Each slug must exist in `discover_presets.slug` — validated
// at build time below. After Search Console reports healthy
// indexing, scale to 30, then 100+.
// =============================================================
const PILOT_DISCOVER_SLUGS: string[] = [
  'beyond-the-red-room-e4d48b',                      // bags-accessories
  'el-vane-crystal-renewal-night-treatment-d5b827',  // beauty-fragrance
  'frozen-aura-sunglasses-e105db',                   // eyewear
  'tennis-court-chic-17aff8',                        // fashion
  'kyoto-matcha-tea-ceremony-c8176c',                // food-drink
  'leopard-strides-af33ef',                          // footwear
  'architectural-trench-b91198',                     // home
  'diamond-hoop-earrings-2b9ca4',                    // jewelry
  'aurenx-series-one-wireless-earbuds-b7fd11',       // tech
  'v-anor-bio-balance-synbiotic-complex-5da369',     // wellness
];

type ChangeFreq =
  | 'always' | 'hourly' | 'daily' | 'weekly'
  | 'monthly' | 'yearly' | 'never';

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: ChangeFreq;
  priority: number;
}

/** Static public routes from src/App.tsx (excluding /app/*, /auth, /onboarding,
 *  /reset-password, /upload/*, /tryshot/* — all blocked in robots.txt). */
const MARKETING_URLS: SitemapEntry[] = [
  // Homepage
  { loc: '/',                               changefreq: 'weekly',  priority: 1.0 },

  // Top-converting product pages
  { loc: '/pricing',                        changefreq: 'monthly', priority: 0.9 },
  { loc: '/why-vovv',                       changefreq: 'monthly', priority: 0.9 },
  { loc: '/how-it-works',                   changefreq: 'monthly', priority: 0.9 },
  { loc: '/faq',                            changefreq: 'monthly', priority: 0.7 },
  { loc: '/roadmap',                        changefreq: 'weekly',  priority: 0.7 },
  { loc: '/try',                            changefreq: 'monthly', priority: 0.8 },

  // Public galleries / discovery
  { loc: '/discover',                       changefreq: 'weekly',  priority: 0.8 },
  { loc: '/freestyle',                      changefreq: 'daily',   priority: 0.9 },
  { loc: '/product-visual-library',         changefreq: 'weekly',  priority: 0.9 },

  // SEO landing pages (AI photography family)
  { loc: '/ai-product-photography',         changefreq: 'weekly',  priority: 0.9 },
  { loc: '/ai-product-photo-generator',     changefreq: 'monthly', priority: 0.9 },
  { loc: '/shopify-product-photography-ai', changefreq: 'monthly', priority: 0.85 },
  { loc: '/etsy-product-photography-ai',    changefreq: 'monthly', priority: 0.85 },
  { loc: '/ai-product-photography-vs-photoshoot', changefreq: 'monthly', priority: 0.8 },
  { loc: '/ai-product-photography-vs-studio',     changefreq: 'monthly', priority: 0.8 },

  // Feature pages
  { loc: '/features/workflows',             changefreq: 'monthly', priority: 0.8 },
  { loc: '/features/virtual-try-on',        changefreq: 'monthly', priority: 0.8 },
  { loc: '/features/freestyle',             changefreq: 'monthly', priority: 0.8 },
  { loc: '/features/creative-drops',        changefreq: 'monthly', priority: 0.7 },
  { loc: '/features/brand-profiles',        changefreq: 'monthly', priority: 0.7 },
  { loc: '/features/ai-models-backgrounds', changefreq: 'monthly', priority: 0.7 },
  { loc: '/features/shopify-image-generator', changefreq: 'monthly', priority: 0.7 },
  { loc: '/features/upscale',               changefreq: 'monthly', priority: 0.7 },
  { loc: '/features/perspectives',          changefreq: 'monthly', priority: 0.7 },
  { loc: '/features/real-estate-staging',   changefreq: 'monthly', priority: 0.7 },

  // Company / content
  { loc: '/blog',                           changefreq: 'daily',   priority: 0.9 },
  { loc: '/about',                          changefreq: 'monthly', priority: 0.7 },
  { loc: '/team',                           changefreq: 'monthly', priority: 0.5 },
  { loc: '/careers',                        changefreq: 'monthly', priority: 0.6 },
  { loc: '/contact',                        changefreq: 'monthly', priority: 0.6 },
  { loc: '/help',                           changefreq: 'monthly', priority: 0.6 },
  { loc: '/press',                          changefreq: 'monthly', priority: 0.5 },
  { loc: '/changelog',                      changefreq: 'weekly',  priority: 0.5 },
  { loc: '/status',                         changefreq: 'daily',   priority: 0.4 },

  // Legal
  { loc: '/privacy',                        changefreq: 'yearly',  priority: 0.3 },
  { loc: '/terms',                          changefreq: 'yearly',  priority: 0.3 },
  { loc: '/cookies',                        changefreq: 'yearly',  priority: 0.3 },
];

function pickDate(value: unknown): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return TODAY;
}

const blogEntries: SitemapEntry[] = blogPosts.map((post) => {
  const raw = post as Record<string, unknown>;
  const lastmod = pickDate(raw.updatedAt ?? raw.publishedAt ?? raw.date);
  return {
    loc: `/blog/${post.slug}`,
    lastmod,
    changefreq: 'monthly',
    priority: 0.8,
  };
});

const categoryEntries: SitemapEntry[] = aiProductPhotographyCategoryPages.map((cat) => ({
  loc: `/ai-product-photography/${cat.slug}`,
  lastmod: TODAY,
  changefreq: 'monthly',
  priority: 0.85,
}));

// =============================================================
// Discover pilot — validate each slug exists in the database
// before emitting it. Build fails loudly on any mismatch.
// =============================================================
async function buildDiscoverEntries(): Promise<SitemapEntry[]> {
  if (PILOT_DISCOVER_SLUGS.length === 0) return [];

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://azwiljtrbtaupofwmpzb.supabase.co';
  const SUPABASE_KEY =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6d2lsanRyYnRhdXBvZndtcHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTkzNzEsImV4cCI6MjA4NTM3NTM3MX0.w8Flgj4nld44gT4w-S_TSqzZ-FRPt4xTFiHm1U_c5VY';

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await supabase
    .from('discover_presets')
    .select('slug')
    .in('slug', PILOT_DISCOVER_SLUGS);

  if (error) {
    throw new Error(`Failed to validate discover pilot slugs: ${error.message}`);
  }

  const found = new Set((data ?? []).map((r) => r.slug));
  const missing = PILOT_DISCOVER_SLUGS.filter((s) => !found.has(s));
  if (missing.length > 0) {
    throw new Error(`Discover pilot slug(s) not found in DB: ${missing.join(', ')}`);
  }

  return PILOT_DISCOVER_SLUGS.map((slug) => ({
    loc: `/discover/${slug}`,
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: 0.7,
  }));
}

const discoverEntries = await buildDiscoverEntries();

const all: SitemapEntry[] = [
  ...MARKETING_URLS.map((e) => ({ ...e, lastmod: e.lastmod ?? TODAY })),
  ...blogEntries,
  ...categoryEntries,
  ...discoverEntries,
];

// Dedupe by loc, keeping the highest priority entry
const byLoc = new Map<string, SitemapEntry>();
for (const e of all) {
  const existing = byLoc.get(e.loc);
  if (!existing || e.priority > existing.priority) byLoc.set(e.loc, e);
}

const sorted = Array.from(byLoc.values()).sort(
  (a, b) => b.priority - a.priority || a.loc.localeCompare(b.loc),
);

// HARD ASSERTION — no /app/* URL can ever be emitted in the public sitemap.
for (const e of sorted) {
  if (e.loc.startsWith('/app/') || e.loc === '/app') {
    throw new Error(`FORBIDDEN: /app/ URL leaked into sitemap: ${e.loc}`);
  }
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sorted
    .map(
      (e) =>
        `  <url><loc>${SITE}${e.loc}</loc><lastmod>${e.lastmod}</lastmod>` +
        `<changefreq>${e.changefreq}</changefreq>` +
        `<priority>${e.priority.toFixed(2)}</priority></url>`,
    )
    .join('\n') +
  `\n</urlset>\n`;

const outPath = resolve(__dirname, '..', 'public', 'sitemap.xml');
writeFileSync(outPath, xml, 'utf8');

console.log(`✓ Wrote ${sorted.length} URLs to public/sitemap.xml (${discoverEntries.length} discover pilots)`);

