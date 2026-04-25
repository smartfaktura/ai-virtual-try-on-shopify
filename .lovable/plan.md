# Restyle /pricing to match home aesthetic + create dedicated /faq page

## Goals

1. Bring `/pricing` in line with the premium homepage aesthetic (eyebrows, serif-free heavy-weight headings with `tracking-[-0.03em]`, generous vertical rhythm, off-white `#FAFAF8` surface, dark navy `#1a1a2e` typography, soft `#f0efed` borders, pill CTAs).
2. Make the nav "FAQ" link route to a real, dedicated `/faq` page styled with the same aesthetic — currently it points to `#faq` which goes nowhere outside the pricing page.

## Part 1 — `/pricing` aesthetic refresh

Edit `src/components/landing/LandingPricing.tsx`:

**Section frame**
- Wrap in `bg-[#FAFAF8]`, change outer section to `pt-24 sm:pt-28 lg:pt-32 pb-20 lg:pb-32`.
- Replace per-block `mt-20/24` with consistent `mt-24 lg:mt-32` rhythm (like home sections).

**Header (lines ~143–172)**
- Add eyebrow: `<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Pricing</p>`
- Replace H2 with: `text-[#1a1a2e] text-[2.5rem] sm:text-5xl lg:text-[3.25rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6` and copy "Simple pricing. Real production output."
- Subtitle: `mx-auto max-w-xl text-[#6b7280] text-lg leading-relaxed mb-10`.
- Monthly/Annual toggle: keep but restyle to `bg-white border border-[#f0efed]` pill with subtle shadow to match home.

**Plan cards (lines ~199–283)**
- Card: `rounded-2xl border border-[#f0efed] bg-white p-7` (white-on-cream like home cards).
- Highlighted/current: `border-[#1a1a2e]/15 ring-1 ring-[#1a1a2e]/10 shadow-[0_8px_30px_-8px_rgba(26,26,46,0.12)]`.
- Plan name: `text-[#1a1a2e] text-base font-semibold`.
- Price: `text-[#1a1a2e] text-[2.75rem] font-semibold tracking-[-0.02em]`; suffix `/mo` in `text-[#9ca3af]`.
- Feature list text → `text-[#4b5563] text-sm`; check icon stays primary.
- CTA: replace shadcn `<Button>` with raw `<Link>` matching `HomePricingTeaser` (`h-12 px-7 rounded-full bg-[#1a1a2e] text-white text-[15px] font-medium hover:bg-[#2a2a3e]` for primary, bordered variant `border-[#d4d4d4] text-[#1a1a2e] hover:bg-[#f5f5f3]` for secondary). Keep dynamic auth/upgrade logic — only swap the wrapper element and classes.

**All section H2s (Compare every feature, One platform replaces…, Everything you get…, How credits work, FAQ heading, Start Free CTA)**
- Add the same `text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4` eyebrow above each.
- H2 unified to: `text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] mb-4` (drop `font-bold`).
- Subtitles: `text-[#6b7280] text-base sm:text-lg leading-relaxed max-w-xl mx-auto`.

**Comparison table & cards**
- Table border → `border-[#f0efed]`, header bg `bg-[#FAFAF8]`, cells alternate `bg-white` / `bg-[#FAFAF8]/50`.
- Platform feature cards & credit cards → `rounded-2xl border-[#f0efed] bg-white shadow-none hover:shadow-[0_8px_24px_-12px_rgba(26,26,46,0.12)] transition-shadow`.
- Icon tiles: change `bg-primary/10` → `bg-[#1a1a2e]/[0.06] text-[#1a1a2e]` for the muted home look.

**FAQ accordion on pricing**
- Replace the existing Collapsible-based FAQ block (lines ~566–586) with the same `<Accordion>` pattern used in `HowItWorksFAQ` (rounded-2xl, white card, `border-[#f0efed]`) so the look is consistent across pages.

**Start Free CTA card (lines ~589–603)**
- Change to dark navy block matching `HomeFinalCTA`: `bg-[#1a1a2e]` rounded-2xl, white headline, `text-[#9ca3af]` body, white pill CTA with arrow.

