/**
 * Prerender public/SEO routes to static HTML using Puppeteer.
 *
 * Defense in depth:
 *   Layer A — URL list comes from dist/sitemap.xml (auto-generated, no private routes)
 *   Layer B — FORBIDDEN_PATTERNS regex blocklist (hard-rejects /app, /auth, /admin, tokens, etc.)
 *   Layer C — Runtime redirect detection with trailing-slash tolerance
 *   Layer D — Final HTML scanned for <input type=password> (auth leak guard)
 *
 * Output: dist/<route>/index.html alongside the existing dist/index.html SPA fallback.
 * Lovable hosting auto-serves the prerendered file when it matches the request path.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, type Server } from 'node:http';
import puppeteer, { type Browser } from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const SITEMAP = resolve(DIST, 'sitemap.xml');
const PORT = 4321;

// ============================================================
// Layer B — HARD BLOCKLIST. These MUST NEVER be prerendered.
// ============================================================
const FORBIDDEN_PATTERNS: RegExp[] = [
  /^\/app(\/|$)/,
  /^\/auth(\/|$)/,
  /^\/onboarding(\/|$)/,
  /^\/reset-password(\/|$)/,
  /^\/upload(\/|$)/,
  /^\/tryshot(\/|$)/,
  /^\/admin(\/|$)/,
  /^\/payment-success(\/|$)/,
  /^\/settings(\/|$)/,
  // UUID-shaped tokens (e.g. /upload/<uuid>, /library/<uuid>)
  /[0-9a-f]{8}-[0-9a-f]{4}/i,
];

function isForbidden(path: string): boolean {
  return FORBIDDEN_PATTERNS.some((re) => re.test(path));
}

function normalize(p: string): string {
  if (p === '/' || p === '') return '/';
  return p.replace(/\/$/, '');
}

function readSitemapPaths(): string[] {
  if (!existsSync(SITEMAP)) {
    throw new Error(`Sitemap not found at ${SITEMAP}. Run sitemap generator first.`);
  }
  const xml = readFileSync(SITEMAP, 'utf8');
  const matches = [...xml.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)];
  const raw = matches.map((m) => (m[1] === '' ? '/' : m[1]));
  return Array.from(new Set(raw));
}

function startStaticServer(): Promise<Server> {
  return new Promise((resolveStart) => {
    const server = createServer((req, res) => {
      const urlPath = (req.url || '/').split('?')[0];
      const candidates = [
        join(DIST, urlPath),
        join(DIST, urlPath, 'index.html'),
        join(DIST, 'index.html'), // SPA fallback
      ];
      for (const c of candidates) {
        if (!c.endsWith('/') && existsSync(c)) {
          try {
            const data = readFileSync(c);
            const ext = c.split('.').pop() || '';
            const ct =
              ext === 'html' ? 'text/html; charset=utf-8'
              : ext === 'js' ? 'application/javascript'
              : ext === 'css' ? 'text/css'
              : ext === 'json' ? 'application/json'
              : ext === 'svg' ? 'image/svg+xml'
              : ext === 'png' ? 'image/png'
              : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
              : ext === 'webp' ? 'image/webp'
              : ext === 'woff2' ? 'font/woff2'
              : ext === 'xml' ? 'application/xml'
              : 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': ct });
            res.end(data);
            return;
          } catch { /* try next */ }
        }
      }
      res.writeHead(404);
      res.end('Not found');
    });
    server.listen(PORT, () => resolveStart(server));
  });
}

interface RenderResult {
  path: string;
  ok: boolean;
  reason?: string;
  bytes?: number;
}

async function renderPath(browser: Browser, path: string): Promise<RenderResult> {
  // Layer B (re-check at render time)
  if (isForbidden(path)) {
    return { path, ok: false, reason: 'BLOCKED by FORBIDDEN_PATTERNS' };
  }

  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 PrerenderBot/1.0 (compatible; Lovable static gen)'
    );

    const url = `http://localhost:${PORT}${path}`;
    const resp = await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });

    if (!resp || resp.status() >= 400) {
      return { path, ok: false, reason: `HTTP ${resp?.status() ?? 'no-response'}` };
    }

    await page.waitForSelector('title', { timeout: 10000 });
    // Let SEOHead + React Helmet flush
    await new Promise((r) => setTimeout(r, 800));

    // Layer C — redirect detection with trailing-slash tolerance
    const finalPath = new URL(page.url()).pathname;
    const requestedNorm = normalize(path);
    const finalNorm = normalize(finalPath);

    if (isForbidden(finalNorm)) {
      return { path, ok: false, reason: `Final URL hit forbidden pattern: ${finalPath}` };
    }
    if (requestedNorm !== finalNorm) {
      return { path, ok: false, reason: `Redirected: ${path} → ${finalPath}` };
    }

    // Capture rendered HTML
    const html = await page.content();

    // Layer D — auth leak guard
    if (/<input[^>]+type=["']password["']/i.test(html)) {
      return { path, ok: false, reason: 'Page contains password input (auth leak)' };
    }

    // Write dist/<route>/index.html (root stays as dist/index.html)
    const outDir = path === '/' ? DIST : join(DIST, path);
    mkdirSync(outDir, { recursive: true });
    const outFile = join(outDir, 'index.html');
    writeFileSync(outFile, html, 'utf8');

    return { path, ok: true, bytes: html.length };
  } catch (err) {
    return { path, ok: false, reason: (err as Error).message };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('▶ Reading sitemap...');
  const allPaths = readSitemapPaths();

  // Layer B filter
  const safe = allPaths.filter((p) => !isForbidden(p));
  const blocked = allPaths.filter((p) => isForbidden(p));
  if (blocked.length > 0) {
    console.warn(`⚠ Blocked ${blocked.length} forbidden URL(s) found in sitemap:`);
    blocked.forEach((p) => console.warn(`   - ${p}`));
  }
  console.log(`▶ Will prerender ${safe.length} routes`);

  console.log('▶ Starting static server on :' + PORT);
  const server = await startStaticServer();

  console.log('▶ Launching headless Chromium...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const results: RenderResult[] = [];
  const concurrency = 4;
  for (let i = 0; i < safe.length; i += concurrency) {
    const batch = safe.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((p) => renderPath(browser, p)));
    batchResults.forEach((r) => {
      const tag = r.ok ? '✓' : '✗';
      const extra = r.ok ? `${(r.bytes! / 1024).toFixed(1)}kb` : r.reason;
      console.log(`  ${tag} ${r.path.padEnd(60)} ${extra}`);
      results.push(r);
    });
  }

  await browser.close();
  server.close();

  const failures = results.filter((r) => !r.ok);
  const successes = results.filter((r) => r.ok);
  console.log(`\n▶ Done. ${successes.length} ok, ${failures.length} failed`);

  if (failures.length > 0) {
    console.error('\n❌ Failures:');
    failures.forEach((f) => console.error(`   ${f.path} → ${f.reason}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Prerender crashed:', err);
  process.exit(1);
});
