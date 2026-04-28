/**
 * Validates prerendered HTML files in dist/.
 * Exits non-zero if any required check fails (blocks deploy).
 *
 * Mirrors the policy in plan: universal checks + JSON-LD required/optional split.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const SITE = 'https://vovv.ai';

const DEFAULT_HOMEPAGE_TITLE = 'AI Product Visuals & Videos for E-commerce Brands | VOVV.AI';
const DEFAULT_HOMEPAGE_DESC =
  'VOVV.AI helps e-commerce brands create brand-ready product visuals and videos from one product photo. Generate visuals for ads, websites, and campaigns faster.';

const JSONLD_REQUIRED = (path: string): boolean =>
  path === '/' ||
  path === '/pricing' ||
  path === '/blog' ||
  path.startsWith('/blog/') ||
  path.startsWith('/ai-product-photography') ||
  path.startsWith('/features/');

const JSONLD_OPTIONAL_OK = new Set([
  '/contact', '/status', '/privacy', '/terms', '/cookies',
  '/changelog', '/help', '/press', '/team', '/careers',
  '/about', '/roadmap', '/faq',
]);

interface Issue { severity: 'fail' | 'warn'; msg: string; }

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function findFile(html: string, regex: RegExp): string | null {
  const m = html.match(regex);
  return m ? decodeEntities(m[1]) : null;
}

function findAll(html: string, regex: RegExp): string[] {
  return [...html.matchAll(regex)].map((m) => decodeEntities(m[1]));
}

function visibleTextLength(html: string): number {
  // Strip script/style/noscript blocks then HTML tags
  const stripped = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length;
}

function validateOne(filePath: string, route: string): Issue[] {
  const html = readFileSync(filePath, 'utf8');
  const issues: Issue[] = [];

  // <title>
  const title = findFile(html, /<title[^>]*>([^<]*)<\/title>/i);
  if (!title || title.trim().length === 0) {
    issues.push({ severity: 'fail', msg: 'Missing or empty <title>' });
  } else if (route !== '/' && title.trim() === DEFAULT_HOMEPAGE_TITLE) {
    issues.push({ severity: 'fail', msg: `Title equals default homepage title: "${title}"` });
  }

  // meta description
  const desc = findFile(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)
            ?? findFile(html, /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
  if (!desc || desc.trim().length === 0) {
    issues.push({ severity: 'fail', msg: 'Missing or empty meta description' });
  } else if (route !== '/' && desc.trim() === DEFAULT_HOMEPAGE_DESC) {
    issues.push({ severity: 'fail', msg: 'Meta description equals default homepage desc' });
  }

  // canonical
  const canonical = findFile(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)
                ?? findFile(html, /<link[^>]+href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
  if (!canonical) {
    issues.push({ severity: 'fail', msg: 'Missing canonical' });
  } else {
    // Should match the route (with trailing-slash tolerance and absolute URL)
    const canonicalPath = canonical.replace(SITE, '').replace(/\/$/, '') || '/';
    const expected = route === '/' ? '/' : route.replace(/\/$/, '');
    if (canonicalPath !== expected) {
      issues.push({ severity: 'fail', msg: `Canonical mismatch: ${canonical} (expected route ${route})` });
    }
  }

  // H1
  if (!/<h1\b/i.test(html)) {
    issues.push({ severity: 'fail', msg: 'No <h1> in body' });
  }

  // OG tags
  for (const prop of ['og:title', 'og:description', 'og:image', 'og:type']) {
    const re = new RegExp(`<meta[^>]+property=["']${prop}["']`, 'i');
    if (!re.test(html)) {
      issues.push({ severity: 'fail', msg: `Missing OG tag: ${prop}` });
    }
  }

  // Twitter tags
  for (const name of ['twitter:card', 'twitter:title', 'twitter:image']) {
    const re = new RegExp(`<meta[^>]+name=["']${name}["']`, 'i');
    if (!re.test(html)) {
      issues.push({ severity: 'fail', msg: `Missing Twitter tag: ${name}` });
    }
  }

  // Body text length
  const textLen = visibleTextLength(html);
  if (textLen < 500) {
    issues.push({ severity: 'fail', msg: `Body text only ${textLen} chars (need >500)` });
  }

  // Not loading-only
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : '';
  const bodyText = bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (bodyText.length < 100 || /^(VOVV\.AI|Loading\.\.\.)\s*$/i.test(bodyText)) {
    issues.push({ severity: 'fail', msg: 'Body looks like loading spinner only' });
  }

  // No password input
  if (/<input[^>]+type=["']password["']/i.test(html)) {
    issues.push({ severity: 'fail', msg: 'Auth leak: password input present' });
  }

  // JSON-LD policy
  const jsonLdBlocks = findAll(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const hasJsonLd = jsonLdBlocks.length > 0;

  if (JSONLD_REQUIRED(route)) {
    if (!hasJsonLd) {
      issues.push({ severity: 'fail', msg: 'JSON-LD required but missing' });
    } else {
      // Bonus type checks
      const allLd = jsonLdBlocks.join(' ');
      if (route === '/' && !/"FAQPage"/.test(allLd)) {
        issues.push({ severity: 'warn', msg: 'Homepage missing FAQPage JSON-LD' });
      }
      if (route === '/faq' && !/"FAQPage"/.test(allLd)) {
        issues.push({ severity: 'warn', msg: '/faq missing FAQPage JSON-LD' });
      }
      if (route.startsWith('/blog/') && !/"BlogPosting"/.test(allLd)) {
        issues.push({ severity: 'warn', msg: 'Blog post missing BlogPosting JSON-LD' });
      }
      if (route.startsWith('/ai-product-photography') && !/"SoftwareApplication"|"Product"|"WebPage"/.test(allLd)) {
        issues.push({ severity: 'warn', msg: 'SEO landing missing SoftwareApplication/Product JSON-LD' });
      }
    }
  } else if (!hasJsonLd && !JSONLD_OPTIONAL_OK.has(route)) {
    issues.push({ severity: 'warn', msg: 'JSON-LD missing (route not in optional allow-list)' });
  }

  return issues;
}

function findHtmlFiles(dir: string, base: string = dir): Array<{ file: string; route: string }> {
  const out: Array<{ file: string; route: string }> = [];
  for (const entry of readdirSync(dir)) {
    // Skip vite assets and other build artifacts
    if (entry === 'assets' || entry.startsWith('.') || entry.endsWith('.js') ||
        entry.endsWith('.css') || entry.endsWith('.map')) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...findHtmlFiles(full, base));
    } else if (entry === 'index.html') {
      const rel = relative(base, full);
      const route = '/' + dirname(rel).replace(/\\/g, '/').replace(/^\.$/, '');
      out.push({ file: full, route: route === '/' ? '/' : route.replace(/\/$/, '') });
    }
  }
  return out;
}

function main() {
  if (!existsSync(DIST)) {
    console.error(`✗ ${DIST} does not exist. Run vite build + prerender first.`);
    process.exit(1);
  }

  console.log('▶ Validating prerendered HTML files...\n');
  const files = findHtmlFiles(DIST);
  console.log(`Found ${files.length} index.html files\n`);

  let totalFails = 0;
  let totalWarns = 0;
  let pagesWithFails = 0;

  for (const { file, route } of files) {
    const issues = validateOne(file, route);
    const fails = issues.filter((i) => i.severity === 'fail');
    const warns = issues.filter((i) => i.severity === 'warn');

    if (fails.length === 0 && warns.length === 0) {
      console.log(`  ✓ ${route}`);
    } else {
      console.log(`  ${fails.length > 0 ? '✗' : '⚠'} ${route}`);
      for (const i of fails) console.log(`      ✗ ${i.msg}`);
      for (const i of warns) console.log(`      ⚠ ${i.msg}`);
    }

    totalFails += fails.length;
    totalWarns += warns.length;
    if (fails.length > 0) pagesWithFails++;
  }

  console.log(`\n▶ Summary: ${files.length} pages, ${totalFails} failures, ${totalWarns} warnings`);

  if (totalFails > 0) {
    console.error(`\n❌ ${pagesWithFails} page(s) failed validation. Deploy blocked.`);
    process.exit(1);
  }
  console.log('✓ All pages passed required checks.\n');
}

main();