**Enterprise banner**
- `bg-white border-[#f0efed]`, icon tile `bg-[#1a1a2e]/[0.06]`, outline CTA matches the secondary pill style.

No data/logic changes — only markup/classes. All pricing logic, plan loops, current-plan detection, and CTAs preserved.

## Part 2 — Dedicated `/faq` page

**New file**: `src/pages/FAQ.tsx`

Structure mirrors `HowItWorks.tsx`:
```tsx
<div className="min-h-screen bg-[#FAFAF8]">
  <SEOHead title="Frequently Asked Questions — VOVV.AI" ... canonical={`${SITE_URL}/faq`} />
  <JsonLd data={breadcrumbJsonLd} />
  <JsonLd data={faqPageJsonLd} />
  <LandingNav />
  <main>
    <FAQHero />            {/* eyebrow "Support" + H1 + subtitle, centered */}
    <FAQAccordion />       {/* grouped accordion: Getting started, Plans & credits, Generation, Brand & assets, Account */}
    <FAQContactStrip />    {/* "Still have questions?" → contact + start free */}
    <HomeFinalCTA />
  </main>
  <LandingFooter />
</div>
```

**New file**: `src/components/faq/FAQHero.tsx`
- Centered, `pt-24 sm:pt-28 lg:pt-32 pb-12`, eyebrow "Support", H1 `text-[2.5rem] sm:text-5xl lg:text-[3.25rem] tracking-[-0.03em]` "Everything you wanted to ask.", subtitle `max-w-xl mx-auto text-lg`.

**New file**: `src/components/faq/FAQAccordion.tsx`
- 5 grouped sections, each with section label (`text-[11px] uppercase tracking-[0.2em]`), then `<Accordion type="single" collapsible>` styled identically to `HowItWorksFAQ` (`border border-[#f0efed] bg-white rounded-2xl px-5 sm:px-6`).
- ~25 questions total combining: pricing FAQs (from `LandingPricing.FAQS`), workflow FAQs (from `HowItWorksFAQ.QA`), plus 8–10 new ones covering Brand Models, Bulk export, Commercial use, Refunds, Team seats, Data privacy, File ownership, Cancel/refund policy.

**New file**: `src/components/faq/FAQContactStrip.tsx`
- Light variant of CTA card: `bg-white border border-[#f0efed] rounded-2xl p-8` with two pill buttons: "Start free" → `/auth`, "Contact us" → `/contact`.

**JSON-LD**: Generate `FAQPage` schema from the same questions array for SEO.

## Part 3 — Wiring

**`src/App.tsx`**
- Add `const FAQ = lazy(() => import('@/pages/FAQ'));` (after `HowItWorks`).
- Add `<Route path="/faq" element={<FAQ />} />` next to `/how-it-works`.

**`src/components/landing/LandingNav.tsx`** (line 44)
- Change FAQ link from `{ label: 'FAQ', href: '#faq', isRoute: false }` to:
  ```ts
  { label: 'FAQ', href: '/faq', isRoute: true, prefetch: () => import('@/pages/FAQ') }
  ```

**`public/sitemap.xml`**
- Add `<url><loc>https://vovv.ai/faq</loc><lastmod>2026-04-25</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>` next to `/how-it-works`.

## Files

Created:
- `src/pages/FAQ.tsx`
- `src/components/faq/FAQHero.tsx`
- `src/components/faq/FAQAccordion.tsx`
- `src/components/faq/FAQContactStrip.tsx`

Edited:
- `src/components/landing/LandingPricing.tsx` (markup/className refresh, pricing FAQ → Accordion, CTA card → dark navy)
- `src/App.tsx` (lazy import + route)
- `src/components/landing/LandingNav.tsx` (FAQ link → `/faq`)
- `public/sitemap.xml` (add /faq entry)

## Out of scope

- No changes to pricing data, plan logic, Stripe checkout, or `CompetitorComparison` internals.
- No changes to `/app/pricing` (in-app pricing page).
