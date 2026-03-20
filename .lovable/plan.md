

# Update Help Center FAQ Content

## What Changes

Update the `faqCategories` array in `src/pages/HelpCenter.tsx` to accurately reflect the app's actual features, workflows, and terminology. The landing FAQ already has accurate content — the Help Center should be consistent and more detailed.

### Key content fixes:

**Getting Started**
- Update workflow list to name all actual workflows: Virtual Try-On, Product Listing, Selfie / UGC, Flat Lay, Mirror Selfie, Interior / Exterior Staging, and Picture Perspectives
- Add a question about Freestyle mode (missing entirely)
- Mention 2K resolution / PNG output standard

**Credits & Billing**
- Fix credit costs: Freestyle = 4 credits (6 with model/scene), Workflows = 6 credits, Video = 30 credits
- Remove "roll over for one billing cycle" — landing FAQ says they don't roll over
- Add mention of free 20 credits for new accounts
- Add mention that top-up credits never expire

**Workflows & Generation**
- Fix Workflows description — replace generic "Lifestyle, Studio, Social Media" with actual workflow names
- Add Picture Perspectives workflow explanation (generates front/back/side/close-up angle sets, 6 credits per angle)
- Add question about Upscale feature
- Update Creative Drops to mention "monthly or biweekly" schedule, Growth plans requirement
- Add batch generation details

**Image Quality**
- Mention 2K resolution and PNG output as defaults
- Update upscale info — it's a real feature in the app, not just "from the Library"

**Account & Data**
- Keep mostly as-is, content is accurate

### File
`src/pages/HelpCenter.tsx` — replace the `faqCategories` array (lines 9–111) with updated content. No structural/UI changes.

