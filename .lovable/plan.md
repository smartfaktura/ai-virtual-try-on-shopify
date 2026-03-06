

## Update Landing Page FAQs

### What's outdated
- "Visual Set" terminology used but not consistently explained in context of Workflows
- "Brand Memory" mentioned (line 11) — the actual feature is called "Brand Profile"
- "34 diverse AI models" (line 43) — platform now has 40+ models
- Duplicate quality questions (items 1 and 5 are nearly identical)
- Missing mention of Freestyle mode — a core feature
- Free trial says "20 free credits" with "Visual Set" framing — should reference Workflows
- No mention of 6 core workflows by name

### Updated FAQ list (10 items, replacing all current ones)

| # | Question | Key update |
|---|----------|------------|
| 1 | Will the images look AI-generated? | Fix "Brand Memory" → "Brand Profile" |
| 2 | What are Workflows? | **New** — explains the 6 pipelines (Virtual Try-On, Product Listing, Selfie/UGC, Flat Lay, Mirror Selfie, Interior/Exterior Staging) |
| 3 | What is Freestyle? | **New** — explains prompt-based generation with reference images, Brand Profiles, style presets |
| 4 | How does Virtual Try-On work? | Update model count to 40+, mention pose/framing selection |
| 5 | What are Creative Drops? | Keep mostly same, minor wording polish |
| 6 | How does Brand Profile work? | Rename from "Brand Memory", keep content |
| 7 | How many credits does each generation cost? | **New** — consolidates credit info (8 standard, 16 HQ, 16 try-on, 30 video) |
| 8 | Is there a free trial? | Update to reference Workflows instead of "Visual Set" |
| 9 | What image formats and sizes are supported? | Keep as-is |
| 10 | Can I cancel my subscription anytime? | Keep as-is |

Removes: duplicate quality question, standalone "Visual Set" question (concept folded into Workflows answer), "Can I really stop doing photoshoots?" (too salesy for FAQ).

### Files changed
- `src/components/landing/LandingFAQ.tsx` — replace `faqs` array with updated content

