## Restore /home hero aesthetic on the new homepage `/`

Match the exact /home (old Landing) hero style — bold short static line + typewriter line in muted slate (`#4a5578`) — while keeping all SEO wins from the last round.

### Single file change: `src/components/home/HomeHero.tsx`

**1. H1 — match /home aesthetic exactly**
```
AI Product Visuals.
For E-commerce Brands.   ← typewriter, muted #4a5578, blinking caret
```
- Same font sizes/tracking/leading as `HeroSection.tsx` (the /home hero):
  `text-[2.5rem] sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-0.03em] leading-[1.08]`
- Static first line bold in foreground; second line typewriter in `#4a5578`.
- Caret style copied 1:1 from /home: `w-[3px] h-[0.85em] bg-[#4a5578] animate-[blink_1s_step-end_infinite]`.
- `whitespace-nowrap` on typewriter so text doesn't wrap mid-phrase.

**2. Typewriter phrases — SEO-aligned, Title Case (matches /home rhythm)**
Replace current sentence-style phrases with short Title Case ones that carry intent keywords:
- `For E-commerce Brands.`
- `From One Product Photo.`
- `Product Page Ready.`
- `Ads That Convert.`
- `Every Scene. Every Angle.`
- `No Photoshoot Needed.`

**3. Subheadline — collapse two paragraphs into one (same as /home)**
- Desktop (`hidden sm:block`): "Turn one product photo into product page images, lifestyle visuals, ads, and campaign-ready creative — built for e-commerce brands."
- Mobile (`sm:hidden`): "One product photo. Ads, product pages, lifestyle, campaigns — built for e-commerce brands."
- Keeps every primary keyword (e-commerce, product page, lifestyle, ads, campaign, product photo).

**4. CTAs — Title Case to match /home**
- "Try It On My Product" → /auth
- "See Real Examples" → #examples (kept anchor; same destination as before)

**5. Trust line — match /home wording**
- "20 free credits · No credit card required · Start in seconds"

### What stays the same
- Marquee rows below (already on-aesthetic).
- All SEO improvements from previous round: meta title/description, JSON-LD (Organization, WebSite, SoftwareApplication, FAQPage), category-pill links, in-card SEO links, FAQ content.
- Footer, nav, all other sections untouched.

### Why this version is more SEO-optimized than the last attempt
- H1 is now **two crawlable lines of static + typewriter Title Case keywords**, not one long sentence.
- Both H1 lines combined render as: `AI Product Visuals. For E-commerce Brands.` — a perfect on-keyword headline.
- Typewriter phrases all double as semantic keywords ("Product Page Ready", "Ads That Convert", "From One Product Photo").
- Subhead consolidates all secondary keywords without keyword-stuffing.
- Visual hierarchy now matches /home — premium, spacious, clean.

Plus version.json bump.
