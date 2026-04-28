/**
 * Generates public/sitemap.xml from a single source of truth.
 *
 * Sources:
 *  - Static marketing routes from MARKETING_URLS below
 *  - Blog post URLs from src/data/blogPosts.ts (with image entries)
 *  - SEO category URLs from src/data/aiProductPhotographyCategoryPages.ts
 *  - Public Discover items fetched live from the backend at build time
 *    (with real created_at as lastmod and hero image entries)
 *
 * Wired into `npm run build` so every deploy regenerates the sitemap.
 * Run manually with: `npm run sitemap`
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { blogPosts } from '../src/data/blogPosts';
import {
  aiProductPhotographyCategoryPages,
  PREVIEW,
} from '../src/data/aiProductPhotographyCategoryPages';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://vovv.ai';
const TODAY = new Date().toISOString().slice(0, 10);

// Read backend creds from .env without bringing in a dep
function loadEnv(): Record<string, string> {
  try {
    const raw = readFileSync(resolve(__dirname, '..', '.env'), 'utf8');
    const out: Record<string, string> = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m) out[m[1]] = m[2];
    }
    return out;
  } catch {
    return {};
  }
}
const ENV = loadEnv();
const SUPABASE_URL = ENV.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_KEY = ENV.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

type ChangeFreq =
  | 'always' | 'hourly' | 'daily' | 'weekly'
  | 'monthly' | 'yearly' | 'never';

interface ImageEntry {
  loc: string;
  title?: string;
}

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: ChangeFreq;
  priority: number;
  images?: ImageEntry[];
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

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const blogEntries: SitemapEntry[] = blogPosts.map((post) => {
  const raw = post as Record<string, unknown>;
  const lastmod = pickDate(raw.updatedAt ?? raw.publishedAt ?? raw.date);
  const heroImage =
    (typeof raw.heroImage === 'string' && raw.heroImage) ||
    (typeof raw.coverImage === 'string' && raw.coverImage) ||
    (typeof raw.image === 'string' && raw.image) ||
    undefined;
  return {
    loc: `/blog/${post.slug}`,
    lastmod,
    changefreq: 'monthly',
    priority: 0.8,
    images: heroImage
      ? [{ loc: heroImage, title: typeof raw.title === 'string' ? raw.title : undefined }]
      : undefined,
  };
});

const categoryEntries: SitemapEntry[] = aiProductPhotographyCategoryPages.map((cat) => {
  // Hero image first, then up to 4 scene previews per page.
  // Google supports up to 1,000 image entries per URL — we cap at 5 to stay
  // focused on the strongest visuals and keep the file readable.
  const images: ImageEntry[] = [];
  if (cat.heroImageId) {
    images.push({
      loc: PREVIEW(cat.heroImageId),
      title: cat.heroAlt || `${cat.h1Lead} ${cat.h1Highlight}`,
    });
  }
  for (const scene of cat.sceneExamples.slice(0, 4)) {
    images.push({
      loc: PREVIEW(scene.imageId),
      title: scene.alt || `${scene.label} — ${scene.collectionLabel}`,
    });
  }
  return {
    loc: `/ai-product-photography/${cat.slug}`,
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: 0.85,
    images: images.length ? images : undefined,
  };
});

// ───────── Discover items (live from backend) ─────────
async function fetchDiscoverEntries(): Promise<SitemapEntry[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠ Skipping discover items — VITE_SUPABASE_URL / KEY not found');
    return [];
  }
  const url =
    `${SUPABASE_URL}/rest/v1/discover_presets` +
    `?select=slug,created_at,image_url,title&order=created_at.desc&limit=5000`;
  try {
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) {
      console.warn(`⚠ Discover fetch failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const rows = (await res.json()) as Array<{
      slug: string;
      created_at: string;
      image_url: string | null;
      title: string | null;
    }>;
    return rows
      .filter((r) => typeof r.slug === 'string' && r.slug.length > 0)
      .map((r) => ({
        loc: `/discover/${r.slug}`,
        lastmod: pickDate(r.created_at),
        changefreq: 'monthly' as const,
        priority: 0.7,
        images: r.image_url
          ? [{ loc: r.image_url, title: r.title ?? undefined }]
          : undefined,
      }));
  } catch (err) {
    console.warn('⚠ Discover fetch threw:', (err as Error).message);
    return [];
  }
}

const discoverEntries = await fetchDiscoverEntries();

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

const hasImages = sorted.some((e) => e.images && e.images.length);

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"` +
  (hasImages ? ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` : ``) +
  `>\n` +
  sorted
    .map((e) => {
      const head =
        `  <url><loc>${SITE}${e.loc}</loc><lastmod>${e.lastmod}</lastmod>` +
        `<changefreq>${e.changefreq}</changefreq>` +
        `<priority>${e.priority.toFixed(2)}</priority>`;
      const imgs = (e.images ?? [])
        .map(
          (im) =>
            `<image:image><image:loc>${escapeXml(im.loc)}</image:loc>` +
            (im.title ? `<image:title>${escapeXml(im.title)}</image:title>` : ``) +
            `</image:image>`,
        )
        .join('');
      return `${head}${imgs}</url>`;
    })
    .join('\n') +
  `\n</urlset>\n`;

const outPath = resolve(__dirname, '..', 'public', 'sitemap.xml');
writeFileSync(outPath, xml, 'utf8');

const imageCount = sorted.reduce((n, e) => n + (e.images?.length ?? 0), 0);
console.log(
  `✓ Wrote ${sorted.length} URLs (${imageCount} image entries) to public/sitemap.xml`,
);
