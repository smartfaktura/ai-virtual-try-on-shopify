

## Rebrand: brandframe.ai → framea.ai

A global find-and-replace across all files where the brand name appears. The logo icon will change from **"bf"** to **"fa"** to match the new name.

### Changes Summary

**11 files** will be updated:

| File | What Changes |
|------|-------------|
| `index.html` | Page title, meta description, author, OG tags, Twitter handle |
| `src/components/landing/LandingNav.tsx` | Logo icon "bf" → "fa", brand text |
| `src/components/landing/LandingFooter.tsx` | Logo icon "bf" → "fa", brand text, copyright |
| `src/components/landing/LandingFAQ.tsx` | FAQ answer text |
| `src/components/landing/SocialProofBar.tsx` | Social proof label |
| `src/components/landing/FeatureGrid.tsx` | Section heading |
| `src/pages/Auth.tsx` | Logo icon "bf" → "fa", brand text, image caption |
| `src/pages/Onboarding.tsx` | Toast message, question labels, image caption |
| `src/pages/Settings.tsx` | Model badge "brandframe-v1" → "framea-v1" |
| `src/components/app/AppShell.tsx` | Sidebar logo icon "bf" → "fa", brand text |
| `src/components/app/CompetitorComparison.tsx` | Comparison table name |
| `src/components/app/StudioChat.tsx` | Avatar fallback "bf" → "fa" |
| `src/components/app/ProtectedRoute.tsx` | Loading spinner logo "bf" → "fa" |

### Detailed Replacements

**Brand name text:**
- `brandframe.ai` → `framea.ai` (all lowercase instances)
- `BrandFrame AI` → `Framea AI` (title case in SEO meta)
- `Brandframe.ai` → `Framea.ai` (sentence case in headings)

**Logo icon text:**
- `bf` → `fa` (inside the small rounded logo square, across 6 files)

**Model version badge:**
- `brandframe-v1` → `framea-v1`

**Twitter handle:**
- `@BrandFrameAI` → `@FrameaAI`

No structural or layout changes -- purely text replacements.

