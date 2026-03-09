

## Comprehensive SEO + Blog Implementation for VOVV.AI

This is a large initiative covering three areas: per-page SEO metadata, structured data for Google Rich Results, and a real blog with keyword-optimized posts.

---

### 1. SEO Head Component (`src/components/SEOHead.tsx`) — New

A reusable component that sets `document.title`, meta description, canonical URL, and Open Graph / Twitter tags per page using direct DOM manipulation (no extra dependency needed).

```text
<SEOHead
  title="AI Product Photography for E-commerce | VOVV AI"
  description="..."
  canonical="https://vovvai.lovable.app/about"
  ogImage="..."
/>
```

Will be added to every public page (Landing, About, Blog, Pricing, Careers, Press, Contact, Help, Features pages, legal pages).

---

### 2. JSON-LD Structured Data

Add structured data scripts for Google Rich Results:

- **Landing page**: `Organization` + `WebSite` schema (with SearchAction)
- **FAQ section**: `FAQPage` schema using existing FAQ data from `LandingFAQ.tsx`
- **Blog posts**: `Article` + `BreadcrumbList` schema per post
- **Pricing page**: `Product` schema with pricing tiers

These will be injected via a `<JsonLd>` helper component that appends a `<script type="application/ld+json">` to the document head.

---

### 3. Sitemap + Robots.txt

- **`public/sitemap.xml`** — Static sitemap listing all public routes with `lastmod`, `changefreq`, and `priority`
- **`public/robots.txt`** — Add `Sitemap: https://vovvai.lovable.app/sitemap.xml`

---

### 4. Real Blog with SEO-Optimized Posts

Replace the "Coming Soon" blog page with a full blog system using hardcoded post data (no database needed — static content for SEO indexing).

**Blog post data file** (`src/data/blogPosts.ts`):
- 6 initial posts with targeted keywords, each with: slug, title, metaDescription, publishDate (staggered day-by-day), author, readTime, category, content (markdown), tags

**Target keywords per post:**
1. "AI product photography for e-commerce" — How AI replaces traditional product shoots
2. "virtual try-on technology for fashion brands" — How virtual try-on increases conversions
3. "e-commerce visual content strategy 2026" — Visual strategy guide
4. "AI model photography diverse representation" — Inclusive model photography
5. "automated product listing images" — Streamlining listings at scale
6. "brand consistency AI generated visuals" — Maintaining brand identity with AI

**Blog pages:**
- **`/blog`** — Post listing with cards showing title, excerpt, date, category, read time
- **`/blog/:slug`** — Full post page with markdown rendering, Article JSON-LD, breadcrumbs, related posts, and CTA

**New files:**
| File | Purpose |
|------|---------|
| `src/components/SEOHead.tsx` | Reusable per-page meta tags |
| `src/components/JsonLd.tsx` | JSON-LD structured data injector |
| `src/data/blogPosts.ts` | 6 SEO-optimized blog posts |
| `src/pages/Blog.tsx` | Rewritten — post listing page |
| `src/pages/BlogPost.tsx` | New — individual post page |
| `public/sitemap.xml` | Static sitemap |

**Modified files:**
| File | Change |
|------|--------|
| `public/robots.txt` | Add Sitemap directive |
| `index.html` | Add canonical link tag |
| `src/App.tsx` | Add `/blog/:slug` route |
| `src/pages/Landing.tsx` | Add SEOHead + Organization/WebSite JSON-LD |
| `src/pages/About.tsx` | Add SEOHead |
| `src/pages/Pricing.tsx` | Add SEOHead |
| `src/pages/Careers.tsx` | Add SEOHead |
| `src/pages/Contact.tsx` | Add SEOHead |
| `src/pages/HelpCenter.tsx` | Add SEOHead |
| `src/pages/Press.tsx` | Add SEOHead |
| `src/pages/PrivacyPolicy.tsx` | Add SEOHead |
| `src/pages/TermsOfService.tsx` | Add SEOHead |
| `src/pages/CookiePolicy.tsx` | Add SEOHead |
| `src/components/landing/LandingFAQ.tsx` | Add FAQPage JSON-LD |
| Feature pages (4) | Add SEOHead with targeted titles/descriptions |

---

### SEO Titles & Descriptions (examples)

| Page | Title | Description |
|------|-------|-------------|
| Landing | VOVV AI — AI Product Photography & Visual Studio for E-commerce | Upload one product photo, get 20 brand-ready visuals for ads, website, and campaigns automatically. |
| Pricing | Pricing & Plans — VOVV AI | Free credits to start. Scale with flexible plans from Starter to Enterprise. AI product photography pricing. |
| About | About VOVV AI — The Team Behind AI Product Photography | Meet the team building the future of e-commerce visual content with AI-powered photography and automation. |
| Blog | VOVV AI Blog — AI Photography, E-commerce Tips & Visual Strategy | Insights on AI product photography, visual content strategy, and e-commerce growth from the VOVV AI team. |

This plan requires no new dependencies — `react-markdown` is already installed for blog post rendering.

